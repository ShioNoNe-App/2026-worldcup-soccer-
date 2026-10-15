import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { analyzeBirth, type ChartAnalysis } from '../engine/bazi/analysis';
import { buildContext } from '../engine/diagnosis/engine';
import type { DiagnosisContext } from '../engine/diagnosis/types';
import { reducer, type Action } from './reducer';
import { clearState, loadState, saveState } from './storage';
import type { AppState } from './types';
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
  toasts: Toast[];
  notify: (text: string, icon?: string) => void;
  /** 前回の保存データから再開した（このセッションの最初だけ true） */
  restored: boolean;
  loadWarning: boolean;
  deleteAll: () => void;
}

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => loadState());
  const [state, dispatch] = useReducer(reducer, initial.state);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    // 何も入力していない初期状態は保存しない（削除直後に空データを書き戻さない）
    const pristine = !state.profile && !state.styleChosen && Object.keys(state.answers).length === 0;
    if (pristine) clearState();
    else saveState(state);
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.style = state.style;
    loadStyleFonts(state.style);
    if (state.motion === 'reduce') root.dataset.motion = 'reduce';
    else delete root.dataset.motion;
  }, [state.style, state.motion]);

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

  const diag = useMemo(() => (chart ? buildContext(chart, state.answers) : null), [chart, state.answers]);

  const notify = useCallback((text: string, icon?: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-1), { id, text, icon }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

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
      toasts,
      notify,
      restored: initial.restored,
      loadWarning: initial.corrupted,
      deleteAll,
    }),
    [state, chart, diag, toasts, notify, initial, deleteAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('AppProvider がありません');
  return v;
}
