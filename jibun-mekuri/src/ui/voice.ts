// スタイルごとの言葉づかい（同じ情報を、世界観に合わせて言い換える）。
import type { Lang } from '../i18n/lang';
import type { StyleId } from '../state/types';

export interface Voice {
  next: string;
  reactions: string[];
  discovery: (keyword: string) => string;
  topicDone: string;
  greeting: string;
  welcomeBack: string;
  sectionNum: (n: number) => string;
  /** 残りの質問数 */
  remaining: (n: number) => string;
}

const JA: Record<StyleId, Voice> = {
  pop: {
    next: 'めくる',
    reactions: ['ふむふむ、なるほど〜', 'うんうん！', 'メモしたよ ✎', 'そうなんだね〜'],
    discovery: (k) => `発見カード「${k}」がひらいたよ`,
    topicDone: 'ここまでの結果、まとめたよ！',
    greeting: 'きょうは、なにをめくる？',
    welcomeBack: 'おかえり！つづきからめくろう',
    sectionNum: () => '',
    remaining: (n) => (n <= 1 ? 'ラスト1問！' : `あと${n}問で結果だよ`),
  },
  chic: {
    next: '次へ',
    reactions: ['なるほど。', '記録しました。', '興味深いですね。', 'ひとつ、見えてきました。'],
    discovery: (k) => `新しい発見：「${k}」`,
    topicDone: 'ここまでの回答から、整理しました。',
    greeting: '今日は、どのテーマを読み解きますか。',
    welcomeBack: 'おかえりなさい。前回の続きから。',
    sectionNum: (n) => String(n).padStart(2, '0'),
    remaining: (n) => (n <= 1 ? '最後の質問です' : `残り ${n} 問`),
  },
  game: {
    next: 'めくる！',
    reactions: ['いいね！', 'データ獲得！', 'ナイス回答！', 'おっ、そう来たか！'],
    discovery: (k) => `発見カードGET！「${k}」`,
    topicDone: 'クリア！結果カードが完成したよ',
    greeting: '次はどのステージに行く？',
    welcomeBack: 'おかえり！冒険のつづきから',
    sectionNum: (n) => `STAGE ${n}`,
    remaining: (n) => (n <= 1 ? 'ラストミッション！' : `MISSION あと${n}問`),
  },
  fairy: {
    next: '次へ',
    reactions: ['なるほど、ひとつ見えたね。', 'うん、覚えておくね。', 'その答え、きれいだね。', 'ゆっくりで大丈夫。'],
    discovery: (k) => `ひとつ発見：「${k}」`,
    topicDone: '見つけたことを、まとめておいたよ。',
    greeting: '今日は、何を見つけにいく？',
    welcomeBack: 'おかえり。続きから見ていこう。',
    sectionNum: (n) => String(n).padStart(2, '0'),
    remaining: (n) => (n <= 1 ? 'あと1問だよ' : `あと${n}問`),
  },
};

const EN: Record<StyleId, Voice> = {
  pop: {
    next: 'Flip',
    reactions: ['Hmm, I see~', 'Uh-huh!', 'Noted ✎', 'Oh, is that so~'],
    discovery: (k) => `New discovery card: “${k}”`,
    topicDone: 'Here’s your result so far!',
    greeting: 'What shall we flip today?',
    welcomeBack: 'Welcome back! Let’s pick up where you left off',
    sectionNum: () => '',
    remaining: (n) => (n <= 1 ? 'Last question!' : `${n} more to your result`),
  },
  chic: {
    next: 'Next',
    reactions: ['I see.', 'Noted.', 'Interesting.', 'Something is becoming clear.'],
    discovery: (k) => `New discovery: “${k}”`,
    topicDone: 'Here is a summary of your answers.',
    greeting: 'Which theme shall we read today?',
    welcomeBack: 'Welcome back. Continuing from last time.',
    sectionNum: (n) => String(n).padStart(2, '0'),
    remaining: (n) => (n <= 1 ? 'Final question' : `${n} questions left`),
  },
  game: {
    next: 'Flip!',
    reactions: ['Nice!', 'Data collected!', 'Great answer!', 'Ooh, didn’t see that coming!'],
    discovery: (k) => `Discovery card GET! “${k}”`,
    topicDone: 'Stage clear! Your result card is ready',
    greeting: 'Which stage is next?',
    welcomeBack: 'Welcome back! Your adventure continues',
    sectionNum: (n) => `STAGE ${n}`,
    remaining: (n) => (n <= 1 ? 'Final mission!' : `MISSION: ${n} left`),
  },
  fairy: {
    next: 'Next',
    reactions: ['I see — one more thing found.', 'I’ll remember that.', 'What a clear answer.', 'Take your time.'],
    discovery: (k) => `Found: “${k}”`,
    topicDone: 'Here’s what we found together.',
    greeting: 'What shall we discover today?',
    welcomeBack: 'Welcome back. Let’s continue.',
    sectionNum: (n) => String(n).padStart(2, '0'),
    remaining: (n) => (n <= 1 ? 'Just one more' : `${n} to go`),
  },
};

export function voiceOf(style: StyleId, lang: Lang): Voice {
  return (lang === 'en' ? EN : JA)[style];
}
