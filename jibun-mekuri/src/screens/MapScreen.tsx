import { useState } from 'react';
import { keywordOf } from '../engine/diagnosis/engine';
import type { ThemeId, TraitId, TraitState } from '../engine/diagnosis/types';
import { basisText, dmText, elementText, pick, traitText } from '../content/localize';
import { composeProfileReport } from '../engine/diagnosis/profile';
import { AxisMeters, NakshatraWheel, RadarChart } from '../ui/charts';
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
  const { state, dispatch, chart, diag, jyotish } = useApp();
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

  const report = composeProfileReport(diag, lang);
  const elements = chart.elementCounts.map((count, i) => ({ name: elementText(i, lang).name, count }));
  const pct = Math.round((report.answered / report.total) * 100);

  return (
    <>
      <TopBar title={T('じぶんマップ', 'My map')} />
      <main className="main">
        <div className="map-center anim-rise">
          <Character styleId={state.style} mood="happy" size={92} lang={lang} />
          <h1 style={{ margin: '8px 0 0' }}>{dm.nickname}</h1>
        </div>

        <div className="card level" data-testid="understanding">
          <SectionLabel>{T('じぶん理解度', 'Self-understanding')}</SectionLabel>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '1.1rem' }}>
              Lv.{report.level} {report.levelLabel}
            </strong>
            <span className="small muted">
              {T(`回答で見えたこと ${report.answered} / ${report.total}`, `Revealed: ${report.answered} / ${report.total}`)}
            </span>
          </div>
          <span className="level-bar" aria-hidden="true">
            <span className="level-fill" style={{ width: `${pct}%` }} />
          </span>
          {report.nextHint && <span className="small muted">{report.nextHint}</span>}
        </div>

        <section className="card" style={{ marginTop: 16 }} aria-labelledby="radar-title">
          <SectionLabel n={1}>
            <span id="radar-title">{T('性格チャート（8つの軸）', 'Personality chart (8 axes)')}</span>
          </SectionLabel>
          <RadarChart scores={report.scores} lang={lang} />
          <details className="note" style={{ marginTop: 8 }}>
            <summary>{T('数値で見る', 'View as numbers')}</summary>
            <AxisMeters scores={report.scores} lang={lang} />
          </details>
          <p className="small muted" style={{ margin: '8px 0 0' }}>
            {T(
              '破線は四柱推命・インド占星術・16タイプから読んだ「仮説」、塗りはあなたの回答を反映した今の姿です。答えるほど塗りの形が変わります。',
              'The dashed line is the hypothesis from Four Pillars, Indian astrology and 16 types; the filled shape reflects your answers. The more you answer, the more it changes.',
            )}
          </p>
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <SectionLabel n={2}>{T('3つの占術から見たあなた', 'You, through three lenses')}</SectionLabel>
          {report.core.map((c) => (
            <div className="report-item" key={c.tag}>
              <span className="report-tag">{c.tag}</span>
              <h3 style={{ marginBottom: 4 }}>{c.title}</h3>
              <p style={{ margin: 0 }}>{c.body}</p>
            </div>
          ))}
          {!state.profile?.type16 && (
            <p className="small muted" style={{ marginBottom: 0 }}>
              {T('16タイプ（MBTI®など）を設定から入力すると、3つ目の視点が加わります。', 'Add your 16 type (e.g. MBTI®) in Settings to add a third lens.')}
            </p>
          )}
        </section>

        {(report.consensus.length > 0 || report.gaps.length > 0) && (
          <section className="card" style={{ marginTop: 16 }} data-testid="consensus">
            <SectionLabel n={3}>{T('占術が一致したこと・あなたらしいズレ', 'Where the systems agree — and where you differ')}</SectionLabel>
            {report.consensus.length > 0 && (
              <ul className="points">
                {report.consensus.map((c) => (
                  <li className="point" key={c}>
                    <span className="point-icon" aria-hidden="true">
                      ◎
                    </span>
                    <p>{c}</p>
                  </li>
                ))}
              </ul>
            )}
            {report.gaps.length > 0 && (
              <ul className="points" style={{ marginTop: 10 }}>
                {report.gaps.map((g) => (
                  <li className="point" key={g}>
                    <span className="point-icon" aria-hidden="true">
                      ◈
                    </span>
                    <p>{g}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="card" style={{ marginTop: 16 }} data-testid="manual">
          <SectionLabel n={4}>{T('じぶん取扱説明書', 'Your user manual')}</SectionLabel>
          <p className="small muted">
            {T('質問に答えた軸から、ページが開いていきます。', 'Pages unlock for each axis you’ve answered questions about.')}
          </p>
          {report.manual.map((m) => (
            <div className={`report-item manual-item ${m.unlocked ? '' : 'is-locked'}`} key={m.axis.id}>
              <h3 style={{ marginBottom: 4 }}>
                {m.unlocked ? '' : '🔒 '}
                {pick(m.axis.label, lang)}
                {m.unlocked && (
                  <span className="count-chip" style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                    {m.lean}・{m.score}
                  </span>
                )}
              </h3>
              <p style={{ margin: 0 }}>{m.unlocked ? m.text : m.hint}</p>
            </div>
          ))}
        </section>

        <section className="card" style={{ marginTop: 16 }}>
          <SectionLabel n={5}>{T('生まれた日の空', 'The sky on your birthday')}</SectionLabel>
          {jyotish && <NakshatraWheel j={jyotish} lang={lang} />}
          <h3 style={{ marginTop: 12 }}>{T('五行のバランス（四柱推命）', 'Five elements (Four Pillars)')}</h3>
          <div className="bars" role="list">
            {elements.map((e) => (
              <div className="bar" role="listitem" key={e.name} aria-label={`${e.name} ${e.count}`}>
                <span aria-hidden="true">{e.name}</span>
                <span className="bar-track" aria-hidden="true">
                  <span className="bar-fill" style={{ display: 'block', width: `${(e.count / 8) * 100}%` }} />
                </span>
                <span aria-hidden="true">{e.count}</span>
              </div>
            ))}
          </div>
        </section>

        <h2 style={{ marginTop: 28 }}>{T('発見カード', 'Discovery cards')}</h2>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="legend" aria-label={T('マップの見かた', 'How to read the map')}>
            {(Object.keys(STATUS_INFO) as TraitState['status'][]).map((st) => (
              <span key={st}>
                <span aria-hidden="true">{STATUS_INFO[st].icon}</span> {pick(STATUS_INFO[st].label, lang)}
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
