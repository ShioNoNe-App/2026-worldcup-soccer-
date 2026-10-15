// 診断結果の組み立て。占いからの解釈（chart）と本人の回答（answer）を区別して返す。
import { TEN_GOD_NAMES, branchRelation, compatibilityOf, tenGodOf, type ChartAnalysis, type StarGroup } from '../bazi/analysis';
import { yearPillarForYear } from '../bazi/calendar';
import { STEMS, type Pillar } from '../bazi/constants';
import {
  TEN_GOD_NAMES_EN,
  branchRelationText,
  dmText,
  elementText,
  pick,
  pillarText,
  starGroupText,
  stemReading,
  stemRelationText,
  traitText,
  yearBranchNote,
  yearThemeText,
} from '../../content/localize';
import { TOPIC_BY_ID } from '../../content/topics';
import type { Lang } from '../../i18n/lang';
import { HYPOTHESIS_THRESHOLD, keywordOf, poleOf } from './engine';
import type { DiagnosisContext, PointSource, ResultPoint, TopicDef, TopicResult, TraitId, TraitState } from './types';

function sourceOf(t: TraitState): PointSource {
  if (t.self === null) return 'chart';
  return t.status === 'matched' ? 'both' : 'answer';
}

function priorKeyword(t: TraitState, lang: Lang): string {
  const def = traitText(t.id, lang);
  return t.prior >= 0 ? def.pos.keyword : def.neg.keyword;
}

const q = (lang: Lang, s: string) => (lang === 'en' ? `“${s}”` : `「${s}」`);

/** 命式からの仮説をひとこと（まだ回答していない特性のみ） */
function hypothesisLine(ctx: DiagnosisContext, traits: TraitId[], lang: Lang): string {
  for (const id of traits) {
    const t = ctx.traits[id];
    if (t.status !== 'hypothesis' || Math.abs(t.prior) < HYPOTHESIS_THRESHOLD) continue;
    const kw = (t.prior > 0 ? traitText(id, lang).pos : traitText(id, lang).neg).keyword;
    return lang === 'en' ? ` Your chart suggests a tendency toward ${q(lang, kw)}.` : `占いの解釈では${q(lang, kw)}の傾向が示唆されています。`;
  }
  return '';
}

/** トピックを開いたときの最初の解釈 */
export function topicIntro(topic: TopicDef, ctx: DiagnosisContext, lang: Lang): string {
  const dm = dmText(ctx.chart.dayStem, lang);
  const intro = topic.intro;
  switch (intro.kind) {
    case 'dm':
      return intro.field === 'essenceSelf' ? `${dm.essence} ${dm.self}` : dm[intro.field];
    case 'text': {
      const hyp = intro.hyp ? hypothesisLine(ctx, intro.hyp, lang) : '';
      const after = intro.after ? (lang === 'en' ? ' ' : '') + pick(intro.after, lang) : '';
      return pick(intro.text, lang) + hyp + after;
    }
    case 'backfire':
      return lang === 'en'
        ? `Every strength has conditions where it backfires. One strength in your chart is: “${dm.strengths[0]}.” Let’s look at its flip side.`
        : `どんな強みにも、裏目に出やすい条件があります。あなたの命式から読める強みのひとつは「${dm.strengths[0]}」。その裏側を見ていきましょう。`;
    case 'balance': {
      const counts = ctx.chart.elementCounts;
      const spread = Math.max(...counts) - Math.min(...counts);
      if (lang === 'en') {
        return spread >= 3
          ? 'Your chart has a clear lean in its five elements. You focus easily on what you’re good at, and thinking about balance may make some moments easier.'
          : 'Your chart has a fairly even mix of the five elements. You may have a knack for handling many things in balance.';
      }
      return spread >= 3
        ? 'あなたの命式は、五行の偏りがはっきりしたタイプ。得意なことに集中しやすい反面、バランスを意識すると楽になる場面もありそうです。'
        : 'あなたの命式は、五行が比較的まんべんなく入ったタイプ。いろいろなことをバランスよくこなせる素質がありそうです。';
    }
  }
}

function topicExtras(topic: TopicDef, ctx: DiagnosisContext, lang: Lang): ResultPoint[] {
  const dm = dmText(ctx.chart.dayStem, lang);
  const points: ResultPoint[] = [];
  for (const d of topic.dmExtras ?? []) {
    if (d === 'strength0') points.push({ kind: 'strength', text: dm.strengths[0], source: 'chart' });
    if (d === 'caution0') points.push({ kind: 'caution', text: dm.cautions[0], source: 'chart' });
  }
  for (const e of topic.extras ?? []) {
    if (e.any.length > 0 && !e.any.some((tag) => ctx.tags.has(tag))) continue;
    points.push({ kind: e.kind, text: pick(e.text, lang), source: e.source ?? 'answer' });
  }
  return points;
}

export function composeTopicResult(topicId: string, ctx: DiagnosisContext, lang: Lang = 'ja'): TopicResult {
  const topic = TOPIC_BY_ID[topicId];
  const states = topic.traits.map((id) => ctx.traits[id]);
  const relevant = states
    .filter((t) => t.self !== null || Math.abs(t.value) >= HYPOTHESIS_THRESHOLD)
    .sort((a, b) => Number(b.self !== null) - Number(a.self !== null) || Math.abs(b.value) - Math.abs(a.value));
  const top = relevant.slice(0, 2);

  const strengths: ResultPoint[] = [];
  const cautions: ResultPoint[] = [];
  const tips: ResultPoint[] = [];
  const notes: ResultPoint[] = [];
  for (const t of top) {
    const def = traitText(t.id, lang);
    const pole = poleOf(t.value);
    const source = sourceOf(t);
    if (pole === 'mid') {
      notes.push({ kind: 'note', text: def.mid.summary, source });
      continue;
    }
    const text = def[pole];
    strengths.push({ kind: 'strength', text: text.strength, source });
    cautions.push({ kind: 'caution', text: text.caution, source });
    tips.push({ kind: 'tip', text: text.tip, source });
  }

  for (const e of topicExtras(topic, ctx, lang)) {
    const bucket = e.kind === 'strength' ? strengths : e.kind === 'caution' ? cautions : e.kind === 'tip' ? tips : notes;
    if (!bucket.some((p) => p.text === e.text)) bucket.push(e);
  }

  const ordered =
    topic.emphasis === 'caution'
      ? [...cautions, ...tips, ...strengths, ...notes]
      : topic.emphasis === 'tip'
        ? [...tips, ...strengths, ...cautions, ...notes]
        : [...strengths, ...cautions, ...tips, ...notes];

  const keywords = top.map((t) => keywordOf(t, lang));
  const title = pick(topic.title, lang);
  const headline =
    keywords.length > 0 ? keywords.map((k) => q(lang, k)).join(lang === 'en' ? ' × ' : '×') : lang === 'en' ? `Hints for: ${title}` : `${title}のヒント`;

  const kws = (ts: TraitState[]) => ts.map((t) => q(lang, keywordOf(t, lang))).join(lang === 'en' ? ', ' : '');
  const leadParts: string[] = [];
  const matched = top.filter((t) => t.status === 'matched');
  const different = top.filter((t) => t.status === 'different');
  const specified = top.filter((t) => t.status === 'specified');
  if (matched.length > 0) {
    leadParts.push(lang === 'en' ? `Your chart and your answers agreed on ${kws(matched)}.` : `占いの解釈とあなたの回答が重なったのは${kws(matched)}。`);
  }
  for (const t of different) {
    if (t.rejected && t.self === null) continue;
    leadParts.push(
      lang === 'en'
        ? `Your chart said ${q(lang, priorKeyword(t, lang))}, but your answers revealed a ${q(lang, keywordOf(t, lang))} side. Gaps like this are clues to who you are.`
        : `占いでは${q(lang, priorKeyword(t, lang))}と出ていましたが、あなたの回答からは${q(lang, keywordOf(t, lang))}の一面が見えてきました。こういうズレも、あなたらしさのヒントです。`,
    );
  }
  if (specified.length > 0) {
    leadParts.push(lang === 'en' ? `Your answers revealed a ${kws(specified)} side.` : `あなたの回答から${kws(specified)}の一面が見えてきました。`);
  }
  if (top.length > 0 && top.every((t) => t.self === null)) {
    leadParts.push(
      lang === 'en'
        ? 'Everything here is still based only on your chart. Answering questions makes it fit your real experience.'
        : 'ここに書いたことは、まだ占いの解釈だけにもとづいています。質問に答えると、あなたの実感に合わせて具体的になります。',
    );
  }
  if (top.length === 0) {
    leadParts.push(
      lang === 'en'
        ? 'There aren’t many clues on this theme yet. Answer what you can, and more hints will appear.'
        : 'このテーマについては、まだ手がかりが少なめです。答えられる範囲で質問に答えると、ヒントが増えていきます。',
    );
  }

  const answeredTraits = states.filter((t) => t.self !== null);
  const labels = answeredTraits.map((t) => q(lang, traitText(t.id, lang).label));
  const progressNote =
    answeredTraits.length > 0
      ? lang === 'en'
        ? `From your answers so far, ${labels.join(', ')} became clearer.`
        : `ここまでの回答から、${labels.join('')}が具体的になってきました。`
      : lang === 'en'
        ? 'This is still based only on your chart.'
        : 'まだ占いの解釈だけの状態です。';

  return { topicId, headline, lead: leadParts.join(lang === 'en' ? ' ' : ''), points: ordered, keywords, progressNote };
}

// ---- 初期診断 ----

export interface InitialReading {
  dayStemLabel: string;
  dayStemReading: string;
  image: string;
  nickname: string;
  essence: string;
  strengths: string[];
  cautions: string[];
  topGroup: { group: StarGroup; name: string; stars: string; keyword: string; count: number; text: string } | null;
  elements: { name: string; count: number }[];
  elementNotes: string[];
}

export function buildInitialReading(chart: ChartAnalysis, lang: Lang = 'ja'): InitialReading {
  const dm = dmText(chart.dayStem, lang);
  const groups = Object.entries(chart.groupCounts) as [StarGroup, number][];
  const [bestGroup, bestCount] = groups.reduce((a, b) => (b[1] > a[1] ? b : a));
  const g = starGroupText(bestGroup, lang);
  const topGroup = bestCount >= 2 ? { group: bestGroup, name: g.name, stars: g.stars, keyword: g.keyword, count: bestCount, text: g.strong } : null;
  const elementNotes: string[] = [];
  const maxCount = Math.max(...chart.elementCounts);
  if (maxCount >= 3) chart.dominantElements.forEach((e) => elementNotes.push(elementText(e, lang).many));
  chart.missingElements.slice(0, 2).forEach((e) => elementNotes.push(elementText(e, lang).none));
  if (elementNotes.length === 0) {
    elementNotes.push(
      lang === 'en'
        ? 'A chart with all five elements fairly evenly. You may have a sense of balance that adapts to many situations.'
        : '五行がまんべんなく入った命式。いろいろな場面に対応できるバランス感覚がありそうです。',
    );
  }

  return {
    dayStemLabel: STEMS[chart.dayStem],
    dayStemReading: stemReading(chart.dayStem, lang),
    image: dm.image,
    nickname: dm.nickname,
    essence: dm.essence,
    strengths: [...dm.strengths],
    cautions: [...dm.cautions],
    topGroup,
    elements: chart.elementCounts.map((count, i) => ({ name: elementText(i, lang).name, count })),
    elementNotes,
  };
}

// ---- 相性 ----

export interface CompatResult {
  selfDay: string;
  partnerDay: string;
  title: string;
  stemText: string;
  branchText: string;
  tip: string;
}

export function composeCompat(selfDay: Pillar, partnerDay: Pillar, lang: Lang = 'ja'): CompatResult {
  const c = compatibilityOf(selfDay, partnerDay);
  const s = stemRelationText(c.stem, lang);
  return {
    selfDay: pillarText(selfDay.stem, selfDay.branch, lang),
    partnerDay: pillarText(partnerDay.stem, partnerDay.branch, lang),
    title: s.title,
    stemText: s.text,
    branchText: branchRelationText(c.branch, lang),
    tip: s.tip,
  };
}

// ---- 年運 ----

export interface YearReading {
  year: number;
  pillar: string;
  star: string;
  title: string;
  text: string;
  hint: string;
  branchNote: string | null;
}

export function composeYearReadings(chart: ChartAnalysis, currentYear: number, lang: Lang = 'ja'): YearReading[] {
  return [currentYear, currentYear + 1].map((year) => {
    const p = yearPillarForYear(year);
    const god = tenGodOf(chart.dayStem, p.stem);
    const theme = yearThemeText(god, lang);
    const rel = branchRelation(chart.pillars.day.branch, p.branch);
    return {
      year,
      pillar: pillarText(p.stem, p.branch, lang),
      star: lang === 'en' ? TEN_GOD_NAMES_EN[god] : TEN_GOD_NAMES[god],
      title: theme.title,
      text: theme.text,
      hint: theme.hint,
      branchNote: yearBranchNote(rel, lang),
    };
  });
}
