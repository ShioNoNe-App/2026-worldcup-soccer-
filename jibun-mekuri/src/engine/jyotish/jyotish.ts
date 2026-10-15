// インド占星術（ジョーティシュ）の基本計算。
//
// 採用している計算方式:
// - 月・太陽の位置は astronomy-engine（MIT）で求めた地心黄経（その日の春分点基準）。
// - サイデリアル（恒星基準）への変換は、ラヒリ（チトラパクシャ）のアヤナムシャを
//   J2000 の値 23.85306° と歳差 50.29″/年 の線形近似で求める（誤差は 0.01° 程度）。
// - 月星座（ラーシ）= 月のサイデリアル黄経 ÷ 30°、ナクシャトラ = ÷ 13°20′、パダ = ÷ 3°20′。
// - 入力は日本標準時。出生時刻が不明な場合は正午で計算し、その日の 0:00〜23:59 で
//   月星座・ナクシャトラが変わる場合は ambiguous として返す。
// - アセンダント（ラグナ）は出生地が必要なため計算しない。
import { EclipticGeoMoon, SunPosition } from 'astronomy-engine';
import { parseDate, parseTime, type BirthInput } from '../bazi/calendar';

export const AYANAMSA_J2000 = 23.85306;
const PRECESSION_DEG_PER_YEAR = 50.29 / 3600;
const J2000_MS = Date.UTC(2000, 0, 1, 12);
const NAK_SPAN = 360 / 27;

export function lahiriAyanamsa(date: Date): number {
  const years = (date.getTime() - J2000_MS) / (365.25 * 86400_000);
  return AYANAMSA_J2000 + PRECESSION_DEG_PER_YEAR * years;
}

const norm = (deg: number) => ((deg % 360) + 360) % 360;

export function siderealMoon(date: Date): number {
  return norm(EclipticGeoMoon(date).lon - lahiriAyanamsa(date));
}

export function siderealSun(date: Date): number {
  return norm(SunPosition(date).elon - lahiriAyanamsa(date));
}

export interface JyotishChart {
  moonLongitude: number;
  sunLongitude: number;
  /** 0 = Mesha（牡羊）… 11 = Meena（魚） */
  moonSign: number;
  sunSign: number;
  /** 0 = Ashwini … 26 = Revati */
  nakshatra: number;
  /** 1〜4 */
  pada: number;
  ambiguous: ('moonSign' | 'nakshatra')[];
}

function jstDate(y: number, m: number, d: number, h: number, mi: number): Date {
  return new Date(Date.UTC(y, m - 1, d, h - 9, mi));
}

function chartAt(date: Date) {
  const moon = siderealMoon(date);
  const sun = siderealSun(date);
  return {
    moonLongitude: moon,
    sunLongitude: sun,
    moonSign: Math.floor(moon / 30),
    sunSign: Math.floor(sun / 30),
    nakshatra: Math.floor(moon / NAK_SPAN),
    pada: Math.floor((moon % NAK_SPAN) / (NAK_SPAN / 4)) + 1,
  };
}

export function computeJyotish(input: BirthInput): JyotishChart {
  const { y, m, d } = parseDate(input.date);
  if (input.time) {
    const { h, mi } = parseTime(input.time);
    return { ...chartAt(jstDate(y, m, d, h, mi)), ambiguous: [] };
  }
  const noon = chartAt(jstDate(y, m, d, 12, 0));
  const start = chartAt(jstDate(y, m, d, 0, 0));
  const end = chartAt(jstDate(y, m, d, 23, 59));
  const ambiguous: JyotishChart['ambiguous'] = [];
  if (start.moonSign !== end.moonSign) ambiguous.push('moonSign');
  if (start.nakshatra !== end.nakshatra) ambiguous.push('nakshatra');
  return { ...noon, ambiguous };
}
