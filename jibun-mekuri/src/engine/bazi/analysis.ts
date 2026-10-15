// 命式から導ける計算上の特徴（五行の数、通変星、相性の関係）。
// ここでは「計算結果」だけを返し、文章の解釈は content/ 側で行う。
import {
  BRANCH_ELEMENTS,
  BRANCH_MAIN_HIDDEN_STEM,
  type Element,
  type Pillar,
  mod,
  stemElement,
  stemIsYang,
} from './constants';
import { computeFourPillars, type BirthInput, type FourPillars } from './calendar';

export type TenGod =
  | 'hikenn' // 比肩
  | 'gouzai' // 劫財
  | 'shokujin' // 食神
  | 'shoukan' // 傷官
  | 'henzai' // 偏財
  | 'seizai' // 正財
  | 'henkan' // 偏官
  | 'seikan' // 正官
  | 'henin' // 偏印
  | 'inju'; // 印綬

export const TEN_GOD_NAMES: Record<TenGod, string> = {
  hikenn: '比肩',
  gouzai: '劫財',
  shokujin: '食神',
  shoukan: '傷官',
  henzai: '偏財',
  seizai: '正財',
  henkan: '偏官',
  seikan: '正官',
  henin: '偏印',
  inju: '印綬',
};

/** 通変星の5グループ */
export type StarGroup = 'self' | 'expression' | 'wealth' | 'authority' | 'learning';
export const STAR_GROUP_OF: Record<TenGod, StarGroup> = {
  hikenn: 'self',
  gouzai: 'self',
  shokujin: 'expression',
  shoukan: 'expression',
  henzai: 'wealth',
  seizai: 'wealth',
  henkan: 'authority',
  seikan: 'authority',
  henin: 'learning',
  inju: 'learning',
};

/** 日干から見た他の天干の通変星 */
export function tenGodOf(dayStem: number, otherStem: number): TenGod {
  const de = stemElement(dayStem);
  const oe = stemElement(otherStem);
  const samePolarity = stemIsYang(dayStem) === stemIsYang(otherStem);
  if (de === oe) return samePolarity ? 'hikenn' : 'gouzai';
  if (mod(de + 1, 5) === oe) return samePolarity ? 'shokujin' : 'shoukan';
  if (mod(de + 2, 5) === oe) return samePolarity ? 'henzai' : 'seizai';
  if (mod(oe + 2, 5) === de) return samePolarity ? 'henkan' : 'seikan';
  return samePolarity ? 'henin' : 'inju';
}

export interface ChartAnalysis {
  pillars: FourPillars;
  dayStem: number;
  dayElement: Element;
  /** 天干と地支（本気の五行）を1つずつ数えた簡易集計 */
  elementCounts: [number, number, number, number, number];
  /** 日干以外の天干と、地支の本気蔵干から求めた通変星 */
  tenGods: { position: string; god: TenGod }[];
  groupCounts: Record<StarGroup, number>;
  dominantElements: Element[];
  missingElements: Element[];
}

export function analyzePillars(pillars: FourPillars): ChartAnalysis {
  const list: { name: string; p: Pillar }[] = [
    { name: '年', p: pillars.year },
    { name: '月', p: pillars.month },
    { name: '日', p: pillars.day },
  ];
  if (pillars.hour) list.push({ name: '時', p: pillars.hour });

  const counts: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const { p } of list) {
    counts[stemElement(p.stem)]++;
    counts[BRANCH_ELEMENTS[p.branch]]++;
  }

  const dayStem = pillars.day.stem;
  const tenGods: { position: string; god: TenGod }[] = [];
  for (const { name, p } of list) {
    if (name !== '日') tenGods.push({ position: `${name}干`, god: tenGodOf(dayStem, p.stem) });
    tenGods.push({ position: `${name}支`, god: tenGodOf(dayStem, BRANCH_MAIN_HIDDEN_STEM[p.branch]) });
  }
  const groupCounts: Record<StarGroup, number> = { self: 0, expression: 0, wealth: 0, authority: 0, learning: 0 };
  for (const t of tenGods) groupCounts[STAR_GROUP_OF[t.god]]++;

  const max = Math.max(...counts);
  const dominantElements = counts.flatMap((c, i) => (c === max ? [i as Element] : []));
  const missingElements = counts.flatMap((c, i) => (c === 0 ? [i as Element] : []));

  return {
    pillars,
    dayStem,
    dayElement: stemElement(dayStem),
    elementCounts: counts,
    tenGods,
    groupCounts,
    dominantElements,
    missingElements,
  };
}

export function analyzeBirth(input: BirthInput): ChartAnalysis {
  return analyzePillars(computeFourPillars(input));
}

// ---- 相性（日柱どうしの関係）----

export type StemRelation = 'combine' | 'same' | 'iGenerate' | 'theyGenerate' | 'iControl' | 'theyControl';
export type BranchRelation = 'sixCombine' | 'clash' | 'trine' | 'same' | 'neutral';

const SIX_COMBINE: [number, number][] = [
  [0, 1],
  [2, 11],
  [3, 10],
  [4, 9],
  [5, 8],
  [6, 7],
];

export function stemRelation(a: number, b: number): StemRelation {
  // 干合: 甲己・乙庚・丙辛・丁壬・戊癸（差が5）
  if (Math.abs(a - b) === 5) return 'combine';
  const ae = stemElement(a);
  const be = stemElement(b);
  if (ae === be) return 'same';
  if (mod(ae + 1, 5) === be) return 'iGenerate';
  if (mod(be + 1, 5) === ae) return 'theyGenerate';
  if (mod(ae + 2, 5) === be) return 'iControl';
  return 'theyControl';
}

export function branchRelation(a: number, b: number): BranchRelation {
  if (a === b) return 'same';
  if (SIX_COMBINE.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return 'sixCombine';
  if (mod(a - b, 12) === 6) return 'clash';
  // 三合: 申子辰・亥卯未・寅午戌・巳酉丑（同じグループ = 4 の倍数ずれ）
  if (mod(a - b, 4) === 0) return 'trine';
  return 'neutral';
}

export interface Compatibility {
  partnerDay: Pillar;
  stem: StemRelation;
  branch: BranchRelation;
}

export function compatibilityOf(selfDay: Pillar, partnerDay: Pillar): Compatibility {
  return {
    partnerDay,
    stem: stemRelation(selfDay.stem, partnerDay.stem),
    branch: branchRelation(selfDay.branch, partnerDay.branch),
  };
}
