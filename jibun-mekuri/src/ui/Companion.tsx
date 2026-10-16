// キャラクターとの交流（親密度・お世話）、今日の3問、隠しキャラの解放。
import { useEffect, useState, type ComponentProps } from 'react';
import { buildContext, feedbackFor, nextThemeStep, themeRemainingIds, type ThemeStep } from '../engine/diagnosis/engine';
import type { DiagnosisContext } from '../engine/diagnosis/types';
import {
  COMPANIONS,
  DAILY_GOAL,
  MEKURIN_QUESTIONS,
  mekurinProgress,
  stageOf,
  stageProgress,
  todayKey,
} from '../content/companion';
import { localizeQuestion, pick } from '../content/localize';
import { QUESTION_BY_ID, QUESTIONS } from '../content/questions';
import { THEMES } from '../content/topics';
import { useApp, useT } from '../state/AppContext';
import type { CharId } from '../state/types';
import { Character, CHAR_NAMES } from './Character';
import { Burst, Dialog, RemainingBadge, SectionLabel, TopBar } from './common';
import { QuestionCard, type ConfirmInfo } from './QuestionCard';

/** いま一緒にいるキャラ（親密度に応じた表情） */
export function PartnerCharacter(props: Omit<ComponentProps<typeof Character>, 'charId'>) {
  const { state, partner } = useApp();
  const stage = stageOf(state.intimacy[partner] ?? 0);
  return <Character {...props} charId={partner} mood={props.mood ?? COMPANIONS[partner].moods[stage]} />;
}

/** 回答済み・未回答の質問数（状況に合わない質問は未回答に数えない） */
export function answerStats(ctx: DiagnosisContext | null, answers: Record<string, unknown>) {
  const answered = QUESTIONS.filter((q) => answers[q.id]).length;
  if (!ctx) return { answered, unanswered: 0 };
  const pending = new Set<string>();
  for (const t of THEMES) themeRemainingIds(t.id, ctx).forEach((id) => !id.startsWith('check:') && pending.add(id));
  return { answered, unanswered: pending.size };
}

export function PartnerCard() {
  const { state, dispatch, partner } = useApp();
  const T = useT();
  const lang = state.lang;
  const prof = COMPANIONS[partner];
  const points = state.intimacy[partner] ?? 0;
  const stage = stageOf(points);
  const today = todayKey();
  const care = state.care.date === today ? state.care : { fed: [] as CharId[], petted: [] as CharId[] };
  const [line, setLine] = useState<{ text: string; key: number } | null>(null);
  const [pulse, setPulse] = useState(0);

  const doCare = (kind: 'feed' | 'pet') => {
    const done = (kind === 'feed' ? care.fed : care.petted).includes(partner);
    const pool = kind === 'feed' ? prof.feed : prof.pet;
    setLine({ text: pick(done ? prof.enough : pool[stage >= 2 ? 1 : 0], lang), key: Date.now() });
    if (!done) {
      dispatch({ type: 'care', kind, date: today });
      setPulse(Date.now());
    }
  };

  return (
    <section className="card partner-card anim-rise" data-testid="partner-card" aria-labelledby="partner-name">
      <div className="partner-main">
        <PartnerCharacter styleId={state.style} size={96} reactKey={pulse || undefined} lang={lang} mood={line ? 'happy' : undefined} />
        <div className="partner-info">
          <h2 id="partner-name" style={{ margin: 0 }}>
            {pick(CHAR_NAMES[partner], lang)}
          </h2>
          <p className="small muted" style={{ margin: '2px 0 6px' }} data-testid="partner-stage">
            {T('親密度', 'Affinity')} Lv.{stage + 1}「{pick(prof.stages[stage], lang)}」
          </p>
          <span className="level-bar" aria-hidden="true">
            <span className="level-fill" style={{ width: `${Math.round(stageProgress(points) * 100)}%` }} />
          </span>
          <p className="small muted" style={{ margin: '4px 0 0' }}>
            {stage < 3
              ? T('質問に答えると、もっと仲良くなれます', 'Answer questions to get closer')
              : T('いちばんの仲良し！', 'Best friends!')}
          </p>
        </div>
      </div>
      <p className="bubble partner-bubble anim-pop" key={line?.key ?? stage} aria-live="polite">
        {line?.text ?? pick(prof.greet[stage], lang)}
      </p>
      <div className="row">
        <button type="button" className="btn btn-secondary" onClick={() => doCare('feed')} data-testid="care-feed">
          <span aria-hidden="true">🍙</span> {T('ごはん', 'Feed')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => doCare('pet')} data-testid="care-pet">
          <span aria-hidden="true">✋</span> {T('なでる', 'Pet')}
        </button>
      </div>
    </section>
  );
}

export function DailyCard() {
  const { state, dispatch, diag } = useApp();
  const T = useT();
  const today = todayKey();
  const count = state.daily.date === today ? state.daily.count : 0;
  const { answered, unanswered } = answerStats(diag, state.answers);
  const done = count >= DAILY_GOAL;
  return (
    <section className="card card-accent" style={{ marginTop: 16 }} data-testid="daily-card">
      <SectionLabel>{T('今日の3問', 'Today’s 3 questions')}</SectionLabel>
      <p style={{ margin: '0 0 8px' }}>
        {done
          ? T('今日の3問はクリア！ 答えた分だけ、診断があなたに近づいています。', 'Done for today! Each answer brings your reading closer to you.')
          : T(`少しずつでOK。答えた回答は、ほかの診断でもぜんぶ使われます（今日 ${count} / ${DAILY_GOAL}）。`, `A little at a time is fine. Every answer is reused across all readings (today ${count} / ${DAILY_GOAL}).`)}
      </p>
      <p className="small muted" style={{ margin: '0 0 10px' }} data-testid="answer-stats">
        {T(`回答済み ${answered}問 ／ 未回答 ${unanswered}問`, `Answered ${answered} / Unanswered ${unanswered}`)}
      </p>
      <button
        type="button"
        className="btn btn-accent btn-block"
        disabled={unanswered === 0}
        onClick={() => {
          dispatch({ type: 'go', screen: 'daily' });
          window.scrollTo({ top: 0 });
        }}
        data-testid="daily-start"
      >
        {done ? T('もう少し答える', 'Answer a few more') : T('今日の質問に答える', 'Answer today’s questions')}
      </button>
    </section>
  );
}

export function MekurinCard() {
  const { state, dispatch } = useApp();
  const T = useT();
  const p = mekurinProgress(state.answers);
  if (state.mekurinUnlocked) return null;
  const pct = Math.round((p.done / p.total) * 100);
  return (
    <section className="card" style={{ marginTop: 16 }} data-testid="mekurin-card">
      <SectionLabel>{T('ひみつのキャラクター', 'Secret character')}</SectionLabel>
      <div className="row" style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
        <span className="mekurin-silhouette" aria-hidden="true">
          <Character styleId={state.style} charId="mekurin" size={56} />
        </span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0 }}>
            {T('基本の質問にすべて答えると、だれかが現れるかも…？', 'Answer all the basic questions and someone might appear…?')}
          </p>
          <span className="level-bar" aria-hidden="true" style={{ display: 'block', marginTop: 6 }}>
            <span className="level-fill" style={{ width: `${pct}%` }} />
          </span>
          <p className="small muted" style={{ margin: '4px 0 0' }} data-testid="mekurin-progress">
            {T(`${p.done} / ${p.total} 問（あと${p.total - p.done}問）`, `${p.done} / ${p.total} (${p.total - p.done} left)`)}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-secondary btn-block"
        style={{ marginTop: 10 }}
        onClick={() => {
          dispatch({ type: 'go', screen: 'mekurin' });
          window.scrollTo({ top: 0 });
        }}
        data-testid="mekurin-start"
      >
        {T('残りの基本の質問に答える', 'Answer the remaining basic questions')}
      </button>
    </section>
  );
}

export function CelebrationDialog() {
  const { state, celebration, dismissCelebration, dispatch } = useApp();
  const T = useT();
  if (!celebration) return null;
  const lang = state.lang;
  const who = celebration.who;
  const prof = COMPANIONS[who];
  const isMekurin = celebration.kind === 'mekurin';
  return (
    <Dialog title={isMekurin ? T('ひみつのキャラクターが現れた！', 'A secret character appeared!') : T('親密度アップ！', 'Affinity up!')} onClose={dismissCelebration}>
      <div className="celebrate" data-testid="celebration">
        <Character styleId={state.style} charId={who} size={120} mood="happy" lang={lang} className="anim-pop" />
        <Burst x={140} y={60} />
      </div>
      <h3 className="center">
        {isMekurin
          ? pick(CHAR_NAMES.mekurin, lang)
          : `${pick(CHAR_NAMES[who], lang)}：Lv.${celebration.stage + 1}「${pick(prof.stages[celebration.stage], lang)}」`}
      </h3>
      <p className="center">{isMekurin ? pick(prof.intro, lang) : pick(prof.stageUp, lang)}</p>
      <p className="center small muted">{pick(prof.greet[isMekurin ? 0 : celebration.stage], lang)}</p>
      <div className="stack">
        {isMekurin && (
          <button
            type="button"
            className="btn btn-block"
            onClick={() => {
              dispatch({ type: 'setPartner', partner: 'mekurin' });
              dismissCelebration();
            }}
          >
            {T('メクリンと一緒にいる', 'Stay with Mekurin')}
          </button>
        )}
        <button type="button" className={`btn btn-block ${isMekurin ? 'btn-secondary' : ''}`} onClick={dismissCelebration}>
          {T('とじる', 'Close')}
        </button>
      </div>
    </Dialog>
  );
}

// ---- 今日の3問・基本の質問を続けて答える画面 ----

function dailyStep(ctx: DiagnosisContext, selected: string[]): ThemeStep | null {
  const order = [...selected, ...THEMES.map((t) => t.id).filter((t) => !selected.includes(t))];
  for (const theme of order) {
    const step = nextThemeStep(theme as (typeof THEMES)[number]['id'], ctx);
    if (step && !step.question.id.startsWith('check:')) return step;
  }
  return null;
}

function mekurinStep(ctx: DiagnosisContext): ThemeStep | null {
  const id = MEKURIN_QUESTIONS.find((q) => !ctx.answers[q]);
  if (!id) return null;
  const question = QUESTION_BY_ID[id];
  return { question, topic: question.topics[0] };
}

export function QuestionRunScreen({ mode }: { mode: 'daily' | 'mekurin' }) {
  const { state, dispatch, chart, diag, partner } = useApp();
  const T = useT();
  const lang = state.lang;
  const [fb, setFb] = useState<{ key: number; text: string; keyword: string | null; burst: { x: number; y: number } | null } | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const today = todayKey();
  const dailyCount = state.daily.date === today ? state.daily.count : 0;
  const step = diag ? (mode === 'daily' ? dailyStep(diag, state.selectedThemes) : mekurinStep(diag)) : null;
  const goalReached = mode === 'daily' && sessionCount > 0 && dailyCount >= DAILY_GOAL && dailyCount % DAILY_GOAL === 0;

  useEffect(() => {
    if (!step || !fb) return;
    document.getElementById(`q-${step.question.id}`)?.closest('[data-testid="question-card"]')?.scrollIntoView({ block: 'start' });
  }, [step?.question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!chart || !diag) return null;
  const prof = COMPANIONS[partner];
  const stage = stageOf(state.intimacy[partner] ?? 0);
  const remaining =
    mode === 'mekurin' ? mekurinProgress(state.answers).remaining.length : Math.max(1, DAILY_GOAL - (dailyCount % DAILY_GOAL));

  const onConfirm = ({ option, point }: ConfirmInfo) => {
    if (!step) return;
    const q = step.question;
    const at = Date.now();
    const answers = { ...state.answers, [q.id]: { optionId: option.id, topic: step.topic, at } };
    const f = feedbackFor(diag, buildContext(chart, answers, diag.sources), q, option.id, lang);
    dispatch({ type: 'answer', questionId: q.id, optionId: option.id, topic: step.topic, at, daily: mode === 'daily' ? today : undefined });
    setSessionCount((n) => n + 1);
    const special = option.kind && option.kind !== 'normal';
    setFb({
      key: at,
      text: f.reaction ?? pick(prof.greet[stage], lang),
      keyword: special || !f.keyword ? null : T(`見えてきた：${f.keyword}`, `Now visible: ${f.keyword}`),
      burst: special ? null : point,
    });
  };

  const home = () => {
    dispatch({ type: 'go', screen: 'home' });
    window.scrollTo({ top: 0 });
  };

  const finished = !step || goalReached;
  return (
    <>
      <TopBar title={mode === 'daily' ? T('今日の3問', 'Today’s 3 questions') : T('基本の質問', 'Basic questions')} onBack={home} />
      <main className="main">
        {finished ? (
          <div className="card center anim-flip" data-testid="run-done">
            <PartnerCharacter styleId={state.style} size={110} mood="happy" lang={lang} className="anim-pop" />
            <h2>{mode === 'daily' ? T('今日の3問、クリア！', 'Today’s 3 — done!') : T('基本の質問にすべて答えました', 'All basic questions answered')}</h2>
            <p>
              {T(
                'あなたの回答は、恋愛・仕事・じぶんマップなど、ほかの診断にもそのまま使われます。',
                'Your answers are reused across love, work, My map and every other reading.',
              )}
            </p>
            <div className="stack">
              <button type="button" className="btn btn-block" onClick={() => dispatch({ type: 'go', screen: 'map' })}>
                {T('じぶんマップで変化を見る', 'See the changes in My map')}
              </button>
              {mode === 'daily' && step && (
                <button type="button" className="btn btn-secondary btn-block" onClick={() => setSessionCount(0)}>
                  {T('もう3問答える', 'Answer 3 more')}
                </button>
              )}
              <button type="button" className="btn btn-ghost btn-block" onClick={home}>
                {T('ホームにもどる', 'Back to home')}
              </button>
            </div>
          </div>
        ) : (
          <QuestionCard
            key={step.question.id}
            question={localizeQuestion(step.question, lang)}
            onConfirm={onConfirm}
            confirmLabel={T('次へ', 'Next')}
            header={
              <>
                {fb && (
                  <div className="answer-feedback anim-pop" key={fb.key} aria-live="polite" data-testid="answer-feedback">
                    <PartnerCharacter styleId={state.style} size={40} lang={lang} mood="happy" />
                    <span className="af-text">
                      <span>{fb.text}</span>
                      {fb.keyword && <span className="keyword-pop">✦ {fb.keyword}</span>}
                    </span>
                  </div>
                )}
                <RemainingBadge answered={mode === 'daily' ? dailyCount % DAILY_GOAL : mekurinProgress(state.answers).done} remaining={remaining} />
              </>
            }
          >
            {fb?.burst && <Burst key={fb.key} x={fb.burst.x} y={fb.burst.y} />}
          </QuestionCard>
        )}
      </main>
    </>
  );
}
