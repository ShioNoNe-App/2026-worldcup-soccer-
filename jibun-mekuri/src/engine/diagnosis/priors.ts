// 命式から人物像の仮説（初期値）を導く。どの解釈に基づくかを basis として残す。
import type { ChartAnalysis, StarGroup } from '../bazi/analysis';
import { STEMS } from '../bazi/constants';
import { DAY_MASTERS } from '../../content/dayMasters';
import { ELEMENTS, STAR_GROUPS } from '../../content/chartTexts';
import { TRAIT_IDS } from '../../content/traits';
import type { Prior, TraitId } from './types';

const PRIOR_LIMIT = 0.8;

export function priorsFromChart(chart: ChartAnalysis): Record<TraitId, Prior> {
  const priors = Object.fromEntries(TRAIT_IDS.map((id) => [id, { value: 0, basis: [] as string[] }])) as Record<TraitId, Prior>;
  const add = (trait: TraitId, value: number, basis: string) => {
    const p = priors[trait];
    p.value += value;
    if (!p.basis.includes(basis)) p.basis.push(basis);
  };

  const dm = DAY_MASTERS[chart.dayStem];
  const dmBasis = `日干「${STEMS[chart.dayStem]}（${dm.image}）」の解釈`;
  for (const [trait, v] of Object.entries(dm.priors) as [TraitId, number][]) add(trait, v, dmBasis);

  for (const [group, count] of Object.entries(chart.groupCounts) as [StarGroup, number][]) {
    if (count < 2) continue;
    const g = STAR_GROUPS[group];
    const scale = Math.min(0.3, (count - 1) * 0.12);
    const basis = `命式に${g.name}（${g.stars}）が${count}つ`;
    for (const [trait, v] of Object.entries(g.priors) as [TraitId, number][]) add(trait, v * scale, basis);
  }

  chart.elementCounts.forEach((count, el) => {
    if (count < 3) return;
    const e = ELEMENTS[el];
    const basis = `五行の「${e.name}」が多め（${count}つ）`;
    for (const [trait, v] of Object.entries(e.prior ?? {}) as [TraitId, number][]) add(trait, v, basis);
  });

  for (const id of TRAIT_IDS) {
    const p = priors[id];
    p.value = Math.max(-PRIOR_LIMIT, Math.min(PRIOR_LIMIT, Math.round(p.value * 100) / 100));
  }
  return priors;
}
