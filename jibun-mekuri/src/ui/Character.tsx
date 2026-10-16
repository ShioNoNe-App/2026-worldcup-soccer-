// オリジナルキャラクター（SVG）。スタイルごとに別のキャラクターを描く。
// - pop: 雲の精「ぽむ」
// - chic: 大人っぽい黒猫「ノワ」
// - game: クセのある相棒「コロ」
// - 隠しキャラ: ページのモンスター「メクリン」
import type { ThemeId } from '../engine/diagnosis/types';
import type { CharId, StyleId } from '../state/types';

export type Mood = 'normal' | 'happy' | 'think' | 'surprise';

export const STYLE_CHAR: Record<StyleId, CharId> = { pop: 'pom', chic: 'noir', game: 'koro' };

export const CHAR_NAMES: Record<CharId, { ja: string; en: string }> = {
  pom: { ja: 'ぽむちゃん', en: 'Pomu' },
  noir: { ja: 'ノワ', en: 'Noir' },
  koro: { ja: 'コロ', en: 'Koro' },
  mekurin: { ja: 'メクリン', en: 'Mekurin' },
};

/** 互換: スタイルの標準キャラの名前 */
export const CHARACTER_NAMES: Record<StyleId, { ja: string; en: string }> = {
  pop: CHAR_NAMES.pom,
  chic: CHAR_NAMES.noir,
  game: CHAR_NAMES.koro,
};

interface Props {
  styleId: StyleId;
  mood?: Mood;
  theme?: ThemeId | null;
  size?: number;
  /** 値が変わるたびに、うなずきアニメーションを再生する */
  reactKey?: number | string;
  className?: string;
  lang?: 'ja' | 'en';
  /** 表示するキャラ（省略時はスタイルの標準キャラ） */
  charId?: CharId | null;
}

export function Character({ styleId, mood = 'normal', theme = null, size = 88, reactKey, className = '', lang = 'ja', charId }: Props) {
  const who = charId ?? STYLE_CHAR[styleId];
  const anim = reactKey ? (who === 'koro' || who === 'mekurin' ? 'anim-hop' : 'anim-nod') : '';
  return (
    <svg
      key={reactKey}
      className={`character ${anim} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={lang === 'en' ? `${CHAR_NAMES[who].en} (${moodLabelEn(mood)})` : `${CHAR_NAMES[who].ja}（${moodLabel(mood)}）`}
    >
      {who === 'pom' && <Pom mood={mood} />}
      {who === 'noir' && <Noir mood={mood} />}
      {who === 'koro' && <Koro mood={mood} />}
      {who === 'mekurin' && <Mekurin mood={mood} />}
      {theme && <Accessory theme={theme} styleId={styleId} />}
    </svg>
  );
}

function moodLabelEn(m: Mood) {
  return { normal: 'smiling', happy: 'happy', think: 'thinking', surprise: 'surprised' }[m];
}

function moodLabel(m: Mood) {
  return { normal: 'にこにこ', happy: 'うれしそう', think: '考え中', surprise: 'びっくり' }[m];
}

// ---------- ぽむ（ふんわりポップ） ----------
function Pom({ mood }: { mood: Mood }) {
  const ink = '#4a3f55';
  return (
    <g>
      <ellipse cx="50" cy="90" rx="24" ry="4" fill="rgba(122,89,184,0.15)" />
      <path
        d="M24 64c-9 0-14-8-11-15 2-6 8-8 12-7 1-11 10-19 21-18 6-8 19-8 25 1 9-1 17 7 16 16 7 2 10 9 7 15-3 6-9 8-14 8z"
        fill="#ffffff"
        stroke="#d9c9f2"
        strokeWidth="2.5"
      />
      <path d="M50 22 l3 -7 l3 7 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5z" fill="var(--accent)" transform="translate(-3 -6) scale(0.9)" />
      <ellipse cx="34" cy="55" rx="5" ry="3" fill="#ffc6d3" />
      <ellipse cx="68" cy="55" rx="5" ry="3" fill="#ffc6d3" />
      <PomFace mood={mood} ink={ink} />
      <path d="M30 66c-1 6 2 10 6 10M70 66c1 6-2 10-6 10" stroke="#d9c9f2" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function PomFace({ mood, ink }: { mood: Mood; ink: string }) {
  if (mood === 'happy') {
    return (
      <g stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round">
        <path d="M37 49q4-5 8 0M55 49q4-5 8 0" />
        <path d="M45 56q5 6 10 0" />
      </g>
    );
  }
  if (mood === 'surprise') {
    return (
      <g fill={ink}>
        <circle cx="41" cy="48" r="3.6" />
        <circle cx="59" cy="48" r="3.6" />
        <ellipse cx="50" cy="58" rx="3" ry="3.6" />
      </g>
    );
  }
  if (mood === 'think') {
    return (
      <g>
        <circle cx="41" cy="48" r="3" fill={ink} />
        <path d="M55 48h8" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M46 57h8" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="82" cy="30" r="2.5" fill="#d9c9f2" />
        <circle cx="88" cy="22" r="3.5" fill="#d9c9f2" />
      </g>
    );
  }
  return (
    <g>
      <circle cx="41" cy="48" r="3.2" fill={ink} />
      <circle cx="59" cy="48" r="3.2" fill={ink} />
      <circle cx="42" cy="47" r="1" fill="#fff" />
      <circle cx="60" cy="47" r="1" fill="#fff" />
      <path d="M46 55q4 4 8 0" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  );
}

// ---------- しおり（おしゃれ・自己理解） ----------
function Noir({ mood }: { mood: Mood }) {
  // 座っている黒猫。細い線と落ち着いた色で、大人っぽく
  const fur = '#2b2a33';
  const eye = '#c9b458';
  const tilt = mood === 'think' ? 'rotate(-6 50 70)' : undefined;
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <circle cx="50" cy="52" r="44" fill="none" stroke="var(--line)" strokeWidth="1.2" />
      <path d="M68 84c14 2 20-8 14-16" fill="none" stroke={fur} strokeWidth="5" />
      <path d="M30 88c-2-16 2-30 10-38h20c8 8 12 22 10 38z" fill={fur} />
      <g transform={tilt}>
        <path d="M30 42l-2-20 14 10M70 42l2-20-14 10" fill={fur} />
        <path d="M31 28l2 8M69 28l-2 8" stroke="#6b5a6e" strokeWidth="2" />
        <ellipse cx="50" cy="44" rx="21" ry="18" fill={fur} />
        <NoirEyes mood={mood} eye={eye} />
        <path d="M48 50l2 2 2-2" fill="none" stroke="#c98a9a" strokeWidth="1.6" />
        <path d="M34 50h-10M34 53l-9 3M66 50h10M66 53l9 3" stroke="#8d8798" strokeWidth="1" />
        {mood === 'happy' && <path d="M46 55q4 3 8 0" fill="none" stroke="#c98a9a" strokeWidth="1.4" />}
      </g>
      <path d="M40 88v-6M60 88v-6" stroke="#4a4752" strokeWidth="1.5" />
    </g>
  );
}

function NoirEyes({ mood, eye }: { mood: Mood; eye: string }) {
  if (mood === 'happy')
    return <path d="M38 43q4-4 8 0M54 43q4-4 8 0" fill="none" stroke={eye} strokeWidth="2.2" />;
  if (mood === 'think')
    return (
      <g>
        <path d="M38 43h8M54 43h8" stroke={eye} strokeWidth="2.4" />
      </g>
    );
  const r = mood === 'surprise' ? 4.4 : 3.6;
  return (
    <g>
      <ellipse cx="42" cy="43" rx={r} ry="4" fill={eye} />
      <ellipse cx="58" cy="43" rx={r} ry="4" fill={eye} />
      <ellipse cx="42" cy="43" rx={mood === 'surprise' ? 1.6 : 0.9} ry="3.4" fill="#1b1a20" />
      <ellipse cx="58" cy="43" rx={mood === 'surprise' ? 1.6 : 0.9} ry="3.4" fill="#1b1a20" />
    </g>
  );
}

// ---------- コロ（キャラ・ゲーム）: まんまるの体と2本のアンテナ。片方だけ上がる眉がクセ ----------
function Koro({ mood }: { mood: Mood }) {
  const ink = '#23203a';
  return (
    <g stroke={ink} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
      <path d="M38 30c-4-8-2-16 2-20M62 30c6-6 12-8 18-6" fill="none" />
      <path d="M40 4l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#ffc93c" strokeWidth="2" />
      <circle cx="83" cy="24" r="5" fill="#ff8fa3" strokeWidth="2.5" />
      <path d="M50 26c22 0 36 16 36 34s-15 30-36 30-36-12-36-30 14-34 36-34z" fill="var(--accent)" />
      <path d="M16 62l-8-6M84 62l9-7" fill="none" />
      <ellipse cx="50" cy="70" rx="18" ry="13" fill="#fff" />
      <KoroFace mood={mood} ink={ink} />
      <path d="M34 89v4M66 89v4" />
    </g>
  );
}

function KoroFace({ mood, ink }: { mood: Mood; ink: string }) {
  // 左はまるい目、右は細めた目。いつも何かたくらんでいる顔
  const brow = mood === 'surprise' ? 'M54 38l12-4' : 'M54 40l12-2';
  return (
    <g>
      <path d="M32 42l10 2" fill="none" />
      <path d={brow} fill="none" />
      {mood === 'happy' ? (
        <path d="M34 52q5-6 10 0M56 52q5-6 10 0" fill="none" />
      ) : (
        <>
          <circle cx="39" cy="51" r={mood === 'surprise' ? 7 : 6} fill="#fff" />
          <circle cx="40" cy="52" r="3" fill={ink} stroke="none" />
          {mood === 'think' ? <path d="M55 51h11" fill="none" /> : <path d="M55 52q6-4 11 0" fill="none" />}
        </>
      )}
      {mood === 'surprise' ? (
        <ellipse cx="50" cy="66" rx="4" ry="5" fill={ink} />
      ) : (
        <path d="M42 64l4 3 4-3 4 3 4-3" fill="none" strokeWidth="2.5" />
      )}
    </g>
  );
}

// ---------- メクリン（隠しキャラ）: ページを重ねた体の小さなモンスター ----------
function Mekurin({ mood }: { mood: Mood }) {
  const ink = '#2c2440';
  return (
    <g stroke={ink} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
      <path d="M70 70c12 4 16 14 12 22l-6-4-4 6c-4-8-6-16-2-24z" fill="#e8505b" />
      <path d="M22 84h56l-4-6H26z" fill="#fff6e0" />
      <path d="M24 78h52l-3-5H27z" fill="#ffe3b3" />
      <path d="M26 74c-4-30 6-48 24-48s28 18 24 48z" fill="#6fd3c1" />
      <path d="M50 26c4-10 14-14 22-10-8 0-12 6-14 12z" fill="#fff6e0" />
      <path d="M30 40l-6-12 12 6M70 40l6-12-12 6" fill="#fff6e0" />
      <path d="M40 66h20" fill="none" stroke="#3aa996" strokeWidth="2" />
      <path d="M50 58l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" fill="#ffc93c" strokeWidth="1.6" />
      {mood === 'happy' ? (
        <path d="M36 46q5-6 10 0M54 46q5-6 10 0" fill="none" />
      ) : (
        <>
          <ellipse cx="41" cy="46" rx="6" ry={mood === 'surprise' ? 8 : 7} fill="#fff" />
          <ellipse cx="59" cy="46" rx="6" ry={mood === 'surprise' ? 8 : 7} fill="#fff" />
          <circle cx={mood === 'think' ? 43 : 42} cy={mood === 'think' ? 44 : 47} r="3" fill={ink} stroke="none" />
          <circle cx={mood === 'think' ? 61 : 60} cy={mood === 'think' ? 44 : 47} r="3" fill={ink} stroke="none" />
        </>
      )}
      <path d="M45 54q5 4 10 0" fill="none" />
      <path d="M53 55l1 3 2-3" fill="#fff" strokeWidth="1.6" />
    </g>
  );
}

// ---------- テーマの小物 ----------
function Accessory({ theme, styleId }: { theme: ThemeId; styleId: StyleId }) {
  const stroke = styleId === 'game' ? '#23203a' : styleId === 'chic' ? 'var(--accent-ink)' : 'var(--accent-ink)';
  const fill = styleId === 'chic' ? 'none' : 'var(--accent)';
  const sw = styleId === 'game' ? 2.5 : 1.8;
  const g = { stroke, strokeWidth: sw, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  switch (theme) {
    case 'love':
      return <path {...g} fill={fill} d="M12 22c-4-5 2-11 6-6 4-5 10 1 6 6l-6 6z" />;
    case 'work':
      return (
        <g {...g} fill={fill}>
          <rect x="6" y="16" width="18" height="12" rx="2" />
          <path d="M11 16v-3h8v3" fill="none" />
        </g>
      );
    case 'relations':
      return (
        <g {...g} fill={fill}>
          <circle cx="10" cy="20" r="5" />
          <circle cx="21" cy="20" r="5" />
        </g>
      );
    case 'self':
      return <path {...g} fill={fill} d="M20 10a9 9 0 1 0 6 15 7 7 0 0 1-6-15z" />;
    case 'life':
      return (
        <g {...g} fill={fill}>
          <circle cx="15" cy="19" r="6" />
          <path d="M15 7v3M15 28v3M3 19h3M24 19h3" fill="none" />
        </g>
      );
  }
}

/** テーマのアイコン（テーマカードなどで使う） */
export function ThemeIcon({ theme, className = 'theme-icon' }: { theme: ThemeId; className?: string }) {
  const common = {
    fill: 'none',
    stroke: 'var(--accent-ink)',
    strokeWidth: 2.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="var(--surface)" stroke="var(--border-color)" strokeWidth="1.5" />
      {theme === 'love' && (
        <path {...common} fill="var(--accent)" d="M24 34l-9-9c-4-4-1-11 4.5-10 2 .3 3.5 1.6 4.5 3 1-1.4 2.5-2.7 4.5-3C34 14 37 21 33 25z" />
      )}
      {theme === 'work' && (
        <g {...common}>
          <rect x="12" y="18" width="24" height="16" rx="3" fill="var(--accent)" />
          <path d="M19 18v-4h10v4M12 25h24" />
        </g>
      )}
      {theme === 'relations' && (
        <g {...common}>
          <circle cx="18" cy="20" r="5" fill="var(--accent)" />
          <circle cx="31" cy="20" r="5" fill="var(--accent)" />
          <path d="M10 34c1-5 4-7 8-7s7 2 8 7M23 34c1-5 4-7 8-7s7 2 8 7" />
        </g>
      )}
      {theme === 'self' && (
        <g {...common}>
          <circle cx="24" cy="22" r="9" fill="var(--accent)" />
          <path d="M24 31v6M19 37h10" />
          <path d="M20 21a4 4 0 0 1 4-4" stroke="var(--surface)" />
        </g>
      )}
      {theme === 'life' && (
        <g {...common}>
          <circle cx="24" cy="24" r="10" fill="var(--accent)" />
          <path d="M24 17l3 7-3 7-3-7z" fill="var(--surface)" />
        </g>
      )}
    </svg>
  );
}
