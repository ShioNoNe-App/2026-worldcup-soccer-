import { useEffect, useState } from 'react';
import { BirthInputError, computeFourPillars } from '../engine/bazi/calendar';
import {
  answeredInTopic,
  availableQuestions,
  buildContext,
  feedbackFor,
  keywordOf,
  nextQuestion,
  remainingQuestions,
} from '../engine/diagnosis/engine';
import { composeCompat, composeTopicResult, composeYearReadings, topicIntro } from '../engine/diagnosis/result';
import type { PointKind, PointSource, ThemeId, TraitStatus } from '../engine/diagnosis/types';
import { dmText, localizeQuestion, pick, traitText } from '../content/localize';
import { THEME_BY_ID, THEMES, TOPIC_BY_ID, topicsOfTheme } from '../content/topics';
import { traitsOfTheme } from '../content/traits';
import type { Lang } from '../i18n/lang';
import { useApp, useT } from '../state/AppContext';
import { Character, ThemeIcon, type Mood } from '../ui/Character';
import { Burst, RemainingBadge, SectionLabel, TopBar } from '../ui/common';
import { ThemeRunCta } from './ThemeRun';
import { DateSelect, emptyDate, partsToIso, type DateParts } from '../ui/DateSelect';
import { QuestionCard, type ConfirmInfo } from '../ui/QuestionCard';
import { ShareButton } from '../ui/Share';
import { voiceOf } from '../ui/voice';

export const STATUS_INFO: Record<TraitStatus, { icon: string; label: { ja: string; en: string } }> = {
  unexplored: { icon: '？', label: { ja: 'まだ未探索', en: 'Unexplored' } },
  hypothesis: { icon: '◇', label: { ja: '占いの仮説', en: 'Chart hypothesis' } },
  matched: { icon: '◆', label: { ja: '占い×回答が一致', en: 'Chart & answers agree' } },
  specified: { icon: '●', label: { ja: '回答で具体化', en: 'Clarified by answers' } },
  different: { icon: '◈', label: { ja: '占いと違う一面', en: 'Differs from chart' } },
};

export const SOURCE_LABEL: Record<PointSource, { ja: string; en: string }> = {
  chart: { ja: '占いの解釈', en: 'Chart reading' },
  answer: { ja: 'あなたの回答', en: 'Your answers' },
  both: { ja: '占い×回答', en: 'Chart × answers' },
};

export const KIND_INFO: Record<PointKind, { icon: string; label: { ja: string; en: string } }> = {
  strength: { icon: '★', label: { ja: '強み', en: 'Strength' } },
  caution: { icon: '!', label: { ja: '注意点', en: 'Watch out' } },
  tip: { icon: '➜', label: { ja: '工夫', en: 'Tip' } },
  note: { icon: '✎', label: { ja: 'メモ', en: 'Note' } },
};

function topicStatus(topicId: string, completed: string[], answers: Record<string, { topic: string }>) {
  if (completed.includes(topicId)) return 'done';
  return Object.values(answers).some((a) => a.topic === topicId) ? 'progress' : 'new';
}

// ============ ホーム ============

export function Home() {
  const { state, dispatch, chart, diag, restored } = useApp();
  const T = useT();
  const lang = state.lang;
  const voice = voiceOf(state.style, lang);
  const [showWelcomeBack] = useState(() => restored && Object.keys(state.answers).length > 0);
  if (!chart || !diag) return null;
  const dm = dmText(chart.dayStem, lang);
  const lastAnswer = Object.values(state.answers)
    .filter((a) => a.topic !== 'reading')
    .sort((a, b) => b.at - a.at)[0];
  const resumeTopic = lastAnswer && !state.completedTopics.includes(lastAnswer.topic) ? TOPIC_BY_ID[lastAnswer.topic] : null;
  const discovered = Object.values(diag.traits).filter((t) => t.self !== null || t.rejected).length;
  const unselected = THEMES.filter((t) => !state.selectedThemes.includes(t.id));

  const openTheme = (theme: ThemeId) => {
    dispatch({ type: 'addTheme', theme });
    dispatch({ type: 'go', screen: 'theme', theme });
    window.scrollTo({ top: 0 });
  };
  const editThemes = () => {
    dispatch({ type: 'go', screen: 'themes' });
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <TopBar title={<span className="brand">{T('じぶんめくり', 'Jibun Mekuri')}</span>} />
      <main className="main">
        <div className="char-header anim-rise">
          <Character styleId={state.style} mood="happy" size={84} lang={lang} />
          <p className="bubble">{showWelcomeBack ? voice.welcomeBack : voice.greeting}</p>
        </div>

        {resumeTopic && (
          <div className="card card-accent anim-rise" data-accent={resumeTopic.theme}>
            <SectionLabel>{T('つづきから', 'Continue')}</SectionLabel>
            <p style={{ marginBottom: 12 }}>
              {lang === 'en' ? (
                <>
                  Last time you were in the middle of <strong>{pick(resumeTopic.title, lang)}</strong>.
                </>
              ) : (
                <>
                  前回は「<strong>{pick(resumeTopic.title, lang)}</strong>」の途中でした。
                </>
              )}
            </p>
            <button
              type="button"
              className="btn btn-accent btn-block"
              data-testid="resume"
              onClick={() => {
                dispatch({ type: 'go', screen: 'topic', theme: resumeTopic.theme, topic: resumeTopic.id });
                window.scrollTo({ top: 0 });
              }}
            >
              {T(`「${pick(resumeTopic.title, 'ja')}」をつづける`, `Continue “${pick(resumeTopic.title, 'en')}”`)}
            </button>
          </div>
        )}

        <div className="card" style={{ marginTop: 16 }}>
          <SectionLabel>{T('あなたの基本タイプ', 'Your basic type')}</SectionLabel>
          <h2 style={{ marginBottom: 4 }}>{dm.nickname}</h2>
          <p className="small muted" style={{ marginBottom: 8 }}>
            {T(`発見カード ${discovered} / ${Object.keys(diag.traits).length} 枚`, `Discovery cards: ${discovered} / ${Object.keys(diag.traits).length}`)}
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => dispatch({ type: 'go', screen: 'map' })}>
            {T('じぶんマップを見る', 'See my map')}
          </button>
        </div>

        <div className="section-head">
          <h2>{T('えらんだテーマ', 'Your themes')}</h2>
          <button type="button" className="btn btn-secondary" onClick={editThemes} data-testid="edit-themes">
            <span aria-hidden="true">✎</span> {T('テーマを編集', 'Edit themes')}
          </button>
        </div>
        {state.selectedThemes.length === 0 && <p className="muted">{T('まだテーマが選ばれていません。', 'No themes selected yet.')}</p>}
        <ul className="topic-list" style={{ marginTop: 12 }}>
          {state.selectedThemes.map((id) => {
            const t = THEME_BY_ID[id];
            const topics = topicsOfTheme(id);
            const done = topics.filter((tp) => state.completedTopics.includes(tp.id)).length;
            return (
              <li key={id} data-accent={id}>
                <button type="button" className="topic-btn" onClick={() => openTheme(id)}>
                  <ThemeIcon theme={id} className="theme-icon" />
                  <span className="t-main">
                    <span className="t-title">{pick(t.title, lang)}</span>
                    <span className="t-sub">{T(`結果 ${done} / ${topics.length}`, `Results: ${done} / ${topics.length}`)}</span>
                  </span>
                  <span aria-hidden="true">›</span>
                </button>
              </li>
            );
          })}
        </ul>

        {unselected.length > 0 && (
          <>
            <h3 style={{ marginTop: 24 }}>{T('まだめくっていないテーマ', 'Themes you haven’t explored')}</h3>
            <div className="row">
              {unselected.map((t) => (
                <button key={t.id} type="button" className="btn btn-secondary" data-accent={t.id} onClick={() => openTheme(t.id)}>
                  ＋ {pick(t.short, lang)}
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

// ============ テーマ ============

function featuredText(theme: ThemeId, chartDayStem: number, lang: Lang, yearLine: () => string): string {
  const dm = dmText(chartDayStem, lang);
  if (theme === 'love') return dm.love;
  if (theme === 'work') return dm.work;
  if (theme === 'relations') return dm.relations;
  if (theme === 'self') return `${dm.essence} ${dm.self}`;
  return yearLine();
}

export function ThemeScreen() {
  const { state, dispatch, chart, diag } = useApp();
  const T = useT();
  const lang = state.lang;
  const theme = state.activeTheme;
  if (!theme || !chart || !diag) return null;
  const t = THEME_BY_ID[theme];
  const featured = featuredText(theme, chart.dayStem, lang, () => {
    const y = composeYearReadings(chart, new Date().getFullYear(), lang)[0];
    return lang === 'en' ? `${y.year} (${y.pillar}) is, for you, “${y.title}.” ${y.text}` : `${y.year}年（${y.pillar}）は、あなたにとって「${y.title}」。${y.text}`;
  });
  const traits = traitsOfTheme(theme).map((d) => diag.traits[d.id]);
  const mood: Mood = theme === 'love' ? 'happy' : theme === 'work' ? 'think' : 'normal';

  return (
    <>
      <TopBar title={pick(t.title, lang)} onBack={() => dispatch({ type: 'go', screen: 'home' })} />
      <main className="main">
        <div className="char-header anim-rise">
          <Character styleId={state.style} mood={mood} theme={theme} size={84} lang={lang} />
          <p className="bubble">{T('まずは、命式から読めることをひとつ。', 'First, one thing your chart tells us.')}</p>
        </div>
        <div className="card card-accent anim-flip">
          <SectionLabel n={1}>{T('最初のひとこと', 'First reading')}</SectionLabel>
          <p style={{ marginBottom: 0 }}>{featured}</p>
          <p className="small muted" style={{ marginTop: 8, marginBottom: 0 }}>
            <span className="source source-chart">{pick(SOURCE_LABEL.chart, lang)}</span>
          </p>
        </div>

        <ThemeRunCta theme={theme} />

        <h2 style={{ marginTop: 28 }}>{T('気になるところだけ答える', 'Or answer just what interests you')}</h2>
        <p className="small muted">
          {T('項目ごとに、その項目の質問に最後まで答えると結果が出ます。', 'Each item gives a result once you answer its questions.')}
        </p>
        <ul className="topic-list">
          {topicsOfTheme(theme).map((tp) => {
            const st = topicStatus(tp.id, state.completedTopics, state.answers);
            return (
              <li key={tp.id}>
                <button
                  type="button"
                  className="topic-btn"
                  onClick={() => {
                    dispatch({ type: 'go', screen: 'topic', topic: tp.id });
                    window.scrollTo({ top: 0 });
                  }}
                >
                  <span className="t-main">
                    <span className="t-title">{pick(tp.ask, lang)}</span>
                    <span className="t-sub">{pick(tp.title, lang)}</span>
                  </span>
                  {st === 'done' && <span className="status-badge done">{T('結果あり', 'Done')}</span>}
                  {st === 'progress' && <span className="status-badge">{T('途中', 'In progress')}</span>}
                  {st === 'new' && (
                    <span className="count-chip">{T(`約${availableQuestions(tp.id, diag)}問`, `~${availableQuestions(tp.id, diag)} Qs`)}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="card" style={{ marginTop: 24 }}>
          <SectionLabel n={2}>{T('このテーマの仮説', 'Hypotheses for this theme')}</SectionLabel>
          <div className="nodes">
            {traits.map((s) => (
              <span key={s.id} className={`node st-${s.status}`} style={{ cursor: 'default' }}>
                <span className="n-icon" aria-hidden="true">
                  {STATUS_INFO[s.status].icon}
                </span>
                <span>
                  {traitText(s.id, lang).label}
                  {s.status !== 'unexplored' && <>{lang === 'en' ? ': ' : '：'}{keywordOf(s, lang)}</>}
                  <span className="sr-only">（{pick(STATUS_INFO[s.status].label, lang)}）</span>
                </span>
              </span>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
            {(['hypothesis', 'matched', 'specified', 'different', 'unexplored'] as TraitStatus[])
              .map((k) => `${STATUS_INFO[k].icon} ${pick(STATUS_INFO[k].label, lang)}`)
              .join(' ／ ')}
          </p>
        </div>
      </main>
    </>
  );
}

// ============ トピック（質問と結果） ============

interface Feedback {
  key: number;
  text: string;
  mood: Mood;
  keyword: string | null;
  burst: { x: number; y: number } | null;
}

export function TopicScreen() {
  const { state, dispatch, chart, diag } = useApp();
  const T = useT();
  const lang = state.lang;
  const voice = voiceOf(state.style, lang);
  const topicId = state.activeTopic;
  const topic = topicId ? TOPIC_BY_ID[topicId] : null;
  const [fb, setFb] = useState<Feedback | null>(null);
  const [compatSkipped, setCompatSkipped] = useState(false);
  /** 「ひとつ前へ」で戻ったとき、前の答えを選んだ状態にしておく */
  const [restore, setRestore] = useState<{ qid: string; optionId: string } | null>(null);

  const done = topic ? state.completedTopics.includes(topic.id) : false;
  const q = topic && diag && !done ? nextQuestion(topic.id, diag) : null;

  const needsCompatForm = topic?.special === 'compat' && !state.compat && !compatSkipped && !done;
  const showResult = Boolean(topic && diag && !needsCompatForm && (done || !q));

  useEffect(() => {
    if (topic && showResult && !done) dispatch({ type: 'completeTopic', topic: topic.id });
  }, [topic, showResult, done, dispatch]);

  // 言語を切り替えたら、前の言語で出した反応は消す
  useEffect(() => setFb(null), [state.lang]);

  useEffect(() => {
    if (!q || !fb) return;
    const heading = document.getElementById(`q-${q.id}`);
    heading?.focus({ preventScroll: true });
    heading?.closest('[data-testid="question-card"]')?.scrollIntoView({ block: 'start' });
  }, [q?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!topic || !chart || !diag) return null;

  const answered = answeredInTopic(topic.id, state.answers);
  const remaining = remainingQuestions(topic.id, diag);
  const lastInTopic = Object.entries(state.answers)
    .filter(([, a]) => a.topic === topic.id)
    .sort((a, b) => b[1].at - a[1].at)[0];

  const undoLast = () => {
    if (!lastInTopic) return;
    setRestore({ qid: lastInTopic[0], optionId: lastInTopic[1].optionId });
    dispatch({ type: 'undoAnswer', questionId: lastInTopic[0] });
    setFb(null);
    window.scrollTo({ top: 0 });
  };

  const onConfirm = ({ option, point }: ConfirmInfo) => {
    if (!q) return;
    const at = Date.now();
    const answers = { ...state.answers, [q.id]: { optionId: option.id, topic: topic.id, at } };
    const after = buildContext(chart, answers);
    const f = feedbackFor(diag, after, q, option.id, lang);
    dispatch({ type: 'answer', questionId: q.id, optionId: option.id, topic: topic.id, at });
    setRestore(null);

    const newly = Object.values(after.traits).filter((t) => (t.self !== null || t.rejected) && !state.seenTraits.includes(t.id));
    if (newly.length > 0) dispatch({ type: 'markSeen', traits: newly.map((t) => t.id) });
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

  const backToTheme = () => {
    dispatch({ type: 'go', screen: 'theme', theme: topic.theme });
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <TopBar title={pick(topic.title, lang)} onBack={backToTheme} />
      <main className="main" data-accent={topic.theme}>
        <div className="char-header">
          <Character styleId={state.style} mood={fb?.mood ?? 'normal'} theme={topic.theme} size={80} reactKey={fb?.key} lang={lang} />
          <p className="bubble anim-pop" key={fb?.key ?? 'intro'}>
            {showResult ? voice.topicDone : (fb?.text ?? pick(topic.ask, lang))}
          </p>
        </div>

        {answered === 0 && !showResult && (
          <div className="card card-accent anim-rise">
            <SectionLabel>{pick(SOURCE_LABEL.chart, lang)}</SectionLabel>
            <p style={{ marginBottom: 0 }}>{topicIntro(topic, diag, lang)}</p>
          </div>
        )}

        {topic.special === 'yearly' && <YearlyCards />}
        {topic.special === 'compat' && <CompatPanel onSkip={() => setCompatSkipped(true)} showForm={needsCompatForm} />}

        {!showResult && q && !needsCompatForm && (
          <div style={{ marginTop: 16, position: 'relative' }}>
            <QuestionCard
              key={q.id}
              question={localizeQuestion(q, lang)}
              initialOptionId={restore?.qid === q.id ? restore.optionId : undefined}
              onConfirm={onConfirm}
              onBack={lastInTopic ? undoLast : undefined}
              confirmLabel={remaining <= 1 ? T('答えて結果を見る', 'Answer & see result') : T('次へ', 'Next')}
              header={
                <>
                  {fb && (
                    <div className="answer-feedback anim-pop" key={fb.key} aria-live="polite" data-testid="answer-feedback">
                      <Character styleId={state.style} mood={fb.mood} theme={topic.theme} size={40} lang={lang} />
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
          </div>
        )}

        {showResult && <TopicResultView topicId={topic.id} onUndoLast={lastInTopic ? undoLast : undefined} />}
      </main>
    </>
  );
}

function TopicResultView({ topicId, onUndoLast }: { topicId: string; onUndoLast?: () => void }) {
  const { state, dispatch, diag } = useApp();
  const T = useT();
  const lang = state.lang;
  if (!diag) return null;
  const topic = TOPIC_BY_ID[topicId];
  const r = composeTopicResult(topicId, diag, lang);
  const related = topic.related.map((id) => TOPIC_BY_ID[id]).filter(Boolean);
  const theme = THEME_BY_ID[topic.theme];

  return (
    <div className="stack" style={{ marginTop: 16 }}>
      <div className="card anim-flip" data-testid="topic-result">
        <SectionLabel n={1}>{T(`${pick(topic.title, 'ja')}の結果`, `Result: ${pick(topic.title, 'en')}`)}</SectionLabel>
        <h2>{r.headline}</h2>
        <p>{r.lead}</p>
        <ul className="points">
          {r.points.map((p, i) => (
            <li className="point anim-rise" style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }} key={p.text}>
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
        <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
          {r.progressNote}
        </p>
      </div>

      <div className="row">
        <ShareButton
          title={T(`私の${pick(topic.title, 'ja')}`, `My ${pick(topic.title, 'en').toLowerCase()}`)}
          headline={r.headline}
          keywords={r.keywords}
          theme={topic.theme}
        />
      </div>

      <div className="card">
        <SectionLabel n={2}>{T('次に気になるのは？', 'What’s next?')}</SectionLabel>
        <ul className="topic-list">
          {related.map((tp) => (
            <li key={tp.id} data-accent={tp.theme}>
              <button
                type="button"
                className="topic-btn"
                onClick={() => {
                  dispatch({ type: 'addTheme', theme: tp.theme });
                  dispatch({ type: 'go', screen: 'topic', theme: tp.theme, topic: tp.id });
                  window.scrollTo({ top: 0 });
                }}
              >
                <span className="t-main">
                  <span className="t-title">{pick(tp.ask, lang)}</span>
                  <span className="t-sub">
                    {pick(THEME_BY_ID[tp.theme].short, lang)}・{pick(tp.title, lang)}
                  </span>
                </span>
                {state.completedTopics.includes(tp.id) && <span className="status-badge done">{T('結果あり', 'Done')}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'go', screen: 'theme', theme: topic.theme })}>
          {T(`「${pick(theme.short, 'ja')}」のテーマにもどる`, `Back to “${pick(theme.short, 'en')}”`)}
        </button>
        {onUndoLast && (
          <button type="button" className="btn btn-ghost" onClick={onUndoLast} data-testid="fix-last">
            {T('最後の回答を直す', 'Fix my last answer')}
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'restartTopic', topic: topicId })}>
          {T('最初から答えなおす', 'Start over')}
        </button>
      </div>
    </div>
  );
}

// ============ 年運 ============

export function YearlyCards() {
  const { state, chart } = useApp();
  const T = useT();
  if (!chart) return null;
  const lang = state.lang;
  const years = composeYearReadings(chart, new Date().getFullYear(), lang);
  return (
    <div className="stack" style={{ marginTop: 16 }}>
      {years.map((y, i) => (
        <div className="card anim-flip" key={y.year} style={{ animationDelay: `${i * 120}ms` }}>
          <SectionLabel n={i + 1}>{lang === 'en' ? `${y.year} — ${y.pillar}` : `${y.year}年（${y.pillar}）`}</SectionLabel>
          <h3>{y.title}</h3>
          <p>{y.text}</p>
          {y.branchNote && <p className="small">{y.branchNote}</p>}
          <p className="small" style={{ marginBottom: 4 }}>
            <strong>{T('ヒント：', 'Hint: ')}</strong>
            {y.hint}
          </p>
          <p className="small muted" style={{ marginBottom: 0 }}>
            {T(
              `計算：その年の天干がこの命式の日干に対して「${y.star}」にあたります。年の区切りは立春です。`,
              `Calculation: that year’s heavenly stem is the “${y.star}” relative to your day stem. Years change at Lichun (around Feb 4).`,
            )}
          </p>
        </div>
      ))}
    </div>
  );
}

// ============ 相性 ============

function CompatPanel({ showForm, onSkip }: { showForm: boolean; onSkip: () => void }) {
  const { state, dispatch, chart } = useApp();
  const T = useT();
  const lang = state.lang;
  const [date, setDate] = useState<DateParts>(emptyDate);
  const [error, setError] = useState<string | null>(null);
  if (!chart) return null;

  if (state.compat) {
    const c = composeCompat(chart.pillars.day, state.compat.partnerDay, lang);
    return (
      <div className="card anim-flip" style={{ marginTop: 16 }} data-testid="compat-result">
        <SectionLabel>{T('ふたりの相性（日柱）', 'Your compatibility (day pillars)')}</SectionLabel>
        <p className="small muted">
          {T(`あなたの日柱「${c.selfDay}」× お相手の日柱「${c.partnerDay}」`, `Your day pillar ${c.selfDay} × their day pillar ${c.partnerDay}`)}
        </p>
        <h3>{c.title}</h3>
        <p>{c.stemText}</p>
        <p>{c.branchText}</p>
        <p className="small">
          <strong>{T('ヒント：', 'Hint: ')}</strong>
          {c.tip}
        </p>
        <p className="small muted">
          {T(
            '※ 二人の生年月日から求めた「日柱」の関係だけをもとにした占いの解釈です。相手の気持ちや関係の行方を決めるものではありません。お相手の生年月日は保存せず、計算した日柱だけをこの端末に保存しています。',
            '* This reading is based only on the relationship between your two day pillars. It doesn’t decide how they feel or where things will go. Their birth date isn’t saved — only the calculated day pillar is stored on this device.',
          )}
        </p>
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'clearCompat' })}>
          {T('お相手の情報を消す', 'Remove their info')}
        </button>
      </div>
    );
  }

  if (!showForm) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const iso = partsToIso(date);
    if (!iso) {
      setError(T('お相手の生年月日を選んでください', 'Please choose their birth date'));
      return;
    }
    try {
      const p = computeFourPillars({ date: iso, time: null });
      setError(null);
      dispatch({ type: 'setCompat', partnerDay: p.day });
    } catch (err) {
      setError(err instanceof BirthInputError ? T(err.message, 'This date can’t be used.') : T('計算できませんでした', 'We couldn’t calculate this'));
    }
  };

  return (
    <form className="card stack anim-rise" style={{ marginTop: 16 }} onSubmit={submit} noValidate>
      <SectionLabel>{T('お相手の生年月日（任意）', 'Their birth date (optional)')}</SectionLabel>
      <DateSelect idPrefix="partner" label={T('お相手の生年月日', 'Their birth date')} value={date} onChange={setDate} lang={lang} />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <p className="small muted" style={{ margin: 0 }}>
        {T(
          '相性は、二人の生年月日から求める「日柱」どうしの関係で計算します（時刻は不要）。お相手の生年月日そのものは保存しません。',
          'Compatibility is calculated from the relationship between your two "day pillars" (no time needed). Their birth date itself is not saved.',
        )}
      </p>
      <button type="submit" className="btn btn-block" data-testid="compat-submit">
        {T('相性をみる', 'Check compatibility')}
      </button>
      <button type="button" className="btn btn-secondary btn-block" onClick={onSkip} data-testid="compat-skip">
        {T('わからない・入力しないで進む', 'I don’t know / continue without it')}
      </button>
    </form>
  );
}
