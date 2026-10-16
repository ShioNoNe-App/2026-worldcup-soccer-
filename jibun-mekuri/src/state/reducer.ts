import type { Pillar } from '../engine/bazi/constants';
import type { ThemeId, TraitId } from '../engine/diagnosis/types';
import type { Lang } from '../i18n/lang';
import { TOPIC_BY_ID } from '../content/topics';
import { mekurinProgress } from '../content/companion';
import type { BloodAnswer } from '../content/blood';
import { initialState, type AppState, type CharId, type Profile, type Screen, type StyleId } from './types';

export type Action =
  | { type: 'setStyle'; style: StyleId; chosen?: boolean }
  | { type: 'go'; screen: Screen; theme?: ThemeId | null; topic?: string | null }
  | { type: 'setProfile'; profile: Profile }
  | { type: 'readingStep'; step: number }
  | { type: 'toggleTheme'; theme: ThemeId }
  | { type: 'addTheme'; theme: ThemeId }
  | { type: 'finishOnboarding' }
  | { type: 'answer'; questionId: string; optionId: string; topic: string; at: number; daily?: string }
  | { type: 'care'; kind: 'feed' | 'pet'; date: string }
  | { type: 'setPartner'; partner: CharId }
  | { type: 'unlockMekurin' }
  | { type: 'setBlood'; blood: BloodAnswer | null }
  | { type: 'undoAnswer'; questionId: string }
  | { type: 'setThemes'; themes: ThemeId[] }
  | { type: 'setLang'; lang: Lang }
  | { type: 'finishThemeRun'; theme: ThemeId; topics: string[] }
  | { type: 'restartThemeRun'; theme: ThemeId; topics: string[] }
  | { type: 'completeTopic'; topic: string }
  | { type: 'moreQuestions'; topic: string; count: number }
  | { type: 'restartTopic'; topic: string }
  | { type: 'setCompat'; partnerDay: Pillar }
  | { type: 'clearCompat' }
  | { type: 'markSeen'; traits: TraitId[] }
  | { type: 'setMotion'; motion: 'auto' | 'reduce' }
  | { type: 'visited'; at: number }
  | { type: 'reset'; keepStyle?: boolean };

/** 親密度の増え方（ここで一元管理） */
export const INTIMACY = { answer: 2, care: 1 };

const STYLE_DEFAULT: Record<string, CharId> = { pop: 'pom', chic: 'noir', game: 'koro', fairy: 'mekurin' };

/** 一緒にいるキャラは、選んだ世界観（スタイル）と常に一致する */
export function partnerOf(state: AppState): CharId {
  return STYLE_DEFAULT[state.style] ?? 'pom';
}

/** 回答を記録したトピックのテーマ（'theme:love' のようなテーマ入口の質問も含む） */
function themeOfTopic(topic: string): ThemeId | null {
  if (topic.startsWith('theme:')) return topic.slice(6) as ThemeId;
  return TOPIC_BY_ID[topic]?.theme ?? null;
}

/** 診断の進行状況（プロフィール変更時にリセットする部分） */
function clearedProgress(state: AppState): AppState {
  return {
    ...state,
    readingStep: 0,
    answers: {},
    completedTopics: [],
    themeRunsDone: [],
    topicExtra: {},
    activeTheme: null,
    activeTopic: null,
    seenTraits: [],
    compat: null,
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setStyle':
      return { ...state, style: action.style, styleChosen: action.chosen ?? state.styleChosen };
    case 'go':
      return {
        ...state,
        screen: action.screen,
        activeTheme: action.theme !== undefined ? action.theme : state.activeTheme,
        activeTopic: action.topic !== undefined ? action.topic : state.activeTopic,
      };
    case 'setProfile': {
      const same =
        state.profile?.birthDate === action.profile.birthDate && state.profile?.birthTime === action.profile.birthTime;
      const base = same ? state : clearedProgress(state);
      return { ...base, profile: action.profile };
    }
    case 'readingStep':
      return { ...state, readingStep: Math.max(state.readingStep, action.step) };
    case 'toggleTheme': {
      const has = state.selectedThemes.includes(action.theme);
      return {
        ...state,
        selectedThemes: has ? state.selectedThemes.filter((t) => t !== action.theme) : [...state.selectedThemes, action.theme],
      };
    }
    case 'addTheme':
      return state.selectedThemes.includes(action.theme)
        ? state
        : { ...state, selectedThemes: [...state.selectedThemes, action.theme] };
    case 'finishOnboarding':
      return { ...state, onboarded: true, screen: 'home' };
    case 'answer': {
      if (state.answers[action.questionId]) return state;
      const next: AppState = {
        ...state,
        answers: { ...state.answers, [action.questionId]: { optionId: action.optionId, topic: action.topic, at: action.at } },
      };
      // 初めて答えた質問だけ、いま一緒にいるキャラとの親密度を上げる
      if (!state.countedQuestions.includes(action.questionId)) {
        const who = partnerOf(state);
        next.countedQuestions = [...state.countedQuestions, action.questionId];
        next.intimacy = { ...state.intimacy, [who]: (state.intimacy[who] ?? 0) + INTIMACY.answer };
      }
      if (action.daily) {
        next.daily = { date: action.daily, count: state.daily.date === action.daily ? state.daily.count + 1 : 1 };
      }
      return next;
    }
    case 'care': {
      const who = partnerOf(state);
      const care = state.care.date === action.date ? state.care : { date: action.date, fed: [], petted: [] };
      const list = action.kind === 'feed' ? care.fed : care.petted;
      if (list.includes(who)) return state;
      return {
        ...state,
        care: action.kind === 'feed' ? { ...care, fed: [...care.fed, who] } : { ...care, petted: [...care.petted, who] },
        intimacy: { ...state.intimacy, [who]: (state.intimacy[who] ?? 0) + INTIMACY.care },
      };
    }
    case 'setBlood':
      return { ...state, bloodType: action.blood };
    case 'setPartner':
      if (action.partner === 'mekurin' && !state.mekurinUnlocked) return state;
      return { ...state, partner: action.partner };
    case 'unlockMekurin':
      // 対象の質問にすべて答えていなければ解放しない
      if (state.mekurinUnlocked || mekurinProgress(state.answers).remaining.length > 0) return state;
      return { ...state, mekurinUnlocked: true };
    case 'undoAnswer': {
      if (!state.answers[action.questionId]) return state;
      const { [action.questionId]: removed, ...answers } = state.answers;
      return {
        ...state,
        answers,
        themeRunsDone: state.themeRunsDone.filter((t) => t !== themeOfTopic(removed.topic)),
        completedTopics: state.completedTopics.filter((t) => t !== removed.topic),
      };
    }
    case 'setThemes':
      return { ...state, selectedThemes: action.themes };
    case 'setLang':
      return { ...state, lang: action.lang };
    case 'finishThemeRun':
      return {
        ...state,
        themeRunsDone: state.themeRunsDone.includes(action.theme) ? state.themeRunsDone : [...state.themeRunsDone, action.theme],
        completedTopics: [...new Set([...state.completedTopics, ...action.topics])],
      };
    case 'restartThemeRun': {
      const drop = new Set(action.topics);
      return {
        ...state,
        answers: Object.fromEntries(Object.entries(state.answers).filter(([, a]) => !drop.has(a.topic))),
        themeRunsDone: state.themeRunsDone.filter((t) => t !== action.theme),
        completedTopics: state.completedTopics.filter((t) => !drop.has(t)),
      };
    }
    case 'completeTopic':
      return state.completedTopics.includes(action.topic)
        ? state
        : { ...state, completedTopics: [...state.completedTopics, action.topic] };
    case 'moreQuestions':
      return {
        ...state,
        topicExtra: { ...state.topicExtra, [action.topic]: (state.topicExtra[action.topic] ?? 0) + action.count },
        completedTopics: state.completedTopics.filter((t) => t !== action.topic),
      };
    case 'restartTopic': {
      const answers = Object.fromEntries(Object.entries(state.answers).filter(([, a]) => a.topic !== action.topic));
      const { [action.topic]: _removed, ...topicExtra } = state.topicExtra;
      void _removed;
      return {
        ...state,
        answers,
        topicExtra,
        completedTopics: state.completedTopics.filter((t) => t !== action.topic),
      };
    }
    case 'setCompat':
      return { ...state, compat: { partnerDay: action.partnerDay } };
    case 'clearCompat':
      return { ...state, compat: null };
    case 'markSeen': {
      const add = action.traits.filter((t) => !state.seenTraits.includes(t));
      return add.length ? { ...state, seenTraits: [...state.seenTraits, ...add] } : state;
    }
    case 'setMotion':
      return { ...state, motion: action.motion };
    case 'visited':
      return { ...state, lastVisit: action.at };
    case 'reset': {
      const fresh = initialState();
      const base = { ...fresh, lang: state.lang };
      return action.keepStyle ? { ...base, style: state.style, styleChosen: state.styleChosen } : base;
    }
  }
}
