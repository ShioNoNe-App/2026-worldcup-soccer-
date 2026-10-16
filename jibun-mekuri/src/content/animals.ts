// どうぶつタイプ（このアプリ独自）。日柱の地支で動物（12種）、日干の五行で性質（5種）を決める。
// 既存の「動物占い®」の名称・キャラクター・対応表は使っていない。
import type { L } from '../engine/diagnosis/types';

export interface AnimalContent {
  emoji: string;
  name: L;
  catch: L;
  strengths: [L, L];
  love: L;
  work: L;
  tip: L;
}

/** 地支（子=0 … 亥=11）ごとの動物 */
export const ANIMALS: AnimalContent[] = [
  {
    emoji: '🦔',
    name: { ja: 'ハリネズミ', en: 'Hedgehog' },
    catch: { ja: '用心深いけれど、心を許した相手にはとことん甘えん坊。', en: 'Cautious at first, but a total softie with people you trust.' },
    strengths: [
      { ja: '危険を察知する鋭いアンテナ', en: 'A sharp antenna for trouble' },
      { ja: '一度つながった相手を大切にする誠実さ', en: 'Loyalty to people you’ve bonded with' },
    ],
    love: { ja: '最初はトゲを立てがち。安心できた瞬間から、ぐっと距離が縮まります。', en: 'Spines up at first — once you feel safe, you close the distance fast.' },
    work: { ja: 'リスク管理や品質チェックで頼られやすいタイプ。', en: 'Often relied on for risk management and quality checks.' },
    tip: { ja: '「警戒してるだけ」と一言伝えると、誤解されにくくなります。', en: 'Saying "I’m just cautious" helps avoid misunderstandings.' },
  },
  {
    emoji: '🦫',
    name: { ja: 'カピバラ', en: 'Capybara' },
    catch: { ja: 'どんな場所でもマイペース。いるだけでまわりがほっとする存在。', en: 'Unhurried anywhere — people relax just by being near you.' },
    strengths: [
      { ja: '動じない落ち着き', en: 'Unshakable calm' },
      { ja: 'だれとでも打ちとける包容力', en: 'Warmth that welcomes anyone' },
    ],
    love: { ja: 'のんびり育つ、長続きする恋。一緒にくつろげる相手と相性よし。', en: 'Love that grows slowly and lasts — great with someone you can relax with.' },
    work: { ja: 'チームの空気を和らげる、縁の下の安定役。', en: 'The steady presence who softens the team’s mood.' },
    tip: { ja: '急かされても大丈夫。自分のペースを守る宣言をしておこう。', en: 'It’s okay to be rushed — just declare your own pace.' },
  },
  {
    emoji: '🦅',
    name: { ja: 'ハヤブサ', en: 'Falcon' },
    catch: { ja: '狙いを定めたら一直線。スピードと集中力が武器。', en: 'Once you lock on, you go straight for it — speed and focus are your weapons.' },
    strengths: [
      { ja: 'チャンスを逃さない瞬発力', en: 'Reflexes that never miss a chance' },
      { ja: '目標への集中力', en: 'Laser focus on goals' },
    ],
    love: { ja: '好きになったら行動が早い。駆け引きより直球勝負。', en: 'Quick to act when you fall — direct over playing games.' },
    work: { ja: '新規開拓や、短期決戦のプロジェクトで光ります。', en: 'You shine in new ventures and short, decisive projects.' },
    tip: { ja: '急降下の前に、着地点を一度だけ確認しよう。', en: 'Before you dive, check your landing spot once.' },
  },
  {
    emoji: '🐼',
    name: { ja: 'レッサーパンダ', en: 'Red panda' },
    catch: { ja: '愛され上手で、実はこだわり屋。好きなものへの愛が深い。', en: 'Easy to love, and secretly particular — deep devotion to what you like.' },
    strengths: [
      { ja: '人に好かれる親しみやすさ', en: 'Approachability that people adore' },
      { ja: '自分の「好き」を貫くセンス', en: 'Taste to stick with what you love' },
    ],
    love: { ja: '甘え上手でかわいがられやすい。自分の世界も大切にしたいタイプ。', en: 'Good at being affectionate — but you also guard your own world.' },
    work: { ja: '人と人をつなぐ役や、センスを生かす仕事に向いています。', en: 'Suited to connecting people and work that uses your taste.' },
    tip: { ja: 'こだわりは、理由と一緒に話すと共感されやすくなります。', en: 'Share your preferences with the reason — people relate more.' },
  },
  {
    emoji: '🐋',
    name: { ja: 'クジラ', en: 'Whale' },
    catch: { ja: 'スケールが大きく、ゆったり深く考える人。大きな夢を抱えて泳ぐタイプ。', en: 'Big-scale and deep-thinking — you swim carrying big dreams.' },
    strengths: [
      { ja: '大局を見る視野の広さ', en: 'A wide view of the big picture' },
      { ja: '大きなものを受けとめる懐の深さ', en: 'Depth to hold big things' },
    ],
    love: { ja: '包みこむような愛し方。相手の夢も応援できる人です。', en: 'An embracing kind of love — you cheer on your partner’s dreams too.' },
    work: { ja: '長期ビジョンやリーダー役で力を発揮します。', en: 'You thrive with long-term visions and leadership roles.' },
    tip: { ja: '大きな夢は、今週できる小さな一歩に分けてみよう。', en: 'Break big dreams into one small step for this week.' },
  },
  {
    emoji: '🦉',
    name: { ja: 'フクロウ', en: 'Owl' },
    catch: { ja: '静かに全体を見渡す観察者。物知りで、いざというとき頼れる知恵袋。', en: 'A quiet observer of everything — the wise one people turn to.' },
    strengths: [
      { ja: '本質を見抜く観察眼', en: 'Eyes that see the essence' },
      { ja: '冷静な分析力', en: 'Calm analysis' },
    ],
    love: { ja: 'よく観察してから心を開くタイプ。知的な会話が恋の入口。', en: 'You open up after observing — smart conversation is your way in.' },
    work: { ja: '調査・分析・企画など、考える仕事で頼られます。', en: 'Trusted in thinking work — research, analysis, planning.' },
    tip: { ja: '気づいたことは、早めに一言シェアすると喜ばれます。', en: 'Share what you notice early — people will thank you.' },
  },
  {
    emoji: '🐬',
    name: { ja: 'イルカ', en: 'Dolphin' },
    catch: { ja: '明るく社交的で、仲間と泳ぐのが大好き。場を楽しくする天才。', en: 'Bright and social, you love swimming with friends — a genius at fun.' },
    strengths: [
      { ja: 'だれとでも仲良くなれるコミュ力', en: 'Getting along with anyone' },
      { ja: '場を盛り上げる明るさ', en: 'Brightness that lifts the room' },
    ],
    love: { ja: '一緒に笑える関係が一番。楽しい時間をたくさん共有したいタイプ。', en: 'Laughing together matters most — you want lots of fun time shared.' },
    work: { ja: '営業、広報、チームの盛り上げ役で輝きます。', en: 'You shine in sales, PR and energizing the team.' },
    tip: { ja: 'にぎやかな日のあとは、ひとりで休む時間も予約しておこう。', en: 'After busy social days, book some alone time to rest.' },
  },
  {
    emoji: '🦙',
    name: { ja: 'アルパカ', en: 'Alpaca' },
    catch: { ja: 'やさしくて平和主義。でも、譲れないところははっきりしている。', en: 'Gentle and peace-loving — but clear about what you won’t give up.' },
    strengths: [
      { ja: 'まわりを和ませるやさしさ', en: 'Kindness that soothes others' },
      { ja: '自分の軸を持つ芯の強さ', en: 'A firm core of your own' },
    ],
    love: { ja: '穏やかで思いやりのある恋。安心感をくれる相手と好相性。', en: 'Calm, caring love — great with someone who gives you security.' },
    work: { ja: 'サポートや調整役で、チームを支えます。', en: 'You support the team in coordination and support roles.' },
    tip: { ja: 'がまんしすぎる前に、「ここは譲れない」を言葉にしよう。', en: 'Before holding back too long, say what you won’t give up.' },
  },
  {
    emoji: '🦦',
    name: { ja: 'カワウソ', en: 'Otter' },
    catch: { ja: '好奇心いっぱいの遊び上手。器用に新しいことを覚えていく。', en: 'Curious and playful — you pick up new things skillfully.' },
    strengths: [
      { ja: '何でも楽しめる好奇心', en: 'Curiosity that enjoys everything' },
      { ja: '手先と頭の器用さ', en: 'Skill with hands and mind' },
    ],
    love: { ja: '一緒に遊べる相手にときめくタイプ。新しい体験がふたりの燃料。', en: 'You fall for someone you can play with — new experiences fuel you both.' },
    work: { ja: 'アイデア出しや、マルチタスクの現場で活躍します。', en: 'You excel at brainstorming and multitasking.' },
    tip: { ja: '楽しいことが増えたら、ひとつだけ「続けること」を決めよう。', en: 'When fun things pile up, choose one to keep doing.' },
  },
  {
    emoji: '🐦',
    name: { ja: 'ハチドリ', en: 'Hummingbird' },
    catch: { ja: '美しいものに敏感で、軽やかに動ける人。こだわりとスピードの両立型。', en: 'Sensitive to beauty and light on your feet — care and speed together.' },
    strengths: [
      { ja: '細部まで美しく仕上げるセンス', en: 'Taste for beautiful details' },
      { ja: '素早い切り替え', en: 'Quick switching' },
    ],
    love: { ja: 'ロマンチックで、言葉や演出にときめくタイプ。', en: 'Romantic — moved by words and thoughtful gestures.' },
    work: { ja: 'デザイン、編集、仕上げ役で光ります。', en: 'You shine in design, editing and finishing work.' },
    tip: { ja: 'こまめな休憩が、あなたの集中力を長持ちさせます。', en: 'Frequent short breaks keep your focus going longer.' },
  },
  {
    emoji: '🐧',
    name: { ja: 'ペンギン', en: 'Penguin' },
    catch: { ja: '仲間思いで誠実。みんなで力を合わせるのが得意。', en: 'Loyal and sincere — great at working together as a group.' },
    strengths: [
      { ja: '約束を守る誠実さ', en: 'Sincerity in keeping promises' },
      { ja: 'チームで踏んばる協調性', en: 'Teamwork that holds firm' },
    ],
    love: { ja: '一途で、長く寄り添う恋をするタイプ。', en: 'Devoted — you love by staying close for the long run.' },
    work: { ja: 'チームプレーや、継続が必要な仕事で信頼されます。', en: 'Trusted in teamwork and work that needs persistence.' },
    tip: { ja: 'みんなのためにがんばったら、自分へのごほうびも忘れずに。', en: 'After working hard for everyone, reward yourself too.' },
  },
  {
    emoji: '🦊',
    name: { ja: 'キツネ', en: 'Fox' },
    catch: { ja: '機転がきく戦略家。状況を読んで、いちばんいい道を選べる人。', en: 'A quick-witted strategist who reads the situation and picks the best path.' },
    strengths: [
      { ja: 'とっさの判断力', en: 'Split-second judgment' },
      { ja: '状況を読む頭の回転', en: 'A quick mind that reads the room' },
    ],
    love: { ja: '駆け引きも上手。でも本命には意外とまっすぐです。', en: 'Good at playing it cool — but surprisingly direct with the one you love.' },
    work: { ja: '交渉、企画、トラブル対応で頼られます。', en: 'Relied on for negotiation, planning and troubleshooting.' },
    tip: { ja: 'たまには作戦なしで、素直な気持ちを見せてみよう。', en: 'Now and then, drop the strategy and show your honest feelings.' },
  },
];

/** 日干の五行（木=0 … 水=4）ごとの性質 */
export const ANIMAL_FLAVORS: { name: L; text: L }[] = [
  { name: { ja: 'のびのび', en: 'Sprouting' }, text: { ja: '伸びやかに成長していく前向きさが加わります。', en: 'Adds an upbeat, ever-growing energy.' } },
  { name: { ja: 'ぽかぽか', en: 'Sunny' }, text: { ja: 'まわりを温める明るさと情熱が加わります。', en: 'Adds warmth and passion that brighten others.' } },
  { name: { ja: 'どっしり', en: 'Steady' }, text: { ja: 'ぶれない安定感と包容力が加わります。', en: 'Adds steady calm and big-heartedness.' } },
  { name: { ja: 'きらり', en: 'Sparkling' }, text: { ja: '決断力と、きらりと光るこだわりが加わります。', en: 'Adds decisiveness and a sparkle of pride.' } },
  { name: { ja: 'しっとり', en: 'Dewy' }, text: { ja: '深い感受性と、しなやかな知恵が加わります。', en: 'Adds deep sensitivity and flexible wisdom.' } },
];
