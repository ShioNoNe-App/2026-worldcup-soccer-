import { useState } from 'react';
import { MAX_SUPPORTED_YEAR, MIN_SUPPORTED_YEAR } from '../engine/bazi/calendar';
import { pick } from '../content/localize';
import { THEME_BY_ID } from '../content/topics';
import { useApp, useT } from '../state/AppContext';
import { Dialog, SectionLabel, TopBar } from '../ui/common';
import { STYLE_INFO, StyleOptions } from './Onboarding';

export function Settings() {
  const { state, dispatch, deleteAll, notify } = useApp();
  const T = useT();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <TopBar title={T('設定', 'Settings')} />
      <main className="main">
        <section className="card" aria-labelledby="set-style">
          <SectionLabel n={1}>
            <span id="set-style">{T('UIスタイル', 'UI style')}</span>
          </SectionLabel>
          <p className="small muted">
            {T(`いまは「${STYLE_INFO[state.style].name.ja}」。診断の内容は変わりません。`, `Currently “${STYLE_INFO[state.style].name.en}.” The reading itself stays the same.`)}
          </p>
          <StyleOptions
            value={state.style}
            onSelect={(s) => {
              dispatch({ type: 'setStyle', style: s, chosen: true });
              notify(T(`「${STYLE_INFO[s].name.ja}」に切り替えました`, `Switched to “${STYLE_INFO[s].name.en}”`), '✓');
            }}
          />
        </section>

        <section className="card" style={{ marginTop: 16 }} aria-labelledby="set-themes">
          <SectionLabel n={2}>
            <span id="set-themes">{T('テーマ', 'Themes')}</span>
          </SectionLabel>
          <p className="small muted">
            {T('いま選んでいるテーマ：', 'Selected themes: ')}
            {state.selectedThemes.length > 0
              ? state.selectedThemes.map((t) => pick(THEME_BY_ID[t].short, state.lang)).join(state.lang === 'en' ? ', ' : '、')
              : T('なし', 'None')}
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => dispatch({ type: 'go', screen: 'themes' })}>
            <span aria-hidden="true">✎</span> {T('テーマを編集', 'Edit themes')}
          </button>
        </section>

        <section className="card" style={{ marginTop: 16 }} aria-labelledby="set-motion">
          <SectionLabel n={3}>
            <span id="set-motion">{T('アニメーション', 'Animation')}</span>
          </SectionLabel>
          <div role="radiogroup" aria-labelledby="set-motion">
            <label className="checkbox">
              <input type="radio" name="motion" checked={state.motion === 'auto'} onChange={() => dispatch({ type: 'setMotion', motion: 'auto' })} />
              <span>{T('端末の設定にあわせる', 'Follow device setting')}</span>
            </label>
            <label className="checkbox">
              <input type="radio" name="motion" checked={state.motion === 'reduce'} onChange={() => dispatch({ type: 'setMotion', motion: 'reduce' })} />
              <span>{T('動きを減らす', 'Reduce motion')}</span>
            </label>
          </div>
        </section>

        <section className="card" style={{ marginTop: 16 }} aria-labelledby="set-profile">
          <SectionLabel n={4}>
            <span id="set-profile">{T('あなたの情報', 'Your info')}</span>
          </SectionLabel>
          <p className="small">
            {T('生年月日：', 'Birth date: ')}
            {state.profile?.birthDate ?? T('未入力', 'Not set')}
            <br />
            {T('生まれた時刻：', 'Birth time: ')}
            {state.profile?.birthTime ?? T('不明', 'Unknown')}
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => dispatch({ type: 'go', screen: 'profile' })}>
            {T('生年月日・時刻を変更', 'Change birth date / time')}
          </button>
        </section>

        <section className="card" style={{ marginTop: 16 }} aria-labelledby="set-data">
          <SectionLabel n={5}>
            <span id="set-data">{T('保存データ', 'Saved data')}</span>
          </SectionLabel>
          <p className="small">
            {T(
              '生年月日・回答・選んだテーマ・スタイルは、この端末のブラウザ（localStorage）にだけ保存しています。外部のサーバーには送信していません。',
              'Your birth date, answers, themes and style are saved only in this browser (localStorage). Nothing is sent to any server.',
            )}
          </p>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
            {T('保存データをすべて削除', 'Delete all saved data')}
          </button>
        </section>

        <p className="center" style={{ marginTop: 16 }}>
          <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'go', screen: 'about' })}>
            {T('計算方法・プライバシー・注意事項', 'How it works, privacy & notes')}
          </button>
        </p>
      </main>
      {confirmDelete && (
        <Dialog title={T('保存データを削除しますか？', 'Delete saved data?')} onClose={() => setConfirmDelete(false)}>
          <p>
            {T(
              '生年月日、回答、相性の結果、スタイルの設定がこの端末から削除されます。元に戻すことはできません。',
              'Your birth date, answers, compatibility result and style setting will be removed from this device. This can’t be undone.',
            )}
          </p>
          <div className="stack">
            <button
              type="button"
              className="btn btn-danger btn-block"
              data-testid="confirm-delete"
              onClick={() => {
                deleteAll();
                setConfirmDelete(false);
                notify(T('保存データを削除しました', 'Saved data deleted'), '✓');
                window.scrollTo({ top: 0 });
              }}
            >
              {T('削除する', 'Delete')}
            </button>
            <button type="button" className="btn btn-secondary btn-block" onClick={() => setConfirmDelete(false)}>
              {T('やめる', 'Cancel')}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}

export function About() {
  const { state, dispatch } = useApp();
  const T = useT();
  const en = state.lang === 'en';
  const back = () => dispatch({ type: 'go', screen: state.onboarded ? 'settings' : 'welcome' });
  const ul = { paddingLeft: '1.2em' };
  return (
    <>
      <TopBar title={T('計算方法・プライバシー', 'How it works & privacy')} onBack={back} />
      <main className="main">
        <section className="card">
          <SectionLabel n={1}>{T('このアプリについて', 'About this app')}</SectionLabel>
          {en ? (
            <>
              <p>
                Jibun Mekuri is an entertainment service that uses Four Pillars of Destiny (BaZi) as a starting point for thinking about yourself.
                Its readings are not scientifically proven, and they don’t predict the future or read other people’s minds.
              </p>
              <p style={{ marginBottom: 0 }}>
                For important matters such as school, jobs, career changes, marriage, money or health, don’t decide based on fortune-telling alone —
                combine it with real information and advice from people you trust. If you keep feeling distressed, please talk to someone close to
                you or a public support service.
              </p>
            </>
          ) : (
            <>
              <p>
                「じぶんめくり」は、四柱推命を入口にして自分のことを考えるための、エンターテインメントのサービスです。
                占いの結果は科学的に証明されたものではなく、未来や他人の気持ちを言い当てるものでもありません。
              </p>
              <p style={{ marginBottom: 0 }}>
                進学・就職・転職・結婚・お金・健康など大切なことは、占いだけで決めず、現実の情報や信頼できる人の意見と合わせて考えてください。
                つらい気持ちが続くときは、身近な人や公的な相談窓口に相談してください。
              </p>
            </>
          )}
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <SectionLabel n={2}>{T('命式の計算方法', 'How the chart is calculated')}</SectionLabel>
          {en ? (
            <ul className="small" style={ul}>
              <li>Birth date and time are treated as Japan Standard Time (JST, UTC+9). No longitude (true solar time) correction is applied.</li>
              <li>Year pillar: the year changes at the exact moment of Lichun (Start of Spring).</li>
              <li>
                Month pillar: the month changes at the exact moments of the twelve "jie" solar terms (Lichun, Jingzhe, Qingming, Lixia, Mangzhong,
                Xiaoshu, Liqiu, Bailu, Hanlu, Lidong, Daxue, Xiaohan). The month stem is derived from the year stem.
              </li>
              <li>Day pillar: the sexagenary day is derived from the Gregorian date. Days change at 0:00.</li>
              <li>
                Hour pillar: twelve two-hour periods. 23:00–23:59 is the Rat hour, and its stem is derived from the next day’s stem (the day pillar
                stays the same). Some schools change the day at 23:00, which gives different results.
              </li>
              <li>
                If the birth time is unknown, no hour pillar is shown. If you were born on a solar-term day and the time is unknown, we calculate as
                noon and tell you so.
              </li>
              <li>
                Solar-term times come from a table for {MIN_SUPPORTED_YEAR}–{MAX_SUPPORTED_YEAR} generated with the open-source calendar library
                lunar-javascript (MIT license). Results are checked against that library in automated tests.
              </li>
              <li>Gender is not used in any calculation here. "Luck pillars" (10-year cycles), which need gender, are not implemented.</li>
              <li>If you were born during Japan’s daylight saving time (1948–1951), enter the clock time minus one hour to calculate in JST.</li>
            </ul>
          ) : (
            <ul className="small" style={ul}>
              <li>入力された生年月日・時刻は日本標準時（JST, UTC+9）として扱います。経度による地方時の補正（真太陽時）は行いません。</li>
              <li>年柱：立春の「節入り時刻」で年が切り替わります。</li>
              <li>
                月柱：十二節（立春・啓蟄・清明・立夏・芒種・小暑・立秋・白露・寒露・立冬・大雪・小寒）の節入り時刻で月が切り替わります。月干は年干から求めます（五虎遁）。
              </li>
              <li>日柱：グレゴリオ暦の日付から六十干支を求めます。日の切り替わりは 0:00 です。</li>
              <li>
                時柱：2時間ごとの十二時辰。23:00〜23:59 は「子の刻」とし、時干は翌日の日干から求めます（日柱は当日のまま）。流派によっては 23:00
                で日を切り替える場合があり、その場合とは結果が異なります。
              </li>
              <li>出生時刻が不明な場合、時柱は出しません。節入り日に生まれて時刻が不明な場合は、正午生まれとして計算し、その旨を表示します。</li>
              <li>
                節入り時刻は、オープンソースの暦ライブラリ lunar-javascript（MIT ライセンス）の天文計算から
                {MIN_SUPPORTED_YEAR}〜{MAX_SUPPORTED_YEAR}年分を生成した表を使っています。計算結果は自動テストで同ライブラリと照合しています。
              </li>
              <li>性別はこのアプリの計算（四柱・五行・通変星・相性・年運）では使いません。性別を使う「大運」（10年ごとの運勢）は未実装です。</li>
              <li>1948〜1951年の日本のサマータイム期間に生まれた方は、当時の時計の時刻から1時間引いた時刻を入力すると、日本標準時での計算になります。</li>
            </ul>
          )}
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <SectionLabel n={3}>{T('解釈について', 'About the readings')}</SectionLabel>
          {en ? (
            <ul className="small" style={{ ...ul, marginBottom: 0 }}>
              <li>The five-element count is a simple tally of each pillar’s stem and the main element of its branch.</li>
              <li>The Ten Gods are derived from the other stems and each branch’s main hidden stem, as seen from your day stem.</li>
              <li>Compatibility uses only your two day pillars (stem combinations and element cycles, plus branch combinations, clashes and trines).</li>
              <li>Yearly readings use the Ten God of that year’s stem relative to your day stem, and how the year’s branch relates to your day branch.</li>
              <li>Personality "hypotheses" are this app’s own interpretations of these calculations, and they are refined or corrected by your answers.</li>
              <li>The English version is a translation; some Four Pillars terms are given in simplified English.</li>
            </ul>
          ) : (
            <ul className="small" style={{ ...ul, marginBottom: 0 }}>
              <li>五行の数は、四柱の天干と地支（本気の五行）を1つずつ数えた簡易的な集計です。</li>
              <li>通変星は、日干から見た他の天干と、各地支の本気の蔵干から求めています。</li>
              <li>相性は、二人の日柱（日干の干合・五行の関係と、日支の支合・冲・三合）だけで判断しています。</li>
              <li>年運は、その年の天干が日干に対してどの通変星にあたるか、と年支と日支の関係から読んでいます。</li>
              <li>性格などの「仮説」は、これらの計算結果に対してこのアプリが独自に用意した解釈文で、回答によって具体化・修正されます。</li>
            </ul>
          )}
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <SectionLabel n={4}>{T('プライバシー', 'Privacy')}</SectionLabel>
          {en ? (
            <ul className="small" style={{ ...ul, marginBottom: 0 }}>
              <li>Your birth date and time, answers, themes and style are saved only in your browser’s localStorage.</li>
              <li>This app doesn’t send what you enter to any server or AI service. It contains no analytics or ad tags. Fonts are bundled with the app.</li>
              <li>If you enter someone’s birth date for compatibility, only the calculated day pillar is saved — not the birth date itself.</li>
              <li>Sharing includes only the headline and keywords on the result card — never your birth date or answers.</li>
              <li>You can delete everything anytime with "Delete all saved data" in Settings. On a shared device, please delete it when you’re done.</li>
              <li>The hosting service may show its own badge or collect standard access logs; that is outside this app’s control.</li>
            </ul>
          ) : (
            <ul className="small" style={{ ...ul, marginBottom: 0 }}>
              <li>入力した生年月日・時刻、回答、選んだテーマ、スタイルの設定は、お使いのブラウザの localStorage にだけ保存されます。</li>
              <li>このアプリは、入力内容を外部のサーバーや AI サービスに送信しません。アクセス解析や広告のタグも入れていません。フォントもアプリに同梱しています。</li>
              <li>相性診断でお相手の生年月日を入力した場合、生年月日そのものは保存せず、計算した「日柱」だけを保存します。</li>
              <li>シェア機能で共有されるのは、結果カードの見出しとキーワードだけです。生年月日や回答は含まれません。</li>
              <li>設定の「保存データをすべて削除」から、いつでも削除できます。共有の端末で使う場合は、使い終わったら削除してください。</li>
              <li>ホスティングサービスが独自のバッジを表示したり、一般的なアクセスログを記録したりする場合があります（このアプリの管理外です）。</li>
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
