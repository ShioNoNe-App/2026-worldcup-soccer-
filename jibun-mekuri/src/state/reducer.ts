import type { Pillar } from '../engine/bazi/constants';
import type { ThemeId, TraitId } from '../engine/diagnosis/types';
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
  | { type: 'completeTopic'; topic: string }
  | { type: 'moreQuestions'; topic: string; count: number }
  | { type: 'restartTopic'; topic: string }
  | { type: 'setCompat'; partnerDay: Pillar }
  | { type: 'clearCompat' }
  | { type: 'markSeen'; traits: TraitId[] }
  | { type: 'setMotion'; motion: 'auto' | 'reduce' }
  | { type: 'visited'; at: number }
  | { type: 'reset'; keepStyle?: boolean };

/** 診断の進行状況（プロフィール変更時にリセットする部分） */
function clearedProgress(state: AppState): AppState {
  return {
    ...state,
    readingStep: 0,
    answers: {},
    completedTopics: [],
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
      return action.keepStyle ? { ...fresh, style: state.style, styleChosen: state.styleChosen } : fresh;
    }
  }
}
