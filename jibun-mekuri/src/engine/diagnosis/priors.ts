// 命式から人物像の仮説（初期値）を導く。どの解釈に基づくかを basis として残す。
import type { ChartAnalysis, StarGroup } from '../bazi/analysis';
import type { Element } from '../bazi/constants';
import { DAY_MASTERS } from '../../content/dayMasters';
import { ELEMENTS, STAR_GROUPS } from '../../content/chartTexts';
import { TRAIT_IDS } from '../../content/traits';
import type { BasisRef, Prior, TraitId } from './types';

const PRIOR_LIMIT = 0.8;

export function priorsFromChart(chart: ChartAnalysis): Record<TraitId, Prior> {
  const priors = Object.fromEntries(TRAIT_IDS.map((id) => [id, { value: 0, basis: [] as BasisRef[] }])) as Record<TraitId, Prior>;
  const add = (trait: TraitId, value: number, basis: BasisRef) => {
    const p = priors[trait];
    p.value += value;
    if (!p.basis.includes(basis)) p.basis.push(basis);
  };

  const dm = DAY_MASTERS[chart.dayStem];
  const dmBasis: BasisRef = { kind: 'dayMaster', stem: chart.dayStem };
  for (const [trait, v] of Object.entries(dm.priors) as [TraitId, number][]) add(trait, v, dmBasis);

  for (const [group, count] of Object.entries(chart.groupCounts) as [StarGroup, number][]) {
    if (count < 2) continue;
    const g = STAR_GROUPS[group];
    const scale = Math.min(0.3, (count - 1) * 0.12);
    const basis: BasisRef = { kind: 'group', group, count };
    for (const [trait, v] of Object.entries(g.priors) as [TraitId, number][]) add(trait, v * scale, basis);
  }

  chart.elementCounts.forEach((count, el) => {
    if (count < 3) return;
    const e = ELEMENTS[el];
    const basis: BasisRef = { kind: 'element', element: el as Element, count };
    for (const [trait, v] of Object.entries(e.prior ?? {}) as [TraitId, number][]) add(trait, v, basis);
  });

  for (const id of TRAIT_IDS) {
    const p = priors[id];
    p.value = Math.max(-PRIOR_LIMIT, Math.min(PRIOR_LIMIT, Math.round(p.value * 100) / 100));
  }
  return priors;
}
