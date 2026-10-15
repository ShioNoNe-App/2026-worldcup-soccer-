import { analyzeBirth } from '../bazi/analysis';
import { computeJyotish } from '../jyotish/jyotish';
import { buildContext, nextThemeStep, themeRemaining } from './engine';
import { axisScores, composeProfileReport, composeThemeReport } from './profile';
import type { Answers, ThemeId } from './types';

const birth = { date: '1995-08-17', time: '09:30' };
const chart = analyzeBirth(birth);
const sources = { jyotish: computeJyotish(birth), type16: 'ENTP' };

function runTheme(theme: ThemeId, pick: (ids: string[]) => string, start: Answers = {}) {
  let answers = start;
  const asked: string[] = [];
  const remainingLog: number[] = [];
  for (let i = 0; i < 80; i++) {
    const ctx = buildContext(chart, answers, sources);
    remainingLog.push(themeRemaining(theme, ctx));
    const step = nextThemeStep(theme, ctx);
    if (!step) return { answers, asked, remainingLog, ctx };
    asked.push(step.question.id);
    answers = { ...answers, [step.question.id]: { optionId: pick(step.question.options.map((o) => o.id)), topic: step.topic, at: i + 1 } };
  }
  throw new Error('終わらない');
}

describe('テーマをまとめて答える', () => {
  it('恋愛は最初に状況を聞き、フリーなら片思い・交際中・復縁の質問は出ない', () => {
    const { asked } = runTheme('love', (ids) => (ids.includes('single') ? 'single' : ids[0]));
    expect(asked[0]).toBe('love_status');
    for (const id of ['crush_distance', 'partner_state', 'reunion_time', 'crush_signal', 'partner_gap']) {
      expect(asked).not.toContain(id);
    }
    expect(asked).toContain('meet_place');
  });

  it('片思いなら片思いの質問が出て、交際中・復縁の質問は出ない', () => {
    const { asked } = runTheme('love', (ids) => (ids.includes('crush') ? 'crush' : ids[0]));
    expect(asked).toContain('crush_distance');
    expect(asked).not.toContain('partner_state');
    expect(asked).not.toContain('reunion_time');
  });

  it('全テーマ: 途中で区切られず最後まで続き、同じ質問は出ない。残り数は最後に0になる', () => {
    for (const theme of ['love', 'work', 'relations', 'self', 'life'] as ThemeId[]) {
      const { asked, remainingLog } = runTheme(theme, (ids) => ids[1] ?? ids[0]);
      expect(new Set(asked).size, theme).toBe(asked.length);
      expect(asked.length, theme).toBeGreaterThanOrEqual(5);
      expect(remainingLog[remainingLog.length - 1], theme).toBe(0);
      expect(remainingLog[0], theme).toBeGreaterThan(0);
    }
  });
});

describe('総合レポート', () => {
  it('8つの軸のスコアは 0〜100 で、回答で変わる', () => {
    const before = axisScores(buildContext(chart, {}, sources));
    const { ctx } = runTheme('self', (ids) => ids[0]);
    const after = axisScores(ctx);
    expect(before).toHaveLength(8);
    for (const s of after) {
      expect(s.current).toBeGreaterThanOrEqual(0);
      expect(s.current).toBeLessThanOrEqual(100);
    }
    expect(after.map((s) => s.current)).not.toEqual(before.map((s) => s.current));
  });

  it('16タイプとインド占星術が仮説に加わり、レポートに3つの視点が出る', () => {
    const ctx = buildContext(chart, {}, sources);
    expect(Object.keys(ctx.systems.type16).length).toBeGreaterThan(0);
    expect(Object.keys(ctx.systems.jyotish).length).toBeGreaterThan(0);
    const r = composeProfileReport(ctx, 'ja');
    expect(r.core).toHaveLength(3);
    expect(r.core[2].title).toContain('ENTP');
    expect(r.manual.every((m) => !m.unlocked)).toBe(true);
  });

  it('答えるほど理解度と取扱説明書が開く', () => {
    const r0 = composeProfileReport(buildContext(chart, {}, sources), 'ja');
    let answers: Answers = {};
    for (const theme of ['love', 'work', 'relations', 'self', 'life'] as ThemeId[]) {
      answers = runTheme(theme, (ids) => ids[0], answers).answers;
    }
    const r1 = composeProfileReport(buildContext(chart, answers, sources), 'ja');
    expect(r1.answered).toBeGreaterThan(r0.answered);
    expect(r1.level).toBeGreaterThan(r0.level);
    expect(r1.manual.filter((m) => m.unlocked).length).toBe(8);
  });

  it('テーマレポートには占術の視点とトピック別の結果が入る', () => {
    const { ctx } = runTheme('work', (ids) => ids[0]);
    const r = composeThemeReport('work', ctx, 'ja');
    expect(r.perspectives.length).toBe(3);
    expect(r.sections.length).toBeGreaterThan(5);
    expect(r.sections.every((s) => s.points.length > 0)).toBe(true);
  });
});
