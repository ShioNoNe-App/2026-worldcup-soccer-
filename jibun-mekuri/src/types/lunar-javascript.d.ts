// テスト専用（計算結果の照合オラクル）。アプリ本体からは import しない。
declare module 'lunar-javascript' {
  interface EightChar {
    setSect(sect: number): void;
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
  }
  interface LunarDate {
    getEightChar(): EightChar;
  }
  interface SolarDate {
    getLunar(): LunarDate;
  }
  export const Solar: {
    fromYmdHms(y: number, m: number, d: number, h: number, mi: number, s: number): SolarDate;
  };
}
