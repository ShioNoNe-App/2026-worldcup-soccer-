import type { Pillar } from '../engine/bazi/constants';
import type { Answers, ThemeId, TraitId } from '../engine/diagnosis/types';
import type { Lang } from '../i18n/lang';

export type StyleId = 'pop' | 'chic' | 'game';
export const STYLE_IDS: StyleId[] = ['pop', 'chic', 'game'];
export const DEFAULT_STYLE: StyleId = 'pop';

export type Screen =
  | 'welcome'
  | 'style'
  | 'profile'
  | 'reading'
  | 'themes'
  | 'home'
  | 'theme'
  | 'topic'
  | 'themeRun'
  | 'map'
  | 'settings'
  | 'about';

export interface Profile {
  /** YYYY-MM-DD（日本時間） */
  birthDate: string;
  /** HH:MM。不明なら null */
  birthTime: string | null;
  /** 本人が知っている16タイプ（任意）。例: 'ENTP' */
  type16?: string | null;
}

export interface AppState {
  version: 1;
  style: StyleId;
  styleChosen: boolean;
  profile: Profile | null;
  onboarded: boolean;
  readingStep: number;
  selectedThemes: ThemeId[];
  answers: Answers;
  completedTopics: string[];
  /** まとめて答え終わったテーマ */
  themeRunsDone: ThemeId[];
  /** 「もっと深掘り」で追加した質問枠 */
  topicExtra: Record<string, number>;
  activeTheme: ThemeId | null;
  activeTopic: string | null;
  screen: Screen;
  /** 発見カードとして表示済みの特性 */
  seenTraits: TraitId[];
  /** 相性: 相手の日柱のみ保存（相手の生年月日は保存しない） */
  compat: { partnerDay: Pillar } | null;
  motion: 'auto' | 'reduce';
  lang: Lang;
  lastVisit: number | null;
}

export function initialState(): AppState {
  return {
    version: 1,
    style: DEFAULT_STYLE,
    styleChosen: false,
    profile: null,
    onboarded: false,
    readingStep: 0,
    selectedThemes: [],
    answers: {},
    completedTopics: [],
    themeRunsDone: [],
    topicExtra: {},
    activeTheme: null,
    activeTopic: null,
    screen: 'welcome',
    seenTraits: [],
    compat: null,
    motion: 'auto',
    lang: 'ja',
    lastVisit: null,
  };
}
