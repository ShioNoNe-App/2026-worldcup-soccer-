import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useApp, useT } from '../state/AppContext';
import type { Screen } from '../state/types';
import { voiceOf } from './voice';

const WITH_TABS: Screen[] = ['home', 'theme', 'topic', 'themeRun', 'daily', 'mekurin', 'map', 'settings', 'about', 'themes'];

/** 言語切り替え（画面右上に常に表示） */
export function LangToggle() {
  const { state, dispatch } = useApp();
  const toEn = state.lang === 'ja';
  return (
    <button
      type="button"
      className="lang-btn"
      lang={toEn ? 'en' : 'ja'}
      aria-label={toEn ? 'Switch to English' : '日本語に切り替える'}
      onClick={() => dispatch({ type: 'setLang', lang: toEn ? 'en' : 'ja' })}
      data-testid="lang-toggle"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
      </svg>
      {toEn ? 'English' : '日本語'}
    </button>
  );
}

/** 画面上部のヘッダー。オンボーディング後はタブメニューもここに出す（画面下部はホスティングのバッジ等と重ならないよう空けておく） */
export function TopBar({ title, onBack }: { title: ReactNode; onBack?: () => void }) {
  const { state } = useApp();
  const T = useT();
  const showTabs = state.onboarded && WITH_TABS.includes(state.screen);
  return (
    <header className="app-header">
      <div className="topbar">
        {onBack && (
          <button type="button" className="icon-btn" onClick={onBack} aria-label={T('もどる', 'Back')}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="topbar-title">{title}</div>
        <LangToggle />
      </div>
      {showTabs && <TabNav />}
    </header>
  );
}

export function SectionLabel({ n, children }: { n?: number; children: ReactNode }) {
  const { state } = useApp();
  const num = n !== undefined ? voiceOf(state.style, state.lang).sectionNum(n) : '';
  return (
    <div className="card-label">
      {num && <span className="num">{num}</span>}
      {num && state.style === 'chic' && <span aria-hidden="true">—</span>}
      <span>{children}</span>
    </div>
  );
}

function TabNav() {
  const { state, dispatch } = useApp();
  const T = useT();
  const current =
    ['theme', 'topic', 'themeRun', 'themes', 'daily', 'mekurin'].includes(state.screen)
      ? 'home'
      : state.screen === 'about'
        ? 'settings'
        : state.screen;
  const tabs: { screen: Screen; label: string; icon: ReactNode }[] = [
    { screen: 'home', label: T('めくる', 'Explore'), icon: <path d="M5 6h10a3 3 0 0 1 3 3v10H8a3 3 0 0 1-3-3zM8 3h11v13" /> },
    {
      screen: 'map',
      label: T('じぶんマップ', 'My map'),
      icon: (
        <>
          <circle cx="12" cy="12" r="3" />
          <circle cx="5" cy="6" r="2" />
          <circle cx="19" cy="6" r="2" />
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="18" r="2" />
          <path d="M7 7l3 3M17 7l-3 3M8 17l2-3M16 16l-2-2" />
        </>
      ),
    },
    {
      screen: 'settings',
      label: T('設定', 'Settings'),
      icon: (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
        </>
      ),
    },
  ];
  return (
    <nav className="tab-nav" aria-label={T('メインメニュー', 'Main menu')}>
      <ul>
        {tabs.map((n) => (
          <li key={n.screen}>
            <button
              type="button"
              className="nav-btn"
              aria-current={current === n.screen ? 'page' : undefined}
              onClick={() => {
                dispatch({ type: 'go', screen: n.screen });
                window.scrollTo({ top: 0 });
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {n.icon}
              </svg>
              {n.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.icon && (
            <span className="t-icon" aria-hidden="true">
              {t.icon}
            </span>
          )}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

/** 回答したときに、押した場所から粒が飛ぶ演出（装飾のみ） */
export function Burst({ x, y }: { x: number; y: number }) {
  const parts = Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 8 + 0.3;
    const dist = 36 + (i % 3) * 10;
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist };
  });
  return (
    <span className="burst" aria-hidden="true">
      {parts.map((p, i) => (
        <i
          key={i}
          style={{ ['--x' as string]: `${x}px`, ['--y' as string]: `${y}px`, ['--dx' as string]: `${p.dx}px`, ['--dy' as string]: `${p.dy}px` }}
        />
      ))}
    </span>
  );
}

export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [titleId] = useState(() => `dlg-${Math.random().toString(36).slice(2)}`);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    el?.querySelector<HTMLElement>('button, [href], input, select, [tabindex]:not([tabindex="-1"])')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && el) {
        const items = Array.from(el.querySelectorAll<HTMLElement>('button, [href], input, select, [tabindex]:not([tabindex="-1"])')).filter(
          (x) => !x.hasAttribute('disabled'),
        );
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="dialog-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref}>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

/** 「あと◯問」のポップな表示と進み具合のバー */
export function RemainingBadge({ answered, remaining }: { answered: number; remaining: number }) {
  const { state } = useApp();
  const T = useT();
  const voice = voiceOf(state.style, state.lang);
  const total = answered + remaining;
  const pct = total > 0 ? (answered / total) * 100 : 0;
  return (
    <div className="remain" data-testid="remaining">
      <span className={`remain-pop anim-pop ${remaining <= 1 ? 'is-last' : ''}`} key={remaining}>
        {voice.remaining(remaining)}
      </span>
      <span className="remain-step">
        {T(`${answered + 1}問目 / 全${total}問（目安）`, `Q${answered + 1} of ~${total}`)}
      </span>
      <span className="remain-track" aria-hidden="true">
        <span className="remain-fill" style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}
