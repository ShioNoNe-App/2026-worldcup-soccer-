import { useEffect, useRef, useState } from 'react';
import { BirthInputError, computeFourPillars } from '../engine/bazi/calendar';
import { BRANCHES, STEMS, pillarLabel, type Pillar } from '../engine/bazi/constants';
import { buildContext, checkQuestionFor, feedbackFor } from '../engine/diagnosis/engine';
import { buildInitialReading } from '../engine/diagnosis/result';
import type { ThemeId, TraitId } from '../engine/diagnosis/types';
import { localizeQuestion, pick } from '../content/localize';
import { THEMES } from '../content/topics';
import { useApp, useT } from '../state/AppContext';
import { STYLE_IDS, type StyleId } from '../state/types';
import { Character, CHARACTER_NAMES, ThemeIcon, type Mood } from '../ui/Character';
import { Burst, SectionLabel, TopBar } from '../ui/common';
import { DateSelect, isoToParts, partsToIso, type DateParts } from '../ui/DateSelect';
import { loadStyleFonts } from '../ui/fonts';
import { QuestionCard } from '../ui/QuestionCard';
import { voiceOf } from '../ui/voice';

// ============ STEP 1: ウェルカム ============

export function Welcome() {
  const { state, dispatch, loadWarning } = useApp();
  const T = useT();
  const start = () => dispatch({ type: 'go', screen: state.styleChosen ? 'profile' : 'style' });
  return (
    <>
      <TopBar title={<span className="brand">{T('じぶんめくり', 'Jibun Mekuri')}</span>} />
      <main className="main">
        <div className="hero anim-rise">
          <Character styleId={state.style} mood="happy" size={132} className="anim-float" lang={state.lang} />
          <h1 style={{ marginTop: 16 }}>{T('ねえ、あなたってどんな人？', 'Hey, what kind of person are you?')}</h1>
          <p>{T('占ってみたら、まだ知らない自分に出会えるかも。', 'A little fortune-telling might help you meet a side of yourself you haven’t met yet.')}</p>
        </div>
        {loadWarning && (
          <p className="alert" role="alert">
            {T('前回の保存データを読み込めなかったため、はじめからになります。', 'We couldn’t load your saved data, so you’ll start fresh.')}
          </p>
        )}
        <div className="stack" style={{ marginTop: 24 }}>
          <button type="button" className="btn btn-block" onClick={start}>
            {T('占いをはじめる', 'Start my reading')}
          </button>
          <p className="center small muted">{T('生年月日だけではじめられます。登録は不要です。', 'All you need is your birth date. No sign-up required.')}</p>
        </div>
        <div className="card" style={{ marginTop: 28 }}>
          <ul className="small" style={{ margin: 0, paddingLeft: '1.2em' }}>
            <li>{T('四柱推命で命式を計算し、あなたへの「仮説」を出します', 'We calculate your Four Pillars chart and offer "hypotheses" about you')}</li>
            <li>{T('気になるテーマだけ選んで、答えるほど具体的になります', 'Pick only the themes you care about — the more you answer, the more specific it gets')}</li>
            <li>{T('入力内容はこの端末のブラウザ内だけに保存されます', 'What you enter is saved only in this device’s browser')}</li>
          </ul>
        </div>
        <p className="center" style={{ marginTop: 16 }}>
          <button type="button" className="btn-ghost btn" onClick={() => dispatch({ type: 'go', screen: 'about' })}>
            {T('計算方法・プライバシー・注意事項', 'How it works, privacy & notes')}
          </button>
        </p>
      </main>
    </>
  );
}

// ============ STEP 2: スタイル選択 ============

export const STYLE_INFO: Record<StyleId, { name: { ja: string; en: string }; desc: { ja: string; en: string }; sample: { ja: string; en: string } }> = {
  pop: {
    name: { ja: 'ふんわりポップ', en: 'Soft Pop' },
    desc: {
      ja: 'やさしい色とゆるい精霊。恋愛や相性をかわいく楽しみたい人に。',
      en: 'Gentle colors and a fluffy spirit. For enjoying love and compatibility the cute way.',
    },
    sample: { ja: '恋のはじまりは、ひとめぼれ？', en: 'Does love start at first sight?' },
  },
  chic: {
    name: { ja: 'おしゃれ・自己理解', en: 'Chic & Insightful' },
    desc: {
      ja: '雑誌のように整った誌面。自分の傾向をすっきり整理したい人に。',
      en: 'A clean, magazine-like layout. For neatly organizing your tendencies.',
    },
    sample: { ja: '強みと注意点を、整理して読む。', en: 'Read your strengths and cautions, neatly.' },
  },
  game: {
    name: { ja: 'キャラ・ゲーム', en: 'Character Game' },
    desc: {
      ja: '相棒キャラと発見カード集め。友達とワイワイ楽しみたい人に。',
      en: 'A buddy character and discovery cards. For having fun with friends.',
    },
    sample: { ja: '発見カードGET！ 次のステージへ', en: 'Discovery card GET! On to the next stage' },
  },
};

export function StyleOptions({ value, onSelect }: { value: StyleId; onSelect: (s: StyleId) => void }) {
  const { state } = useApp();
  const T = useT();
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
    <div role="radiogroup" aria-label={T('UIスタイル', 'UI style')} className="stack">
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
                <span aria-hidden="true">✓</span> {T('選択中', 'Selected')}
              </span>
            )}
            <strong style={{ fontSize: '1.05rem' }}>{pick(info.name, state.lang)}</strong>
            <span className="style-preview" data-style={id} aria-hidden="true">
              <Character styleId={id} mood="happy" size={64} />
              <span className="mini">
                <strong>{pick(CHARACTER_NAMES[id], state.lang)}</strong>
                {pick(info.sample, state.lang)}
              </span>
            </span>
            <span className="small muted" style={{ display: 'block' }}>
              {pick(info.desc, state.lang)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function StylePicker() {
  const { state, dispatch } = useApp();
  const T = useT();
  return (
    <>
      <TopBar title={T('世界観をえらぶ', 'Choose a style')} onBack={() => dispatch({ type: 'go', screen: 'welcome' })} />
      <main className="main">
        <h1>{T('どの世界観で占う？', 'Which style do you like?')}</h1>
        <p className="muted">{T('診断の中身は同じです。あとから設定でいつでも変えられます。', 'The reading is the same in every style. You can change it anytime in Settings.')}</p>
        <StyleOptions value={state.style} onSelect={(s) => dispatch({ type: 'setStyle', style: s })} />
        <div className="sticky-actions stack">
          <button
            type="button"
            className="btn btn-block"
            data-testid="style-start"
            onClick={() => {
              dispatch({ type: 'setStyle', style: state.style, chosen: true });
              dispatch({ type: 'go', screen: 'profile' });
            }}
          >
            {T(`「${STYLE_INFO[state.style].name.ja}」ではじめる`, `Start with “${STYLE_INFO[state.style].name.en}”`)}
          </button>
        </div>
        <p className="center">
          <button
            type="button"
            className="btn btn-ghost"
            data-testid="style-skip"
            onClick={() => {
              dispatch({ type: 'setStyle', style: 'pop', chosen: true });
              dispatch({ type: 'go', screen: 'profile' });
            }}
          >
            {T('スキップ（ふんわりポップではじめる）', 'Skip (start with Soft Pop)')}
          </button>
        </p>
      </main>
    </>
  );
}

// ============ STEP 3: 基本情報 ============

export function ProfileForm() {
  const { state, dispatch } = useApp();
  const T = useT();
  const editing = state.onboarded;
  const [date, setDate] = useState<DateParts>(() => isoToParts(state.profile?.birthDate));
  const [knowsTime, setKnowsTime] = useState(Boolean(state.profile?.birthTime));
  const [time, setTime] = useState(state.profile?.birthTime ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const iso = partsToIso(date);
    if (!iso) {
      setError(T('生年月日を選んでください', 'Please choose your birth date'));
      return;
    }
    if (knowsTime && !/^\d{2}:\d{2}$/.test(time)) {
      setError(T('生まれた時刻を入力するか、「時刻がわかる」のチェックを外してください', 'Enter your birth time, or uncheck "I know my birth time"'));
      return;
    }
    const birthTime = knowsTime ? time : null;
    try {
      computeFourPillars({ date: iso, time: birthTime });
    } catch (err) {
      setError(
        err instanceof BirthInputError
          ? T(err.message, 'This date can’t be used. Please choose a valid date between 1900 and 2100.')
          : T('計算できませんでした。入力を確認してください', 'We couldn’t calculate this. Please check your input.'),
      );
      return;
    }
    if (iso > new Date().toISOString().slice(0, 10)) {
      setError(T('未来の日付は入力できません', 'Future dates can’t be used'));
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
        title={editing ? T('生年月日の変更', 'Change birth date') : T('あなたのこと', 'About you')}
        onBack={() => dispatch({ type: 'go', screen: editing ? 'settings' : 'style' })}
      />
      <main className="main">
        <h1>{editing ? T('生年月日を変更する', 'Change your birth date') : T('生年月日を教えてね', 'When were you born?')}</h1>
        <p className="muted">{T('四柱推命の「命式」を計算するために使います。', 'We use it to calculate your Four Pillars chart.')}</p>
        {editing && (
          <p className="alert">
            {T(
              '生年月日や時刻を変えると、命式が変わるため、これまでの回答はリセットされます。',
              'Changing your birth date or time changes your chart, so your previous answers will be reset.',
            )}
          </p>
        )}
        <form className="stack" onSubmit={submit} noValidate>
          <div className="card stack">
            <DateSelect idPrefix="birth" label={T('生年月日（必須）', 'Birth date (required)')} value={date} onChange={setDate} lang={state.lang} />
            <label className="checkbox">
              <input type="checkbox" checked={knowsTime} onChange={(e) => setKnowsTime(e.target.checked)} data-testid="knows-time" />
              <span>{T('生まれた時刻がわかる（任意）', 'I know my birth time (optional)')}</span>
            </label>
            {knowsTime && (
              <div className="field">
                <label className="field-label" htmlFor="birth-time">
                  {T('生まれた時刻', 'Birth time')}
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
            <summary>{T('なぜこの情報が必要？', 'Why do we need this?')}</summary>
            <p>
              <strong>{T('生年月日', 'Birth date')}</strong>
              {T('：年・月・日の3つの柱を出すのに使います。', ': used for three pillars — year, month and day.')}
            </p>
            <p>
              <strong>{T('時刻（任意）', 'Time (optional)')}</strong>
              {T(
                '：4つ目の「時柱」を出すのに使います。わからなくても診断できます。また「節入り」の日（月の区切りの日）に生まれた方は、時刻によって月の柱が変わるため、わかれば入力をおすすめします。',
                ': used for the fourth "hour pillar." You can still get a reading without it. If you were born on a solar-term day (when the month changes), the time can change your month pillar, so we recommend entering it if you know it.',
              )}
            </p>
            <p>
              <strong>{T('性別', 'Gender')}</strong>
              {T('：このアプリの命式計算と解釈では性別を使わないため、お聞きしていません。', ': not asked, because this app’s calculations and readings don’t use it.')}
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>{T('出生地', 'Birthplace')}</strong>
              {T(
                '：使いません。日本時間で計算します。海外で生まれた方は、日本時間に換算して入力してください。',
                ': not used. We calculate in Japan Standard Time (UTC+9). If you were born outside Japan, please convert your birth time to Japan time.',
              )}
            </p>
          </details>
          <p className="small muted">
            {T(
              '入力内容はこの端末のブラウザ内にだけ保存され、外部には送信されません。設定からいつでも削除できます。',
              'Your input is saved only in this browser and is never sent anywhere. You can delete it anytime in Settings.',
            )}
          </p>
          <div className="sticky-actions">
            <button type="submit" className="btn btn-block" data-testid="profile-submit">
              {editing ? T('変更して命式を計算しなおす', 'Save and recalculate') : T('命式をひらく', 'Open my chart')}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

// ============ STEP 4: 初期診断 ============

function PillarBox({ label, pillar, isDay, unknownLabel }: { label: string; pillar: Pillar | null; isDay?: boolean; unknownLabel: string }) {
  return (
    <div className={`pillar ${isDay ? 'is-day' : ''}`}>
      <div className="pos">{label}</div>
      {pillar ? (
        <div className="kan" aria-label={`${label} ${pillarLabel(pillar)}`} data-testid={`pillar-${label}`}>
          {STEMS[pillar.stem]}
          <br />
          {BRANCHES[pillar.branch]}
        </div>
      ) : (
        <div className="unknown">{unknownLabel}</div>
      )}
    </div>
  );
}

export function Reading() {
  const { state, dispatch, chart, diag } = useApp();
  const T = useT();
  const lang = state.lang;
  const voice = voiceOf(state.style, lang);
  const lastRef = useRef<HTMLDivElement>(null);
  const [fb, setFb] = useState<{ text: string; mood: Mood; key: number; keyword: string | null; burst: { x: number; y: number } | null } | null>(null);
  const step = state.readingStep;

  useEffect(() => {
    if (step > 0) lastRef.current?.focus();
  }, [step]);

  if (!chart || !diag) {
    return (
      <main className="main">
        <p>{T('命式を計算できませんでした。', 'We couldn’t calculate your chart.')}</p>
        <button type="button" className="btn" onClick={() => dispatch({ type: 'go', screen: 'profile' })}>
          {T('生年月日を入力する', 'Enter birth date')}
        </button>
      </main>
    );
  }
  const r = buildInitialReading(chart, lang);
  const p = chart.pillars;

  // 「え、なんでわかるの？」の確認質問: 最も強い仮説をひとつ
  const strongest = (Object.values(diag.traits) as (typeof diag.traits)[TraitId][])
    .filter((t) => t.status === 'hypothesis' || state.answers[`check:${t.id}`])
    .sort((a, b) => Math.abs(b.prior) - Math.abs(a.prior))[0];
  const checkQ = strongest ? checkQuestionFor(strongest.id, strongest.prior, ['reading']) : null;
  const checkAnswer = checkQ ? state.answers[checkQ.id] : undefined;

  const confirmCheck = ({ option, point }: { option: { id: string; kind?: string }; point: { x: number; y: number } | null }) => {
    if (!checkQ) return;
    const at = Date.now();
    const answers = { ...state.answers, [checkQ.id]: { optionId: option.id, topic: 'reading', at } };
    const f = feedbackFor(diag, buildContext(chart, answers), checkQ, option.id, lang);
    dispatch({ type: 'answer', questionId: checkQ.id, optionId: option.id, topic: 'reading', at });
    setFb({
      text: f.reaction ?? voice.reactions[0],
      mood: option.id === 'yes2' ? 'surprise' : option.id === 'wrong' || option.id === 'no' ? 'think' : 'happy',
      key: at,
      keyword: option.kind === 'unknown' ? null : f.keyword,
      burst: point,
    });
    if (option.id !== 'unknown' && strongest) {
      dispatch({ type: 'markSeen', traits: [strongest.id] });
    }
  };

  const cards = [
    <div className="card anim-flip" data-accent="self" key="0">
      <SectionLabel n={1}>{T('あなたの命式', 'Your chart')}</SectionLabel>
      <div className="pillars">
        <PillarBox label={T('時柱', 'Hour')} pillar={p.hour} unknownLabel={T('時刻不明', 'Unknown')} />
        <PillarBox label={T('日柱', 'Day')} pillar={p.day} isDay unknownLabel="" />
        <PillarBox label={T('月柱', 'Month')} pillar={p.month} unknownLabel="" />
        <PillarBox label={T('年柱', 'Year')} pillar={p.year} unknownLabel="" />
      </div>
      <p>
        {lang === 'en' ? (
          <>
            At your center is the top character of your day pillar: <strong>{r.dayStemLabel}</strong> ({r.dayStemReading}). In Four Pillars
            astrology, this is likened to a <strong>{r.image}</strong>.
          </>
        ) : (
          <>
            あなたの中心にあるのは、日柱の上の文字「<strong>{r.dayStemLabel}</strong>（{r.dayStemReading}）」。 四柱推命では、これを
            <strong>「{r.image}」</strong>にたとえます。
          </>
        )}
      </p>
      {p.ambiguity.length > 0 && (
        <p className="alert">
          {lang === 'en'
            ? `You were born on a solar-term day, so your ${p.ambiguity.includes('year') ? 'year and ' : ''}month pillar depends on your birth time. We calculated as if you were born at noon. Enter your birth time in Settings to confirm it.`
            : `生まれた日が「節入り」の日のため、出生時刻によって${p.ambiguity.includes('year') ? '年柱と' : ''}月柱が変わります。ここでは正午生まれとして計算しています。時刻がわかる場合は設定から入力すると確定します。`}
        </p>
      )}
    </div>,
    <div className="card anim-flip" key="1">
      <SectionLabel n={2}>{T('基本の資質', 'Your core nature')}</SectionLabel>
      <h2>{r.nickname}</h2>
      <p style={{ marginBottom: 0 }}>{r.essence}</p>
    </div>,
    <div className="card anim-flip" data-accent="work" key="2">
      <SectionLabel n={3}>{T('強みとして出やすい傾向', 'Likely strengths')}</SectionLabel>
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
                {lang === 'en'
                  ? `${r.topGroup.count} ${r.topGroup.name} (${r.topGroup.stars}). `
                  : `${r.topGroup.name}（${r.topGroup.stars}）が${r.topGroup.count}つ。`}
              </strong>
              {r.topGroup.text}
            </p>
          </li>
        )}
      </ul>
    </div>,
    <div className="card anim-flip" data-accent="life" key="3">
      <SectionLabel n={4}>{T('気をつけたい傾向', 'Things to watch')}</SectionLabel>
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
        {T(
          '注意点は「強みの裏側」として出ることが多いもの。心当たりがあれば、少し意識するだけで十分です。',
          'Cautions are often the flip side of strengths. If one rings a bell, just keeping it in mind is enough.',
        )}
      </p>
    </div>,
    <div className="card anim-flip" data-accent="relations" key="4">
      <SectionLabel n={5}>{T('五行のバランス', 'Five-element balance')}</SectionLabel>
      <div className="bars" role="list" aria-label={T('五行の数', 'Count of each element')}>
        {r.elements.map((e) => (
          <div className="bar" role="listitem" key={e.name} aria-label={`${e.name} ${e.count}`}>
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
      <div data-accent="love" key="5" style={{ position: 'relative' }}>
        <div className="char-header">
          <Character styleId={state.style} mood={fb?.mood ?? 'think'} size={72} reactKey={fb?.key} lang={lang} />
          <p className="bubble anim-pop" key={fb?.key ?? 'q'}>
            {fb ? fb.text : T('命式からの仮説、当たってるかな？', 'Does the hypothesis from your chart ring true?')}
          </p>
        </div>
        {checkAnswer ? (
          <div className="card anim-rise">
            <SectionLabel n={6}>{T('ひとつだけ聞かせて', 'Just one question')}</SectionLabel>
            <h2>{localizeQuestion(checkQ, lang).text}</h2>
            <p>
              {T('あなたの答え：', 'Your answer: ')}
              <strong>{localizeQuestion(checkQ, lang).options.find((o) => o.id === checkAnswer.optionId)?.label}</strong>
            </p>
            {fb?.keyword && (
              <p>
                <span className="keyword-pop anim-pop">
                  <span aria-hidden="true">✦</span> {T('キーワード：', 'Keyword: ')}
                  {fb.keyword}
                </span>
              </p>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                dispatch({ type: 'undoAnswer', questionId: checkQ.id });
                setFb(null);
              }}
            >
              {T('答えを選びなおす', 'Change my answer')}
            </button>
            {fb?.burst && <Burst key={fb.key} x={fb.burst.x} y={fb.burst.y} />}
          </div>
        ) : (
          <QuestionCard
            key={checkQ.id}
            question={localizeQuestion(checkQ, lang)}
            onConfirm={confirmCheck}
            confirmLabel={T('この答えで決定', 'Confirm this answer')}
            header={<SectionLabel n={6}>{T('ひとつだけ聞かせて', 'Just one question')}</SectionLabel>}
          />
        )}
      </div>
    ) : null,
  ].filter(Boolean);

  const total = cards.length;
  const visible = cards.slice(0, Math.min(step + 1, total));
  const finished = step + 1 >= total;

  return (
    <>
      <TopBar title={T('あなたの基本の命式', 'Your basic chart')} />
      <main className="main">
        <div className="char-header anim-rise">
          <Character styleId={state.style} mood="happy" size={72} lang={lang} />
          <p className="bubble">
            {step === 0 ? T('命式がひらいたよ。1枚ずつめくってみよう。', 'Your chart is open. Let’s flip through it one card at a time.') : voice.reactions[step % voice.reactions.length]}
          </p>
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
            <button type="button" className="btn btn-block" onClick={() => dispatch({ type: 'readingStep', step: step + 1 })} data-testid="reading-next">
              {voice.next}（{step + 1} / {total}）
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-block"
              data-testid="to-themes"
              onClick={() => {
                dispatch({ type: 'go', screen: 'themes' });
                window.scrollTo({ top: 0 });
              }}
            >
              {checkAnswer ? T('次に知りたいテーマをえらぶ', 'Choose what to explore next') : T('答えずに、テーマをえらぶ', 'Skip and choose themes')}
            </button>
          )}
        </div>
        {!finished && (
          <p className="center">
            <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'readingStep', step: total - 1 })} data-testid="reading-all">
              {T('まとめて全部めくる', 'Flip them all at once')}
            </button>
          </p>
        )}
      </main>
    </>
  );
}

// ============ STEP 5: テーマ選択（あとから編集も） ============

export function ThemePicker() {
  const { state, dispatch } = useApp();
  const T = useT();
  const editing = state.onboarded;
  // 編集中は「保存」を押すまで反映しない
  const [draft, setDraft] = useState<ThemeId[]>(state.selectedThemes);
  const selected = editing ? draft : state.selectedThemes;
  const toggle = (id: ThemeId) => {
    if (editing) setDraft((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
    else dispatch({ type: 'toggleTheme', theme: id });
  };
  const confirm = () => {
    if (editing) {
      dispatch({ type: 'setThemes', themes: draft });
      dispatch({ type: 'go', screen: 'home' });
    } else {
      dispatch({ type: 'finishOnboarding' });
      if (selected.length === 1) dispatch({ type: 'go', screen: 'theme', theme: selected[0] });
      else dispatch({ type: 'go', screen: 'home' });
    }
    window.scrollTo({ top: 0 });
  };
  return (
    <>
      <TopBar
        title={editing ? T('テーマを編集', 'Edit themes') : T('テーマをえらぶ', 'Choose themes')}
        onBack={() => dispatch({ type: 'go', screen: editing ? 'home' : 'reading' })}
      />
      <main className="main">
        <h1>{editing ? T('見たいテーマを選びなおそう', 'Change the themes you want to explore') : T('次は、何を知りたい？', 'What do you want to know next?')}</h1>
        <p className="muted">
          {editing
            ? T('タップで追加・解除できます。外したテーマの回答は消えません。', 'Tap to add or remove. Answers in removed themes are kept.')
            : T('いくつ選んでもOK。あとから「めくる」画面の「テーマを編集」でいつでも変えられます。', 'Pick as many as you like. You can change them anytime with "Edit themes" on the Explore screen.')}
        </p>
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
                onClick={() => toggle(t.id)}
                data-testid={`theme-${t.id}`}
              >
                {on && (
                  <span className="check">
                    <span aria-hidden="true">✓</span> {T('選択中', 'Selected')}
                  </span>
                )}
                <ThemeIcon theme={t.id} />
                <span className="tc-text">
                  <span className="tc-title">{pick(t.title, state.lang)}</span>
                  <span className="tc-lead">{pick(t.lead, state.lang)}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="sticky-actions">
          <button type="button" className="btn btn-block" disabled={selected.length === 0} onClick={confirm} data-testid="themes-confirm">
            {selected.length === 0
              ? T('テーマを選んでください', 'Choose at least one theme')
              : editing
                ? T(`このテーマで保存（${selected.length}）`, `Save these themes (${selected.length})`)
                : T(`このテーマでめくる（${selected.length}）`, `Explore these themes (${selected.length})`)}
          </button>
        </div>
      </main>
    </>
  );
}
