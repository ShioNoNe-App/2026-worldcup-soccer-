// じぶんマップのチャートで使う「8つの軸」。複数の特性を合成して 0〜100 のスコアにする。
import type { L, ThemeId, TraitId } from '../engine/diagnosis/types';

export interface AxisDef {
  id: string;
  label: L;
  /** スコアが低い側／高い側の呼び名 */
  low: L;
  high: L;
  /** 構成する特性と向き（+1: 特性の pos 側が高スコア） */
  parts: [TraitId, 1 | -1][];
  /** この軸を具体化するのに答えるとよいテーマ */
  theme: ThemeId;
  highText: L;
  lowText: L;
  midText: L;
}

export const AXES: AxisDef[] = [
  {
    id: 'social',
    label: { ja: '社交性', en: 'Sociability' },
    low: { ja: 'ひとり時間派', en: 'Solo-charging' },
    high: { ja: 'にぎやか派', en: 'People-charging' },
    parts: [['self_energy', 1], ['rel_circle', 1], ['work_collab', 1]],
    theme: 'self',
    highText: {
      ja: '人と関わるほど元気になるタイプ。予定が少ない週は、意識して誰かに会う予定を入れると調子が上がります。',
      en: 'You get more energized the more you connect with people. On quiet weeks, deliberately plan to see someone.',
    },
    lowText: {
      ja: 'ひとりの時間で充電するタイプ。予定を詰めすぎない「余白」が、あなたのパフォーマンスを守ります。',
      en: 'You recharge alone. Leaving open space in your schedule protects your performance.',
    },
    midText: {
      ja: '人といる時間とひとりの時間、どちらも必要なバランス型。週の中で両方を意識的に配置すると快適です。',
      en: 'You need both people time and alone time. Plan for both across your week.',
    },
  },
  {
    id: 'action',
    label: { ja: '行動力', en: 'Action' },
    low: { ja: 'じっくり派', en: 'Deliberate' },
    high: { ja: '即行動派', en: 'Quick to act' },
    parts: [['work_pace', 1], ['love_pace', 1]],
    theme: 'work',
    highText: {
      ja: '思い立ったらすぐ動けるスピードが武器。大事な場面だけ「ひと呼吸」を入れると、勢いが成果に変わります。',
      en: 'Your speed is your weapon. Add one deep breath before big moments and momentum turns into results.',
    },
    lowText: {
      ja: '見通しを立ててから動く慎重派。準備の質が高いぶん、「6割で一度出す」と決めると一気に進みます。',
      en: 'You move once you see the path. Decide to "share at 60%" and things will speed up.',
    },
    midText: {
      ja: '状況に応じてスピードを切りかえられるタイプ。急ぐ場面と待つ場面の見極めが上手です。',
      en: 'You can switch speeds depending on the situation — good at knowing when to rush and when to wait.',
    },
  },
  {
    id: 'expression',
    label: { ja: '表現力', en: 'Expression' },
    low: { ja: '控えめ', en: 'Reserved' },
    high: { ja: 'ストレート', en: 'Outspoken' },
    parts: [['love_express', 1], ['rel_conflict', 1]],
    theme: 'love',
    highText: {
      ja: '気持ちや意見をまっすぐ言葉にできるタイプ。伝える前に相手の準備を確かめると、より響きます。',
      en: 'You put feelings and opinions straight into words. Checking if the other person is ready makes it land better.',
    },
    lowText: {
      ja: '思いを内に秘めるタイプ。言葉にするのは3割だけでも、関係は大きく変わります。',
      en: 'You keep feelings inside. Putting even 30% into words can change a relationship a lot.',
    },
    midText: {
      ja: '相手や場面に合わせて、伝え方を選べるタイプです。',
      en: 'You choose how to express yourself depending on the person and moment.',
    },
  },
  {
    id: 'adventure',
    label: { ja: '挑戦心', en: 'Adventure' },
    low: { ja: '安定志向', en: 'Stability-seeking' },
    high: { ja: 'チャレンジ志向', en: 'Challenge-seeking' },
    parts: [['work_drive', 1], ['life_mode', 1], ['marriage_view', -1]],
    theme: 'life',
    highText: {
      ja: '新しいこと・変化にワクワクするタイプ。「やめる基準」を先に決めておくと、安心して冒険できます。',
      en: 'New things and change excite you. Decide your "stop rules" in advance and you can adventure safely.',
    },
    lowText: {
      ja: '安定した土台の上で力を発揮するタイプ。小さな新しいことを月に1つ足すくらいがちょうどいい。',
      en: 'You thrive on solid ground. Adding one small new thing a month is just right.',
    },
    midText: {
      ja: '安定と挑戦をバランスよく使い分けられるタイプです。',
      en: 'You balance stability and challenge well.',
    },
  },
  {
    id: 'independence',
    label: { ja: '自由度', en: 'Independence' },
    low: { ja: 'つながり重視', en: 'Togetherness' },
    high: { ja: 'マイペース', en: 'Own pace' },
    parts: [['work_structure', -1], ['love_distance', -1]],
    theme: 'love',
    highText: {
      ja: '自分のペースと裁量を大切にするタイプ。自由をもらう代わりに「共有のタイミング」を決めると信頼が増します。',
      en: 'You value your own pace and freedom. Agreeing on when you’ll check in builds trust in return.',
    },
    lowText: {
      ja: '人や仕組みとのつながりの中で安心できるタイプ。頼れるルールや人がいると、力が伸びます。',
      en: 'You feel secure within connections and structure. Reliable rules and people help you grow.',
    },
    midText: {
      ja: '自由とつながり、どちらも必要なタイプです。',
      en: 'You need both freedom and connection.',
    },
  },
  {
    id: 'heart',
    label: { ja: '感性', en: 'Heart-led' },
    low: { ja: '論理で決める', en: 'Head-led' },
    high: { ja: '気持ちで決める', en: 'Heart-led' },
    parts: [['self_decide', 1]],
    theme: 'self',
    highText: {
      ja: 'ワクワクや共感を頼りに決めるタイプ。決めた理由をひと言メモしておくと、迷ったときの支えになります。',
      en: 'You decide by excitement and empathy. Jot down why you chose — it helps when you waver.',
    },
    lowText: {
      ja: '理由と根拠で決めるタイプ。比べる項目を3つに絞ると、決断がぐっと速くなります。',
      en: 'You decide with reasons and evidence. Limit comparisons to three items and you’ll decide faster.',
    },
    midText: {
      ja: '気持ちと理屈の両方で判断できるバランス型です。',
      en: 'You weigh both feelings and logic.',
    },
  },
  {
    id: 'sensitivity',
    label: { ja: '繊細さ', en: 'Sensitivity' },
    low: { ja: 'おおらか', en: 'Easygoing' },
    high: { ja: '繊細', en: 'Sensitive' },
    parts: [['love_reassure', 1]],
    theme: 'love',
    highText: {
      ja: '小さな変化に気づけるアンテナの持ち主。不安なときは「事実」と「想像」を分けて書き出すと楽になります。',
      en: 'You have an antenna for small changes. When anxious, separate facts from imagination on paper.',
    },
    lowText: {
      ja: '細かいことに振り回されないおおらかさがあります。ときどき気持ちを言葉で伝えると、相手も安心します。',
      en: 'You aren’t thrown by small things. Sometimes putting feelings into words reassures others.',
    },
    midText: {
      ja: '気になることがあっても、自分で落ち着きを取り戻せるタイプです。',
      en: 'Even when something bothers you, you can calm yourself down.',
    },
  },
  {
    id: 'leadership',
    label: { ja: 'リーダー性', en: 'Leadership' },
    low: { ja: '支え役', en: 'Supporter' },
    high: { ja: '引っぱり役', en: 'Leader' },
    parts: [['rel_role', 1], ['love_lead', 1]],
    theme: 'relations',
    highText: {
      ja: '方向を決めて人を引っぱるタイプ。ときどき「おまかせ」してみると、周りも育ちます。',
      en: 'You set the direction and lead. Letting others take over sometimes helps them grow too.',
    },
    lowText: {
      ja: '人を支え、聞き役になれるタイプ。あなた自身の話を聞いてくれる人も大切に。',
      en: 'You support others and listen well. Treasure people who listen to you, too.',
    },
    midText: {
      ja: '場面に応じて、引っぱる側にも支える側にもなれるタイプです。',
      en: 'You can lead or support depending on the situation.',
    },
  },
];
