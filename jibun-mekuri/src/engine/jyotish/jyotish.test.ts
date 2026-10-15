import { computeJyotish, lahiriAyanamsa, siderealSun } from './jyotish';

describe('インド占星術の計算', () => {
  it('ラヒリ・アヤナムシャは 2024 年で約 24.19°', () => {
    expect(lahiriAyanamsa(new Date(Date.UTC(2024, 0, 1)))).toBeCloseTo(24.19, 1);
  });

  it('2024年のメーシャ・サンクランティ（4/13 21:15 IST）で太陽がサイデリアル牡羊座に入る', () => {
    // IST = UTC+5:30
    const before = siderealSun(new Date(Date.UTC(2024, 3, 13, 15, 45) - 3 * 3600_000));
    const after = siderealSun(new Date(Date.UTC(2024, 3, 13, 15, 45) + 3 * 3600_000));
    expect(before).toBeGreaterThan(359.8);
    expect(after).toBeLessThan(0.2);
  });

  it('2000-01-01 12:00 JST の月は天秤（トゥラー）・スヴァーティ付近', () => {
    const j = computeJyotish({ date: '2000-01-01', time: '12:00' });
    expect(j.moonSign).toBe(6);
    expect(j.nakshatra).toBe(14);
    expect(j.pada).toBeGreaterThanOrEqual(1);
    expect(j.pada).toBeLessThanOrEqual(4);
  });

  it('時刻不明で、その日に月がナクシャトラを移る場合は未確定と知らせる', () => {
    // 月は約1日で1ナクシャトラ進むため、ほとんどの日で ambiguous になりうる
    let flagged = 0;
    for (let d = 1; d <= 28; d++) {
      const j = computeJyotish({ date: `2001-02-${String(d).padStart(2, '0')}`, time: null });
      if (j.ambiguous.includes('nakshatra')) flagged++;
    }
    expect(flagged).toBeGreaterThan(10);
  });
});
