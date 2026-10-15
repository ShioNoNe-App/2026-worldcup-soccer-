// スタイルごとの言葉づかい（同じ情報を、世界観に合わせて言い換える）。
import type { StyleId } from '../state/types';

export interface Voice {
  tagline: string;
  next: string;
  reactions: string[];
  discovery: (keyword: string) => string;
  topicDone: string;
  greeting: string;
  welcomeBack: string;
  sectionNum: (n: number) => string;
}

export const VOICES: Record<StyleId, Voice> = {
  pop: {
    tagline: 'ゆるっと占って、じぶんをめくろう',
    next: 'めくる',
    reactions: ['ふむふむ、なるほど〜', 'うんうん！', 'メモしたよ ✎', 'そうなんだね〜'],
    discovery: (k) => `発見カード「${k}」がひらいたよ`,
    topicDone: 'ここまでの結果、まとめたよ！',
    greeting: 'きょうは、なにをめくる？',
    welcomeBack: 'おかえり！つづきからめくろう',
    sectionNum: () => '',
  },
  chic: {
    tagline: '占いを手がかりに、自分を読み解く',
    next: '次へ',
    reactions: ['なるほど。', '記録しました。', '興味深いですね。', 'ひとつ、見えてきました。'],
    discovery: (k) => `新しい発見：「${k}」`,
    topicDone: 'ここまでの回答から、整理しました。',
    greeting: '今日は、どのテーマを読み解きますか。',
    welcomeBack: 'おかえりなさい。前回の続きから。',
    sectionNum: (n) => String(n).padStart(2, '0'),
  },
  game: {
    tagline: '答えるたびに、じぶんデータが解放される！',
    next: 'めくる！',
    reactions: ['いいね！', 'データ獲得！', 'ナイス回答！', 'おっ、そう来たか！'],
    discovery: (k) => `発見カードGET！「${k}」`,
    topicDone: 'クリア！結果カードが完成したよ',
    greeting: '次はどのステージに行く？',
    welcomeBack: 'おかえり！冒険のつづきから',
    sectionNum: (n) => `STAGE ${n}`,
  },
};
