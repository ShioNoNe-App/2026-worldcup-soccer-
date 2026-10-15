import { Solar } from 'lunar-javascript';
import { computeFourPillars, BirthInputError } from './calendar';
import { pillarLabel } from './constants';
import { SEKKI_TABLE, SEKKI_FIRST_YEAR } from './sekki-table';

function labels(date: string, time: string | null) {
  const p = computeFourPillars({ date, time });
  return [pillarLabel(p.year), pillarLabel(p.month), pillarLabel(p.day), p.hour ? pillarLabel(p.hour) : null];
}

/** lunar-javascript による照合。年柱・月柱は北京時間で節気判定するため JST-1h で、日柱・時柱は現地時刻で求める。 */
function oracle(y: number, m: number, d: number, h: number, mi: number) {
  const jst = new Date(Date.UTC(y, m - 1, d, h, mi));
  const cst = new Date(jst.getTime() - 3600_000);
  const ymEc = Solar.fromYmdHms(cst.getUTCFullYear(), cst.getUTCMonth() + 1, cst.getUTCDate(), cst.getUTCHours(), cst.getUTCMinutes(), 0)
    .getLunar()
    .getEightChar();
  const dhEc = Solar.fromYmdHms(y, m, d, h, mi, 0).getLunar().getEightChar();
  dhEc.setSect(2);
  return [ymEc.getYear(), ymEc.getMonth(), dhEc.getDay(), dhEc.getTime()];
}

const pad = (n: number) => String(n).padStart(2, '0');

describe('四柱の計算（既知の例）', () => {
  it('2000-01-01 12:00 は 己卯年 丙子月 戊午日 戊午時', () => {
    expect(labels('2000-01-01', '12:00')).toEqual(['己卯', '丙子', '戊午', '戊午']);
  });

  it('1984年の立春は北京時間 2/4 23:19 = 日本時間 2/5 0:19。日本時間で判定する', () => {
    expect(labels('1984-02-04', '23:30').slice(0, 2)).toEqual(['癸亥', '乙丑']);
    expect(labels('1984-02-05', '01:00').slice(0, 2)).toEqual(['甲子', '丙寅']);
  });

  it('2024年の立春は JST 17:27 頃。17:00 と 18:00 で年柱が切り替わる', () => {
    expect(labels('2024-02-04', '17:00')[0]).toBe('癸卯');
    expect(labels('2024-02-04', '18:00')[0]).toBe('甲辰');
    expect(labels('2024-02-04', '18:00')[1]).toBe('丙寅');
  });

  it('23時台は日柱は当日のまま、時干は翌日の日干から求める', () => {
    expect(labels('2000-01-01', '23:30')).toEqual(['己卯', '丙子', '戊午', '甲子']);
    expect(labels('2000-01-01', '00:30')[3]).toBe('壬子');
  });

  it('時刻不明なら時柱を出さない', () => {
    expect(labels('1990-06-15', null)[3]).toBeNull();
  });

  it('節入り日に時刻不明だと年柱・月柱が未確定と知らせる', () => {
    const p = computeFourPillars({ date: '2024-02-04', time: null });
    expect(p.ambiguity).toEqual(['year', 'month']);
    const q = computeFourPillars({ date: '2024-03-05', time: null });
    expect(q.ambiguity).toEqual(['month']);
    const r = computeFourPillars({ date: '2024-03-15', time: null });
    expect(r.ambiguity).toEqual([]);
  });

  it('不正な入力はエラー', () => {
    expect(() => computeFourPillars({ date: '2023-02-29', time: null })).toThrow(BirthInputError);
    expect(() => computeFourPillars({ date: '1850-01-01', time: null })).toThrow(BirthInputError);
    expect(() => computeFourPillars({ date: '2000-01-01', time: '25:00' })).toThrow(BirthInputError);
  });
});

describe('lunar-javascript との照合', () => {
  it('無作為な 3000 件の日時で一致する', () => {
    let seed = 12345;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let i = 0; i < 3000; i++) {
      const t = Date.UTC(1901, 0, 1) + rand() * (Date.UTC(2099, 11, 31) - Date.UTC(1901, 0, 1));
      const dt = new Date(t);
      const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate(), h = dt.getUTCHours(), mi = dt.getUTCMinutes();
      expect(labels(`${y}-${pad(m)}-${pad(d)}`, `${pad(h)}:${pad(mi)}`), `${y}-${m}-${d} ${h}:${mi}`).toEqual(oracle(y, m, d, h, mi));
    }
  });

  it('全ての節入りの 2 分前・2 分後で一致する（1901〜2099年）', () => {
    SEKKI_TABLE.forEach((row, ri) => {
      const year = SEKKI_FIRST_YEAR + ri;
      if (year < 1901 || year > 2099) return;
      for (const sec of row) {
        for (const delta of [-120, 120]) {
          const jst = new Date((sec + delta) * 1000 + 9 * 3600_000);
          const y = jst.getUTCFullYear(), m = jst.getUTCMonth() + 1, d = jst.getUTCDate(), h = jst.getUTCHours(), mi = jst.getUTCMinutes();
          const ours = labels(`${y}-${pad(m)}-${pad(d)}`, `${pad(h)}:${pad(mi)}`);
          expect(ours.slice(0, 2), `${y}-${m}-${d} ${h}:${mi}`).toEqual(oracle(y, m, d, h, mi).slice(0, 2));
        }
      }
    });
  });
});
