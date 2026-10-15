// 1問ずつの質問カード。選択肢を選んでも、すぐには確定しない。
// 「次へ」を押したときに確定し、確定前なら何度でも選び直せる。
import { useRef, useState, type ReactNode } from 'react';
import type { OptionDef, QuestionDef } from '../engine/diagnosis/types';
import { useT } from '../state/AppContext';

export interface ConfirmInfo {
  option: OptionDef;
  /** 演出用: カード内での選択肢の中心座標 */
  point: { x: number; y: number } | null;
}

export function QuestionCard({
  question,
  onConfirm,
  onBack,
  header,
  footer,
  confirmLabel,
  initialOptionId,
  children,
}: {
  question: QuestionDef;
  onConfirm: (info: ConfirmInfo) => void;
  onBack?: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  confirmLabel?: string;
  initialOptionId?: string;
  children?: ReactNode;
}) {
  const T = useT();
  const [selected, setSelected] = useState<string | null>(initialOptionId ?? null);
  const cardRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const confirm = () => {
    const option = question.options.find((o) => o.id === selected);
    if (!option) return;
    const btn = optionRefs.current[option.id]?.getBoundingClientRect();
    const host = cardRef.current?.getBoundingClientRect();
    onConfirm({
      option,
      point: btn && host ? { x: btn.left - host.left + btn.width / 2, y: btn.top - host.top + btn.height / 2 } : null,
    });
  };

  return (
    <div className="card anim-rise" ref={cardRef} style={{ position: 'relative' }} data-testid="question-card">
      {header}
      <h2 tabIndex={-1} style={{ marginTop: 4, outline: 'none' }} data-testid="question" id={`q-${question.id}`}>
        {question.text}
      </h2>
      {question.sub && <p className="small muted">{question.sub}</p>}
      <div className="options" role="radiogroup" aria-labelledby={`q-${question.id}`}>
        {question.options.map((o) => {
          const on = selected === o.id;
          return (
            <button
              key={o.id}
              ref={(el) => {
                optionRefs.current[o.id] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              className={`option ${o.kind && o.kind !== 'normal' ? 'is-special' : ''}`}
              onClick={() => setSelected(o.id)}
            >
              <span className="mark" aria-hidden="true">
                {on ? '✓' : ''}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="q-actions" style={onBack ? undefined : { gridTemplateColumns: '1fr' }}>
        {onBack && (
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            <span aria-hidden="true">←</span> {T('ひとつ前へ', 'Back')}
          </button>
        )}
        <button type="button" className="btn" disabled={!selected} onClick={confirm} data-testid="confirm-answer">
          {selected ? (confirmLabel ?? T('次へ', 'Next')) : T('答えを選んでね', 'Choose an answer')}
        </button>
      </div>
      {children}
      {footer}
    </div>
  );
}
