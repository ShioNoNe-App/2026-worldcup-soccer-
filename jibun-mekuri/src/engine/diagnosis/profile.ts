// じぶんマップの総合レポート。8つの軸のスコアと、占術どうし・回答との一致/ズレを組み立てる。
import { AXES, type AxisDef } from '../../content/axes';
import { NAKSHATRAS, RASHIS, nakshatraName } from '../../content/jyotish';
import { SYSTEM_NAMES, dmText, pick, pillarText } from '../../content/localize';
import { TYPES16, isTypeCode } from '../../content/types16';
import { THEME_BY_ID, TOPICS } from '../../content/topics';
import type { Lang } from '../../i18n/lang';
import { composeTopicResult, topicIntro } from './result';
import { themeRunTopics } from './engine';
import type { DiagnosisContext, ResultPoint, SystemId, ThemeId, TraitId } from './types';

export type ScoreSource = SystemId | 'answers';

export interface AxisScore {
  axis: AxisDef;
  /** 占術の仮説だけのスコア（0〜100） */
  hypothesis: number;
  /** 回答も反映した今のスコア */
  current: number;
  /** 回答で確かめた特性の数 */
  answeredParts: number;
  bySource: Record<ScoreSource, number | null>;
}

const toScore = (v: number) => Math.round(50 + 50 * Math.max(-1, Math.min(1, v)));

function axisValue(axis: AxisDef, get: (t: TraitId) => number | null | undefined): number | null {
  const vals = axis.parts.map(([t, sign]) => {
    const v = get(t);
    return v === null || v === undefined ? null : v * sign;
  });
  const known = vals.filter((v): v is number => v !== null);
  if (known.length === 0) return null;
  // 不明な成分は 0 とみなして平均（片方だけで極端にならないように）
  return vals.reduce<number>((a, v) => a + (v ?? 0), 0) / vals.length;
}

export function axisScores(ctx: DiagnosisContext, axes: AxisDef[] = AXES): AxisScore[] {
  return axes.map((axis) => {
    const hyp = axisValue(axis, (t) => (ctx.traits[t].rejected ? 0 : ctx.traits[t].prior)) ?? 0;
    const cur = axisValue(axis, (t) => ctx.traits[t].value) ?? 0;
    const bySource = {
      bazi: axisValue(axis, (t) => ctx.systems.bazi[t]),
      jyotish: axisValue(axis, (t) => ctx.systems.jyotish[t]),
      type16: axisValue(axis, (t) => ctx.systems.type16[t]),
      answers: axisValue(axis, (t) => ctx.traits[t].self),
    };
    return {
      axis,
      hypothesis: toScore(hyp),
      current: toScore(cur),
      answeredParts: axis.parts.filter(([t]) => ctx.traits[t].self !== null).length,
      bySource: Object.fromEntries(
        Object.entries(bySource).map(([k, v]) => [k, v === null ? null : toScore(v)]),
      ) as Record<ScoreSource, number | null>,
    };
  });
}

const STRONG = 8; // 50 からこれ以上離れたら「傾向あり」

function direction(score: number | null): -1 | 0 | 1 {
  if (score === null) return 0;
  if (score >= 50 + STRONG) return 1;
  if (score <= 50 - STRONG) return -1;
  return 0;
}

export interface ReportItem {
  title: string;
  body: string;
  tag?: string;
}

export interface ProfileReport {
  answered: number;
  total: number;
  level: number;
  levelLabel: string;
  nextHint: string | null;
  scores: AxisScore[];
  core: ReportItem[];
  consensus: string[];
  gaps: string[];
  manual: { axis: AxisDef; unlocked: boolean; text: string; score: number; lean: string; hint: string }[];
}

const LEVELS: { min: number; ja: string; en: string }[] = [
  { min: 0, ja: 'はじめまして', en: 'Just met' },
  { min: 4, ja: '輪郭が見えてきた', en: 'Outline appearing' },
  { min: 8, ja: 'だいぶわかってきた', en: 'Getting clearer' },
  { min: 12, ja: 'かなり深く理解', en: 'Deep understanding' },
  { min: 16, ja: 'じぶんマスター', en: 'Self master' },
];

export function composeProfileReport(ctx: DiagnosisContext, lang: Lang): ProfileReport {
  const T = (ja: string, en: string) => (lang === 'en' ? en : ja);
  const traits = Object.values(ctx.traits);
  const answered = traits.filter((t) => t.self !== null || t.rejected).length;
  const total = traits.length;
  let level = 0;
  LEVELS.forEach((l, i) => {
    if (answered >= l.min) level = i;
  });
  const next = LEVELS[level + 1];
  const scores = axisScores(ctx);

  // ---- 核になる3つの視点 ----
  const dm = dmText(ctx.chart.dayStem, lang);
  const core: ReportItem[] = [
    {
      tag: pick(SYSTEM_NAMES.bazi, lang),
      title: dm.nickname,
      body: `${dm.essence}`,
    },
  ];
  const j = ctx.sources.jyotish;
  if (j) {
    const r = RASHIS[j.moonSign];
    const n = NAKSHATRAS[j.nakshatra];
    core.push({
      tag: pick(SYSTEM_NAMES.jyotish, lang),
      title: T(`月星座 ${r.name.ja} × ${nakshatraName(j.nakshatra, 'ja')}（${n.keyword.ja}）`, `Moon in ${r.name.en} × ${n.name} (${n.keyword.en})`),
      body: `${pick(r.mind, lang)} ${pick(n.text, lang)}`,
    });
  }
  const code = ctx.sources.type16;
  if (isTypeCode(code)) {
    const t = TYPES16[code];
    core.push({
      tag: pick(SYSTEM_NAMES.type16, lang),
      title: `${code}：${pick(t.nickname, lang)}`,
      body: pick(t.summary, lang),
    });
  }

  // ---- 一致とズレ ----
  const consensus: string[] = [];
  const gaps: string[] = [];
  for (const s of scores) {
    const label = pick(s.axis.label, lang);
    const systems = (['bazi', 'jyotish', 'type16'] as SystemId[]).filter((k) => s.bySource[k] !== null);
    for (const dir of [1, -1] as const) {
      const agree = systems.filter((k) => direction(s.bySource[k]) === dir);
      if (agree.length >= 2) {
        const names = agree.map((k) => pick(SYSTEM_NAMES[k], lang)).join(T('・', ', '));
        const pole = pick(dir > 0 ? s.axis.high : s.axis.low, lang);
        const confirmed = direction(s.bySource.answers) === dir;
        consensus.push(
          T(
            `${names}がそろって「${label}：${pole}」を示しています。${confirmed ? 'あなたの回答とも一致しました。' : ''}`,
            `${names} all point to “${label}: ${pole}.”${confirmed ? ' Your answers agree, too.' : ''}`,
          ),
        );
      }
    }
    const ans = direction(s.bySource.answers);
    const hyp = direction(s.hypothesis);
    if (ans !== 0 && hyp !== 0 && ans !== hyp) {
      gaps.push(
        T(
          `「${label}」は占いでは「${pick(hyp > 0 ? s.axis.high : s.axis.low, 'ja')}」寄りでしたが、あなたの実感は「${pick(ans > 0 ? s.axis.high : s.axis.low, 'ja')}」。生まれ持った傾向とは違う自分を、経験の中で育ててきたのかもしれません。`,
          `For “${label},” the charts leaned “${pick(hyp > 0 ? s.axis.high : s.axis.low, 'en')},” but you feel “${pick(ans > 0 ? s.axis.high : s.axis.low, 'en')}.” You may have grown a different side of yourself through experience.`,
        ),
      );
    }
  }

  // ---- じぶん取扱説明書（回答すると開く） ----
  const manual = scores.map((s) => {
    const dir = direction(s.current);
    const text = pick(dir > 0 ? s.axis.highText : dir < 0 ? s.axis.lowText : s.axis.midText, lang);
    return {
      axis: s.axis,
      unlocked: s.answeredParts > 0,
      text,
      score: s.current,
      lean:
        dir > 0
          ? T(`${pick(s.axis.high, 'ja')}寄り`, `Leans ${pick(s.axis.high, 'en')}`)
          : dir < 0
            ? T(`${pick(s.axis.low, 'ja')}寄り`, `Leans ${pick(s.axis.low, 'en')}`)
            : T('バランス型', 'Balanced'),
      hint: T(
        `「${pick(THEME_BY_ID[s.axis.theme].short, 'ja')}」のテーマに答えると開きます`,
        `Answer the “${pick(THEME_BY_ID[s.axis.theme].short, 'en')}” theme to unlock`,
      ),
    };
  });

  return {
    answered,
    total,
    level: level + 1,
    levelLabel: lang === 'en' ? LEVELS[level].en : LEVELS[level].ja,
    nextHint: next
      ? T(`あと${next.min - answered}つ答えると「${next.ja}」に`, `${next.min - answered} more to reach “${next.en}”`)
      : null,
    scores,
    core,
    consensus,
    gaps,
    manual,
  };
}

// ---- テーマのまとめレポート ----

export interface ThemeReport {
  perspectives: ReportItem[];
  sections: { topicId: string; title: string; headline: string; lead: string; points: ResultPoint[] }[];
}

export function composeThemeReport(theme: ThemeId, ctx: DiagnosisContext, lang: Lang): ThemeReport {
  const T = (ja: string, en: string) => (lang === 'en' ? en : ja);
  const dm = dmText(ctx.chart.dayStem, lang);
  const perspectives: ReportItem[] = [];
  const dmField = theme === 'love' ? dm.love : theme === 'work' ? dm.work : theme === 'relations' ? dm.relations : dm.self;
  perspectives.push({
    tag: pick(SYSTEM_NAMES.bazi, lang),
    title: T(`日柱 ${pillarText(ctx.chart.pillars.day.stem, ctx.chart.pillars.day.branch, 'ja')}`, `Day pillar ${pillarText(ctx.chart.pillars.day.stem, ctx.chart.pillars.day.branch, 'en')}`),
    body: dmField,
  });
  const j = ctx.sources.jyotish;
  if (j) {
    const r = RASHIS[j.moonSign];
    const body = theme === 'love' ? r.love : theme === 'work' ? r.work : theme === 'self' || theme === 'life' ? r.mind : r.comfort;
    perspectives.push({
      tag: pick(SYSTEM_NAMES.jyotish, lang),
      title: T(`月星座 ${r.name.ja}`, `Moon in ${r.name.en}`),
      body: `${pick(body, lang)}${theme === 'relations' || theme === 'self' ? T(`（心が整うコツ：${r.comfort.ja}）`, ` (What settles you: ${r.comfort.en})`) : ''}`,
    });
  }
  const code = ctx.sources.type16;
  if (isTypeCode(code)) {
    const t = TYPES16[code];
    const body = theme === 'love' ? t.love : theme === 'work' ? t.work : t.summary;
    perspectives.push({
      tag: pick(SYSTEM_NAMES.type16, lang),
      title: `${code}：${pick(t.nickname, lang)}`,
      body: `${pick(body, lang)} ${T(`強み：${t.strength.ja}／注意：${t.caution.ja}`, `Strength: ${t.strength.en} / Watch out: ${t.caution.en}`)}`,
    });
  }

  const included = new Set(themeRunTopics(theme, ctx).map((t) => t.id));
  const sections = TOPICS.filter((t) => t.theme === theme && included.has(t.id) && t.special !== 'yearly').map((t) => {
    const r = composeTopicResult(t.id, ctx, lang);
    return {
      topicId: t.id,
      title: pick(t.title, lang),
      headline: r.headline,
      lead: r.lead || topicIntro(t, ctx, lang),
      points: r.points,
    };
  });
  return { perspectives, sections };
}

// ---- 回答から求める独自の16タイプ ----

const DIMS: { dim: string; pos: string; neg: string; traits: TraitId[]; theme: ThemeId }[] = [
  { dim: 'EI', pos: 'E', neg: 'I', traits: ['self_energy', 'rel_circle'], theme: 'self' },
  { dim: 'NS', pos: 'N', neg: 'S', traits: ['life_mode'], theme: 'life' },
  { dim: 'FT', pos: 'F', neg: 'T', traits: ['self_decide'], theme: 'self' },
  { dim: 'JP', pos: 'J', neg: 'P', traits: ['work_structure'], theme: 'work' },
];

export interface DerivedType {
  /** 4つすべて回答から決まったときだけ */
  code: string | null;
  letters: { dim: string; letter: string | null; strength: number; theme: ThemeId }[];
}

/** あなたの回答だけから求める16タイプ（独自の判定。公式の診断とは関係ない） */
export function derivedType16(ctx: DiagnosisContext): DerivedType {
  const letters = DIMS.map((d) => {
    const vals = d.traits.map((t) => ctx.traits[t].self).filter((v): v is number => v !== null);
    if (vals.length === 0) return { dim: d.dim, letter: null, strength: 0, theme: d.theme };
    const v = vals.reduce((a, b) => a + b, 0) / vals.length;
    // 中間（0付近）のときは、占術の仮説で軽く補う
    const tie = Math.abs(v) < 0.1 ? d.traits.reduce((a, t) => a + ctx.traits[t].prior, 0) : v;
    return { dim: d.dim, letter: tie >= 0 ? d.pos : d.neg, strength: Math.round(Math.abs(v) * 100), theme: d.theme };
  });
  // E/I・N/S・F/T・J/P の順なので、そのまま一般的な4文字表記になる
  const code = letters.every((l) => l.letter) ? letters.map((l) => l.letter).join('') : null;
  return { code, letters };
}
