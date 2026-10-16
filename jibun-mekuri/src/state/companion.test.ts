import { MEKURIN_QUESTIONS, mekurinProgress, stageOf } from '../content/companion';
import { QUESTION_BY_ID } from '../content/questions';
import { INTIMACY, partnerOf, reducer } from './reducer';
import { initialState, type AppState } from './types';
import { loadState, saveState } from './storage';
import { analyzeBirth } from '../engine/bazi/analysis';
import { buildContext } from '../engine/diagnosis/engine';
import { composeTopicResult } from '../engine/diagnosis/result';
import { derivedType16 } from '../engine/diagnosis/profile';

let at = 0;
const answer = (s: AppState, q: string, o = 'x') => reducer(s, { type: 'answer', questionId: q, optionId: o, topic: 't', at: ++at });

describe('親密度', () => {
  it('初めて答えた質問だけ加算され、答えなおしでは増えない', () => {
    let s = initialState();
    expect(partnerOf(s)).toBe('pom');
    s = answer(s, 'love_pace');
    expect(s.intimacy.pom).toBe(INTIMACY.answer);
    s = answer(s, 'love_pace'); // 同じ質問にもう一度（無視される）
    expect(s.intimacy.pom).toBe(INTIMACY.answer);
    s = reducer(s, { type: 'undoAnswer', questionId: 'love_pace' });
    s = answer(s, 'love_pace', 'y'); // 答えなおし
    expect(s.intimacy.pom).toBe(INTIMACY.answer);
  });

  it('キャラは選んだ世界観と一致し、そのキャラに加算される', () => {
    let s = reducer(initialState(), { type: 'setStyle', style: 'chic' });
    expect(partnerOf(s)).toBe('noir');
    s = answer(s, 'work_pace');
    expect(s.intimacy.noir).toBe(INTIMACY.answer);
    s = reducer(s, { type: 'setStyle', style: 'fairy' });
    expect(partnerOf(s)).toBe('mekurin');
    s = reducer(s, { type: 'setPartner', partner: 'koro' }); // 世界観とずれる指定は無視される
    expect(partnerOf(s)).toBe('mekurin');
    s = answer(s, 'work_drive');
    expect(s.intimacy.mekurin).toBe(INTIMACY.answer);
    expect(s.answers.work_pace).toBeDefined(); // 世界観を変えても回答は消えない
  });

  it('血液型は保存・変更でき、診断の回答や仮説には影響しない', () => {
    localStorage.clear();
    let s = reducer(initialState(), { type: 'setProfile', profile: { birthDate: '1995-08-17', birthTime: null } });
    s = answer(s, 'love_pace');
    const before = buildContext(analyzeBirth({ date: '1995-08-17', time: null }), s.answers);
    s = reducer(s, { type: 'setBlood', blood: 'AB' });
    expect(Object.keys(s.answers)).toEqual(['love_pace']);
    saveState(s);
    expect(loadState().state.bloodType).toBe('AB');
    s = reducer(s, { type: 'setBlood', blood: 'unknown' });
    expect(s.bloodType).toBe('unknown');
    const after = buildContext(analyzeBirth({ date: '1995-08-17', time: null }), s.answers);
    expect(after.traits).toEqual(before.traits);
    expect(initialState().bloodType).toBeNull();
  });

  it('ごはん・なでるは1日1回ずつ', () => {
    let s = initialState();
    s = reducer(s, { type: 'care', kind: 'feed', date: '2026-10-16' });
    s = reducer(s, { type: 'care', kind: 'feed', date: '2026-10-16' });
    s = reducer(s, { type: 'care', kind: 'pet', date: '2026-10-16' });
    expect(s.intimacy.pom).toBe(INTIMACY.care * 2);
    s = reducer(s, { type: 'care', kind: 'feed', date: '2026-10-17' });
    expect(s.intimacy.pom).toBe(INTIMACY.care * 3);
  });

  it('段階は4つ', () => {
    expect([0, 6, 20, 40, 100].map(stageOf)).toEqual([0, 1, 2, 3, 3]);
  });

  it('親密度と解放状態は保存・復元される', () => {
    localStorage.clear();
    let s = reducer(initialState(), { type: 'setProfile', profile: { birthDate: '1995-08-17', birthTime: null } });
    s = answer(s, 'love_pace');
    saveState(s);
    const r = loadState().state;
    expect(r.intimacy.pom).toBe(INTIMACY.answer);
    expect(r.countedQuestions).toContain('love_pace');
  });
});

describe('メクリンの解放', () => {
  it('対象の質問がすべて実在し、全部答えるまで解放されない', () => {
    for (const q of MEKURIN_QUESTIONS) expect(QUESTION_BY_ID[q], q).toBeDefined();
    let s = initialState();
    for (const q of MEKURIN_QUESTIONS.slice(0, -1)) s = answer(s, q);
    expect(mekurinProgress(s.answers).remaining).toHaveLength(1);
    s = reducer(s, { type: 'unlockMekurin' });
    expect(s.mekurinUnlocked).toBe(false);
    s = answer(s, MEKURIN_QUESTIONS[MEKURIN_QUESTIONS.length - 1]);
    s = reducer(s, { type: 'unlockMekurin' });
    expect(s.mekurinUnlocked).toBe(true);
    // 一度解放されたら、回答を取り消しても維持
    s = reducer(s, { type: 'undoAnswer', questionId: 'love_pace' });
    expect(s.mekurinUnlocked).toBe(true);
  });
});

describe('診断の質', () => {
  const chart = analyzeBirth({ date: '1995-08-17', time: null });
  it('結果に「どの回答から読み取ったか」が入る', () => {
    const ctx = buildContext(chart, { love_pace: { optionId: 'intuitive', topic: 'love_style', at: 1 } });
    const r = composeTopicResult('love_style', ctx, 'ja');
    expect(r.points.some((p) => p.text.includes('「直感で「いいな」と思う」'))).toBe(true);
    expect(r.progressNote).toContain('まだ回答がありません');
  });

  it('回答から独自の16タイプを求める（4指標がそろったときだけ）', () => {
    const partial = derivedType16(buildContext(chart, { self_energy: { optionId: 'friends', topic: 'energy', at: 1 } }));
    expect(partial.code).toBeNull();
    expect(partial.letters[0].letter).toBe('E');
    const full = derivedType16(
      buildContext(chart, {
        self_energy: { optionId: 'home', topic: 'energy', at: 1 },
        life_mode: { optionId: 'expand', topic: 'year', at: 2 },
        self_decide: { optionId: 'reason', topic: 'decide_self', at: 3 },
        work_structure: { optionId: 'free', topic: 'style', at: 4 },
      }),
    );
    expect(full.code).toBe('INTP');
  });
});

describe('どうぶつタイプ', () => {
  it('日柱の地支で動物、日干の五行で性質が決まる', async () => {
    const { ANIMALS, ANIMAL_FLAVORS } = await import('../content/animals');
    expect(ANIMALS).toHaveLength(12);
    expect(ANIMAL_FLAVORS).toHaveLength(5);
    // 2000-01-01 は 戊午（土・午）→ どっしりイルカ
    const c = analyzeBirth({ date: '2000-01-01', time: null });
    expect(ANIMAL_FLAVORS[c.dayElement].name.ja + ANIMALS[c.pillars.day.branch].name.ja).toBe('どっしりイルカ');
  });
});
