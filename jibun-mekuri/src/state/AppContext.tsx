import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { analyzeBirth, type ChartAnalysis } from '../engine/bazi/analysis';
import { buildContext } from '../engine/diagnosis/engine';
import { computeJyotish, type JyotishChart } from '../engine/jyotish/jyotish';
import type { DiagnosisContext } from '../engine/diagnosis/types';
import { reducer, type Action } from './reducer';
import { clearState, loadState, saveState } from './storage';
import type { AppState, CharId } from './types';
import { partnerOf } from './reducer';
import { COMPANIONS, mekurinProgress, stageOf } from '../content/companion';
import { loadStyleFonts } from '../ui/fonts';

export interface Toast {
  id: number;
  text: string;
  icon?: string;
}

interface AppContextValue {
  state: AppState;
  dispatch: (a: Action) => void;
  chart: ChartAnalysis | null;
  diag: DiagnosisContext | null;
  jyotish: JyotishChart | null;
  toasts: Toast[];
  notify: (text: string, icon?: string) => void;
  /** 前回の保存データから再開した（このセッションの最初だけ true） */
  restored: boolean;
  loadWarning: boolean;
  deleteAll: () => void;
  partner: CharId;
  celebration: Celebration | null;
  dismissCelebration: () => void;
}

export interface Celebration {
  kind: 'stage' | 'mekurin';
  who: CharId;
  stage: number;
}

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => loadState());
  const [state, dispatch] = useReducer(reducer, initial.state);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    // 何も入力していない初期状態は保存しない（削除直後に空データを書き戻さない）
    const pristine = !state.profile && !state.styleChosen && state.lang === 'ja' && Object.keys(state.answers).length === 0;
    if (pristine) clearState();
    else saveState(state);
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.style = state.style;
    root.lang = state.lang;
    loadStyleFonts(state.style);
    if (state.motion === 'reduce') root.dataset.motion = 'reduce';
    else delete root.dataset.motion;
  }, [state.style, state.motion, state.lang]);

  // ---- 親密度の段階アップ・隠しキャラ解放のお祝い ----
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const notifyRef = useRef<(text: string, icon?: string) => void>(() => {});
  const partner = partnerOf(state);
  const points = state.intimacy[partner] ?? 0;
  const lastStage = useRef<{ who: CharId; stage: number }>({ who: partner, stage: stageOf(points) });
  useEffect(() => {
    const stage = stageOf(points);
    const prev = lastStage.current;
    if (prev.who === partner && stage > prev.stage) {
      // 回答の流れを止めないよう、段階アップは画面をふさがない通知で知らせる
      const p = COMPANIONS[partner];
      const en = state.lang === 'en';
      notifyRef.current(
        `${en ? p.stageUp.en : p.stageUp.ja} Lv.${stage + 1}「${en ? p.stages[stage].en : p.stages[stage].ja}」`,
        '💗',
      );
    }
    lastStage.current = { who: partner, stage };
  }, [partner, points, state.lang]);

  useEffect(() => {
    if (!state.mekurinUnlocked && state.profile && mekurinProgress(state.answers).remaining.length === 0) {
      dispatch({ type: 'unlockMekurin' });
      setCelebration({ kind: 'mekurin', who: 'mekurin', stage: 0 });
    }
  }, [state.answers, state.mekurinUnlocked, state.profile]);

  useEffect(() => {
    const onHide = () => dispatch({ type: 'visited', at: Date.now() });
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, []);

  const chart = useMemo(() => {
    if (!state.profile) return null;
    try {
      return analyzeBirth({ date: state.profile.birthDate, time: state.profile.birthTime });
    } catch {
      return null;
    }
  }, [state.profile]);

  const jyotish = useMemo(() => {
    if (!state.profile) return null;
    try {
      return computeJyotish({ date: state.profile.birthDate, time: state.profile.birthTime });
    } catch {
      return null;
    }
  }, [state.profile]);

  const diag = useMemo(
    () => (chart ? buildContext(chart, state.answers, { jyotish, type16: state.profile?.type16 ?? null }) : null),
    [chart, jyotish, state.answers, state.profile?.type16],
  );

  const notify = useCallback((text: string, icon?: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-1), { id, text, icon }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  notifyRef.current = notify;

  const deleteAll = useCallback(() => {
    clearState();
    dispatch({ type: 'reset' });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      dispatch,
      chart,
      diag,
      jyotish,
      partner,
      celebration,
      dismissCelebration: () => setCelebration(null),
      toasts,
      notify,
      restored: initial.restored,
      loadWarning: initial.corrupted,
      deleteAll,
    }),
    [state, chart, diag, jyotish, partner, celebration, toasts, notify, initial, deleteAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('AppProvider がありません');
  return v;
}

/** 日英の文言を選ぶ: T('日本語', 'English') */
export function useT(): (ja: string, en: string) => string {
  const { state } = useApp();
  return (ja, en) => (state.lang === 'en' ? en : ja);
}
