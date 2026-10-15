// 命式（四柱）の計算。
//
// 採用している計算方式:
// - 入力は日本標準時（JST, UTC+9）の生年月日・出生時刻。経度による地方時補正は行わない。
// - 年柱: 立春の節入り時刻で年が切り替わる。
// - 月柱: 十二節（立春・啓蟄・清明…）の節入り時刻で月が切り替わる。月干は年干から五虎遁で求める。
// - 日柱: グレゴリオ暦の日付からユリウス通日で六十干支を求める。日の切り替わりは 0:00。
// - 時柱: 2時間ごとの十二時辰。23:00〜23:59 は「子の刻」とし、時干は翌日の日干から五鼠遁で求める
//   （日柱は当日のまま）。
// - 出生時刻が不明な場合は時柱を出さない。節入り日に生まれて時刻が不明な場合は、
//   月柱・年柱が確定できないことを ambiguity で返す（計算には正午を仮定）。
import { SEKKI_FIRST_YEAR, SEKKI_LAST_YEAR, SEKKI_TABLE } from './sekki-table';
import { mod, type Pillar } from './constants';

export const JST_OFFSET_HOURS = 9;
export const MIN_SUPPORTED_YEAR = SEKKI_FIRST_YEAR + 1;
export const MAX_SUPPORTED_YEAR = SEKKI_LAST_YEAR - 1;

export interface BirthInput {
  /** YYYY-MM-DD（日本時間） */
  date: string;
  /** HH:MM（日本時間）。不明な場合は null */
  time: string | null;
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
  /** 時刻不明により確定できない柱 */
  ambiguity: ('year' | 'month')[];
}

export class BirthInputError extends Error {}

interface ParsedDate {
  y: number;
  m: number;
  d: number;
}

export function parseDate(date: string): ParsedDate {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new BirthInputError('生年月日の形式が正しくありません');
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const check = new Date(Date.UTC(y, mo - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) {
    throw new BirthInputError('存在しない日付です');
  }
  if (y < MIN_SUPPORTED_YEAR || y > MAX_SUPPORTED_YEAR) {
    throw new BirthInputError(`${MIN_SUPPORTED_YEAR}年〜${MAX_SUPPORTED_YEAR}年の日付に対応しています`);
  }
  return { y, m: mo, d };
}

export function parseTime(time: string): { h: number; mi: number } {
  const m = /^(\d{2}):(\d{2})$/.exec(time);
  if (!m) throw new BirthInputError('時刻の形式が正しくありません');
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) throw new BirthInputError('時刻の形式が正しくありません');
  return { h, mi };
}

/** グレゴリオ暦の日付のユリウス通日（正午基準の整数） */
export function julianDayNumber(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function jstToUnixSeconds(y: number, m: number, d: number, h: number, mi: number): number {
  return Date.UTC(y, m - 1, d, h - JST_OFFSET_HOURS, mi) / 1000;
}

function sekkiRow(year: number): readonly number[] {
  const row = SEKKI_TABLE[year - SEKKI_FIRST_YEAR];
  if (!row) throw new BirthInputError('対応範囲外の日付です');
  return row;
}

/** 立春基準の年（干支年）を求める */
function sexagenaryYear(calendarYear: number, t: number): number {
  return t >= sekkiRow(calendarYear)[1] ? calendarYear : calendarYear - 1;
}

/** 時刻 t（Unix 秒）が属する節月の月支 */
function monthBranchAt(calendarYear: number, t: number): number {
  // 前年の大雪 → 当年の各節 の順に、t 以前で最も新しい節を探す
  const candidates: { t: number; branch: number }[] = [];
  for (const y of [calendarYear - 1, calendarYear]) {
    sekkiRow(y).forEach((jt, col) => candidates.push({ t: jt, branch: (col + 1) % 12 }));
  }
  let found = candidates[0];
  for (const c of candidates) {
    if (c.t <= t) found = c;
  }
  return found.branch;
}

function yearAndMonthPillars(y: number, m: number, d: number, h: number, mi: number): { year: Pillar; month: Pillar } {
  const t = jstToUnixSeconds(y, m, d, h, mi);
  const sy = sexagenaryYear(y, t);
  const yearIndex = mod(sy - 4, 60);
  const year: Pillar = { stem: yearIndex % 10, branch: yearIndex % 12 };
  const branch = monthBranchAt(y, t);
  // 五虎遁: 寅月の天干 = (年干 % 5) * 2 + 2
  const tigerStem = mod((year.stem % 5) * 2 + 2, 10);
  const stem = mod(tigerStem + mod(branch - 2, 12), 10);
  return { year, month: { stem, branch } };
}

export function dayPillarOf(y: number, m: number, d: number): Pillar {
  const idx = mod(julianDayNumber(y, m, d) + 49, 60);
  return { stem: idx % 10, branch: idx % 12 };
}

export function hourPillarOf(dayStemForHour: number, hour: number): Pillar {
  const branch = Math.floor((hour + 1) / 2) % 12;
  // 五鼠遁: 子の刻の天干 = (日干 % 5) * 2
  const ratStem = mod((dayStemForHour % 5) * 2, 10);
  return { stem: mod(ratStem + branch, 10), branch };
}

export function computeFourPillars(input: BirthInput): FourPillars {
  const { y, m, d } = parseDate(input.date);
  const day = dayPillarOf(y, m, d);

  if (input.time) {
    const { h, mi } = parseTime(input.time);
    const { year, month } = yearAndMonthPillars(y, m, d, h, mi);
    let stemForHour = day.stem;
    if (h === 23) {
      const next = new Date(Date.UTC(y, m - 1, d + 1));
      stemForHour = dayPillarOf(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate()).stem;
    }
    return { year, month, day, hour: hourPillarOf(stemForHour, h), ambiguity: [] };
  }

  const start = yearAndMonthPillars(y, m, d, 0, 0);
  const end = yearAndMonthPillars(y, m, d, 23, 59);
  const noon = yearAndMonthPillars(y, m, d, 12, 0);
  const ambiguity: ('year' | 'month')[] = [];
  if (start.year.stem !== end.year.stem || start.year.branch !== end.year.branch) ambiguity.push('year');
  if (start.month.stem !== end.month.stem || start.month.branch !== end.month.branch) ambiguity.push('month');
  return { year: noon.year, month: noon.month, day, hour: null, ambiguity };
}

/** 指定した年の立春以降の干支年の柱（年運用） */
export function yearPillarForYear(sexagenaryYearNumber: number): Pillar {
  const i = mod(sexagenaryYearNumber - 4, 60);
  return { stem: i % 10, branch: i % 12 };
}
