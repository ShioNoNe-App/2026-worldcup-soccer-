import { analyzeBirth } from '../bazi/analysis';
import { TOPICS, TOPIC_BY_ID } from '../../content/topics';
import { QUESTIONS } from '../../content/questions';
import { buildContext, nextQuestion, checkQuestionFor, resolveQuestion, isCheckQuestion } from './engine';
import { composeTopicResult, composeCompat, composeYearReadings, buildInitialReading } from './result';
import { priorsFromChart } from './priors';
import type { Answers, OptionDef, QuestionDef } from './types';
import { dayPillarOf } from '../bazi/calendar';

// 2000-01-01 12:00 → 日干 戊（山タイプ）
const chart = analyzeBirth({ date: '2000-01-01', time: '12:00' });

function answer(answers: Answers, q: QuestionDef, optionId: string, topic: string): Answers {
  return { ...answers, [q.id]: { optionId, topic, at: Object.keys(answers).length + 1 } };
}

/** pick で選んだ選択肢で、トピックが終わるまで答え続ける */
function runTopic(topic: string, pick: (q: QuestionDef) => OptionDef, start: Answers = {}) {
  let answers = start;
  const asked: QuestionDef[] = [];
  for (let i = 0; i < 20; i++) {
    const ctx = buildContext(chart, answers);
    const q = nextQuestion(topic, ctx);
    if (!q) break;
    asked.push(q);
    answers = answer(answers, q, pick(q).id, topic);
  }
  return { answers, asked, ctx: buildContext(chart, answers) };
}

describe('命式からの仮説', () => {
  it('日干の解釈を根拠に仮説が立つ', () => {
    const priors = priorsFromChart(chart);
    expect(priors.marriage_view.value).toBeGreaterThan(0.2);
    expect(priors.marriage_view.basis).toContainEqual({ kind: 'dayMaster', stem: 4 });
  });
});

describe('適応的な質問の選択', () => {
  it('片思い: 最初に状況を聞き、回答に応じて次の質問が変わる', () => {
    const ctx = buildContext(chart, {});
    const first = nextQuestion('crush', ctx)!;
    expect(first.id).toBe('crush_distance');

    const far = buildContext(chart, answer({}, first, 'far', 'crush'));
    expect(nextQuestion('crush', far)!.id).toBe('crush_far');

    const close = buildContext(chart, answer({}, first, 'close', 'crush'));
    expect(nextQuestion('crush', close)!.id).toBe('crush_signal');

    const date = buildContext(chart, answer({}, first, 'date', 'crush'));
    expect(nextQuestion('crush', date)!.id).toBe('crush_after_date');
  });

  it('同じ質問をくり返さず、トピックの質問を最後まで聞き切って終わる', () => {
    for (const topic of TOPICS.filter((t) => t.special !== 'blood' && t.special !== 'animal')) {
      const { asked, ctx } = runTopic(topic.id, (q) => q.options[0]);
      const ids = asked.map((q) => q.id);
      expect(new Set(ids).size, topic.id).toBe(ids.length);
      expect(ids.length, topic.id).toBeGreaterThan(0);
      expect(ids.length, topic.id).toBeLessThan(12);
      expect(nextQuestion(topic.id, ctx), topic.id).toBeNull();
    }
  });

  it('仕事のトピックでは恋愛の質問が出ない', () => {
    for (const topic of TOPICS.filter((t) => t.theme === 'work')) {
      for (const pickIndex of [0, 1, 2]) {
        const { asked } = runTopic(topic.id, (q) => q.options[Math.min(pickIndex, q.options.length - 1)]);
        for (const q of asked) expect(q.theme, `${topic.id}:${q.id}`).not.toBe('love');
      }
    }
  });

  it('恋愛のトピックでは仕事の質問が出ない', () => {
    for (const topic of TOPICS.filter((t) => t.theme === 'love')) {
      const { asked } = runTopic(topic.id, (q) => q.options[1]);
      for (const q of asked) expect(q.theme, `${topic.id}:${q.id}`).not.toBe('work');
    }
  });

  it('「わからない」「どれも違う」「スキップ」でも先に進める', () => {
    const pickSpecial = (q: QuestionDef) => q.options.find((o) => o.kind && o.kind !== 'normal') ?? q.options[q.options.length - 1];
    for (const topic of TOPICS.filter((t) => t.special !== 'blood' && t.special !== 'animal')) {
      const { asked, ctx } = runTopic(topic.id, pickSpecial);
      expect(asked.length).toBeGreaterThan(0);
      expect(() => composeTopicResult(topic.id, ctx)).not.toThrow();
    }
  });

  it('すでに答えた特性の質問は、別のトピックでは省略される', () => {
    const { answers } = runTopic('love_style', (q) => q.options[0]);
    const ctx = buildContext(chart, answers);
    expect(ctx.traits.love_pace.self).not.toBeNull();
    const { asked } = runTopic('meet', (q) => q.options[0], answers);
    expect(asked.map((q) => q.id)).not.toContain('love_pace');
  });

  it('全ての質問IDが一意で、トピックが存在する', () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of QUESTIONS) for (const t of q.topics) if (!t.startsWith('theme:')) expect(TOPIC_BY_ID[t], `${q.id}→${t}`).toBeDefined();
  });
});

describe('仮説の確認と否定', () => {
  it('「全然ちがう」と答えた仮説は押しつけず、再確認もしない', () => {
    const ctx0 = buildContext(chart, {});
    expect(ctx0.traits.marriage_view.status).toBe('hypothesis');
    const q = checkQuestionFor('marriage_view', ctx0.traits.marriage_view.prior, ['fit']);
    const ctx = buildContext(chart, answer({}, q, 'wrong', 'fit'));
    const t = ctx.traits.marriage_view;
    expect(t.rejected).toBe(true);
    expect(t.status).toBe('different');
    expect(t.value).toBeLessThan(0);
    // 同じ確認質問は二度と出ない
    for (const topic of ['marriage', 'fit']) {
      const { asked } = runTopic(topic, (qq) => qq.options[0], ctx.answers);
      expect(asked.filter((a) => isCheckQuestion(a.id) && a.targets[0] === 'marriage_view')).toHaveLength(0);
    }
  });

  it('確認質問に「すごくある」と答えると、占いと回答が重なったと表示される', () => {
    const ctx0 = buildContext(chart, {});
    const q = checkQuestionFor('marriage_view', ctx0.traits.marriage_view.prior, ['marriage']);
    const ctx = buildContext(chart, answer({}, q, 'yes2', 'marriage'));
    expect(ctx.traits.marriage_view.status).toBe('matched');
    const r = composeTopicResult('marriage', ctx);
    expect(r.lead).toContain('重なった');
    expect(r.points.some((p) => p.source === 'both')).toBe(true);
  });

  it('確認質問は回答履歴から復元できる', () => {
    const priors = priorsFromChart(chart);
    expect(resolveQuestion('check:marriage_view', priors)?.targets).toEqual(['marriage_view']);
    expect(resolveQuestion('check:nope', priors)).toBeUndefined();
  });
});

describe('回答によって結果が変わる', () => {
  it('恋のスピードの回答で、結果のキーワードが変わる', () => {
    const q = QUESTIONS.find((x) => x.id === 'love_pace')!;
    const a = composeTopicResult('love_style', buildContext(chart, answer({}, q, 'intuitive', 'love_style')));
    const b = composeTopicResult('love_style', buildContext(chart, answer({}, q, 'gradual', 'love_style')));
    expect(a.keywords).toContain('ひとめぼれ体質');
    expect(b.keywords).toContain('じっくり育てる恋');
    expect(a.headline).not.toBe(b.headline);
  });

  it('状況の回答に応じたアドバイスが加わる', () => {
    const q = QUESTIONS.find((x) => x.id === 'crush_distance')!;
    const r = composeTopicResult('crush', buildContext(chart, answer({}, q, 'far', 'crush')));
    expect(r.points.some((p) => p.text.includes('あいさつ'))).toBe(true);
  });
});

describe('その他の結果', () => {
  it('初期診断', () => {
    const r = buildInitialReading(chart);
    expect(r.dayStemLabel).toBe('戊');
    expect(r.nickname).toContain('山');
    expect(r.strengths).toHaveLength(2);
  });
  it('相性は日柱どうしで計算する', () => {
    const r = composeCompat(chart.pillars.day, dayPillarOf(1999, 12, 27));
    expect(r.selfDay).toBe('戊午');
    expect(r.partnerDay).toBe('癸丑'); // 戊午の5日前
    expect(r.title).toContain('干合');
  });
  it('年運は今年と来年', () => {
    const r = composeYearReadings(chart, 2026);
    expect(r.map((x) => x.pillar)).toEqual(['丙午', '丁未']);
    expect(r[0].star).toBe('偏印'); // 戊から見た丙
    expect(r[0].branchNote).toContain('同じ'); // 日支 午 と 年支 午
  });
});
