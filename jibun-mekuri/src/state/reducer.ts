import type { Pillar } from '../engine/bazi/constants';
import type { ThemeId, TraitId } from '../engine/diagnosis/types';
import type { Lang } from '../i18n/lang';
import { TOPIC_BY_ID } from '../content/topics';
import { initialState, type AppState, type Profile, type Screen, type StyleId } from './types';

export type Action =
  | { type: 'setStyle'; style: StyleId; chosen?: boolean }
  | { type: 'go'; screen: Screen; theme?: ThemeId | null; topic?: string | null }
  | { type: 'setProfile'; profile: Profile }
  | { type: 'readingStep'; step: number }
  | { type: 'toggleTheme'; theme: ThemeId }
  | { type: 'addTheme'; theme: ThemeId }
  | { type: 'finishOnboarding' }
  | { type: 'answer'; questionId: string; optionId: string; topic: string; at: number }
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
    case 'answer':
      if (state.answers[action.questionId]) return state;
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: { optionId: action.optionId, topic: action.topic, at: action.at } },
      };
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
