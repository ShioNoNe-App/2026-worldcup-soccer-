import { useEffect, useRef, useState } from 'react';
import { BirthInputError, computeFourPillars } from '../engine/bazi/calendar';
import { BRANCHES, STEMS, pillarLabel, type Pillar } from '../engine/bazi/constants';
import { checkQuestionFor, feedbackFor, buildContext } from '../engine/diagnosis/engine';
import { buildInitialReading } from '../engine/diagnosis/result';
import type { OptionDef, ThemeId, TraitId } from '../engine/diagnosis/types';
import { THEMES } from '../content/topics';
import { useApp } from '../state/AppContext';
import { STYLE_IDS, type StyleId } from '../state/types';
import { Character, CHARACTER_NAMES, ThemeIcon, type Mood } from '../ui/Character';
import { Burst, SectionLabel, TopBar } from '../ui/common';
import { DateSelect, isoToParts, partsToIso, type DateParts } from '../ui/DateSelect';
import { VOICES } from '../ui/voice';
import { loadStyleFonts } from '../ui/fonts';

// ============ STEP 1: ウェルカム ============

export function Welcome() {
  const { state, dispatch, loadWarning } = useApp();
  const start = () => dispatch({ type: 'go', screen: state.styleChosen ? 'profile' : 'style' });
  return (
    <main className="main no-nav">
      <div className="hero anim-rise">
        <p className="brand muted small" aria-label="じぶんめくり">
          じぶんめくり
        </p>
        <Character styleId={state.style} mood="happy" size={132} className="anim-float" />
        <h1 style={{ marginTop: 16 }}>ねえ、あなたってどんな人？</h1>
        <p>占ってみたら、まだ知らない自分に出会えるかも。</p>
      </div>
      {loadWarning && (
        <p className="alert" role="alert">
          前回の保存データを読み込めなかったため、はじめからになります。
        </p>
      )}
      <div className="stack" style={{ marginTop: 24 }}>
        <button type="button" className="btn btn-block" onClick={start}>
          占いをはじめる
        </button>
        <p className="center small muted">生年月日だけではじめられます。登録は不要です。</p>
      </div>
      <div className="card" style={{ marginTop: 28 }}>
        <ul className="small" style={{ margin: 0, paddingLeft: '1.2em' }}>
          <li>四柱推命で命式を計算し、あなたへの「仮説」を出します</li>
          <li>気になるテーマだけ選んで、答えるほど具体的になります</li>
          <li>入力内容はこの端末のブラウザ内だけに保存されます</li>
        </ul>
      </div>
      <p className="center" style={{ marginTop: 16 }}>
        <button type="button" className="btn-ghost btn" onClick={() => dispatch({ type: 'go', screen: 'about' })}>
          計算方法・プライバシー・注意事項
        </button>
      </p>
    </main>
  );
}

// ============ STEP 2: スタイル選択 ============

export const STYLE_INFO: Record<StyleId, { name: string; desc: string; sample: string }> = {
  pop: {
    name: 'ふんわりポップ',
    desc: 'やさしい色とゆるい精霊。恋愛や相性をかわいく楽しみたい人に。',
    sample: '恋のはじまりは、ひとめぼれ？',
  },
  chic: {
    name: 'おしゃれ・自己理解',
    desc: '雑誌のように整った誌面。自分の傾向をすっきり整理したい人に。',
    sample: '強みと注意点を、整理して読む。',
  },
  game: {
    name: 'キャラ・ゲーム',
    desc: '相棒キャラと発見カード集め。友達とワイワイ楽しみたい人に。',
    sample: '発見カードGET！ 次のステージへ',
  },
};

export function StyleOptions({ value, onSelect }: { value: StyleId; onSelect: (s: StyleId) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => STYLE_IDS.forEach(loadStyleFonts), []);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + STYLE_IDS.length) % STYLE_IDS.length;
    onSelect(STYLE_IDS[next]);
    refs.current[next]?.focus();
  };
  return (
    <div role="radiogroup" aria-label="UIスタイル" className="stack">
      {STYLE_IDS.map((id, i) => {
        const info = STYLE_INFO[id];
        const checked = value === id;
        return (
          <button
            key={id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className="select-card"
            onClick={() => onSelect(id)}
            onKeyDown={(e) => onKey(e, i)}
            data-testid={`style-${id}`}
          >
            {checked && (
              <span className="check">
                <span aria-hidden="true">✓</span> 選択中
              </span>
            )}
            <strong style={{ fontSize: '1.05rem' }}>{info.name}</strong>
            <span className="style-preview" data-style={id} aria-hidden="true">
              <Character styleId={id} mood="happy" size={64} />
              <span className="mini">
                <strong>{CHARACTER_NAMES[id]}</strong>
                {info.sample}
              </span>
            </span>
            <span className="small muted" style={{ display: 'block' }}>
              {info.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function StylePicker() {
  const { state, dispatch } = useApp();
  return (
    <>
      <TopBar title="世界観をえらぶ" onBack={() => dispatch({ type: 'go', screen: 'welcome' })} />
      <main className="main no-nav">
        <h1>どの世界観で占う？</h1>
        <p className="muted">診断の中身は同じです。あとから設定でいつでも変えられます。</p>
        <StyleOptions value={state.style} onSelect={(s) => dispatch({ type: 'setStyle', style: s })} />
        <div className="sticky-actions stack">
          <button
            type="button"
            className="btn btn-block"
            onClick={() => {
              dispatch({ type: 'setStyle', style: state.style, chosen: true });
              dispatch({ type: 'go', screen: 'profile' });
            }}
          >
            「{STYLE_INFO[state.style].name}」ではじめる
          </button>
        </div>
        <p className="center">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              dispatch({ type: 'setStyle', style: 'pop', chosen: true });
              dispatch({ type: 'go', screen: 'profile' });
            }}
          >
            スキップ（ふんわりポップではじめる）
          </button>
        </p>
      </main>
    </>
  );
}

// ============ STEP 3: 基本情報 ============

export function ProfileForm() {
  const { state, dispatch } = useApp();
  const editing = state.onboarded;
  const [date, setDate] = useState<DateParts>(() => isoToParts(state.profile?.birthDate));
  const [knowsTime, setKnowsTime] = useState(Boolean(state.profile?.birthTime));
  const [time, setTime] = useState(state.profile?.birthTime ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const iso = partsToIso(date);
    if (!iso) {
      setError('生年月日を選んでください');
      return;
    }
    if (knowsTime && !/^\d{2}:\d{2}$/.test(time)) {
      setError('生まれた時刻を入力するか、「時刻がわかる」のチェックを外してください');
      return;
    }
    const birthTime = knowsTime ? time : null;
    try {
      computeFourPillars({ date: iso, time: birthTime });
    } catch (err) {
      setError(err instanceof BirthInputError ? err.message : '計算できませんでした。入力を確認してください');
      return;
    }
    if (iso > new Date().toISOString().slice(0, 10)) {
      setError('未来の日付は入力できません');
      return;
    }
    setError(null);
    dispatch({ type: 'setProfile', profile: { birthDate: iso, birthTime } });
    dispatch({ type: 'go', screen: editing ? 'home' : 'reading' });
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <TopBar
        title={editing ? '生年月日の変更' : 'あなたのこと'}
        onBack={() => dispatch({ type: 'go', screen: editing ? 'settings' : 'style' })}
      />
      <main className="main no-nav">
        <h1>{editing ? '生年月日を変更する' : '生年月日を教えてね'}</h1>
        <p className="muted">四柱推命の「命式」を計算するために使います。</p>
        {editing && <p className="alert">生年月日や時刻を変えると、命式が変わるため、これまでの回答はリセットされます。</p>}
        <form className="stack" onSubmit={submit} noValidate>
          <div className="card stack">
            <DateSelect idPrefix="birth" label="生年月日（必須）" value={date} onChange={setDate} />
            <label className="checkbox">
              <input type="checkbox" checked={knowsTime} onChange={(e) => setKnowsTime(e.target.checked)} />
              <span>生まれた時刻がわかる（任意）</span>
            </label>
            {knowsTime && (
              <div className="field">
                <label className="field-label" htmlFor="birth-time">
                  生まれた時刻
                </label>
                <input id="birth-time" className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </div>
          <details className="note">
            <summary>なぜこの情報が必要？</summary>
            <p>
              <strong>生年月日</strong>：年・月・日の3つの柱を出すのに使います。
            </p>
            <p>
              <strong>時刻（任意）</strong>：4つ目の「時柱」を出すのに使います。わからなくても診断できます。
              また「節入り」の日（月の区切りの日）に生まれた方は、時刻によって月の柱が変わるため、わかれば入力をおすすめします。
            </p>
            <p>
              <strong>性別</strong>：このアプリの命式計算と解釈では性別を使わないため、お聞きしていません。
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>出生地</strong>：使いません。日本時間で計算します。海外で生まれた方は、日本時間に換算して入力してください。
            </p>
          </details>
          <p className="small muted">入力内容はこの端末のブラウザ内にだけ保存され、外部には送信されません。設定からいつでも削除できます。</p>
          <div className="sticky-actions">
            <button type="submit" className="btn btn-block">
              {editing ? '変更して命式を計算しなおす' : '命式をひらく'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

// ============ STEP 4: 初期診断 ============


function PillarBox({ label, pillar, isDay }: { label: string; pillar: Pillar | null; isDay?: boolean }) {
  return (
    <div className={`pillar ${isDay ? 'is-day' : ''}`}>
      <div className="pos">{label}</div>
      {pillar ? (
        <div className="kan" aria-label={`${label} ${pillarLabel(pillar)}`}>
          {STEMS[pillar.stem]}
          <br />
          {BRANCHES[pillar.branch]}
        </div>
      ) : (
        <div className="unknown">時刻不明</div>
      )}
    </div>
  );
}

export function Reading() {
  const { state, dispatch, chart, diag, notify } = useApp();
  const voice = VOICES[state.style];
  const lastRef = useRef<HTMLDivElement>(null);
  const [fb, setFb] = useState<{ text: string; mood: Mood; key: number; keyword: string | null; burst?: { x: number; y: number } } | null>(null);
  const step = state.readingStep;

  useEffect(() => {
    if (step > 0) lastRef.current?.focus();
  }, [step]);

  if (!chart || !diag) {
    return (
      <main className="main no-nav">
        <p>命式を計算できませんでした。</p>
        <button type="button" className="btn" onClick={() => dispatch({ type: 'go', screen: 'profile' })}>
          生年月日を入力する
        </button>
      </main>
    );
  }
  const r = buildInitialReading(chart);
  const p = chart.pillars;

  // 「え、なんでわかるの？」の確認質問: 最も強い仮説をひとつ
  const strongest = (Object.values(diag.traits) as (typeof diag.traits)[TraitId][])
    .filter((t) => t.status === 'hypothesis' || state.answers[`check:${t.id}`])
    .sort((a, b) => Math.abs(b.prior) - Math.abs(a.prior))[0];
  const checkQ = strongest ? checkQuestionFor(strongest.id, strongest.prior, ['reading']) : null;
  const checkAnswered = checkQ ? Boolean(state.answers[checkQ.id]) : true;

  const answerCheck = (opt: OptionDef, e: React.MouseEvent) => {
    if (!checkQ || checkAnswered) return;
    const at = Date.now();
    const answers = { ...state.answers, [checkQ.id]: { optionId: opt.id, topic: 'reading', at } };
    const f = feedbackFor(diag, buildContext(chart, answers), checkQ, opt.id);
    dispatch({ type: 'answer', questionId: checkQ.id, optionId: opt.id, topic: 'reading', at });
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const host = (e.currentTarget as HTMLElement).closest('.card')!.getBoundingClientRect();
    setFb({
      text: f.reaction ?? voice.reactions[0],
      mood: opt.id === 'yes2' ? 'surprise' : opt.id === 'wrong' || opt.id === 'no' ? 'think' : 'happy',
      key: at,
      keyword: opt.kind === 'unknown' ? null : f.keyword,
      burst: { x: rect.left - host.left + rect.width / 2, y: rect.top - host.top + rect.height / 2 },
    });
    if (opt.id !== 'unknown') {
      dispatch({ type: 'markSeen', traits: [strongest!.id] });
      if (f.keyword) notify(voice.discovery(f.keyword), '✦');
    }
  };

  const cards = [
    <div className="card anim-flip" data-accent="self" key="0">
      <SectionLabel n={1}>あなたの命式</SectionLabel>
      <div className="pillars">
        <PillarBox label="時柱" pillar={p.hour} />
        <PillarBox label="日柱" pillar={p.day} isDay />
        <PillarBox label="月柱" pillar={p.month} />
        <PillarBox label="年柱" pillar={p.year} />
      </div>
      <p>
        あなたの中心にあるのは、日柱の上の文字「<strong>{r.dayStemLabel}</strong>（{r.dayStemReading}）」。
        四柱推命では、これを<strong>「{r.image}」</strong>にたとえます。
      </p>
      {p.ambiguity.length > 0 && (
        <p className="alert">
          生まれた日が「節入り」の日のため、出生時刻によって{p.ambiguity.includes('year') ? '年柱と' : ''}月柱が変わります。ここでは正午生まれとして計算しています。
          時刻がわかる場合は設定から入力すると確定します。
        </p>
      )}
    </div>,
    <div className="card anim-flip" key="1">
      <SectionLabel n={2}>基本の資質</SectionLabel>
      <h2>{r.nickname}</h2>
      <p style={{ marginBottom: 0 }}>{r.essence}</p>
    </div>,
    <div className="card anim-flip" data-accent="work" key="2">
      <SectionLabel n={3}>強みとして出やすい傾向</SectionLabel>
      <ul className="points">
        {r.strengths.map((s) => (
          <li className="point" key={s}>
            <span className="point-icon" aria-hidden="true">
              ★
            </span>
            <p>{s}</p>
          </li>
        ))}
        {r.topGroup && (
          <li className="point">
            <span className="point-icon" aria-hidden="true">
              ✦
            </span>
            <p>
              <strong>
                {r.topGroup.name}（{r.topGroup.stars}）が{r.topGroup.count}つ。
              </strong>
              {r.topGroup.text}
            </p>
          </li>
        )}
      </ul>
    </div>,
    <div className="card anim-flip" data-accent="life" key="3">
      <SectionLabel n={4}>気をつけたい傾向</SectionLabel>
      <ul className="points">
        {r.cautions.map((s) => (
          <li className="point" key={s}>
            <span className="point-icon" aria-hidden="true">
              !
            </span>
            <p>{s}</p>
          </li>
        ))}
      </ul>
      <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
        注意点は「強みの裏側」として出ることが多いもの。心当たりがあれば、少し意識するだけで十分です。
      </p>
    </div>,
    <div className="card anim-flip" data-accent="relations" key="4">
      <SectionLabel n={5}>五行のバランス</SectionLabel>
      <div className="bars" role="list" aria-label="五行の数">
        {r.elements.map((e) => (
          <div className="bar" role="listitem" key={e.name} aria-label={`${e.name} ${e.count}つ`}>
            <span aria-hidden="true">{e.name}</span>
            <span className="bar-track" aria-hidden="true">
              <span className="bar-fill" style={{ display: 'block', width: `${(e.count / 8) * 100}%` }} />
            </span>
            <span aria-hidden="true">{e.count}</span>
          </div>
        ))}
      </div>
      {r.elementNotes.map((n) => (
        <p key={n} className="small">
          {n}
        </p>
      ))}
    </div>,
    checkQ ? (
      <div className="card anim-flip" data-accent="love" key="5" style={{ position: 'relative' }}>
        <SectionLabel n={6}>ひとつだけ聞かせて</SectionLabel>
        <div className="char-header">
          <Character styleId={state.style} mood={fb?.mood ?? 'think'} size={72} reactKey={fb?.key} />
          {fb ? (
            <p className="bubble anim-pop" key={fb.key}>
              {fb.text}
            </p>
          ) : (
            <p className="bubble">命式からの仮説、当たってるかな？</p>
          )}
        </div>
        <h2>{checkQ.text}</h2>
        <p className="muted small">{checkQ.sub}</p>
        <div className="options">
          {checkQ.options.map((o) => {
            const selected = state.answers[checkQ.id]?.optionId === o.id;
            return (
              <button
                key={o.id}
                type="button"
                className={`option ${o.kind && o.kind !== 'normal' && o.id === 'unknown' ? 'is-special' : ''}`}
                aria-pressed={selected}
                disabled={checkAnswered && !selected}
                onClick={(e) => answerCheck(o, e)}
              >
                <span className="mark" aria-hidden="true">
                  {selected ? '✓' : ''}
                </span>
                {o.label}
              </button>
            );
          })}
        </div>
        {fb?.keyword && (
          <p style={{ marginTop: 12 }}>
            <span className="keyword-pop anim-pop">
              <span aria-hidden="true">✦</span> キーワード：{fb.keyword}
            </span>
          </p>
        )}
        {fb?.burst && <Burst key={fb.key} x={fb.burst.x} y={fb.burst.y} />}
      </div>
    ) : null,
  ].filter(Boolean);

  const total = cards.length;
  const visible = cards.slice(0, Math.min(step + 1, total));
  const finished = step + 1 >= total;

  return (
    <>
      <TopBar title="あなたの基本の命式" />
      <main className="main no-nav">
        <div className="char-header anim-rise">
          <Character styleId={state.style} mood="happy" size={72} />
          <p className="bubble">{step === 0 ? '命式がひらいたよ。1枚ずつめくってみよう。' : voice.reactions[step % voice.reactions.length]}</p>
        </div>
        <div className="stack">
          {visible.map((c, i) => (
            <div key={i} ref={i === visible.length - 1 ? lastRef : undefined} tabIndex={-1} style={{ outline: 'none' }}>
              {c}
            </div>
          ))}
        </div>
        <div className="sticky-actions stack">
          {!finished ? (
            <>
              <button type="button" className="btn btn-block" onClick={() => dispatch({ type: 'readingStep', step: step + 1 })}>
                {voice.next}（{step + 1} / {total}）
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-block"
              onClick={() => {
                dispatch({ type: 'go', screen: 'themes' });
                window.scrollTo({ top: 0 });
              }}
            >
              {checkAnswered ? '次に知りたいテーマをえらぶ' : '答えずに、テーマをえらぶ'}
            </button>
          )}
        </div>
        {!finished && (
          <p className="center">
            <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'readingStep', step: total - 1 })}>
              まとめて全部めくる
            </button>
          </p>
        )}
      </main>
    </>
  );
}

// ============ STEP 5: テーマ選択 ============

export function ThemePicker() {
  const { state, dispatch } = useApp();
  const selected = state.selectedThemes;
  const confirm = () => {
    if (!state.onboarded) dispatch({ type: 'finishOnboarding' });
    if (selected.length === 1) dispatch({ type: 'go', screen: 'theme', theme: selected[0] });
    else dispatch({ type: 'go', screen: 'home' });
    window.scrollTo({ top: 0 });
  };
  return (
    <>
      <TopBar
        title="テーマをえらぶ"
        onBack={() => dispatch({ type: 'go', screen: state.onboarded ? 'home' : 'reading' })}
      />
      <main className={`main ${state.onboarded ? '' : 'no-nav'}`}>
        <h1>次は、何を知りたい？</h1>
        <p className="muted">いくつ選んでもOK。あとから追加・変更もできます。</p>
        <div className="theme-grid">
          {THEMES.map((t) => {
            const on = selected.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                className={`select-card theme-card ${t.featured ? 'featured' : ''}`}
                data-accent={t.id}
                onClick={() => dispatch({ type: 'toggleTheme', theme: t.id as ThemeId })}
                data-testid={`theme-${t.id}`}
              >
                {on && (
                  <span className="check">
                    <span aria-hidden="true">✓</span> 選択中
                  </span>
                )}
                <ThemeIcon theme={t.id} />
                <span className="tc-text">
                  <span className="tc-title">{t.title}</span>
                  <span className="tc-lead">{t.lead}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="sticky-actions">
          <button type="button" className="btn btn-block" disabled={selected.length === 0} onClick={confirm}>
            {selected.length === 0 ? 'テーマを選んでください' : `このテーマでめくる（${selected.length}）`}
          </button>
        </div>
      </main>
    </>
  );
}
