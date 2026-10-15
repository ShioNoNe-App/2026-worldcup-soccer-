// 文章の言語切り替え。ロジック（ID・効果・分岐条件）は日本語版のデータを正とし、
// 表示する文章だけを言語に合わせて差し替える。
import type { BranchRelation, StarGroup, StemRelation, TenGod } from '../engine/bazi/analysis';
import { BRANCHES, STEMS, STEM_READINGS } from '../engine/bazi/constants';
import type { BasisRef, L, OptionDef, PoleText, QuestionDef, TraitId } from '../engine/diagnosis/types';
import type { Lang } from '../i18n/lang';
import {
  BRANCH_RELATION_TEXTS,
  ELEMENTS,
  STAR_GROUPS,
  STEM_RELATION_TEXTS,
  YEAR_BRANCH_NOTES,
  YEAR_THEMES,
} from './chartTexts';
import { DAY_MASTERS } from './dayMasters';
import { RASHIS } from './jyotish';
import {
  BRANCH_RELATION_TEXTS_EN,
  ELEMENTS_EN,
  STAR_GROUPS_EN,
  STEM_RELATION_TEXTS_EN,
  YEAR_BRANCH_NOTES_EN,
  YEAR_THEMES_EN,
} from './en/chartTexts';
import { DAY_MASTERS_EN, type DayMasterText } from './en/dayMasters';
import { COMMON_OPTIONS_EN, QUESTIONS_EN } from './en/questions';
import { TRAITS_EN, type TraitText } from './en/traits';
import { TRAIT_BY_ID } from './traits';

export const pick = (l: L, lang: Lang): string => l[lang];

export function dmText(stem: number, lang: Lang): DayMasterText {
  return lang === 'en' ? DAY_MASTERS_EN[stem] : DAY_MASTERS[stem];
}

export function traitText(id: TraitId, lang: Lang): TraitText {
  if (lang === 'en') return TRAITS_EN[id];
  const t = TRAIT_BY_ID[id];
  return { label: t.label, pos: t.pos, neg: t.neg, mid: t.mid };
}

export function poleText(id: TraitId, pole: 'pos' | 'neg', lang: Lang): PoleText {
  return traitText(id, lang)[pole];
}

const STEM_EN = ['Yang Wood', 'Yin Wood', 'Yang Fire', 'Yin Fire', 'Yang Earth', 'Yin Earth', 'Yang Metal', 'Yin Metal', 'Yang Water', 'Yin Water'];
const BRANCH_EN = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];

/** 天干の読み（ja: ひらがな、en: 陰陽五行） */
export function stemReading(stem: number, lang: Lang): string {
  return lang === 'en' ? STEM_EN[stem] : STEM_READINGS[stem];
}

export function pillarText(stem: number, branch: number, lang: Lang): string {
  const kan = STEMS[stem] + BRANCHES[branch];
  return lang === 'en' ? `${kan} (${STEM_EN[stem]} ${BRANCH_EN[branch]})` : kan;
}

// ---- 質問 ----

const CHECK_OPTIONS: Record<Lang, Record<string, { label: string; reaction?: string }>> = {
  ja: {},
  en: {
    yes2: { label: 'Very much!', reaction: 'I knew it!' },
    yes1: { label: 'A little', reaction: 'Hmm, a little — got it.' },
    no: { label: 'Not really', reaction: 'I see, there’s another side to you.' },
    wrong: { label: 'Not at all', reaction: 'Thanks for telling me. I won’t push this reading on you.' },
    unknown: { label: 'Not sure' },
  },
};

/** 質問の文章を言語に合わせる（ロジックはそのまま） */
export function localizeQuestion(q: QuestionDef, lang: Lang): QuestionDef {
  if (lang === 'ja') return q;
  if (q.id.startsWith('check:')) {
    const trait = q.targets[0];
    const pole = q.checkPole ?? 'pos';
    const p = poleText(trait, pole, 'en');
    return {
      ...q,
      text: `Your chart suggests you’re “${p.keyword}.” Does that sound like you?`,
      sub: p.summary,
      options: q.options.map((o) => ({ ...o, ...CHECK_OPTIONS.en[o.id] })),
    };
  }
  const en = QUESTIONS_EN[q.id];
  if (!en) return q;
  return {
    ...q,
    text: en.text,
    sub: en.sub,
    options: q.options.map((o): OptionDef => {
      const t = en.options[o.id] ?? COMMON_OPTIONS_EN[o.id];
      return t ? { ...o, label: t.label, reaction: t.reaction, keyword: 'keyword' in t ? t.keyword : undefined } : o;
    }),
  };
}

// ---- 命式の解釈文 ----

export function starGroupText(group: StarGroup, lang: Lang) {
  return lang === 'en' ? STAR_GROUPS_EN[group] : STAR_GROUPS[group];
}

export function elementText(el: number, lang: Lang) {
  return lang === 'en' ? ELEMENTS_EN[el] : ELEMENTS[el];
}

export function yearThemeText(god: TenGod, lang: Lang) {
  return lang === 'en' ? YEAR_THEMES_EN[god] : YEAR_THEMES[god];
}

export function yearBranchNote(rel: BranchRelation, lang: Lang): string | null {
  return (lang === 'en' ? YEAR_BRANCH_NOTES_EN[rel] : YEAR_BRANCH_NOTES[rel]) ?? null;
}

export function stemRelationText(rel: StemRelation, lang: Lang) {
  return lang === 'en' ? STEM_RELATION_TEXTS_EN[rel] : STEM_RELATION_TEXTS[rel];
}

export function branchRelationText(rel: BranchRelation, lang: Lang): string {
  return lang === 'en' ? BRANCH_RELATION_TEXTS_EN[rel] : BRANCH_RELATION_TEXTS[rel];
}

export function basisText(b: BasisRef, lang: Lang): string {
  switch (b.kind) {
    case 'dayMaster': {
      const dm = dmText(b.stem, lang);
      return lang === 'en' ? `Reading of your day stem ${STEMS[b.stem]} (${dm.image})` : `日干「${STEMS[b.stem]}（${dm.image}）」の解釈`;
    }
    case 'group': {
      const g = starGroupText(b.group, lang);
      return lang === 'en' ? `${b.count} ${g.name} (${g.stars}) in your chart` : `命式に${g.name}（${g.stars}）が${b.count}つ`;
    }
    case 'element': {
      const e = elementText(b.element, lang);
      return lang === 'en' ? `Plenty of ${e.name} (${b.count})` : `五行の「${e.name}」が多め（${b.count}つ）`;
    }
    case 'moonSign': {
      const r = RASHIS[b.sign];
      return lang === 'en' ? `Indian astrology: Moon in ${r.name.en}` : `インド占星術：月星座 ${r.name.ja}`;
    }
    case 'type16':
      return lang === 'en' ? `16 types: “${b.letter}” in ${b.code}` : `16タイプ：${b.code} の「${b.letter}」`;
  }
}

export const SYSTEM_NAMES: Record<'bazi' | 'jyotish' | 'type16' | 'answers', L> = {
  bazi: { ja: '四柱推命', en: 'Four Pillars' },
  jyotish: { ja: 'インド占星術', en: 'Indian astrology' },
  type16: { ja: '16タイプ', en: '16 types' },
  answers: { ja: 'あなたの回答', en: 'Your answers' },
};

export const TEN_GOD_NAMES_EN: Record<TenGod, string> = {
  hikenn: 'Peer',
  gouzai: 'Rob Wealth',
  shokujin: 'Eating God',
  shoukan: 'Hurting Officer',
  henzai: 'Indirect Wealth',
  seizai: 'Direct Wealth',
  henkan: 'Seven Killings',
  seikan: 'Direct Officer',
  henin: 'Indirect Resource',
  inju: 'Direct Resource',
};
