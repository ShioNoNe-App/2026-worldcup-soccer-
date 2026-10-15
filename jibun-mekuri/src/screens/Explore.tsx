import { useEffect, useRef, useState } from 'react';
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
import { composeCompat, composeTopicResult, composeYearReadings } from '../engine/diagnosis/result';
import type { OptionDef, PointKind, PointSource, QuestionDef, ThemeId, TraitStatus } from '../engine/diagnosis/types';
import { DAY_MASTERS } from '../content/dayMasters';
import { THEME_BY_ID, THEMES, TOPIC_BY_ID, topicsOfTheme } from '../content/topics';
import { TRAIT_BY_ID, traitsOfTheme } from '../content/traits';
import { useApp } from '../state/AppContext';
import { Character, ThemeIcon, type Mood } from '../ui/Character';
import { Burst, ProgressDots, SectionLabel, TopBar } from '../ui/common';
import { DateSelect, emptyDate, partsToIso, type DateParts } from '../ui/DateSelect';
import { ShareButton } from '../ui/Share';
import { VOICES } from '../ui/voice';

export const STATUS_INFO: Record<TraitStatus, { icon: string; label: string }> = {
  unexplored: { icon: '？', label: 'まだ未探索' },
  hypothesis: { icon: '◇', label: '占いの仮説' },
  matched: { icon: '◆', label: '占い×回答が一致' },
  specified: { icon: '●', label: '回答で具体化' },
  different: { icon: '◈', label: '占いと違う一面' },
};

const SOURCE_LABEL: Record<PointSource, string> = {
  chart: '占いの解釈',
  answer: 'あなたの回答',
  both: '占い×回答',
};

const KIND_INFO: Record<PointKind, { icon: string; label: string }> = {
  strength: { icon: '★', label: '強み' },
  caution: { icon: '!', label: '注意点' },
  tip: { icon: '➜', label: '工夫' },
  note: { icon: '✎', label: 'メモ' },
};

function topicStatus(topicId: string, completed: string[], answers: Record<string, { topic: string }>) {
  if (completed.includes(topicId)) return 'done';
  return Object.values(answers).some((a) => a.topic === topicId) ? 'progress' : 'new';
}

// ============ ホーム ============

export function Home() {
  const { state, dispatch, chart, diag, restored } = useApp();
  const voice = VOICES[state.style];
  const [showWelcomeBack] = useState(() => restored && Object.keys(state.answers).length > 0);
  if (!chart || !diag) return null;
  const dm = DAY_MASTERS[chart.dayStem];
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

  return (
    <>
      <TopBar title={<span className="brand">じぶんめくり</span>} />
      <main className="main">
        <div className="char-header anim-rise">
          <Character styleId={state.style} mood="happy" size={84} />
          <p className="bubble">{showWelcomeBack ? voice.welcomeBack : voice.greeting}</p>
        </div>

        {resumeTopic && (
          <div className="card card-accent anim-rise" data-accent={resumeTopic.theme}>
            <SectionLabel>つづきから</SectionLabel>
            <p style={{ marginBottom: 12 }}>
              前回は「<strong>{resumeTopic.title}</strong>」の途中でした。
            </p>
            <button
              type="button"
              className="btn btn-accent btn-block"
              onClick={() => {
                dispatch({ type: 'go', screen: 'topic', theme: resumeTopic.theme, topic: resumeTopic.id });
                window.scrollTo({ top: 0 });
              }}
            >
              「{resumeTopic.title}」をつづける
            </button>
          </div>
        )}

        <div className="card" style={{ marginTop: 16 }}>
          <SectionLabel>あなたの基本タイプ</SectionLabel>
          <h2 style={{ marginBottom: 4 }}>{dm.nickname}</h2>
          <p className="small muted" style={{ marginBottom: 8 }}>
            発見カード {discovered} / {Object.keys(diag.traits).length} 枚
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => dispatch({ type: 'go', screen: 'map' })}>
            じぶんマップを見る
          </button>
        </div>

        <h2 style={{ marginTop: 28 }}>えらんだテーマ</h2>
        {state.selectedThemes.length === 0 && <p className="muted">まだテーマが選ばれていません。</p>}
        <ul className="topic-list">
          {state.selectedThemes.map((id) => {
            const t = THEME_BY_ID[id];
            const topics = topicsOfTheme(id);
            const done = topics.filter((tp) => state.completedTopics.includes(tp.id)).length;
            return (
              <li key={id} data-accent={id}>
                <button type="button" className="topic-btn" onClick={() => openTheme(id)}>
                  <ThemeIcon theme={id} className="theme-icon" />
                  <span className="t-main">
                    <span className="t-title">{t.title}</span>
                    <span className="t-sub">
                      結果 {done} / {topics.length}
                    </span>
                  </span>
                  <span aria-hidden="true">›</span>
                </button>
              </li>
            );
          })}
        </ul>

        {unselected.length > 0 && (
          <>
            <h3 style={{ marginTop: 24 }}>まだめくっていないテーマ</h3>
            <div className="row">
              {unselected.map((t) => (
                <button key={t.id} type="button" className="btn btn-secondary" data-accent={t.id} onClick={() => openTheme(t.id)}>
                  ＋ {t.short}
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

export function ThemeScreen() {
  const { state, dispatch, chart, diag } = useApp();
  const theme = state.activeTheme;
  if (!theme || !chart || !diag) return null;
  const t = THEME_BY_ID[theme];
  const dm = DAY_MASTERS[chart.dayStem];
  const featured =
    theme === 'love'
      ? dm.love
      : theme === 'work'
        ? dm.work
        : theme === 'relations'
          ? dm.relations
          : theme === 'self'
            ? `${dm.essence} ${dm.self}`
            : (() => {
                const y = composeYearReadings(chart, new Date().getFullYear())[0];
                return `${y.year}年（${y.pillar}）は、あなたにとって「${y.title}」。${y.text}`;
              })();
  const traits = traitsOfTheme(theme).map((d) => diag.traits[d.id]);
  const mood: Mood = theme === 'love' ? 'happy' : theme === 'work' ? 'think' : 'normal';

  return (
    <>
      <TopBar title={t.title} onBack={() => dispatch({ type: 'go', screen: 'home' })} />
      <main className="main">
        <div className="char-header anim-rise">
          <Character styleId={state.style} mood={mood} theme={theme} size={84} />
          <p className="bubble">まずは、命式から読めることをひとつ。</p>
        </div>
        <div className="card card-accent anim-flip">
          <SectionLabel n={1}>最初のひとこと</SectionLabel>
          <p style={{ marginBottom: 0 }}>{featured}</p>
          <p className="small muted" style={{ marginTop: 8, marginBottom: 0 }}>
            <span className="source source-chart">占いの解釈</span>
          </p>
        </div>

        <h2 style={{ marginTop: 28 }}>もっと知りたいことは？</h2>
        <p className="small muted">気になるものだけ選んでね。1〜3問くらいで結果が出ます。</p>
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
                    <span className="t-title">{tp.ask}</span>
                    <span className="t-sub">{tp.title}</span>
                  </span>
                  {st === 'done' && <span className="status-badge done">結果あり</span>}
                  {st === 'progress' && <span className="status-badge">途中</span>}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="card" style={{ marginTop: 24 }}>
          <SectionLabel n={2}>このテーマの仮説</SectionLabel>
          <div className="nodes">
            {traits.map((s) => (
              <span key={s.id} className={`node st-${s.status}`} style={{ cursor: 'default' }}>
                <span className="n-icon" aria-hidden="true">
                  {STATUS_INFO[s.status].icon}
                </span>
                <span>
                  {TRAIT_BY_ID[s.id].label}
                  {s.status !== 'unexplored' && <>：{keywordOf(s)}</>}
                  <span className="sr-only">（{STATUS_INFO[s.status].label}）</span>
                </span>
              </span>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
            ◇ 占いの仮説 ／ ◆ 占い×回答が一致 ／ ● 回答で具体化 ／ ◈ 占いと違う一面 ／ ？ 未探索
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
  const { state, dispatch, chart, diag, notify } = useApp();
  const voice = VOICES[state.style];
  const topicId = state.activeTopic;
  const topic = topicId ? TOPIC_BY_ID[topicId] : null;
  const [fb, setFb] = useState<Feedback | null>(null);
  const [compatSkipped, setCompatSkipped] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const extra = topic ? (state.topicExtra[topic.id] ?? 0) : 0;
  const done = topic ? state.completedTopics.includes(topic.id) : false;
  const q = topic && diag && !done ? nextQuestion(topic.id, diag, extra) : null;

  const needsCompatForm = topic?.special === 'compat' && !state.compat && !compatSkipped && !done;
  const showResult = Boolean(topic && diag && !needsCompatForm && (done || !q));

  useEffect(() => {
    if (topic && showResult && !done) dispatch({ type: 'completeTopic', topic: topic.id });
  }, [topic, showResult, done, dispatch]);

  useEffect(() => {
    if (fb) headingRef.current?.focus();
  }, [q?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!topic || !chart || !diag) return null;

  const answered = answeredInTopic(topic.id, state.answers);
  const remaining = remainingQuestions(topic.id, diag, extra);

  const onAnswer = (question: QuestionDef, opt: OptionDef, e: React.MouseEvent<HTMLButtonElement>) => {
    const at = Date.now();
    const answers = { ...state.answers, [question.id]: { optionId: opt.id, topic: topic.id, at } };
    const after = buildContext(chart, answers);
    const f = feedbackFor(diag, after, question, opt.id);
    dispatch({ type: 'answer', questionId: question.id, optionId: opt.id, topic: topic.id, at });

    const newly = Object.values(after.traits).filter((t) => (t.self !== null || t.rejected) && !state.seenTraits.includes(t.id));
    if (newly.length > 0) {
      dispatch({ type: 'markSeen', traits: newly.map((t) => t.id) });
      notify(voice.discovery(keywordOf(newly[0])), '✦');
    }

    const btn = e.currentTarget.getBoundingClientRect();
    const host = cardRef.current?.getBoundingClientRect();
    const special = opt.kind && opt.kind !== 'normal';
    setFb({
      key: at,
      text: opt.reaction ?? (special ? 'OK、次にいこう。' : voice.reactions[answered % voice.reactions.length]),
      mood: opt.id === 'yes2' ? 'surprise' : special ? 'think' : 'happy',
      keyword: special ? null : f.keyword,
      burst: host && !special ? { x: btn.left - host.left + btn.width / 2, y: btn.top - host.top + btn.height / 2 } : null,
    });
  };

  const backToTheme = () => {
    dispatch({ type: 'go', screen: 'theme', theme: topic.theme });
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <TopBar title={topic.title} onBack={backToTheme} />
      <main className="main" data-accent={topic.theme}>
        <div className="char-header">
          <Character styleId={state.style} mood={fb?.mood ?? 'normal'} theme={topic.theme} size={80} reactKey={fb?.key} />
          <p className="bubble anim-pop" key={fb?.key ?? 'intro'}>
            {showResult ? voice.topicDone : (fb?.text ?? topic.ask)}
          </p>
        </div>

        {fb?.keyword && !showResult && (
          <p aria-live="polite">
            <span className="keyword-pop anim-pop" key={fb.key}>
              <span aria-hidden="true">✦</span> 見えてきた：{fb.keyword}
            </span>
          </p>
        )}

        {answered === 0 && !showResult && (
          <div className="card card-accent anim-rise">
            <SectionLabel>占いの解釈</SectionLabel>
            <p style={{ marginBottom: 0 }}>{topic.intro(diag)}</p>
          </div>
        )}

        {topic.special === 'yearly' && <YearlyCards />}
        {topic.special === 'compat' && (
          <CompatPanel onSkip={() => setCompatSkipped(true)} showForm={needsCompatForm} />
        )}

        {!showResult && q && !needsCompatForm && (
          <div className="card anim-rise" key={q.id} ref={cardRef} style={{ marginTop: 16, position: 'relative' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="small muted">このテーマの質問</span>
              <ProgressDots
                total={answered + remaining}
                current={answered}
                label={`${answered}問回答。あと最大${remaining}問`}
              />
            </div>
            <h2 ref={headingRef} tabIndex={-1} style={{ marginTop: 8, outline: 'none' }} data-testid="question">
              {q.text}
            </h2>
            {q.sub && <p className="small muted">{q.sub}</p>}
            <div className="options" role="group" aria-label="回答の選択肢">
              {q.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`option ${o.kind && o.kind !== 'normal' ? 'is-special' : ''}`}
                  onClick={(e) => onAnswer(q, o, e)}
                >
                  <span className="mark" aria-hidden="true" />
                  {o.label}
                </button>
              ))}
            </div>
            {fb?.burst && <Burst key={fb.key} x={fb.burst.x} y={fb.burst.y} />}
            <p className="center" style={{ marginTop: 12, marginBottom: 0 }}>
              <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'completeTopic', topic: topic.id })}>
                {answered > 0 ? 'ここまでの結果を見る' : '質問に答えずに結果を見る'}
              </button>
            </p>
          </div>
        )}

        {showResult && <TopicResultView topicId={topic.id} />}
      </main>
    </>
  );
}

function TopicResultView({ topicId }: { topicId: string }) {
  const { state, dispatch, diag } = useApp();
  if (!diag) return null;
  const topic = TOPIC_BY_ID[topicId];
  const r = composeTopicResult(topicId, diag);
  const more = availableQuestions(topicId, diag) > 0;
  const related = topic.related.map((id) => TOPIC_BY_ID[id]).filter(Boolean);
  const theme = THEME_BY_ID[topic.theme];

  return (
    <div className="stack" style={{ marginTop: 16 }}>
      <div className="card anim-flip" data-testid="topic-result">
        <SectionLabel n={1}>{topic.title}の結果</SectionLabel>
        <h2>{r.headline}</h2>
        <p>{r.lead}</p>
        <ul className="points">
          {r.points.map((p, i) => (
            <li className="point anim-rise" style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }} key={p.text}>
              <span className="point-icon" aria-hidden="true">
                {KIND_INFO[p.kind].icon}
              </span>
              <div>
                <span className="point-kind">{KIND_INFO[p.kind].label}</span>
                <span className={`source source-${p.source}`}>{SOURCE_LABEL[p.source]}</span>
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
          title={`私の${topic.title}`}
          headline={r.headline}
          keywords={r.keywords}
          sub={theme.title}
          theme={topic.theme}
        />
        {more && (
          <button type="button" className="btn btn-secondary" onClick={() => dispatch({ type: 'moreQuestions', topic: topicId, count: 2 })}>
            もう少し深掘りする
          </button>
        )}
      </div>

      <div className="card">
        <SectionLabel n={2}>次に気になるのは？</SectionLabel>
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
                  <span className="t-title">{tp.ask}</span>
                  <span className="t-sub">{THEME_BY_ID[tp.theme].short}・{tp.title}</span>
                </span>
                {state.completedTopics.includes(tp.id) && <span className="status-badge done">結果あり</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'go', screen: 'theme', theme: topic.theme })}>
          「{theme.short}」のテーマにもどる
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'restartTopic', topic: topicId })}>
          答えなおす
        </button>
      </div>
    </div>
  );
}

// ============ 年運 ============

function YearlyCards() {
  const { chart } = useApp();
  if (!chart) return null;
  const years = composeYearReadings(chart, new Date().getFullYear());
  return (
    <div className="stack" style={{ marginTop: 16 }}>
      {years.map((y, i) => (
        <div className="card anim-flip" key={y.year} style={{ animationDelay: `${i * 120}ms` }}>
          <SectionLabel n={i + 1}>
            {y.year}年（{y.pillar}）
          </SectionLabel>
          <h3>{y.title}</h3>
          <p>{y.text}</p>
          {y.branchNote && <p className="small">{y.branchNote}</p>}
          <p className="small" style={{ marginBottom: 4 }}>
            <strong>ヒント：</strong>
            {y.hint}
          </p>
          <p className="small muted" style={{ marginBottom: 0 }}>
            計算：その年の天干がこの命式の日干に対して「{y.star}」にあたります。年の区切りは立春です。
          </p>
        </div>
      ))}
    </div>
  );
}

// ============ 相性 ============

function CompatPanel({ showForm, onSkip }: { showForm: boolean; onSkip: () => void }) {
  const { state, dispatch, chart } = useApp();
  const [date, setDate] = useState<DateParts>(emptyDate);
  const [error, setError] = useState<string | null>(null);
  if (!chart) return null;

  if (state.compat) {
    const c = composeCompat(chart.pillars.day, state.compat.partnerDay);
    return (
      <div className="card anim-flip" style={{ marginTop: 16 }} data-testid="compat-result">
        <SectionLabel>ふたりの相性（日柱）</SectionLabel>
        <p className="small muted">
          あなたの日柱「{c.selfDay}」× お相手の日柱「{c.partnerDay}」
        </p>
        <h3>{c.title}</h3>
        <p>{c.stemText}</p>
        <p>{c.branchText}</p>
        <p className="small">
          <strong>ヒント：</strong>
          {c.tip}
        </p>
        <p className="small muted">
          ※ 二人の生年月日から求めた「日柱」の関係だけをもとにした占いの解釈です。相手の気持ちや関係の行方を決めるものではありません。
          お相手の生年月日は保存せず、計算した日柱だけをこの端末に保存しています。
        </p>
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'clearCompat' })}>
          お相手の情報を消す
        </button>
      </div>
    );
  }

  if (!showForm) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const iso = partsToIso(date);
    if (!iso) {
      setError('お相手の生年月日を選んでください');
      return;
    }
    try {
      const p = computeFourPillars({ date: iso, time: null });
      setError(null);
      dispatch({ type: 'setCompat', partnerDay: p.day });
    } catch (err) {
      setError(err instanceof BirthInputError ? err.message : '計算できませんでした');
    }
  };

  return (
    <form className="card stack anim-rise" style={{ marginTop: 16 }} onSubmit={submit} noValidate>
      <SectionLabel>お相手の生年月日（任意）</SectionLabel>
      <DateSelect idPrefix="partner" label="お相手の生年月日" value={date} onChange={setDate} />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <p className="small muted" style={{ margin: 0 }}>
        相性は、二人の生年月日から求める「日柱」どうしの関係で計算します（時刻は不要）。お相手の生年月日そのものは保存しません。
      </p>
      <button type="submit" className="btn btn-block">
        相性をみる
      </button>
      <button type="button" className="btn btn-secondary btn-block" onClick={onSkip}>
        わからない・入力しないで進む
      </button>
    </form>
  );
}
