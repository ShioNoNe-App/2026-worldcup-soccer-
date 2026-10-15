import { loadState, saveState, clearState, STORAGE_KEY } from './storage';
import { reducer } from './reducer';
import { initialState } from './types';

describe('保存と復元', () => {
  beforeEach(() => localStorage.clear());

  it('保存した状態を復元できる', () => {
    let s = initialState();
    s = reducer(s, { type: 'setStyle', style: 'chic', chosen: true });
    s = reducer(s, { type: 'setProfile', profile: { birthDate: '1995-05-05', birthTime: null } });
    s = reducer(s, { type: 'answer', questionId: 'love_pace', optionId: 'intuitive', topic: 'love_style', at: 1 });
    saveState(s);
    const r = loadState();
    expect(r.restored).toBe(true);
    expect(r.state.style).toBe('chic');
    expect(r.state.answers.love_pace.optionId).toBe('intuitive');
  });

  it('壊れたデータは初期状態にフォールバック', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    const r = loadState();
    expect(r.corrupted).toBe(true);
    expect(r.state.screen).toBe('welcome');
  });

  it('削除できる', () => {
    saveState(initialState());
    clearState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadState().restored).toBe(false);
  });

  it('プロフィールが変わったら診断の進行をリセット', () => {
    let s = reducer(initialState(), { type: 'setProfile', profile: { birthDate: '1995-05-05', birthTime: null } });
    s = reducer(s, { type: 'answer', questionId: 'love_pace', optionId: 'intuitive', topic: 'love_style', at: 1 });
    s = reducer(s, { type: 'setProfile', profile: { birthDate: '1995-05-05', birthTime: null } });
    expect(Object.keys(s.answers)).toHaveLength(1);
    s = reducer(s, { type: 'setProfile', profile: { birthDate: '1996-05-05', birthTime: null } });
    expect(Object.keys(s.answers)).toHaveLength(0);
  });

  it('同じ質問に二重に答えない', () => {
    let s = reducer(initialState(), { type: 'answer', questionId: 'q', optionId: 'a', topic: 't', at: 1 });
    s = reducer(s, { type: 'answer', questionId: 'q', optionId: 'b', topic: 't', at: 2 });
    expect(s.answers.q.optionId).toBe('a');
  });
});
