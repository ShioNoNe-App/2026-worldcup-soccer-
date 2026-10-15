import { analyzeBirth } from '../engine/bazi/analysis';
import { buildContext, checkQuestionFor, nextQuestion } from '../engine/diagnosis/engine';
import { buildInitialReading, composeCompat, composeTopicResult, composeYearReadings, topicIntro } from '../engine/diagnosis/result';
import type { Answers, QuestionDef } from '../engine/diagnosis/types';
import { dayPillarOf } from '../engine/bazi/calendar';
import { computeJyotish } from '../engine/jyotish/jyotish';
import { composeProfileReport, composeThemeReport } from '../engine/diagnosis/profile';
import { DAY_MASTERS_EN } from './en/dayMasters';
import { COMMON_OPTIONS_EN, QUESTIONS_EN } from './en/questions';
import { TRAITS_EN } from './en/traits';
import { basisText, localizeQuestion } from './localize';
import { QUESTIONS } from './questions';
import { THEMES, TOPICS } from './topics';
import { TRAIT_IDS } from './traits';

const KANA = /[぀-ヿ]/;

describe('英語の文章がそろっている', () => {
  it('全ての質問と選択肢に英語がある', () => {
    for (const q of QUESTIONS) {
      const en = QUESTIONS_EN[q.id];
      expect(en, q.id).toBeDefined();
      for (const o of q.options) {
        expect(en.options[o.id] ?? COMMON_OPTIONS_EN[o.id], `${q.id}.${o.id}`).toBeDefined();
      }
      const loc = localizeQuestion(q, 'en');
      expect(loc.text).not.toMatch(KANA);
      for (const o of loc.options) expect(o.label, `${q.id}.${o.id}`).not.toMatch(KANA);
    }
  });

  it('全ての特性・日干・テーマ・トピックに英語がある', () => {
    for (const id of TRAIT_IDS) expect(TRAITS_EN[id], id).toBeDefined();
    expect(DAY_MASTERS_EN).toHaveLength(10);
    for (const t of THEMES) expect(t.title.en).not.toMatch(KANA);
    for (const t of TOPICS) {
      expect(t.title.en, t.id).not.toMatch(KANA);
      expect(t.ask.en, t.id).not.toMatch(KANA);
      for (const e of t.extras ?? []) expect(e.text.en, t.id).not.toMatch(KANA);
    }
  });

  it('確認質問も英語になる', () => {
    const q = localizeQuestion(checkQuestionFor('love_pace', 0.5), 'en');
    expect(q.text).toContain('Falls at first sight');
    expect(q.options.map((o) => o.label)).toContain('Not at all');
  });
});

describe('英語の結果にかなが混ざらない', () => {
  const dates = ['1990-04-12', '2000-01-01', '1985-11-30', '1978-07-07', '2005-02-04', '1995-08-17', '1969-12-24', '2010-06-01', '1999-09-09', '1988-03-03'];
  for (const date of dates) {
    it(date, () => {
      const chart = analyzeBirth({ date, time: '12:00' });
      const r = buildInitialReading(chart, 'en');
      expect(JSON.stringify(r)).not.toMatch(KANA);
      expect(JSON.stringify(composeYearReadings(chart, 2026, 'en'))).not.toMatch(KANA);
      expect(JSON.stringify(composeCompat(chart.pillars.day, dayPillarOf(1993, 3, 9), 'en'))).not.toMatch(KANA);
      for (const topic of TOPICS) {
        let answers: Answers = {};
        const ctx0 = buildContext(chart, answers);
        expect(topicIntro(topic, ctx0, 'en'), topic.id).not.toMatch(KANA);
        for (let i = 0; i < 6; i++) {
          const ctx = buildContext(chart, answers);
          const q: QuestionDef | null = nextQuestion(topic.id, ctx);
          if (!q) break;
          answers = { ...answers, [q.id]: { optionId: q.options[i % q.options.length].id, topic: topic.id, at: i + 1 } };
        }
        const ctx = buildContext(chart, answers);
        expect(JSON.stringify(composeTopicResult(topic.id, ctx, 'en')), topic.id).not.toMatch(KANA);
        for (const t of Object.values(ctx.traits)) for (const b of t.basis) expect(basisText(b, 'en')).not.toMatch(KANA);
      }
      const full = buildContext(chart, {}, { jyotish: computeJyotish({ date, time: '12:00' }), type16: 'INFJ' });
      // 軸の定義（日英併記のデータ）は除いて、表示される文章だけを検査
      const noAxis = (k: string, v: unknown) => (k === 'axis' ? undefined : v);
      expect(JSON.stringify(composeProfileReport(full, 'en'), noAxis)).not.toMatch(KANA);
      for (const theme of ['love', 'work', 'relations', 'self', 'life'] as const) {
        expect(JSON.stringify(composeThemeReport(theme, full, 'en')), theme).not.toMatch(KANA);
      }
    });
  }
});
