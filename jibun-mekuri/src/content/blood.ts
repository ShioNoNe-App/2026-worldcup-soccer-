// 血液型（エンタメとしての性格傾向）。他の診断軸のスコアには一切使わない。
import type { L } from '../engine/diagnosis/types';

export type BloodType = 'A' | 'B' | 'O' | 'AB';
export type BloodAnswer = BloodType | 'unknown' | 'skip';
export const BLOOD_TYPES: BloodType[] = ['A', 'B', 'O', 'AB'];

export const BLOOD_DISCLAIMER: L = {
  ja: '血液型による性格分類は、科学的に確立されたものではありません。エンターテインメントとしてお楽しみください。',
  en: 'Personality types by blood group are not scientifically established. Please enjoy this as entertainment.',
};

export const BLOOD: Record<BloodType, { title: L; tendencies: L[]; reflect: L }> = {
  A: {
    title: { ja: 'こまやかな気配りさん…かも？', en: 'A thoughtful planner… maybe?' },
    tendencies: [
      { ja: '段取りを考えてから動くと安心できる傾向があるかも', en: 'You may feel safer when you plan before acting' },
      { ja: 'まわりの空気を読んで、さりげなく気をつかうことが多いかも', en: 'You might often read the room and quietly look after others' },
      { ja: '「ちゃんとしたい」気持ちが強く出ることがあるかも', en: 'A strong wish to "do it properly" may show up' },
    ],
    reflect: { ja: '最近、気をつかいすぎて疲れた場面はあった？', en: 'Have you worn yourself out by being too considerate lately?' },
  },
  B: {
    title: { ja: '好奇心まっすぐさん…かも？', en: 'A curious free spirit… maybe?' },
    tendencies: [
      { ja: '「面白そう」と思ったら、まず飛びこんでみる傾向があるかも', en: 'You may jump in as soon as something looks interesting' },
      { ja: '自分のペースを大切にしたいタイプかも', en: 'You might really value your own pace' },
      { ja: 'ハマったことには、とことん集中するかも', en: 'You may focus deeply on whatever you’re hooked on' },
    ],
    reflect: { ja: '今いちばんハマっていることは何？', en: 'What are you most hooked on right now?' },
  },
  O: {
    title: { ja: 'おおらかな頼れる人…かも？', en: 'An easygoing anchor… maybe?' },
    tendencies: [
      { ja: '細かいことより、全体の流れを大事にする傾向があるかも', en: 'You may care more about the big picture than small details' },
      { ja: '気づけば、まわりに頼られる役になっているかも', en: 'You might find yourself being the one others rely on' },
      { ja: '決めたら、まっすぐ進む力があるかも', en: 'Once decided, you may push straight ahead' },
    ],
    reflect: { ja: '最近、あなたが頼った人・頼られた人は？', en: 'Who did you rely on — or who relied on you — recently?' },
  },
  AB: {
    title: { ja: 'ふたつの顔をもつ人…かも？', en: 'A person with two sides… maybe?' },
    tendencies: [
      { ja: '冷静さと情熱、両方をあわせ持っている傾向があるかも', en: 'You may combine calm and passion' },
      { ja: '人とほどよい距離をとるのが上手かも', en: 'You might be good at keeping a comfortable distance' },
      { ja: '独自の視点で物事を見ることがあるかも', en: 'You may see things from your own unique angle' },
    ],
    reflect: { ja: '「意外だね」と言われた自分の一面はある？', en: 'Is there a side of you people find surprising?' },
  },
};
