// キャラクターの個性・親密度・セリフ、隠しキャラ「メクリン」の解放条件。
import type { L } from '../engine/diagnosis/types';
import type { Answers } from '../engine/diagnosis/types';
import type { CharId } from '../state/types';
import type { Mood } from '../ui/Character';

/** 親密度の段階のしきい値（この値以上でその段階） */
export const STAGE_MIN = [0, 6, 20, 40];

export function stageOf(points: number): 0 | 1 | 2 | 3 {
  let s = 0;
  STAGE_MIN.forEach((min, i) => {
    if (points >= min) s = i;
  });
  return s as 0 | 1 | 2 | 3;
}

/** 次の段階までの進み具合（0〜1）。最終段階なら 1 */
export function stageProgress(points: number): number {
  const s = stageOf(points);
  if (s === 3) return 1;
  return (points - STAGE_MIN[s]) / (STAGE_MIN[s + 1] - STAGE_MIN[s]);
}

export interface CharProfile {
  intro: L;
  /** 段階の名前（キャラの個性に合わせる） */
  stages: [L, L, L, L];
  /** 段階ごとのあいさつ */
  greet: [L, L, L, L];
  feed: [L, L];
  pet: [L, L];
  /** 今日はもうお世話した（責めない言い方） */
  enough: L;
  stageUp: L;
  /** 段階ごとの表情 */
  moods: [Mood, Mood, Mood, Mood];
}

export const COMPANIONS: Record<CharId, CharProfile> = {
  pom: {
    intro: { ja: 'ふわふわの雲の精。いつもとなりで「だいじょうぶ」って言ってくれる、安心の相棒。', en: 'A fluffy cloud spirit who always sits beside you saying, "It’s okay."' },
    stages: [
      { ja: 'はじめまして', en: 'Just met' },
      { ja: 'ふわっと顔なじみ', en: 'Getting familiar' },
      { ja: 'なかよし', en: 'Good friends' },
      { ja: 'だいすき', en: 'Best friends' },
    ],
    greet: [
      { ja: 'あ、こんにちは…！ ぽむです。よろしくね。', en: 'Oh, hello…! I’m Pomu. Nice to meet you.' },
      { ja: 'また来てくれたんだ〜！ きょうは何めくる？', en: 'You came back~! What shall we flip today?' },
      { ja: 'えへへ、会えるとうれしいな。ゆっくりいこうね。', en: 'Hehe, I’m happy to see you. Let’s take it easy.' },
      { ja: 'おかえり！ あなたのこと、ちょっとずつわかってきたよ〜♡', en: 'Welcome back! I’m getting to know you bit by bit~♡' },
    ],
    feed: [
      { ja: 'わぁ、ありがとう！ ふわふわ度アップ〜', en: 'Yay, thank you! Extra fluffy now~' },
      { ja: 'もぐもぐ…しあわせの味がする〜', en: 'Munch munch… it tastes like happiness~' },
    ],
    pet: [
      { ja: 'くすぐったい〜！ でもうれしい', en: 'That tickles~! But I like it' },
      { ja: 'ふにゃ〜…ねむくなってきちゃった', en: 'Fwaa~… I’m getting sleepy' },
    ],
    enough: { ja: 'きょうはもう満足だよ。また明日もね〜', en: 'I’m all happy for today. See you tomorrow~' },
    stageUp: { ja: 'ぽむちゃんともっと仲良くなったよ！', en: 'You and Pomu got closer!' },
    moods: ['normal', 'normal', 'happy', 'happy'],
  },
  noir: {
    intro: { ja: '夜の書斎に住む黒猫。口数は少ないけれど、よく見ている。言葉は短く、的確。', en: 'A black cat of the night study. Few words, sharp eyes, precise remarks.' },
    stages: [
      { ja: '距離をとる', en: 'Keeping distance' },
      { ja: '気にかける', en: 'Taking notice' },
      { ja: '信頼', en: 'Trust' },
      { ja: '特別な相手', en: 'Someone special' },
    ],
    greet: [
      { ja: '……ノワ。用があるなら、どうぞ。', en: '…Noir. If you need something, go ahead.' },
      { ja: 'また来たのね。今日は何を読み解く？', en: 'Back again. What shall we read today?' },
      { ja: 'あなたの答え、なかなか興味深いわ。続けましょう。', en: 'Your answers are rather interesting. Let’s continue.' },
      { ja: '待っていたわ。……べつに、ずっとじゃないけれど。', en: 'I was waiting. …Not the whole time, of course.' },
    ],
    feed: [
      { ja: '……悪くないわね。', en: '…Not bad.' },
      { ja: 'ありがとう。覚えておくわ。', en: 'Thank you. I’ll remember this.' },
    ],
    pet: [
      { ja: '……少しだけなら、許してあげる。', en: '…Just a little. I’ll allow it.' },
      { ja: '（ごろごろ…）……今のは聞かなかったことに。', en: '(purr…) …You didn’t hear that.' },
    ],
    enough: { ja: '今日はもう十分。また明日。', en: 'That’s enough for today. Tomorrow, then.' },
    stageUp: { ja: 'ノワとの距離が、少し縮まった。', en: 'The distance between you and Noir has narrowed.' },
    moods: ['think', 'normal', 'normal', 'happy'],
  },
  koro: {
    intro: { ja: '2本のアンテナで「なにか」を受信している謎の相棒。話はよく脱線するけど、たまに核心をつく。', en: 'A mysterious buddy who receives "something" with two antennas. Goes off-topic a lot, but sometimes hits the nail on the head.' },
    stages: [
      { ja: '観察中', en: 'Observing' },
      { ja: '受信中', en: 'Receiving' },
      { ja: '相棒', en: 'Buddy' },
      { ja: '最強コンビ', en: 'Ultimate duo' },
    ],
    greet: [
      { ja: 'ピピッ…未確認の人間を発見コロ。', en: 'Beep… unidentified human detected, koro.' },
      { ja: 'お、また来たコロ！ アンテナがピーンってなったコロ。', en: 'Oh, you’re back, koro! My antennas went boing.' },
      { ja: 'キミの答え、全部メモしてるコロ。たまに食べちゃうけど。', en: 'I note down all your answers, koro. Sometimes I eat the notes.' },
      { ja: '相棒〜！ 今日もいっしょに宇宙の真理をめくるコロ！', en: 'Buddy~! Let’s flip open the truths of the universe again, koro!' },
    ],
    feed: [
      { ja: 'うまっ！ これはアンテナにも効くコロ。', en: 'Yum! This boosts my antennas too, koro.' },
      { ja: 'ごちそうさまコロ。お礼に謎のダンスをどうぞ。', en: 'Thanks for the meal, koro. Here’s a mysterious dance.' },
    ],
    pet: [
      { ja: 'そこはアンテナの付け根…！ 弱いコロ…', en: 'That’s the base of my antenna…! My weak spot, koro…' },
      { ja: 'なでられ記録、更新コロ！', en: 'New petting record, koro!' },
    ],
    enough: { ja: '今日はもう充電満タンコロ。また明日〜', en: 'Fully charged for today, koro. See you tomorrow~' },
    stageUp: { ja: 'コロとの通信レベルが上がった！', en: 'Your connection with Koro leveled up!' },
    moods: ['surprise', 'normal', 'happy', 'happy'],
  },
  mekurin: {
    intro: {
      ja: 'あなたが答えた「ページ」から生まれた、ちいさなモンスター。答えを食べて大きくなる、と本人は言っている。',
      en: 'A tiny monster born from the "pages" of your answers. It claims it grows by eating answers.',
    },
    stages: [
      { ja: 'うまれたて', en: 'Newborn' },
      { ja: 'ぺらぺら期', en: 'Fluttering' },
      { ja: 'ぶあつい仲', en: 'Thick bond' },
      { ja: '一冊の物語', en: 'A whole story' },
    ],
    greet: [
      { ja: 'めく…？ あなたの答えから、うまれたみたい。', en: 'Meku…? I think I was born from your answers.' },
      { ja: 'めくめく！ 今日はどのページを見せてくれる？', en: 'Meku meku! Which page will you show me today?' },
      { ja: 'あなたのページ、すき。ぜんぶ大事にしまってあるよ。', en: 'I love your pages. I keep every one safe.' },
      { ja: 'ぼくたち、もう一冊の本みたいだね。めくってもめくっても、あなたがいる。', en: 'We’re like one whole book now. Every page I flip, there you are.' },
    ],
    feed: [
      { ja: 'ページの味がする…！ めくめく！', en: 'Tastes like pages…! Meku meku!' },
      { ja: 'おなかのしおりがピンってなった！', en: 'My bookmark tail went boing!' },
    ],
    pet: [
      { ja: 'くるっ。うれしいとページがめくれちゃう。', en: 'Flip! My pages turn when I’m happy.' },
      { ja: 'もっと〜。…あ、やっぱり照れる。', en: 'More~. …Oh, actually, that’s embarrassing.' },
    ],
    enough: { ja: '今日のページはここまで。また明日めくろうね。', en: 'That’s today’s page. Let’s flip again tomorrow.' },
    stageUp: { ja: 'メクリンのページが増えた！', en: 'Mekurin gained new pages!' },
    moods: ['surprise', 'normal', 'happy', 'happy'],
  },
};

/**
 * メクリンの解放条件: 状況に関係なく誰でも答えられる「基本の質問」すべてに答えること。
 * 既存の質問から選んでいる（新しい質問は増やさない）。
 */
export const MEKURIN_QUESTIONS = [
  'love_pace',
  'love_express',
  'love_distance',
  'love_value',
  'work_pace',
  'work_structure',
  'work_drive',
  'rel_role',
  'rel_circle',
  'rel_conflict',
  'self_energy',
  'self_decide',
  'self_value',
  'life_mode',
] as const;

export function mekurinProgress(answers: Answers): { done: number; total: number; remaining: string[] } {
  const remaining = MEKURIN_QUESTIONS.filter((q) => !answers[q]);
  return { done: MEKURIN_QUESTIONS.length - remaining.length, total: MEKURIN_QUESTIONS.length, remaining };
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const DAILY_GOAL = 3;
