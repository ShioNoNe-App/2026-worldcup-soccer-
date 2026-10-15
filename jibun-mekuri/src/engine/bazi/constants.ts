// 四柱推命の基本定数。文章解釈は含まない（content/ 側で扱う）。

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const STEM_READINGS = ['きのえ', 'きのと', 'ひのえ', 'ひのと', 'つちのえ', 'つちのと', 'かのえ', 'かのと', 'みずのえ', 'みずのと'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const BRANCH_READINGS = ['ね', 'うし', 'とら', 'う', 'たつ', 'み', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'い'] as const;

/** 五行: 木=0, 火=1, 土=2, 金=3, 水=4 */
export type Element = 0 | 1 | 2 | 3 | 4;
export const ELEMENT_NAMES = ['木', '火', '土', '金', '水'] as const;
export const ELEMENT_KEYS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

export function stemElement(stem: number): Element {
  return Math.floor(stem / 2) as Element;
}
export function stemIsYang(stem: number): boolean {
  return stem % 2 === 0;
}

/** 地支の五行（本気の五行） */
export const BRANCH_ELEMENTS: readonly Element[] = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
/** 地支の蔵干・本気（主たる蔵干）の天干インデックス */
export const BRANCH_MAIN_HIDDEN_STEM: readonly number[] = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8];

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export interface Pillar {
  stem: number;
  branch: number;
}

export function pillarLabel(p: Pillar): string {
  return STEMS[p.stem] + BRANCHES[p.branch];
}

/** 六十干支の番号（甲子=0）から柱を作る */
export function pillarFromCycle(index: number): Pillar {
  const i = mod(index, 60);
  return { stem: i % 10, branch: i % 12 };
}

/** 柱から六十干支の番号を求める（存在しない組み合わせは -1） */
export function cycleIndex(p: Pillar): number {
  for (let i = 0; i < 60; i++) {
    if (i % 10 === p.stem && i % 12 === p.branch) return i;
  }
  return -1;
}
