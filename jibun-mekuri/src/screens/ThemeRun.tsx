// テーマの質問に、最初から最後までまとめて答える画面と、そのテーマのレポート。
import { useEffect, useState } from 'react';
import { PartnerCharacter } from '../ui/Companion';
import { buildContext, feedbackFor, keywordOf, nextThemeStep, themeAnswered, themeRemaining, themeRunTopics } from '../engine/diagnosis/engine';
import { axisScores, composeThemeReport } from '../engine/diagnosis/profile';
import type { ThemeId } from '../engine/diagnosis/types';
import { localizeQuestion, pick } from '../content/localize';
import { THEME_BY_ID, TOPICS } from '../content/topics';
import { traitsOfTheme } from '../content/traits';
import { useApp, useT } from '../state/AppContext';
import { AxisMeters } from '../ui/charts';
import { type Mood } from '../ui/Character';
import { Burst, RemainingBadge, SectionLabel, TopBar } from '../ui/common';
import { QuestionCard, type ConfirmInfo } from '../ui/QuestionCard';
import { ShareButton } from '../ui/Share';
import { voiceOf } from '../ui/voice';
import { KIND_INFO, SOURCE_LABEL, YearlyCards } from './Explore';

/** テーマに属するトピック（回答の記録先）。テーマ入口の質問も含む */
function themeTopicIds(theme: ThemeId): string[] {
  return [`theme:${theme}`, ...TOPICS.filter((t) => t.theme === theme).map((t) => t.id)];
}

export function ThemeRunCta({ theme }: { theme: ThemeId }) {
  const { state, dispatch, diag } = useApp();
  const T = useT();
  if (!diag) return null;
  const done = state.themeRunsDone.includes(theme);
  const answered = themeAnswered(theme, state.answers);
  const remaining = themeRemaining(theme, diag);
  const go = () => {
    dispatch({ type: 'go', screen: 'themeRun', theme });
    window.scrollTo({ top: 0 });
  };
  return (
    <div className="card card-accent run-cta" style={{ marginTop: 16 }} data-testid="theme-run-cta">
      <SectionLabel n={2}>{T('このテーマにまとめて答える', 'Answer this theme in one go')}</SectionLabel>
      {done ? (
        <>
          <p style={{ margin: 0 }}>{T('このテーマの質問にはすべて答えました。レポートができています。', 'You’ve answered every question in this theme. Your report is ready.')}</p>
          <button type="button" className="btn btn-accent btn-block" onClick={go} data-testid="theme-run-start">
            {T('テーマレポートを見る', 'See theme report')}
          </button>
        </>
      ) : (
        <>
          <p style={{ margin: 0 }}>
            {answered === 0
              ? T(
                  `質問に続けて答えると、このテーマのレポートが完成します（全部で約${remaining}問・途中で閉じても続きから再開できます）。`,
                  `Answer the questions in a row to complete this theme’s report (about ${remaining} questions; you can resume anytime).`,
                )
              : T(`あと約${remaining}問でレポートが完成します。`, `About ${remaining} more questions to complete your report.`)}
          </p>
          {answered > 0 && (
            <span className="remain-track" aria-hidden="true">
              <span className="remain-fill" style={{ width: `${(answered / (answered + remaining)) * 100}%` }} />
            </span>
          )}
          <button type="button" className="btn btn-accent btn-block" onClick={go} data-testid="theme-run-start">
            {answered === 0 ? T(`まとめて答える（約${remaining}問）`, `Start (about ${remaining} Qs)`) : T(`続きから答える（あと約${remaining}問）`, `Continue (about ${remaining} left)`)}
          </button>
        </>
      )}
    </div>
  );
}

interface Feedback {
  key: number;
  text: string;
  mood: Mood;
  keyword: string | null;
  burst: { x: number; y: number } | null;
}

export function ThemeRunScreen() {
  const { state, dispatch, chart, diag } = useApp();
  const T = useT();
  const lang = state.lang;
  const voice = voiceOf(state.style, lang);
  const theme = state.activeTheme;
  const [fb, setFb] = useState<Feedback | null>(null);
  const [restore, setRestore] = useState<{ qid: string; optionId: string } | null>(null);

  const done = theme ? state.themeRunsDone.includes(theme) : false;
  const step = theme && diag && !done ? nextThemeStep(theme, diag) : null;

  useEffect(() => {
    if (theme && diag && !done && !step) {
      dispatch({ type: 'finishThemeRun', theme, topics: themeRunTopics(theme, diag).map((t) => t.id) });
      window.scrollTo({ top: 0 });
    }
  }, [theme, diag, done, step, dispatch]);

  useEffect(() => setFb(null), [state.lang]);

  useEffect(() => {
    if (!step || !fb) return;
    const heading = document.getElementById(`q-${step.question.id}`);
    heading?.focus({ preventScroll: true });
    heading?.closest('[data-testid="question-card"]')?.scrollIntoView({ block: 'start' });
  }, [step?.question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!theme || !chart || !diag) return null;
  const t = THEME_BY_ID[theme];
  const topicIds = themeTopicIds(theme);
  const answered = themeAnswered(theme, state.answers);
  const remaining = themeRemaining(theme, diag);
  const last = Object.entries(state.answers)
    .filter(([, a]) => topicIds.includes(a.topic))
    .sort((a, b) => b[1].at - a[1].at)[0];

  const undoLast = () => {
    if (!last) return;
    setRestore({ qid: last[0], optionId: last[1].optionId });
    dispatch({ type: 'undoAnswer', questionId: last[0] });
    setFb(null);
    window.scrollTo({ top: 0 });
  };

  const onConfirm = ({ option, point }: ConfirmInfo) => {
    if (!step) return;
    const q = step.question;
    const at = Date.now();
    const answers = { ...state.answers, [q.id]: { optionId: option.id, topic: step.topic, at } };
    const after = buildContext(chart, answers, diag.sources);
    const f = feedbackFor(diag, after, q, option.id, lang);
    dispatch({ type: 'answer', questionId: q.id, optionId: option.id, topic: step.topic, at });
    setRestore(null);
    const newly = Object.values(after.traits).filter((tr) => (tr.self !== null || tr.rejected) && !state.seenTraits.includes(tr.id));
    if (newly.length > 0) dispatch({ type: 'markSeen', traits: newly.map((tr) => tr.id) });
    const special = option.kind && option.kind !== 'normal';
    setFb({
      key: at,
      text: f.reaction ?? (special ? T('OK、次にいこう。', 'OK, let’s move on.') : voice.reactions[answered % voice.reactions.length]),
      mood: option.id === 'yes2' ? 'surprise' : special ? 'think' : 'happy',
      keyword: special
        ? null
        : newly.length > 0
          ? voice.discovery(keywordOf(newly[0], lang))
          : f.keyword
            ? T(`見えてきた：${f.keyword}`, `Now visible: ${f.keyword}`)
            : null,
      burst: special ? null : point,
    });
  };

  const back = () => {
    dispatch({ type: 'go', screen: 'theme', theme });
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <TopBar title={pick(t.title, lang)} onBack={back} />
      <main className="main" data-accent={theme}>
        {!done && step ? (
          <>
            {answered === 0 && (
              <div className="char-header anim-rise">
                <PartnerCharacter styleId={state.style} mood="happy" theme={theme} size={72} lang={lang} />
                <p className="bubble">
                  {T('このテーマの質問に、続けて答えていこう。最後にまとめてレポートにするね。', 'Let’s answer this theme’s questions in a row. I’ll put it all into a report at the end.')}
                </p>
              </div>
            )}
            <QuestionCard
              key={step.question.id}
              question={localizeQuestion(step.question, lang)}
              initialOptionId={restore?.qid === step.question.id ? restore.optionId : undefined}
              onConfirm={onConfirm}
              onBack={last ? undoLast : undefined}
              confirmLabel={remaining <= 1 ? T('答えてレポートを見る', 'Answer & see report') : T('次へ', 'Next')}
              header={
                <>
                  {fb && (
                    <div className="answer-feedback anim-pop" key={fb.key} aria-live="polite" data-testid="answer-feedback">
                      <PartnerCharacter styleId={state.style} mood={fb.mood} theme={theme} size={40} lang={lang} />
                      <span className="af-text">
                        <span>{fb.text}</span>
                        {fb.keyword && (
                          <span className="keyword-pop">
                            <span aria-hidden="true">✦</span> {fb.keyword}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  <RemainingBadge answered={answered} remaining={remaining} />
                </>
              }
            >
              {fb?.burst && <Burst key={fb.key} x={fb.burst.x} y={fb.burst.y} />}
            </QuestionCard>
          </>
        ) : (
          <ThemeReportView theme={theme} onRestart={() => dispatch({ type: 'restartThemeRun', theme, topics: topicIds })} />
        )}
      </main>
    </>
  );
}

function ThemeReportView({ theme, onRestart }: { theme: ThemeId; onRestart: () => void }) {
  const { state, dispatch, diag } = useApp();
  const T = useT();
  const lang = state.lang;
  if (!diag) return null;
  const t = THEME_BY_ID[theme];
  const report = composeThemeReport(theme, diag, lang);
  const themeTraits = new Set(traitsOfTheme(theme).map((d) => d.id));
  const scores = axisScores(diag).filter((s) => s.axis.parts.some(([tr]) => themeTraits.has(tr)));
  const keywords = traitsOfTheme(theme)
    .map((d) => diag.traits[d.id])
    .filter((tr) => tr.self !== null)
    .slice(0, 4)
    .map((tr) => keywordOf(tr, lang));
  const voice = voiceOf(state.style, lang);

  return (
    <div className="stack" data-testid="theme-report">
      <div className="char-header anim-rise">
        <PartnerCharacter styleId={state.style} mood="happy" theme={theme} size={80} lang={lang} />
        <p className="bubble">{voice.topicDone}</p>
      </div>
      <div className="card anim-flip">
        <SectionLabel n={1}>{T(`${pick(t.title, 'ja')}のレポート`, `${pick(t.title, 'en')} report`)}</SectionLabel>
        <h2>{keywords.length > 0 ? keywords.map((k) => (lang === 'en' ? `“${k}”` : `「${k}」`)).join(' ') : pick(t.title, lang)}</h2>
        {scores.length > 0 && <AxisMeters scores={scores} lang={lang} />}
      </div>

      <div className="card">
        <SectionLabel n={2}>{T('3つの占術から見たあなた', 'You, through three lenses')}</SectionLabel>
        {report.perspectives.map((p) => (
          <div className="report-item" key={p.tag}>
            <span className="report-tag">{p.tag}</span>
            <h3 style={{ marginBottom: 4 }}>{p.title}</h3>
            <p style={{ margin: 0 }}>{p.body}</p>
          </div>
        ))}
        {!state.profile?.type16 && (
          <p className="small muted" style={{ marginBottom: 0 }}>
            {T('16タイプ（MBTI®など）がわかる方は、設定から入力すると視点が増えます。', 'If you know your 16 type (e.g. MBTI®), add it in Settings for another lens.')}
          </p>
        )}
      </div>

      {theme === 'life' && <YearlyCards />}

      {report.sections.map((sec, i) => (
        <div className="card" key={sec.topicId}>
          <SectionLabel n={i + 3}>{sec.title}</SectionLabel>
          <h3>{sec.headline}</h3>
          {sec.lead && <p>{sec.lead}</p>}
          <ul className="points">
            {sec.points.map((p) => (
              <li className="point" key={p.text}>
                <span className="point-icon" aria-hidden="true">
                  {KIND_INFO[p.kind].icon}
                </span>
                <div>
                  <span className="point-kind">{pick(KIND_INFO[p.kind].label, lang)}</span>
                  <span className={`source source-${p.source}`}>{pick(SOURCE_LABEL[p.source], lang)}</span>
                  <p>{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="row">
        <ShareButton
          title={T(`私の${pick(t.short, 'ja')}タイプ`, `My ${pick(t.short, 'en').toLowerCase()} type`)}
          headline={keywords.slice(0, 2).join(lang === 'en' ? ' × ' : '×') || pick(t.title, lang)}
          keywords={keywords}
          theme={theme}
        />
        <button type="button" className="btn btn-secondary" onClick={() => dispatch({ type: 'go', screen: 'map' })}>
          {T('じぶんマップで全体を見る', 'See the big picture in My map')}
        </button>
      </div>
      <p className="center">
        <button type="button" className="btn btn-ghost" onClick={onRestart} data-testid="theme-run-restart">
          {T('このテーマを最初から答えなおす', 'Answer this theme again from the start')}
        </button>
      </p>
    </div>
  );
}
