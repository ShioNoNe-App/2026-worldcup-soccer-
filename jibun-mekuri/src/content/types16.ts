// 16タイプ性格（MBTI® などで本人が知っているタイプ）の自己申告を使った解釈。
// このアプリはタイプを判定しない。公式の診断とは関係のない、独自の解釈文。
import type { L, TraitId } from '../engine/diagnosis/types';

export const TYPE_CODES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
] as const;
export type TypeCode = (typeof TYPE_CODES)[number];

export function isTypeCode(s: unknown): s is TypeCode {
  return typeof s === 'string' && (TYPE_CODES as readonly string[]).includes(s);
}

export interface TypeContent {
  nickname: L;
  summary: L;
  love: L;
  work: L;
  strength: L;
  caution: L;
}

/** 4つの指標ごとの仮説（-1〜1）。文字ごとに足し合わせる */
export const LETTER_PRIORS: Record<string, Partial<Record<TraitId, number>>> = {
  E: { self_energy: 0.45, rel_circle: 0.35, work_collab: 0.25 },
  I: { self_energy: -0.45, rel_circle: -0.35, work_collab: -0.25 },
  N: { life_mode: 0.25, work_structure: -0.15 },
  S: { life_mode: -0.2, work_structure: 0.15 },
  T: { self_decide: -0.45, rel_conflict: 0.2 },
  F: { self_decide: 0.45, love_reassure: 0.15 },
  J: { work_structure: 0.35, work_pace: -0.2, marriage_view: 0.2 },
  P: { work_structure: -0.35, work_pace: 0.2, marriage_view: -0.15 },
};

export const TYPES16: Record<TypeCode, TypeContent> = {
  INTJ: {
    nickname: { ja: '静かな戦略家', en: 'The Quiet Strategist' },
    summary: { ja: '長期の設計図を頭の中に描き、ひとりで着々と実現していくタイプ。', en: 'Draws a long-range blueprint in your head and quietly makes it real.' },
    love: { ja: '恋も「本当に信頼できるか」を見極めてから。少数の深い関係を大切にします。', en: 'In love, you first judge whether someone is truly trustworthy, then value a few deep bonds.' },
    work: { ja: '仕組みづくりや戦略立案で真価を発揮。', en: 'You show your true worth in systems design and strategy.' },
    strength: { ja: '遠くを見通す計画力', en: 'Far-sighted planning' },
    caution: { ja: '説明を省いて「冷たい」と誤解されやすい', en: 'Skipping explanations can make you seem cold' },
  },
  INTP: {
    nickname: { ja: 'なぜなぜ探究者', en: 'The Curious Analyst' },
    summary: { ja: '「なぜ？」を突き詰めるのが好きな、自由な発想の思考家。', en: 'A free-thinking analyst who loves chasing every "why?"' },
    love: { ja: '知的な会話ができる相手に惹かれます。気持ちの言語化は少し苦手かも。', en: 'Drawn to people you can talk ideas with; putting feelings into words may be harder.' },
    work: { ja: '分析・研究・設計など、考える時間が多い仕事に向きます。', en: 'Suited to thinking-heavy work like analysis, research and design.' },
    strength: { ja: '本質を見抜く論理力', en: 'Logic that sees the core' },
    caution: { ja: '考えるほど行動が遅れがち', en: 'The more you think, the later you act' },
  },
  ENTJ: {
    nickname: { ja: '前進する指揮官', en: 'The Driving Commander' },
    summary: { ja: '目標を決めたら人と仕組みを動かして、最短距離で実現するタイプ。', en: 'Once a goal is set, you mobilize people and systems to reach it fast.' },
    love: { ja: '一緒に高め合えるパートナーを求めます。主導権は握りがち。', en: 'You want a partner who helps you both grow — and you tend to take the lead.' },
    work: { ja: 'リーダーや事業づくりで力を発揮。', en: 'You thrive as a leader or business builder.' },
    strength: { ja: '決断力と推進力', en: 'Decisiveness and drive' },
    caution: { ja: 'スピードを求めて人の気持ちを置き去りにしやすい', en: 'Chasing speed can leave others’ feelings behind' },
  },
  ENTP: {
    nickname: { ja: 'アイデア発明家', en: 'The Idea Inventor' },
    summary: { ja: '議論とひらめきが大好き。「こうしたらもっと面白い」を次々に生み出します。', en: 'Loves debate and sparks — you keep coming up with "this would be more fun."' },
    love: { ja: '刺激的な会話ができる相手と恋に落ちやすい。マンネリは苦手。', en: 'You fall for people who keep the conversation exciting; routine is hard for you.' },
    work: { ja: '企画・新規事業・問題解決で輝きます。', en: 'You shine in planning, new ventures and problem-solving.' },
    strength: { ja: '発想の柔軟さと突破力', en: 'Flexible ideas and breakthroughs' },
    caution: { ja: '始めるのは得意、続けるのは少し苦手', en: 'Great at starting, less so at sticking with it' },
  },
  INFJ: {
    nickname: { ja: '静かな理想家', en: 'The Quiet Idealist' },
    summary: { ja: '人の心を深く理解し、意味のあることに静かな情熱を注ぐタイプ。', en: 'Deeply understands people and pours quiet passion into what matters.' },
    love: { ja: '魂でつながるような深い関係を求めます。', en: 'You seek a deep, soul-level connection.' },
    work: { ja: 'カウンセリング、教育、企画など「人と意味」に関わる仕事に向きます。', en: 'Suited to work about people and meaning — counseling, education, planning.' },
    strength: { ja: '洞察力と共感力', en: 'Insight and empathy' },
    caution: { ja: '理想が高く、ひとりで抱えこみやすい', en: 'High ideals can lead you to carry everything alone' },
  },
  INFP: {
    nickname: { ja: '心の詩人', en: 'The Heartfelt Poet' },
    summary: { ja: '自分の価値観を大切にする、やさしく想像力豊かなタイプ。', en: 'Gentle and imaginative, true to your own values.' },
    love: { ja: 'ロマンチックで一途。本当の自分を受けとめてくれる人を求めます。', en: 'Romantic and devoted — you look for someone who accepts the real you.' },
    work: { ja: '創作・ケア・言葉に関わる仕事で才能が生きます。', en: 'Your gifts live in creative, caring or writing work.' },
    strength: { ja: '共感力と表現力', en: 'Empathy and expression' },
    caution: { ja: '傷つくのを恐れて本音を隠しがち', en: 'Fear of getting hurt can make you hide your feelings' },
  },
  ENFJ: {
    nickname: { ja: 'みんなの応援団長', en: 'The Team Cheerleader' },
    summary: { ja: '人の可能性を信じて引き出す、あたたかいリーダータイプ。', en: 'A warm leader who believes in and draws out people’s potential.' },
    love: { ja: '相手に尽くすタイプ。自分のケアも忘れずに。', en: 'You give a lot to your partner — don’t forget to care for yourself.' },
    work: { ja: '教育・人事・チーム運営で輝きます。', en: 'You shine in teaching, HR and team leadership.' },
    strength: { ja: '人を巻きこむ力', en: 'Bringing people together' },
    caution: { ja: '人の期待に応えすぎて疲れやすい', en: 'Meeting everyone’s expectations can wear you out' },
  },
  ENFP: {
    nickname: { ja: 'ワクワク冒険家', en: 'The Spark Adventurer' },
    summary: { ja: '好奇心と情熱にあふれ、まわりを明るく巻きこむタイプ。', en: 'Bursting with curiosity and passion, you light up everyone around you.' },
    love: { ja: '恋のはじまりはドラマチック。ときめきを大切にします。', en: 'Your romances start dramatically — you treasure the spark.' },
    work: { ja: '企画・発信・人と関わる仕事で力を発揮。', en: 'You thrive in planning, communication and people-facing work.' },
    strength: { ja: '人を元気にするエネルギー', en: 'Energy that lifts people up' },
    caution: { ja: '興味が移りやすく、やり残しが出やすい', en: 'Shifting interests can leave things unfinished' },
  },
  ISTJ: {
    nickname: { ja: '誠実な守り手', en: 'The Steady Keeper' },
    summary: { ja: '約束とルールを大切にし、任されたことを確実にやりとげるタイプ。', en: 'Values promises and rules, and reliably finishes what you’re given.' },
    love: { ja: '誠実で長続きする恋。言葉より行動で示します。', en: 'Sincere, lasting love — shown through actions more than words.' },
    work: { ja: '管理・事務・品質など、正確さが求められる仕事で信頼されます。', en: 'Trusted in work that needs accuracy — management, operations, quality.' },
    strength: { ja: '責任感と正確さ', en: 'Responsibility and accuracy' },
    caution: { ja: '急な変化や例外が苦手', en: 'Sudden changes and exceptions are hard for you' },
  },
  ISFJ: {
    nickname: { ja: 'やさしい支え手', en: 'The Gentle Supporter' },
    summary: { ja: '人の役に立つことに喜びを感じる、細やかで思いやり深いタイプ。', en: 'Thoughtful and caring — helping others brings you joy.' },
    love: { ja: '相手の好みを覚えて尽くす、あたたかい恋をします。', en: 'A warm lover who remembers what your partner likes and cares for them.' },
    work: { ja: '医療・教育・サポート職で力を発揮します。', en: 'You thrive in healthcare, education and support roles.' },
    strength: { ja: '気配りと継続力', en: 'Attentiveness and consistency' },
    caution: { ja: '頼まれると断れず、抱えこみやすい', en: 'You struggle to say no and take on too much' },
  },
  ESTJ: {
    nickname: { ja: '頼れるまとめ役', en: 'The Reliable Organizer' },
    summary: { ja: '段取りとルールでチームを動かす、実行力のあるタイプ。', en: 'Gets teams moving with plans and rules — a strong executor.' },
    love: { ja: '安定した関係を築き、将来もきちんと考えます。', en: 'You build stable relationships and think seriously about the future.' },
    work: { ja: 'マネジメントや運営で頼られます。', en: 'People rely on you for management and operations.' },
    strength: { ja: '実行力と組織力', en: 'Execution and organization' },
    caution: { ja: '「正しさ」を押しつけているように見えることも', en: 'You can seem to impose what’s "right"' },
  },
  ESFJ: {
    nickname: { ja: '場をつくるホスト', en: 'The Warm Host' },
    summary: { ja: '人が心地よく過ごせる場をつくるのが得意な、社交的なタイプ。', en: 'Sociable and great at making spaces where people feel at home.' },
    love: { ja: '記念日やイベントを大切にする、愛情表現豊かな恋。', en: 'An expressive lover who cherishes anniversaries and special moments.' },
    work: { ja: '接客・チーム運営・調整役で輝きます。', en: 'You shine in hospitality, team coordination and liaison roles.' },
    strength: { ja: '人をつなぐ温かさ', en: 'Warmth that connects people' },
    caution: { ja: '人の評価を気にしすぎることがある', en: 'You may care too much about others’ opinions' },
  },
  ISTP: {
    nickname: { ja: 'クールな職人', en: 'The Cool Craftsperson' },
    summary: { ja: '仕組みを理解して手を動かすのが好きな、冷静で器用なタイプ。', en: 'Calm and handy — you love understanding how things work and making them.' },
    love: { ja: '束縛は苦手。自由を尊重し合える関係が心地よい。', en: 'Not a fan of being tied down — you like mutual freedom.' },
    work: { ja: '技術・エンジニアリング・トラブル対応で頼られます。', en: 'Trusted in technical work, engineering and troubleshooting.' },
    strength: { ja: '冷静な判断と問題解決力', en: 'Calm judgment and problem-solving' },
    caution: { ja: '気持ちを言葉にするのが後回しになりがち', en: 'Putting feelings into words often gets postponed' },
  },
  ISFP: {
    nickname: { ja: '感性のアーティスト', en: 'The Gentle Artist' },
    summary: { ja: '「今ここ」の美しさを感じとる、やさしく自由なタイプ。', en: 'Gentle and free, sensing the beauty of here and now.' },
    love: { ja: '穏やかで思いやりのある恋。自分のペースを大切に。', en: 'A calm, caring lover who values your own pace.' },
    work: { ja: 'デザイン・ものづくり・ケアの分野で才能が生きます。', en: 'Your gifts shine in design, crafts and care.' },
    strength: { ja: '美的センスと共感力', en: 'Aesthetic sense and empathy' },
    caution: { ja: '衝突を避けて我慢しすぎることがある', en: 'Avoiding conflict can mean holding in too much' },
  },
  ESTP: {
    nickname: { ja: '現場のチャレンジャー', en: 'The On-the-Spot Challenger' },
    summary: { ja: 'その場の判断とノリで道を切りひらく、行動派のタイプ。', en: 'A doer who blazes a trail with on-the-spot judgment and energy.' },
    love: { ja: '一緒に楽しめる相手に惹かれる、アクティブな恋。', en: 'An active lover drawn to someone you can have fun with.' },
    work: { ja: '営業・現場・スピード勝負の仕事で輝きます。', en: 'You shine in sales, field work and fast-paced jobs.' },
    strength: { ja: '瞬発力と交渉力', en: 'Quick reflexes and negotiation' },
    caution: { ja: '長期計画やコツコツ作業は退屈に感じやすい', en: 'Long-term plans and routine work can bore you' },
  },
  ESFP: {
    nickname: { ja: 'ステージの太陽', en: 'The Stage Sunshine' },
    summary: { ja: 'いるだけで場が明るくなる、楽しさの天才タイプ。', en: 'A genius of fun — the room brightens when you’re there.' },
    love: { ja: '楽しい時間を一緒にたくさん過ごしたいタイプ。', en: 'You want to spend lots of fun time together.' },
    work: { ja: '接客・エンタメ・イベントで力を発揮します。', en: 'You thrive in hospitality, entertainment and events.' },
    strength: { ja: '場を盛り上げる表現力', en: 'Expressiveness that livens things up' },
    caution: { ja: '先の計画が後回しになりがち', en: 'Planning ahead often gets put off' },
  },
};
