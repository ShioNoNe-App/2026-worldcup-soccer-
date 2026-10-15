// 節入り（十二節）時刻テーブルを生成するスクリプト。
// 出典: lunar-javascript (MIT, https://github.com/6tail/lunar-javascript) の
// 節気計算（寿星天文暦ベース、北京時間 UTC+8 で出力）を UTC に換算して保存する。
// 実行: npm run gen:sekki
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { Solar } = require('lunar-javascript');

const FIRST_YEAR = 1899;
const LAST_YEAR = 2101;
// 各年の十二節（月の始まり）。月支: 丑, 寅, 卯, 辰, 巳, 午, 未, 申, 酉, 戌, 亥, 子
const JIE = ['小寒', '立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪'];

const rows = [];
for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
  const table = Solar.fromYmd(y, 6, 1).getLunar().getJieQiTable();
  const row = JIE.map((name) => {
    const s = table[name];
    if (s.getYear() !== y) throw new Error(`unexpected year for ${name} ${y}`);
    // 北京時間 (UTC+8) → UTC の Unix 秒
    const utc = Date.UTC(s.getYear(), s.getMonth() - 1, s.getDay(), s.getHour() - 8, s.getMinute(), s.getSecond());
    return Math.round(utc / 1000);
  });
  rows.push(row);
}

const body = rows.map((r) => `  [${r.join(',')}],`).join('\n');
const out = `// 自動生成ファイル。編集しないでください（scripts/generate-sekki-table.mjs）。
// 十二節の節入り時刻（UTC Unix 秒）。行 = 西暦年 ${FIRST_YEAR}〜${LAST_YEAR}、
// 列 = 小寒, 立春, 啓蟄, 清明, 立夏, 芒種, 小暑, 立秋, 白露, 寒露, 立冬, 大雪。
// 元データ: lunar-javascript (MIT) の節気計算。
export const SEKKI_FIRST_YEAR = ${FIRST_YEAR};
export const SEKKI_LAST_YEAR = ${LAST_YEAR};
export const SEKKI_TABLE: readonly (readonly number[])[] = [
${body}
];
`;
writeFileSync(new URL('../src/engine/bazi/sekki-table.ts', import.meta.url), out);
console.log(`wrote ${rows.length} years`);
