// じぶんマップのチャート（SVG）。色はスタイルのトークン（--series-me / --series-hyp）に従う。
// 2つの系列は色だけでなく「塗り＋実線」と「破線」でも区別する。
import { useState } from 'react';
import type { AxisScore } from '../engine/diagnosis/profile';
import type { JyotishChart } from '../engine/jyotish/jyotish';
import { NAKSHATRAS, RASHIS, nakshatraName } from '../content/jyotish';
import { pick } from '../content/localize';
import type { Lang } from '../i18n/lang';

const SIZE = 320;
const C = SIZE / 2;
const R = 112;

function point(i: number, n: number, value: number, radius = R): [number, number] {
  const angle = -Math.PI / 2 + (Math.PI * 2 * i) / n;
  const r = (value / 100) * radius;
  return [C + Math.cos(angle) * r, C + Math.sin(angle) * r];
}

const poly = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export function RadarChart({ scores, lang }: { scores: AxisScore[]; lang: Lang }) {
  const [active, setActive] = useState<number | null>(null);
  const n = scores.length;
  const me = scores.map((s, i) => point(i, n, s.current));
  const hyp = scores.map((s, i) => point(i, n, s.hypothesis));
  const T = (ja: string, en: string) => (lang === 'en' ? en : ja);
  const a = active !== null ? scores[active] : null;

  return (
    <figure className="chart radar" aria-label={T('性格8軸のレーダーチャート', 'Radar chart of 8 personality axes')}>
      <div className="chart-legend" aria-hidden="true">
        <span>
          <svg width="22" height="12">
            <rect x="1" y="1" width="20" height="10" rx="3" fill="var(--series-me)" fillOpacity="0.25" stroke="var(--series-me)" strokeWidth="2" />
          </svg>
          {T('いまのあなた（回答を反映）', 'You now (with answers)')}
        </span>
        <span>
          <svg width="22" height="12">
            <line x1="1" y1="6" x2="21" y2="6" stroke="var(--series-hyp)" strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          {T('占いの仮説', 'Chart hypothesis')}
        </span>
      </div>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="radar-svg" role="img" aria-hidden="true">
        {[25, 50, 75, 100].map((ring) => (
          <polygon key={ring} points={poly(scores.map((_, i) => point(i, n, ring)))} fill="none" stroke="var(--chart-grid)" strokeWidth="1" />
        ))}
        {scores.map((_, i) => {
          const [x, y] = point(i, n, 100);
          return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="var(--chart-grid)" strokeWidth="1" />;
        })}
        <polygon points={poly(hyp)} fill="none" stroke="var(--series-hyp)" strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" />
        <polygon
          className="radar-me"
          points={poly(me)}
          fill="var(--series-me)"
          fillOpacity="0.22"
          stroke="var(--series-me)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {me.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={active === i ? 6 : 4} fill="var(--series-me)" stroke="var(--surface)" strokeWidth="2" />
        ))}
        {scores.map((s, i) => {
          const [x, y] = point(i, n, 100, R + 22);
          const anchor = Math.abs(x - C) < 8 ? 'middle' : x > C ? 'start' : 'end';
          return (
            <text
              key={s.axis.id}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className={`radar-label ${active === i ? 'is-active' : ''}`}
            >
              {pick(s.axis.label, lang)}
            </text>
          );
        })}
        {/* 押しやすい当たり判定 */}
        {scores.map((s, i) => {
          const [x, y] = point(i, n, 100, R + 10);
          return (
            <circle
              key={`hit-${s.axis.id}`}
              cx={x}
              cy={y}
              r="26"
              fill="transparent"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(active === i ? null : i)}
            />
          );
        })}
      </svg>
      <div className="chart-tip" aria-live="polite">
        {a ? (
          <>
            <strong>{pick(a.axis.label, lang)}</strong>
            {T(`　いま ${a.current}　／　占いの仮説 ${a.hypothesis}`, `  Now ${a.current} / Hypothesis ${a.hypothesis}`)}
          </>
        ) : (
          <span className="muted">{T('軸の名前をタップすると数値が見られます', 'Tap an axis name to see its values')}</span>
        )}
      </div>
    </figure>
  );
}

/** 軸ごとのメーター（チャートの表データを兼ねる） */
export function AxisMeters({ scores, lang }: { scores: AxisScore[]; lang: Lang }) {
  const T = (ja: string, en: string) => (lang === 'en' ? en : ja);
  return (
    <ul className="meters" aria-label={T('8つの軸の数値', 'Values for the 8 axes')}>
      {scores.map((s) => (
        <li key={s.axis.id} className="meter">
          <div className="meter-head">
            <strong>{pick(s.axis.label, lang)}</strong>
            <span className="meter-val">
              {s.current}
              <span className="muted small">{T(`（仮説 ${s.hypothesis}）`, ` (hyp. ${s.hypothesis})`)}</span>
            </span>
          </div>
          <div className="meter-track" aria-hidden="true">
            <span className="meter-mid" />
            <span className="meter-hyp" style={{ left: `${s.hypothesis}%` }} />
            <span className="meter-me" style={{ left: `${s.current}%` }} />
          </div>
          <div className="meter-poles small muted">
            <span>{pick(s.axis.low, lang)}</span>
            <span>{pick(s.axis.high, lang)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

const SIGN_SHORT_JA = ['羊', '牛', '双', '蟹', '獅', '乙', '秤', '蠍', '射', '山', '瓶', '魚'];
const SIGN_SHORT_EN = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];

/** サイデリアル黄道の円盤。月（塗り）と太陽（輪）の位置を示す */
export function NakshatraWheel({ j, lang }: { j: JyotishChart; lang: Lang }) {
  const T = (ja: string, en: string) => (lang === 'en' ? en : ja);
  const S = 280;
  const c = S / 2;
  const outer = 118;
  const inner = 84;
  // 0°（牡羊座の始まり）を左に置き、反時計回り（ホロスコープの慣習）
  const at = (deg: number, r: number): [number, number] => {
    const a = Math.PI - (deg * Math.PI) / 180;
    return [c + Math.cos(a) * r, c - Math.sin(a) * r];
  };
  const [mx, my] = at(j.moonLongitude, (outer + inner) / 2);
  const [sx, sy] = at(j.sunLongitude, inner - 16);
  const nak = NAKSHATRAS[j.nakshatra];
  const r = RASHIS[j.moonSign];
  const nakStart = j.nakshatra * (360 / 27);
  const arc = (from: number, to: number, rad: number) => {
    const [x1, y1] = at(from, rad);
    const [x2, y2] = at(to, rad);
    return `M ${x1} ${y1} A ${rad} ${rad} 0 0 0 ${x2} ${y2}`;
  };
  return (
    <figure className="chart wheel">
      <svg viewBox={`0 0 ${S} ${S}`} className="wheel-svg" role="img" aria-label={T(`月は${r.name.ja}・${nakshatraName(j.nakshatra, 'ja')}、太陽は${RASHIS[j.sunSign].name.ja}`, `Moon in ${r.name.en}, ${nak.name}; Sun in ${RASHIS[j.sunSign].name.en}`)}>
        <circle cx={c} cy={c} r={outer} fill="var(--surface-2)" stroke="var(--chart-grid)" />
        <circle cx={c} cy={c} r={inner} fill="var(--surface)" stroke="var(--chart-grid)" />
        {/* 月のいるナクシャトラを強調 */}
        <path d={arc(nakStart, nakStart + 360 / 27, (outer + inner) / 2)} stroke="var(--series-me)" strokeOpacity="0.25" strokeWidth={outer - inner} fill="none" />
        {Array.from({ length: 27 }, (_, i) => {
          const [x1, y1] = at(i * (360 / 27), outer);
          const [x2, y2] = at(i * (360 / 27), outer - 8);
          return <line key={`n${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--chart-grid)" strokeWidth="1" />;
        })}
        {Array.from({ length: 12 }, (_, i) => {
          const [x1, y1] = at(i * 30, outer);
          const [x2, y2] = at(i * 30, inner);
          const [lx, ly] = at(i * 30 + 15, outer + 12);
          return (
            <g key={`s${i}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--chart-grid)" strokeWidth="1" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className={`wheel-label ${i === j.moonSign ? 'is-active' : ''}`}>
                {lang === 'en' ? SIGN_SHORT_EN[i] : SIGN_SHORT_JA[i]}
              </text>
            </g>
          );
        })}
        <circle cx={sx} cy={sy} r="7" fill="var(--surface)" stroke="var(--series-hyp)" strokeWidth="2.5" />
        <circle cx={mx} cy={my} r="8" fill="var(--series-me)" stroke="var(--surface)" strokeWidth="2" />
        <text x={c} y={c - 10} textAnchor="middle" className="wheel-center">
          {T(r.name.ja, r.name.en)}
        </text>
        <text x={c} y={c + 12} textAnchor="middle" className="wheel-sub">
          {nakshatraName(j.nakshatra, lang)}
        </text>
      </svg>
      <figcaption className="chart-legend">
        <span>
          <svg width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="5" fill="var(--series-me)" />
          </svg>
          {T('月（心・感情）', 'Moon (mind)')}
        </span>
        <span>
          <svg width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="5" fill="var(--surface)" stroke="var(--series-hyp)" strokeWidth="2" />
          </svg>
          {T('太陽（意志・活力）', 'Sun (will)')}
        </span>
      </figcaption>
    </figure>
  );
}
