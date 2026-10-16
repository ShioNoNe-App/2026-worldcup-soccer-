// ブラウザ内（localStorage）への保存と復元。外部には送信しない。
import { STYLE_IDS, initialState, type AppState } from './types';

export const STORAGE_KEY = 'jibun-mekuri:v1';

export interface LoadResult {
  state: AppState;
  /** 保存データがあったが読み込めなかった */
  corrupted: boolean;
  /** 以前の保存データから再開した */
  restored: boolean;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function loadState(storage: Storage | null = safeStorage()): LoadResult {
  const fresh = initialState();
  if (!storage) return { state: fresh, corrupted: false, restored: false };
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { state: fresh, corrupted: false, restored: false };
  }
  if (!raw) return { state: fresh, corrupted: false, restored: false };
  try {
    const data: unknown = JSON.parse(raw);
    if (!isObject(data) || data.version !== 1) throw new Error('version');
    const merged = { ...fresh, ...data } as AppState;
    if (!STYLE_IDS.includes(merged.style)) merged.style = fresh.style;
    if (merged.lang !== 'ja' && merged.lang !== 'en') merged.lang = fresh.lang;
    if (!isObject(merged.answers)) merged.answers = {};
    if (!Array.isArray(merged.selectedThemes)) merged.selectedThemes = [];
    if (!Array.isArray(merged.completedTopics)) merged.completedTopics = [];
    if (!Array.isArray(merged.seenTraits)) merged.seenTraits = [];
    if (!Array.isArray(merged.themeRunsDone)) merged.themeRunsDone = [];
    if (!isObject(merged.intimacy)) merged.intimacy = fresh.intimacy;
    merged.intimacy = { ...fresh.intimacy, ...merged.intimacy };
    if (!Array.isArray(merged.countedQuestions)) merged.countedQuestions = Object.keys(merged.answers);
    if (!isObject(merged.care) || !Array.isArray(merged.care.fed) || !Array.isArray(merged.care.petted)) merged.care = fresh.care;
    if (!isObject(merged.daily)) merged.daily = fresh.daily;
    if (typeof merged.mekurinUnlocked !== 'boolean') merged.mekurinUnlocked = false;
    if (!isObject(merged.topicExtra)) merged.topicExtra = {};
    if (merged.profile !== null && (!isObject(merged.profile) || typeof merged.profile.birthDate !== 'string')) {
      return { state: { ...fresh, style: merged.style, styleChosen: merged.styleChosen }, corrupted: true, restored: false };
    }
    return { state: merged, corrupted: false, restored: true };
  } catch {
    return { state: fresh, corrupted: true, restored: false };
  }
}

export function saveState(state: AppState, storage: Storage | null = safeStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(storage: Storage | null = safeStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // 削除できない環境では何もしない
  }
}

function safeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}
