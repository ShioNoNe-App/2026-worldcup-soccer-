// 占術・診断から人物像の仮説（初期値）を導く。どの解釈に基づくかを basis として残す。
// - 四柱推命（命式）: 日干・通変星・五行
// - インド占星術: 月星座の元素
// - 16タイプ（本人が知っているタイプの自己申告）: 4つの指標
import type { ChartAnalysis, StarGroup } from '../bazi/analysis';
import type { Element } from '../bazi/constants';
import { DAY_MASTERS } from '../../content/dayMasters';
import { ELEMENTS, STAR_GROUPS } from '../../content/chartTexts';
import { RASHIS, RASHI_ELEMENT_PRIORS } from '../../content/jyotish';
import { LETTER_PRIORS, isTypeCode } from '../../content/types16';
import { TRAIT_IDS } from '../../content/traits';
import type { BasisRef, ExtraSources, Prior, SystemId, TraitId } from './types';

const PRIOR_LIMIT = 0.8;

type Acc = Record<TraitId, Prior>;

function empty(): Acc {
  return Object.fromEntries(TRAIT_IDS.map((id) => [id, { value: 0, basis: [] as BasisRef[] }])) as Acc;
}

function add(acc: Acc, trait: TraitId, value: number, basis: BasisRef) {
  const p = acc[trait];
  p.value += value;
  if (!p.basis.includes(basis)) p.basis.push(basis);
}

export function baziPriors(chart: ChartAnalysis): Acc {
  const acc = empty();
  const dm = DAY_MASTERS[chart.dayStem];
  const dmBasis: BasisRef = { kind: 'dayMaster', stem: chart.dayStem };
  for (const [trait, v] of Object.entries(dm.priors) as [TraitId, number][]) add(acc, trait, v, dmBasis);

  for (const [group, count] of Object.entries(chart.groupCounts) as [StarGroup, number][]) {
    if (count < 2) continue;
    const g = STAR_GROUPS[group];
    const scale = Math.min(0.3, (count - 1) * 0.12);
    const basis: BasisRef = { kind: 'group', group, count };
    for (const [trait, v] of Object.entries(g.priors) as [TraitId, number][]) add(acc, trait, v * scale, basis);
  }

  chart.elementCounts.forEach((count, el) => {
    if (count < 3) return;
    const e = ELEMENTS[el];
    const basis: BasisRef = { kind: 'element', element: el as Element, count };
    for (const [trait, v] of Object.entries(e.prior ?? {}) as [TraitId, number][]) add(acc, trait, v, basis);
  });
  return acc;
}

export function jyotishPriors(sources: ExtraSources): Acc {
  const acc = empty();
  const j = sources.jyotish;
  if (!j) return acc;
  const basis: BasisRef = { kind: 'moonSign', sign: j.moonSign };
  const priors = RASHI_ELEMENT_PRIORS[RASHIS[j.moonSign].element];
  for (const [trait, v] of Object.entries(priors) as [TraitId, number][]) add(acc, trait, v, basis);
  return acc;
}

export function type16Priors(sources: ExtraSources): Acc {
  const acc = empty();
  const code = sources.type16;
  if (!isTypeCode(code)) return acc;
  for (const letter of code) {
    const basis: BasisRef = { kind: 'type16', code, letter };
    for (const [trait, v] of Object.entries(LETTER_PRIORS[letter] ?? {}) as [TraitId, number][]) add(acc, trait, v, basis);
  }
  return acc;
}

const clamp = (v: number) => Math.max(-PRIOR_LIMIT, Math.min(PRIOR_LIMIT, Math.round(v * 100) / 100));

export interface CombinedPriors {
  priors: Record<TraitId, Prior>;
  systems: Record<SystemId, Partial<Record<TraitId, number>>>;
}

export function combinedPriors(chart: ChartAnalysis, sources: ExtraSources = {}): CombinedPriors {
  const parts: [SystemId, Acc][] = [
    ['bazi', baziPriors(chart)],
    ['jyotish', jyotishPriors(sources)],
    ['type16', type16Priors(sources)],
  ];
  const priors = empty();
  const systems = { bazi: {}, jyotish: {}, type16: {} } as CombinedPriors['systems'];
  for (const [sys, acc] of parts) {
    for (const id of TRAIT_IDS) {
      const p = acc[id];
      if (p.basis.length === 0) continue;
      systems[sys][id] = clamp(p.value);
      priors[id].value += p.value;
      priors[id].basis.push(...p.basis);
    }
  }
  for (const id of TRAIT_IDS) priors[id].value = clamp(priors[id].value);
  return { priors, systems };
}

/** 互換用: 命式だけの仮説 */
export function priorsFromChart(chart: ChartAnalysis): Record<TraitId, Prior> {
  return combinedPriors(chart).priors;
}
