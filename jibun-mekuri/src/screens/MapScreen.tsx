import { useState } from 'react';
import { keywordOf } from '../engine/diagnosis/engine';
import type { ThemeId, TraitId, TraitState } from '../engine/diagnosis/types';
import { basisText, dmText, pick, traitText } from '../content/localize';
import { THEMES } from '../content/topics';
import { traitsOfTheme } from '../content/traits';
import { useApp, useT } from '../state/AppContext';
import { Character } from '../ui/Character';
import { Dialog, SectionLabel, TopBar } from '../ui/common';
import { ShareButton } from '../ui/Share';
import { STATUS_INFO } from './Explore';

const STATUS_HELP: Record<TraitState['status'], { ja: string; en: string }> = {
  unexplored: { ja: 'まだ占いの仮説も回答もない部分です。', en: 'There’s no chart hypothesis or answer here yet.' },
  hypothesis: {
    ja: '命式から読んだ「仮説」です。まだあなたの回答では確かめていません。',
    en: 'A "hypothesis" read from your chart. You haven’t checked it with your answers yet.',
  },
  matched: { ja: '命式からの仮説と、あなたの回答が重なった部分です。', en: 'Your chart’s hypothesis and your answers agreed here.' },
  specified: {
    ja: '命式からは強い仮説が出ていなかった、またはあなたの回答が「中間」だった部分で、回答によって具体的になりました。',
    en: 'Your chart had no strong hypothesis here, or your answer was in the middle — your answers made it clearer.',
  },
  different: {
    ja: '命式からの仮説とは違う回答だった部分です。占いの解釈より、あなたの実感を優先しています。',
    en: 'Your answers differed from the chart’s hypothesis. We put your own experience ahead of the reading.',
  },
};

export function MapScreen() {
  const { state, dispatch, chart, diag } = useApp();
  const T = useT();
  const lang = state.lang;
  const [detail, setDetail] = useState<TraitId | null>(null);
  if (!chart || !diag) return null;
  const dm = dmText(chart.dayStem, lang);
  const all = Object.values(diag.traits);
  const specified = all.filter((t) => t.self !== null || t.rejected);

  const openTheme = (theme: ThemeId) => {
    dispatch({ type: 'addTheme', theme });
    dispatch({ type: 'go', screen: 'theme', theme });
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <TopBar title={T('じぶんマップ', 'My map')} />
      <main className="main">
        <div className="map-center anim-rise">
          <Character styleId={state.style} mood="happy" size={92} lang={lang} />
          <h1 style={{ margin: '8px 0 0' }}>{dm.nickname}</h1>
          <p className="small muted">
            {T(`回答で見えてきたこと ${specified.length} 個 ／ ぜんぶで ${all.length} 個`, `Revealed by your answers: ${specified.length} of ${all.length}`)}
          </p>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="legend" aria-label={T('マップの見かた', 'How to read the map')}>
            {(Object.keys(STATUS_INFO) as TraitState['status'][]).map((s) => (
              <span key={s}>
                <span aria-hidden="true">{STATUS_INFO[s].icon}</span> {pick(STATUS_INFO[s].label, lang)}
              </span>
            ))}
          </div>
          <p className="small muted" style={{ margin: '8px 0 0' }}>
            {T(
              '占いの仮説は「そういう傾向が示唆される」という解釈で、事実として決まったものではありません。',
              'Chart hypotheses are readings that "suggest a tendency" — not established facts.',
            )}
          </p>
        </div>

        <div className="stack">
          {THEMES.map((th, i) => {
            const traits = traitsOfTheme(th.id).map((d) => diag.traits[d.id]);
            const touched = traits.some((t) => t.self !== null || t.rejected);
            const selected = state.selectedThemes.includes(th.id);
            const dim = !touched && !selected;
            return (
              <section key={th.id} className={`card map-domain ${dim ? 'is-dim' : ''}`} data-accent={th.id} aria-labelledby={`map-${th.id}`}>
                <SectionLabel n={i + 1}>
                  <span id={`map-${th.id}`}>{pick(th.title, lang)}</span>
                </SectionLabel>
                {dim && (
                  <p className="small muted" style={{ margin: 0 }}>
                    {T('まだめくっていない領域です。', 'You haven’t explored this area yet.')}
                  </p>
                )}
                <div className="nodes">
                  {traits.map((t) => {
                    const label = traitText(t.id, lang).label;
                    const shown = t.status === 'unexplored' ? label : keywordOf(t, lang);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`node st-${t.status}`}
                        onClick={() => setDetail(t.id)}
                        aria-label={`${label}${lang === 'en' ? ': ' : '：'}${shown}（${pick(STATUS_INFO[t.status].label, lang)}）`}
                      >
                        <span className="n-icon" aria-hidden="true">
                          {STATUS_INFO[t.status].icon}
                        </span>
                        <span aria-hidden="true">{shown}</span>
                      </button>
                    );
                  })}
                </div>
                {dim && (
                  <button type="button" className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => openTheme(th.id)}>
                    {T('このテーマをめくる', 'Explore this theme')}
                  </button>
                )}
              </section>
            );
          })}
        </div>

        <div style={{ marginTop: 20 }}>
          <ShareButton title={T('私のじぶんマップ', 'My self map')} headline={dm.nickname} keywords={specified.slice(0, 4).map((t) => keywordOf(t, lang))} />
        </div>
      </main>
      {detail && <TraitDetail trait={diag.traits[detail]} onClose={() => setDetail(null)} />}
    </>
  );
}

function TraitDetail({ trait, onClose }: { trait: TraitState; onClose: () => void }) {
  const { state } = useApp();
  const T = useT();
  const lang = state.lang;
  const def = traitText(trait.id, lang);
  const pole = trait.value >= 0.2 ? def.pos : trait.value <= -0.2 ? def.neg : null;
  return (
    <Dialog title={def.label} onClose={onClose}>
      <p>
        <span className="chip">
          <span aria-hidden="true">{STATUS_INFO[trait.status].icon}</span> {pick(STATUS_INFO[trait.status].label, lang)}
        </span>
      </p>
      {trait.status !== 'unexplored' && (
        <>
          <h3>{keywordOf(trait, lang)}</h3>
          <p>{pole ? pole.summary : def.mid.summary}</p>
        </>
      )}
      <p className="small">{pick(STATUS_HELP[trait.status], lang)}</p>
      <dl className="small">
        <dt>
          <strong>{T('占いの根拠', 'Basis in your chart')}</strong>
        </dt>
        <dd style={{ margin: '0 0 8px' }}>
          {trait.basis.length > 0
            ? trait.basis.map((b) => basisText(b, lang)).join(lang === 'en' ? '; ' : '、')
            : T('この項目について、命式からの強い手がかりはありません。', 'Your chart has no strong clue about this item.')}
          {trait.rejected && T('（あなたが「全然ちがう」と答えたため、この解釈は使っていません）', ' (You answered "Not at all," so this reading isn’t used.)')}
        </dd>
        <dt>
          <strong>{T('あなたの回答', 'Your answers')}</strong>
        </dt>
        <dd style={{ margin: 0 }}>
          {trait.selfCount > 0
            ? T(`${trait.selfCount}つの回答から読み取りました。`, `Read from ${trait.selfCount} answer${trait.selfCount > 1 ? 's' : ''}.`)
            : T('まだ回答していません。', 'Not answered yet.')}
        </dd>
      </dl>
      <button type="button" className="btn btn-block" onClick={onClose}>
        {T('閉じる', 'Close')}
      </button>
    </Dialog>
  );
}
