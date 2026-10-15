// 診断結果の組み立て。占いからの解釈（chart）と本人の回答（answer）を区別して返す。
import { TEN_GOD_NAMES, compatibilityOf, tenGodOf, branchRelation, type ChartAnalysis, type StarGroup } from '../bazi/analysis';
import { yearPillarForYear } from '../bazi/calendar';
import { BRANCHES, ELEMENT_NAMES, STEMS, STEM_READINGS, pillarLabel, type Pillar } from '../bazi/constants';
import {
  BRANCH_RELATION_TEXTS,
  ELEMENTS,
  STAR_GROUPS,
  STEM_RELATION_TEXTS,
  YEAR_BRANCH_NOTES,
  YEAR_THEMES,
} from '../../content/chartTexts';
import { DAY_MASTERS } from '../../content/dayMasters';
import { TOPIC_BY_ID } from '../../content/topics';
import { TRAIT_BY_ID } from '../../content/traits';
import { HYPOTHESIS_THRESHOLD, keywordOf, poleOf } from './engine';
import type { DiagnosisContext, PointSource, ResultPoint, TopicResult, TraitState } from './types';

function sourceOf(t: TraitState): PointSource {
  if (t.self === null) return 'chart';
  return t.status === 'matched' ? 'both' : 'answer';
}

function priorKeyword(t: TraitState): string {
  const def = TRAIT_BY_ID[t.id];
  return t.prior >= 0 ? def.pos.keyword : def.neg.keyword;
}

export function composeTopicResult(topicId: string, ctx: DiagnosisContext): TopicResult {
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
    const def = TRAIT_BY_ID[t.id];
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

  const extras = topic.extras?.(ctx) ?? [];
  for (const e of extras) {
    const bucket = e.kind === 'strength' ? strengths : e.kind === 'caution' ? cautions : e.kind === 'tip' ? tips : notes;
    if (!bucket.some((p) => p.text === e.text)) bucket.push(e);
  }

  const ordered =
    topic.emphasis === 'caution'
      ? [...cautions, ...tips, ...strengths, ...notes]
      : topic.emphasis === 'tip'
        ? [...tips, ...strengths, ...cautions, ...notes]
        : [...strengths, ...cautions, ...tips, ...notes];

  const keywords = top.map(keywordOf);
  const headline = keywords.length > 0 ? keywords.map((k) => `「${k}」`).join('×') : `${topic.title}のヒント`;

  const leadParts: string[] = [];
  const matched = top.filter((t) => t.status === 'matched');
  const different = top.filter((t) => t.status === 'different');
  const specified = top.filter((t) => t.status === 'specified');
  if (matched.length > 0) {
    leadParts.push(`占いの解釈とあなたの回答が重なったのは「${matched.map(keywordOf).join('」「')}」。`);
  }
  for (const t of different) {
    if (t.rejected && t.self === null) continue;
    leadParts.push(
      `占いでは「${priorKeyword(t)}」と出ていましたが、あなたの回答からは「${keywordOf(t)}」の一面が見えてきました。こういうズレも、あなたらしさのヒントです。`,
    );
  }
  if (specified.length > 0) leadParts.push(`あなたの回答から「${specified.map(keywordOf).join('」「')}」の一面が見えてきました。`);
  if (top.length > 0 && top.every((t) => t.self === null)) {
    leadParts.push('ここに書いたことは、まだ占いの解釈だけにもとづいています。質問に答えると、あなたの実感に合わせて具体的になります。');
  }
  if (top.length === 0) leadParts.push('このテーマについては、まだ手がかりが少なめです。答えられる範囲で質問に答えると、ヒントが増えていきます。');

  const answeredTraits = states.filter((t) => t.self !== null);
  const progressNote =
    answeredTraits.length > 0
      ? `ここまでの回答から、「${answeredTraits.map((t) => TRAIT_BY_ID[t.id].label).join('」「')}」が具体的になってきました。`
      : 'まだ占いの解釈だけの状態です。';

  return { topicId, headline, lead: leadParts.join(''), points: ordered, keywords, progressNote };
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

export function buildInitialReading(chart: ChartAnalysis): InitialReading {
  const dm = DAY_MASTERS[chart.dayStem];
  const groups = Object.entries(chart.groupCounts) as [StarGroup, number][];
  const [bestGroup, bestCount] = groups.reduce((a, b) => (b[1] > a[1] ? b : a));
  const topGroup =
    bestCount >= 2
      ? { group: bestGroup, ...STAR_GROUPS[bestGroup], count: bestCount, text: STAR_GROUPS[bestGroup].strong }
      : null;
  const elementNotes: string[] = [];
  const maxCount = Math.max(...chart.elementCounts);
  if (maxCount >= 3) chart.dominantElements.forEach((e) => elementNotes.push(ELEMENTS[e].many));
  chart.missingElements.slice(0, 2).forEach((e) => elementNotes.push(ELEMENTS[e].none));
  if (elementNotes.length === 0) elementNotes.push('五行がまんべんなく入った命式。いろいろな場面に対応できるバランス感覚がありそうです。');

  return {
    dayStemLabel: STEMS[chart.dayStem],
    dayStemReading: STEM_READINGS[chart.dayStem],
    image: dm.image,
    nickname: dm.nickname,
    essence: dm.essence,
    strengths: [...dm.strengths],
    cautions: [...dm.cautions],
    topGroup,
    elements: chart.elementCounts.map((count, i) => ({ name: ELEMENT_NAMES[i], count })),
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

export function composeCompat(selfDay: Pillar, partnerDay: Pillar): CompatResult {
  const c = compatibilityOf(selfDay, partnerDay);
  const s = STEM_RELATION_TEXTS[c.stem];
  return {
    selfDay: pillarLabel(selfDay),
    partnerDay: pillarLabel(partnerDay),
    title: s.title,
    stemText: s.text,
    branchText: BRANCH_RELATION_TEXTS[c.branch],
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

export function composeYearReadings(chart: ChartAnalysis, currentYear: number): YearReading[] {
  return [currentYear, currentYear + 1].map((year) => {
    const p = yearPillarForYear(year);
    const god = tenGodOf(chart.dayStem, p.stem);
    const theme = YEAR_THEMES[god];
    const rel = branchRelation(chart.pillars.day.branch, p.branch);
    return {
      year,
      pillar: `${STEMS[p.stem]}${BRANCHES[p.branch]}`,
      star: TEN_GOD_NAMES[god],
      title: theme.title,
      text: theme.text,
      hint: theme.hint,
      branchNote: YEAR_BRANCH_NOTES[rel] ?? null,
    };
  });
}
