// シェア機能。シェア内容は「タイトル・見出し・キーワード」だけで、
// 生年月日・命式・相手の情報・自由記述は含めない。
import { useRef, useState } from 'react';
import type { ThemeId } from '../engine/diagnosis/types';
import { useApp } from '../state/AppContext';
import type { StyleId } from '../state/types';
import { Character } from './Character';
import { Dialog } from './common';

export interface ShareContent {
  title: string;
  headline: string;
  keywords: string[];
  sub?: string;
  theme?: ThemeId;
}

export function shareText(c: ShareContent): string {
  const kw = c.keywords.length ? `\n${c.keywords.map((k) => `#${k.replace(/\s/g, '')}`).join(' ')}` : '';
  return `【じぶんめくり】${c.title}は…\n${c.headline}${kw}\n#じぶんめくり`;
}

export function ShareButton(props: ShareContent) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn" onClick={() => setOpen(true)}>
        <span aria-hidden="true">↗</span> シェアする
      </button>
      {open && <ShareDialog content={props} onClose={() => setOpen(false)} />}
    </>
  );
}

function ShareDialog({ content, onClose }: { content: ShareContent; onClose: () => void }) {
  const { state } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const text = shareText(content);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const doShare = async () => {
    try {
      await navigator.share({ title: 'じぶんめくり', text });
      setStatus('シェアしました');
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') setStatus('シェアできませんでした。テキストのコピーをお試しください');
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('テキストをコピーしました');
    } catch {
      setStatus('コピーできませんでした。下のテキストを長押しして選択してください');
    }
  };

  const saveImage = async () => {
    const el = cardRef.current;
    if (!el) return;
    try {
      const blob = await renderShareImage(content, state.style, getComputedStyle(el));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jibun-mekuri.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('画像を保存しました');
    } catch {
      setStatus('画像を作成できませんでした');
    }
  };

  return (
    <Dialog title="結果をシェア" onClose={onClose}>
      <div className="share-card" ref={cardRef} data-accent={content.theme} data-testid="share-card">
        <Character styleId={state.style} mood="happy" theme={content.theme ?? null} size={64} />
        <div className="s-title">{content.title}</div>
        <div className="s-head">{content.headline}</div>
        {content.keywords.length > 0 && (
          <div className="row" style={{ justifyContent: state.style === 'chic' ? 'flex-start' : 'center' }}>
            {content.keywords.map((k) => (
              <span className="chip" key={k}>
                #{k}
              </span>
            ))}
          </div>
        )}
        <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
          じぶんめくり
        </p>
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>
        シェアされるのは上のカードの内容だけです。生年月日や回答の内容は含まれません。
      </p>
      <div className="stack" style={{ marginTop: 12 }}>
        {canShare && (
          <button type="button" className="btn btn-block" onClick={doShare}>
            シェアする
          </button>
        )}
        <button type="button" className={`btn btn-block ${canShare ? 'btn-secondary' : ''}`} onClick={copy}>
          テキストをコピー
        </button>
        <button type="button" className="btn btn-secondary btn-block" onClick={saveImage}>
          画像を保存
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>
          閉じる
        </button>
      </div>
      <p role="status" aria-live="polite" className="small" style={{ minHeight: '1.5em', marginTop: 8 }}>
        {status}
      </p>
      <textarea
        readOnly
        value={text}
        aria-label="シェア用テキスト"
        className="input"
        style={{ minHeight: 96, resize: 'vertical' }}
        onFocus={(e) => e.currentTarget.select()}
      />
    </Dialog>
  );
}

/** シェア用の画像を canvas で描く（スタイルの色と形を反映） */
async function renderShareImage(c: ShareContent, style: StyleId, cs: CSSStyleDeclaration): Promise<Blob> {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const bg = v('--bg', '#fff8ee');
  const surface = v('--surface', '#fff');
  const text = v('--text', '#333');
  const accent = v('--accent', '#f497a9');
  const accentInk = v('--accent-ink', '#b23e5e');
  const accentSoft = v('--accent-soft', '#ffe6ec');
  const border = v('--border-color', '#eee');
  const font = v('--font-heading', 'sans-serif');
  const radius = style === 'chic' ? 8 : style === 'game' ? 40 : 64;

  if ('fonts' in document) await document.fonts.ready;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  if (style === 'pop') {
    for (const [x, y, r, col] of [
      [140, 160, 260, 'rgba(203,184,240,0.45)'],
      [960, 260, 240, 'rgba(255,196,206,0.5)'],
      [300, 1000, 280, 'rgba(178,232,214,0.45)'],
    ] as [number, number, number, string][]) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
  } else if (style === 'game') {
    ctx.fillStyle = 'rgba(35,32,58,0.08)';
    for (let x = 0; x < W; x += 36) for (let y = 0; y < H; y += 36) ctx.fillRect(x, y, 4, 4);
  }

  const cardX = 90;
  const cardY = 150;
  const cardW = W - 180;
  const cardH = H - 300;
  if (style === 'game') {
    ctx.fillStyle = border;
    roundRect(ctx, cardX + 14, cardY + 14, cardW, cardH, radius);
    ctx.fill();
  }
  ctx.fillStyle = style === 'chic' ? surface : accentSoft;
  roundRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fill();
  ctx.lineWidth = style === 'game' ? 8 : 3;
  ctx.strokeStyle = style === 'pop' ? accent : border;
  ctx.stroke();

  const align = style === 'chic' ? 'left' : 'center';
  const tx = style === 'chic' ? cardX + 80 : W / 2;
  ctx.textAlign = align;
  ctx.fillStyle = accentInk;
  ctx.font = `700 40px ${font}`;
  ctx.fillText(c.title, tx, cardY + 140);
  if (style === 'chic') {
    ctx.fillRect(cardX + 80, cardY + 170, 120, 3);
  }

  ctx.fillStyle = text;
  ctx.font = `700 64px ${font}`;
  const lines = wrap(ctx, c.headline, cardW - 160);
  lines.slice(0, 4).forEach((line, i) => ctx.fillText(line, tx, cardY + 280 + i * 90));

  ctx.font = `700 36px ${font}`;
  ctx.fillStyle = accentInk;
  const tags = c.keywords.map((k) => `#${k}`).join('  ');
  wrap(ctx, tags, cardW - 160)
    .slice(0, 2)
    .forEach((line, i) => ctx.fillText(line, tx, cardY + cardH - 120 + i * 50));

  ctx.textAlign = 'center';
  ctx.fillStyle = text;
  ctx.font = `700 34px ${font}`;
  ctx.fillText('じぶんめくり', W / 2, H - 70);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/png'));
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, s: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const ch of s) {
    if (ctx.measureText(line + ch).width > max && line) {
      lines.push(line);
      line = ch;
    } else line += ch;
  }
  if (line) lines.push(line);
  return lines;
}
