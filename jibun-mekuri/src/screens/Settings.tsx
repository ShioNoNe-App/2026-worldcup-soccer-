import { useState } from 'react';
import { MAX_SUPPORTED_YEAR, MIN_SUPPORTED_YEAR } from '../engine/bazi/calendar';
import { useApp } from '../state/AppContext';
import { Dialog, SectionLabel, TopBar } from '../ui/common';
import { STYLE_INFO, StyleOptions } from './Onboarding';

export function Settings() {
  const { state, dispatch, deleteAll, notify } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <TopBar title="設定" />
      <main className="main">
        <section className="card" aria-labelledby="set-style">
          <SectionLabel n={1}>
            <span id="set-style">UIスタイル</span>
          </SectionLabel>
          <p className="small muted">いまは「{STYLE_INFO[state.style].name}」。診断の内容は変わりません。</p>
          <StyleOptions
            value={state.style}
            onSelect={(s) => {
              dispatch({ type: 'setStyle', style: s, chosen: true });
              notify(`「${STYLE_INFO[s].name}」に切り替えました`, '✓');
            }}
          />
        </section>

        <section className="card" style={{ marginTop: 16 }} aria-labelledby="set-motion">
          <SectionLabel n={2}>
            <span id="set-motion">アニメーション</span>
          </SectionLabel>
          <div role="radiogroup" aria-labelledby="set-motion">
            <label className="checkbox">
              <input
                type="radio"
                name="motion"
                checked={state.motion === 'auto'}
                onChange={() => dispatch({ type: 'setMotion', motion: 'auto' })}
              />
              <span>端末の設定にあわせる</span>
            </label>
            <label className="checkbox">
              <input
                type="radio"
                name="motion"
                checked={state.motion === 'reduce'}
                onChange={() => dispatch({ type: 'setMotion', motion: 'reduce' })}
              />
              <span>動きを減らす</span>
            </label>
          </div>
        </section>

        <section className="card" style={{ marginTop: 16 }} aria-labelledby="set-profile">
          <SectionLabel n={3}>
            <span id="set-profile">あなたの情報</span>
          </SectionLabel>
          <p className="small">
            生年月日：{state.profile?.birthDate ?? '未入力'}
            <br />
            生まれた時刻：{state.profile?.birthTime ?? '不明'}
          </p>
          <div className="row">
            <button type="button" className="btn btn-secondary" onClick={() => dispatch({ type: 'go', screen: 'profile' })}>
              生年月日・時刻を変更
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => dispatch({ type: 'go', screen: 'themes' })}>
              テーマを追加・変更
            </button>
          </div>
        </section>

        <section className="card" style={{ marginTop: 16 }} aria-labelledby="set-data">
          <SectionLabel n={4}>
            <span id="set-data">保存データ</span>
          </SectionLabel>
          <p className="small">
            生年月日・回答・選んだテーマ・スタイルは、この端末のブラウザ（localStorage）にだけ保存しています。外部のサーバーには送信していません。
          </p>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
            保存データをすべて削除
          </button>
        </section>

        <p className="center" style={{ marginTop: 16 }}>
          <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'go', screen: 'about' })}>
            計算方法・プライバシー・注意事項
          </button>
        </p>
      </main>
      {confirmDelete && (
        <Dialog title="保存データを削除しますか？" onClose={() => setConfirmDelete(false)}>
          <p>生年月日、回答、相性の結果、スタイルの設定がこの端末から削除されます。元に戻すことはできません。</p>
          <div className="stack">
            <button
              type="button"
              className="btn btn-danger btn-block"
              onClick={() => {
                deleteAll();
                setConfirmDelete(false);
                notify('保存データを削除しました', '✓');
                window.scrollTo({ top: 0 });
              }}
            >
              削除する
            </button>
            <button type="button" className="btn btn-secondary btn-block" onClick={() => setConfirmDelete(false)}>
              やめる
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}

export function About() {
  const { state, dispatch } = useApp();
  const back = () => dispatch({ type: 'go', screen: state.onboarded ? 'settings' : 'welcome' });
  return (
    <>
      <TopBar title="計算方法・プライバシー" onBack={back} />
      <main className={`main ${state.onboarded ? '' : 'no-nav'}`}>
        <section className="card">
          <SectionLabel n={1}>このアプリについて</SectionLabel>
          <p>
            「じぶんめくり」は、四柱推命を入口にして自分のことを考えるための、エンターテインメントのサービスです。
            占いの結果は科学的に証明されたものではなく、未来や他人の気持ちを言い当てるものでもありません。
          </p>
          <p style={{ marginBottom: 0 }}>
            進学・就職・転職・結婚・お金・健康など大切なことは、占いだけで決めず、現実の情報や信頼できる人の意見と合わせて考えてください。
            つらい気持ちが続くときは、身近な人や公的な相談窓口に相談してください。
          </p>
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <SectionLabel n={2}>命式の計算方法</SectionLabel>
          <ul className="small" style={{ paddingLeft: '1.2em' }}>
            <li>入力された生年月日・時刻は日本標準時（JST, UTC+9）として扱います。経度による地方時の補正（真太陽時）は行いません。</li>
            <li>年柱：立春の「節入り時刻」で年が切り替わります。</li>
            <li>月柱：十二節（立春・啓蟄・清明・立夏・芒種・小暑・立秋・白露・寒露・立冬・大雪・小寒）の節入り時刻で月が切り替わります。月干は年干から求めます（五虎遁）。</li>
            <li>日柱：グレゴリオ暦の日付から六十干支を求めます。日の切り替わりは 0:00 です。</li>
            <li>時柱：2時間ごとの十二時辰。23:00〜23:59 は「子の刻」とし、時干は翌日の日干から求めます（日柱は当日のまま）。流派によっては 23:00 で日を切り替える場合があり、その場合とは結果が異なります。</li>
            <li>出生時刻が不明な場合、時柱は出しません。節入り日に生まれて時刻が不明な場合は、正午生まれとして計算し、その旨を表示します。</li>
            <li>
              節入り時刻は、オープンソースの暦ライブラリ lunar-javascript（MIT ライセンス）の天文計算から
              {MIN_SUPPORTED_YEAR}〜{MAX_SUPPORTED_YEAR}年分を生成した表を使っています。計算結果は自動テストで同ライブラリと照合しています。
            </li>
            <li>性別はこのアプリの計算（四柱・五行・通変星・相性・年運）では使いません。性別を使う「大運」（10年ごとの運勢）は未実装です。</li>
            <li>1948〜1951年の日本のサマータイム期間に生まれた方は、当時の時計の時刻から1時間引いた時刻を入力すると、日本標準時での計算になります。</li>
          </ul>
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <SectionLabel n={3}>解釈について</SectionLabel>
          <ul className="small" style={{ paddingLeft: '1.2em', marginBottom: 0 }}>
            <li>五行の数は、四柱の天干と地支（本気の五行）を1つずつ数えた簡易的な集計です。</li>
            <li>通変星は、日干から見た他の天干と、各地支の本気の蔵干から求めています。</li>
            <li>相性は、二人の日柱（日干の干合・五行の関係と、日支の支合・冲・三合）だけで判断しています。</li>
            <li>年運は、その年の天干が日干に対してどの通変星にあたるか、と年支と日支の関係から読んでいます。</li>
            <li>性格などの「仮説」は、これらの計算結果に対してこのアプリが独自に用意した解釈文で、回答によって具体化・修正されます。</li>
          </ul>
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <SectionLabel n={4}>プライバシー</SectionLabel>
          <ul className="small" style={{ paddingLeft: '1.2em', marginBottom: 0 }}>
            <li>入力した生年月日・時刻、回答、選んだテーマ、スタイルの設定は、お使いのブラウザの localStorage にだけ保存されます。</li>
            <li>このアプリは、入力内容を外部のサーバーや AI サービスに送信しません。アクセス解析や広告のタグも入れていません。フォントもアプリに同梱しています。</li>
            <li>相性診断でお相手の生年月日を入力した場合、生年月日そのものは保存せず、計算した「日柱」だけを保存します。</li>
            <li>シェア機能で共有されるのは、結果カードの見出しとキーワードだけです。生年月日や回答は含まれません。</li>
            <li>設定の「保存データをすべて削除」から、いつでも削除できます。共有の端末で使う場合は、使い終わったら削除してください。</li>
          </ul>
        </section>
      </main>
    </>
  );
}
