import { MAX_SUPPORTED_YEAR, MIN_SUPPORTED_YEAR } from '../engine/bazi/calendar';

export interface DateParts {
  y: string;
  m: string;
  d: string;
}

export const emptyDate: DateParts = { y: '', m: '', d: '' };

export function partsToIso(p: DateParts): string | null {
  if (!p.y || !p.m || !p.d) return null;
  return `${p.y}-${p.m.padStart(2, '0')}-${p.d.padStart(2, '0')}`;
}

export function isoToParts(iso: string | null | undefined): DateParts {
  if (!iso) return emptyDate;
  const [y, m, d] = iso.split('-');
  return { y, m: String(Number(m)), d: String(Number(d)) };
}

/** 年・月・日の3つのセレクト。スマートフォンでも確実に選べるようにネイティブの select を使う */
export function DateSelect({
  idPrefix,
  label,
  value,
  onChange,
  maxYear = Math.min(MAX_SUPPORTED_YEAR, new Date().getFullYear()),
  lang = 'ja',
}: {
  lang?: 'ja' | 'en';
  idPrefix: string;
  label: string;
  value: DateParts;
  onChange: (v: DateParts) => void;
  maxYear?: number;
}) {
  const years: number[] = [];
  for (let y = maxYear; y >= MIN_SUPPORTED_YEAR; y--) years.push(y);
  const en = lang === 'en';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysInMonth = value.y && value.m ? new Date(Number(value.y), Number(value.m), 0).getDate() : 31;
  return (
    <fieldset className="field" style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend className="field-label">{label}</legend>
      <div className="select-row">
        <label className="sr-only" htmlFor={`${idPrefix}-y`}>
          {en ? 'Year' : '年'}
        </label>
        <select id={`${idPrefix}-y`} className="select" value={value.y} onChange={(e) => onChange({ ...value, y: e.target.value })}>
          <option value="">{en ? 'Year' : '年'}</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {en ? y : `${y}年`}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${idPrefix}-m`}>
          {en ? 'Month' : '月'}
        </label>
        <select id={`${idPrefix}-m`} className="select" value={value.m} onChange={(e) => onChange({ ...value, m: e.target.value })}>
          <option value="">{en ? 'Month' : '月'}</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {en ? MONTHS[i] : `${i + 1}月`}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${idPrefix}-d`}>
          {en ? 'Day' : '日'}
        </label>
        <select id={`${idPrefix}-d`} className="select" value={value.d} onChange={(e) => onChange({ ...value, d: e.target.value })}>
          <option value="">{en ? 'Day' : '日'}</option>
          {Array.from({ length: daysInMonth }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {en ? i + 1 : `${i + 1}日`}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
