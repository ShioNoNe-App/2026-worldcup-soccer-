import { analyzeBirth, branchRelation, stemRelation, tenGodOf } from './analysis';

describe('通変星', () => {
  it('日干 甲 から見た各天干', () => {
    const names = Array.from({ length: 10 }, (_, s) => tenGodOf(0, s));
    expect(names).toEqual(['hikenn', 'gouzai', 'shokujin', 'shoukan', 'henzai', 'seizai', 'henkan', 'seikan', 'henin', 'inju']);
  });
  it('日干 癸 から見た 戊 は正官、己 は偏官', () => {
    expect(tenGodOf(9, 4)).toBe('seikan');
    expect(tenGodOf(9, 5)).toBe('henkan');
  });
});

describe('命式の集計', () => {
  it('2000-01-01 12:00（己卯 丙子 戊午 戊午）の五行', () => {
    const a = analyzeBirth({ date: '2000-01-01', time: '12:00' });
    // 己土 卯木 丙火 子水 戊土 午火 戊土 午火
    expect(a.elementCounts).toEqual([1, 3, 3, 0, 1]);
    expect(a.missingElements).toEqual([3]);
    expect(a.tenGods).toHaveLength(7);
  });
});

describe('相性の関係', () => {
  it('干合・五行の関係', () => {
    expect(stemRelation(0, 5)).toBe('combine');
    expect(stemRelation(0, 1)).toBe('same');
    expect(stemRelation(0, 2)).toBe('iGenerate');
    expect(stemRelation(2, 0)).toBe('theyGenerate');
    expect(stemRelation(0, 4)).toBe('iControl');
    expect(stemRelation(0, 6)).toBe('theyControl');
  });
  it('地支の関係', () => {
    expect(branchRelation(0, 1)).toBe('sixCombine');
    expect(branchRelation(0, 6)).toBe('clash');
    expect(branchRelation(0, 4)).toBe('trine');
    expect(branchRelation(3, 3)).toBe('same');
    expect(branchRelation(0, 3)).toBe('neutral');
  });
});
