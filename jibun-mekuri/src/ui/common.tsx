import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useApp } from '../state/AppContext';
import type { Screen } from '../state/types';
import { VOICES } from './voice';

export function TopBar({ title, onBack, right }: { title: ReactNode; onBack?: () => void; right?: ReactNode }) {
  return (
    <header className="topbar">
      {onBack && (
        <button type="button" className="icon-btn" onClick={onBack} aria-label="もどる">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <div className="topbar-title">{title}</div>
      {right}
    </header>
  );
}

export function SectionLabel({ n, children }: { n?: number; children: ReactNode }) {
  const { state } = useApp();
  const num = n !== undefined ? VOICES[state.style].sectionNum(n) : '';
  return (
    <div className="card-label">
      {num && <span className="num">{num}</span>}
      {num && state.style === 'chic' && <span aria-hidden="true">—</span>}
      <span>{children}</span>
    </div>
  );
}

const NAV: { screen: Screen; label: string; icon: ReactNode }[] = [
  {
    screen: 'home',
    label: 'めくる',
    icon: <path d="M5 6h10a3 3 0 0 1 3 3v10H8a3 3 0 0 1-3-3zM8 3h11v13" />,
  },
  {
    screen: 'map',
    label: 'じぶんマップ',
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
    label: '設定',
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
      </>
    ),
  },
];

export function BottomNav() {
  const { state, dispatch } = useApp();
  const current = state.screen === 'theme' || state.screen === 'topic' ? 'home' : state.screen === 'about' ? 'settings' : state.screen;
  return (
    <nav className="bottom-nav" aria-label="メインメニュー">
      <ul>
        {NAV.map((n) => (
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

export function ProgressDots({ total, current, label }: { total: number; current: number; label: string }) {
  return (
    <div className="progress-dots" role="img" aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < current ? 'on' : ''} />
      ))}
    </div>
  );
}
