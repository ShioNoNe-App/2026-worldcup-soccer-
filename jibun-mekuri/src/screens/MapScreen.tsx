import { useState } from 'react';
import { keywordOf } from '../engine/diagnosis/engine';
import type { ThemeId, TraitId, TraitState } from '../engine/diagnosis/types';
import { DAY_MASTERS } from '../content/dayMasters';
import { THEMES } from '../content/topics';
import { TRAIT_BY_ID, traitsOfTheme } from '../content/traits';
import { useApp } from '../state/AppContext';
import { Character } from '../ui/Character';
import { Dialog, SectionLabel, TopBar } from '../ui/common';
import { ShareButton } from '../ui/Share';
import { STATUS_INFO } from './Explore';

const STATUS_HELP: Record<TraitState['status'], string> = {
  unexplored: 'まだ占いの仮説も回答もない部分です。',
  hypothesis: '命式から読んだ「仮説」です。まだあなたの回答では確かめていません。',
  matched: '命式からの仮説と、あなたの回答が重なった部分です。',
  specified: '命式からは強い仮説が出ていなかった、またはあなたの回答が「中間」だった部分で、回答によって具体的になりました。',
  different: '命式からの仮説とは違う回答だった部分です。占いの解釈より、あなたの実感を優先しています。',
};

export function MapScreen() {
  const { state, dispatch, chart, diag } = useApp();
  const [detail, setDetail] = useState<TraitId | null>(null);
  if (!chart || !diag) return null;
  const dm = DAY_MASTERS[chart.dayStem];
  const all = Object.values(diag.traits);
  const specified = all.filter((t) => t.self !== null || t.rejected);

  const openTheme = (theme: ThemeId) => {
    dispatch({ type: 'addTheme', theme });
    dispatch({ type: 'go', screen: 'theme', theme });
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <TopBar title="じぶんマップ" />
      <main className="main">
        <div className="map-center anim-rise">
          <Character styleId={state.style} mood="happy" size={92} />
          <h1 style={{ margin: '8px 0 0' }}>{dm.nickname}</h1>
          <p className="small muted">
            回答で見えてきたこと {specified.length} 個 ／ ぜんぶで {all.length} 個
          </p>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="legend" aria-label="マップの見かた">
            {(Object.keys(STATUS_INFO) as TraitState['status'][]).map((s) => (
              <span key={s}>
                <span aria-hidden="true">{STATUS_INFO[s].icon}</span> {STATUS_INFO[s].label}
              </span>
            ))}
          </div>
          <p className="small muted" style={{ margin: '8px 0 0' }}>
            占いの仮説は「そういう傾向が示唆される」という解釈で、事実として決まったものではありません。
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
                  <span id={`map-${th.id}`}>{th.title}</span>
                </SectionLabel>
                {dim && <p className="small muted" style={{ margin: 0 }}>まだめくっていない領域です。</p>}
                <div className="nodes">
                  {traits.map((t) => {
                    const isNew = state.seenTraits.includes(t.id) && t.self !== null;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`node st-${t.status} ${isNew ? 'anim-glow' : ''}`}
                        onClick={() => setDetail(t.id)}
                        aria-label={`${TRAIT_BY_ID[t.id].label}：${t.status === 'unexplored' ? '未探索' : keywordOf(t)}（${STATUS_INFO[t.status].label}）`}
                      >
                        <span className="n-icon" aria-hidden="true">
                          {STATUS_INFO[t.status].icon}
                        </span>
                        <span aria-hidden="true">{t.status === 'unexplored' ? TRAIT_BY_ID[t.id].label : keywordOf(t)}</span>
                      </button>
                    );
                  })}
                </div>
                {dim && (
                  <button type="button" className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => openTheme(th.id)}>
                    このテーマをめくる
                  </button>
                )}
              </section>
            );
          })}
        </div>

        <div style={{ marginTop: 20 }}>
          <ShareButton
            title="私のじぶんマップ"
            headline={dm.nickname}
            keywords={specified.slice(0, 4).map(keywordOf)}
          />
        </div>
      </main>
      {detail && <TraitDetail trait={diag.traits[detail]} onClose={() => setDetail(null)} />}
    </>
  );
}

function TraitDetail({ trait, onClose }: { trait: TraitState; onClose: () => void }) {
  const def = TRAIT_BY_ID[trait.id];
  const pole = trait.value >= 0.2 ? def.pos : trait.value <= -0.2 ? def.neg : null;
  return (
    <Dialog title={def.label} onClose={onClose}>
      <p>
        <span className="chip">
          <span aria-hidden="true">{STATUS_INFO[trait.status].icon}</span> {STATUS_INFO[trait.status].label}
        </span>
      </p>
      {trait.status !== 'unexplored' && (
        <>
          <h3>{keywordOf(trait)}</h3>
          <p>{pole ? pole.summary : def.mid.summary}</p>
        </>
      )}
      <p className="small">{STATUS_HELP[trait.status]}</p>
      <dl className="small">
        <dt>
          <strong>占いの根拠</strong>
        </dt>
        <dd style={{ margin: '0 0 8px' }}>
          {trait.basis.length > 0 ? trait.basis.join('、') : 'この項目について、命式からの強い手がかりはありません。'}
          {trait.rejected && '（あなたが「全然ちがう」と答えたため、この解釈は使っていません）'}
        </dd>
        <dt>
          <strong>あなたの回答</strong>
        </dt>
        <dd style={{ margin: 0 }}>
          {trait.selfCount > 0 ? `${trait.selfCount}つの回答から読み取りました。` : 'まだ回答していません。'}
        </dd>
      </dl>
      <button type="button" className="btn btn-block" onClick={onClose}>
        閉じる
      </button>
    </Dialog>
  );
}
