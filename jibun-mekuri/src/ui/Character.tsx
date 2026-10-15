// オリジナルキャラクター（SVG）。スタイルごとに別のキャラクターを描く。
// - pop: 雲の精「ぽむ」
// - chic: 線画のことり「しおり」
// - game: 星のしっぽの相棒「コロ」
import type { ThemeId } from '../engine/diagnosis/types';
import type { StyleId } from '../state/types';

export type Mood = 'normal' | 'happy' | 'think' | 'surprise';

export const CHARACTER_NAMES: Record<StyleId, { ja: string; en: string }> = {
  pop: { ja: 'ぽむ', en: 'Pomu' },
  chic: { ja: 'しおり', en: 'Shiori' },
  game: { ja: 'コロ', en: 'Koro' },
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
}

export function Character({ styleId, mood = 'normal', theme = null, size = 88, reactKey, className = '', lang = 'ja' }: Props) {
  const anim = reactKey ? (styleId === 'game' ? 'anim-hop' : 'anim-nod') : '';
  return (
    <svg
      key={reactKey}
      className={`character ${anim} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={lang === 'en' ? `${CHARACTER_NAMES[styleId].en} (${moodLabelEn(mood)})` : `${CHARACTER_NAMES[styleId].ja}（${moodLabel(mood)}）`}
    >
      {styleId === 'pop' && <Pom mood={mood} />}
      {styleId === 'chic' && <Shiori mood={mood} />}
      {styleId === 'game' && <Koro mood={mood} />}
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
function Shiori({ mood }: { mood: Mood }) {
  const ink = 'var(--text)';
  const tilt = mood === 'think' ? 'rotate(-8 50 60)' : mood === 'surprise' ? 'translate(0 -3)' : undefined;
  return (
    <g fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="50" cy="52" r="42" stroke="var(--line)" strokeWidth="1.2" />
      <path d="M22 80h56" stroke="var(--line)" />
      <g transform={tilt}>
        <path d="M30 64c0-15 11-26 25-26 9 0 15 6 15 14 0 14-13 24-28 24h-12" fill="var(--surface)" />
        <path d="M70 50l9 2-9 3" fill="var(--accent)" stroke="var(--accent-ink)" />
        {mood === 'surprise' ? (
          <path d="M38 58c6-14 18-18 24-14" />
        ) : (
          <path d="M36 62c8 4 18 2 24-6" />
        )}
        <path d="M30 76l-8 6M34 76l-5 8" />
        <ShioriEye mood={mood} />
        {mood === 'happy' && <path d="M58 56q3 2 6 0" stroke="var(--accent-ink)" strokeWidth="1.5" />}
      </g>
      <path d="M44 80v6M52 80v6" />
    </g>
  );
}

function ShioriEye({ mood }: { mood: Mood }) {
  if (mood === 'happy') return <path d="M58 46q3-3 6 0" />;
  if (mood === 'think') return <path d="M58 47h6" />;
  if (mood === 'surprise') return <circle cx="61" cy="46" r="2.6" />;
  return <circle cx="61" cy="47" r="1.8" fill="var(--text)" stroke="none" />;
}

// ---------- コロ（キャラ・ゲーム） ----------
function Koro({ mood }: { mood: Mood }) {
  const ink = '#23203a';
  return (
    <g stroke={ink} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
      <path d="M80 70c10-2 14-12 10-20" fill="none" />
      <path d="M90 44l3 6 6 1-4 4 1 6-6-3-5 3 1-6-4-4 6-1z" fill="#ffc93c" strokeWidth="2.5" />
      <path d="M22 40L18 14l20 12z" fill="var(--accent)" />
      <path d="M78 40l4-26-20 12z" fill="var(--accent)" />
      <ellipse cx="50" cy="58" rx="34" ry="31" fill="var(--accent)" />
      <ellipse cx="50" cy="68" rx="20" ry="16" fill="#fff" />
      <KoroFace mood={mood} ink={ink} />
      <path d="M30 88h10M60 88h10" />
    </g>
  );
}

function KoroFace({ mood, ink }: { mood: Mood; ink: string }) {
  if (mood === 'happy') {
    return (
      <g fill="none">
        <path d="M33 52q6-8 12 0M55 52q6-8 12 0" />
        <path d="M43 62q7 9 14 0z" fill="#ff8fa3" />
      </g>
    );
  }
  if (mood === 'surprise') {
    return (
      <g>
        <path d="M33 46l9 6-9 6M67 46l-9 6 9 6" fill="none" />
        <ellipse cx="50" cy="66" rx="5" ry="6" fill={ink} />
      </g>
    );
  }
  if (mood === 'think') {
    return (
      <g>
        <ellipse cx="39" cy="51" rx="6" ry="7" fill="#fff" />
        <ellipse cx="61" cy="51" rx="6" ry="7" fill="#fff" />
        <circle cx="41" cy="48" r="3" fill={ink} stroke="none" />
        <circle cx="63" cy="48" r="3" fill={ink} stroke="none" />
        <path d="M45 65h10" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx="39" cy="51" rx="6.5" ry="8" fill="#fff" />
      <ellipse cx="61" cy="51" rx="6.5" ry="8" fill="#fff" />
      <circle cx="40" cy="52" r="3.6" fill={ink} stroke="none" />
      <circle cx="62" cy="52" r="3.6" fill={ink} stroke="none" />
      <circle cx="41.5" cy="50" r="1.3" fill="#fff" stroke="none" />
      <circle cx="63.5" cy="50" r="1.3" fill="#fff" stroke="none" />
      <path d="M44 63q6 6 12 0" fill="none" />
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
