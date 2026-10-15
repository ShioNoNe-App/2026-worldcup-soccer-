// インド占星術（ジョーティシュ）の解釈文。月星座（ラーシ）は「心の動き・安心のツボ」として現代風に読む。
import type { L, TraitId } from '../engine/diagnosis/types';

export interface RashiContent {
  sanskrit: string;
  name: L;
  element: 'fire' | 'earth' | 'air' | 'water';
  ruler: L;
  mind: L;
  love: L;
  work: L;
  comfort: L;
}

export const RASHIS: RashiContent[] = [
  {
    sanskrit: 'Mesha',
    name: { ja: 'メーシャ（牡羊）', en: 'Mesha (Aries)' },
    element: 'fire',
    ruler: { ja: '火星', en: 'Mars' },
    mind: {
      ja: '気持ちの立ち上がりが速く、「やってみたい」がそのまま行動になる心。迷っている時間がいちばんのストレスになりやすいタイプです。',
      en: 'A mind that rises fast — "I want to try" turns straight into action. Being stuck in indecision tends to be your biggest stress.',
    },
    love: { ja: '恋はスピード勝負になりがち。気持ちが動いた瞬間に伝えたくなります。', en: 'Love tends to be a race — you want to say it the moment you feel it.' },
    work: { ja: '新しいプロジェクトの立ち上げ役で輝きます。', en: 'You shine as the one who kicks off new projects.' },
    comfort: { ja: '体を動かす・新しいことに挑むと心が整う', en: 'Moving your body or trying something new settles your mind' },
  },
  {
    sanskrit: 'Vrishabha',
    name: { ja: 'ヴリシャバ（牡牛）', en: 'Vrishabha (Taurus)' },
    element: 'earth',
    ruler: { ja: '金星', en: 'Venus' },
    mind: {
      ja: '安定と心地よさを大切にする、穏やかでぶれにくい心。好きなもの・慣れた場所が心の土台になります。',
      en: 'A calm, steady mind that values stability and comfort. Favorite things and familiar places are your foundation.',
    },
    love: { ja: 'ゆっくり育てて長く続く恋。五感で味わう時間が愛情表現です。', en: 'Love that grows slowly and lasts. Sharing sensory pleasures is how you show affection.' },
    work: { ja: '品質や美しさを守る、長期的な仕事に向いています。', en: 'Suited to long-term work that protects quality and beauty.' },
    comfort: { ja: 'おいしいもの・心地よい空間で心が満たされる', en: 'Good food and cozy spaces fill your heart' },
  },
  {
    sanskrit: 'Mithuna',
    name: { ja: 'ミトゥナ（双子）', en: 'Mithuna (Gemini)' },
    element: 'air',
    ruler: { ja: '水星', en: 'Mercury' },
    mind: {
      ja: '好奇心がくるくる回る、軽やかで頭の回転が速い心。話すこと・知ることでエネルギーが湧きます。',
      en: 'A light, quick mind with spinning curiosity. Talking and learning recharge you.',
    },
    love: { ja: '会話が楽しい相手に惹かれやすく、言葉のやりとりが恋の燃料。', en: 'You’re drawn to people who are fun to talk to — conversation fuels your romance.' },
    work: { ja: '情報を集めて伝える・つなぐ仕事が得意です。', en: 'You’re good at gathering, sharing and connecting information.' },
    comfort: { ja: '誰かと話す・新しい情報に触れると気分が晴れる', en: 'Chatting or discovering something new lifts your mood' },
  },
  {
    sanskrit: 'Karka',
    name: { ja: 'カルカ（蟹）', en: 'Karka (Cancer)' },
    element: 'water',
    ruler: { ja: '月', en: 'Moon' },
    mind: {
      ja: '感受性が豊かで、身近な人を守りたい気持ちが強い心。安心できる居場所があると、驚くほど強くなれます。',
      en: 'A sensitive mind with a strong wish to protect the people close to you. With a safe place, you become surprisingly strong.',
    },
    love: { ja: '「守り・守られる」関係に幸せを感じやすいタイプ。', en: 'You find happiness in relationships of protecting and being protected.' },
    work: { ja: 'ケアや育成、チームの居心地をつくる役で力を発揮します。', en: 'You thrive in care, mentoring and making the team feel at home.' },
    comfort: { ja: '家や家族・気心の知れた人といる時間で回復する', en: 'Time at home or with people you trust restores you' },
  },
  {
    sanskrit: 'Simha',
    name: { ja: 'シンハ（獅子）', en: 'Simha (Leo)' },
    element: 'fire',
    ruler: { ja: '太陽', en: 'Sun' },
    mind: {
      ja: '誇りと温かさをもつ、堂々とした心。認められること・自分らしく表現できることが元気の源です。',
      en: 'A proud, warm and confident mind. Being recognized and expressing yourself fuel you.',
    },
    love: { ja: '愛情表現はドラマチック。特別扱いされると心が満たされます。', en: 'Your love is dramatic — being treated as special fills your heart.' },
    work: { ja: '人前に立つ、場を率いる役割で輝きます。', en: 'You shine when leading or standing in front of others.' },
    comfort: { ja: 'ほめられる・自分の作品を見てもらうと元気になる', en: 'Praise and sharing your work energize you' },
  },
  {
    sanskrit: 'Kanya',
    name: { ja: 'カニャー（乙女）', en: 'Kanya (Virgo)' },
    element: 'earth',
    ruler: { ja: '水星', en: 'Mercury' },
    mind: {
      ja: '細かいところまで目が届く、几帳面で誠実な心。整えること・役に立つことで安心できます。',
      en: 'A careful, sincere mind that notices details. Putting things in order and being useful bring you peace.',
    },
    love: { ja: '言葉より「気づかい」で愛情を示すタイプ。', en: 'You show love through thoughtful care more than words.' },
    work: { ja: '分析・改善・品質管理で頼られます。', en: 'People rely on you for analysis, improvement and quality.' },
    comfort: { ja: '片づける・計画を立てると心が落ち着く', en: 'Tidying up or making a plan calms you' },
  },
  {
    sanskrit: 'Tula',
    name: { ja: 'トゥラー（天秤）', en: 'Tula (Libra)' },
    element: 'air',
    ruler: { ja: '金星', en: 'Venus' },
    mind: {
      ja: 'バランスと調和を求める、洗練された心。人との関係がうまくいっていると、自分も安定します。',
      en: 'A refined mind that seeks balance and harmony. When your relationships are good, you feel steady too.',
    },
    love: { ja: '対等でおしゃれなパートナーシップに憧れるタイプ。', en: 'You long for an equal, stylish partnership.' },
    work: { ja: '調整・交渉・デザインなど「バランス感覚」が生きる仕事に向きます。', en: 'Suited to work that uses balance — coordination, negotiation, design.' },
    comfort: { ja: '美しいもの・穏やかな会話で心が整う', en: 'Beautiful things and gentle conversation restore you' },
  },
  {
    sanskrit: 'Vrishchika',
    name: { ja: 'ヴリシュチカ（蠍）', en: 'Vrishchika (Scorpio)' },
    element: 'water',
    ruler: { ja: '火星', en: 'Mars' },
    mind: {
      ja: '深く、一途で、表に出さない情熱をもつ心。信頼した相手にはとことん尽くします。',
      en: 'A deep, devoted mind with hidden passion. Once you trust someone, you give everything.',
    },
    love: { ja: '浅い関係より、魂でつながるような深い恋を求めます。', en: 'You want deep, soul-level love rather than something shallow.' },
    work: { ja: '調査・専門分野を深く掘る仕事で力を発揮します。', en: 'You excel at research and digging deep into a specialty.' },
    comfort: { ja: 'ひとりで深く没頭する時間で回復する', en: 'Time alone, deeply absorbed, restores you' },
  },
  {
    sanskrit: 'Dhanu',
    name: { ja: 'ダヌ（射手）', en: 'Dhanu (Sagittarius)' },
    element: 'fire',
    ruler: { ja: '木星', en: 'Jupiter' },
    mind: {
      ja: '自由と理想を追いかける、明るく前向きな心。遠くの目標があると、毎日がいきいきします。',
      en: 'A bright, optimistic mind that chases freedom and ideals. A far-off goal makes every day lively.',
    },
    love: { ja: '一緒に成長し、冒険できる相手と相性がよさそう。', en: 'You match well with someone you can grow and adventure with.' },
    work: { ja: '教える・広げる・旅するなど、視野の広さが生きる仕事に向きます。', en: 'Suited to work that uses a wide view — teaching, expanding, traveling.' },
    comfort: { ja: '旅行や学び、未来の計画を語ると元気になる', en: 'Travel, learning or talking about the future energizes you' },
  },
  {
    sanskrit: 'Makara',
    name: { ja: 'マカラ（山羊）', en: 'Makara (Capricorn)' },
    element: 'earth',
    ruler: { ja: '土星', en: 'Saturn' },
    mind: {
      ja: '責任感が強く、コツコツ積み上げる忍耐の心。目標に近づいている実感が、いちばんの安心材料です。',
      en: 'A responsible, patient mind that builds step by step. Feeling progress toward a goal is your best reassurance.',
    },
    love: { ja: '誠実で長続きする関係を重視。言葉より行動で示します。', en: 'You value sincere, lasting relationships and show love through actions.' },
    work: { ja: '組織をまとめ、長期の成果を出す役割で信頼されます。', en: 'Trusted for organizing teams and delivering long-term results.' },
    comfort: { ja: 'やることリストが進む・結果が見えると落ち着く', en: 'Seeing your to-do list shrink or results appear calms you' },
  },
  {
    sanskrit: 'Kumbha',
    name: { ja: 'クンバ（水瓶）', en: 'Kumbha (Aquarius)' },
    element: 'air',
    ruler: { ja: '土星', en: 'Saturn' },
    mind: {
      ja: '独自の視点をもち、みんなの未来を考える心。型にはまらない自由さが、あなたの安定剤です。',
      en: 'A mind with its own viewpoint that thinks about everyone’s future. Unconventional freedom is your stabilizer.',
    },
    love: { ja: '友達のような対等な関係から恋が始まりやすいタイプ。', en: 'Your romance often starts from an equal, friend-like bond.' },
    work: { ja: '仕組みづくりやテクノロジー、社会を変える仕事に向きます。', en: 'Suited to building systems, technology and work that changes society.' },
    comfort: { ja: '同じ価値観の仲間と語る・新しいアイデアで心が晴れる', en: 'Talking with like-minded people or new ideas clear your mind' },
  },
  {
    sanskrit: 'Meena',
    name: { ja: 'ミーナ（魚）', en: 'Meena (Pisces)' },
    element: 'water',
    ruler: { ja: '木星', en: 'Jupiter' },
    mind: {
      ja: '想像力と共感力にあふれた、やさしい心。人の痛みに寄り添える一方、境界線がにじみやすい面も。',
      en: 'A gentle mind full of imagination and empathy. You feel others’ pain, though your boundaries can blur.',
    },
    love: { ja: 'ロマンチックで、相手と溶け合うような恋に憧れます。', en: 'Romantic — you long for a love where you melt into each other.' },
    work: { ja: 'アート、ケア、癒やしの分野で才能が生きます。', en: 'Your gifts shine in art, care and healing.' },
    comfort: { ja: '音楽・水辺・空想の時間で心が回復する', en: 'Music, water and daydreaming restore your heart' },
  },
];

/** 月星座の元素ごとの仮説（-1〜1） */
export const RASHI_ELEMENT_PRIORS: Record<RashiContent['element'], Partial<Record<TraitId, number>>> = {
  fire: { love_pace: 0.3, work_pace: 0.3, life_mode: 0.25, self_energy: 0.2 },
  earth: { marriage_view: 0.3, work_structure: 0.25, work_drive: -0.2, love_pace: -0.2 },
  air: { rel_circle: 0.3, love_distance: -0.25, self_decide: -0.2, love_express: 0.2 },
  water: { love_reassure: 0.3, self_decide: 0.3, rel_role: -0.2, love_distance: 0.25 },
};

export interface NakshatraContent {
  name: string;
  symbol: L;
  keyword: L;
  text: L;
}

export const NAKSHATRAS: NakshatraContent[] = [
  { name: 'Ashwini', symbol: { ja: '馬の頭', en: 'Horse’s head' }, keyword: { ja: 'スピードと癒やし', en: 'Speed & healing' }, text: { ja: '思い立ったらすぐ動ける行動派。人を元気づけるパワーがあります。', en: 'A doer who moves the moment inspiration strikes, with power to lift others up.' } },
  { name: 'Bharani', symbol: { ja: '器', en: 'Vessel' }, keyword: { ja: '受けとめる力', en: 'Holding power' }, text: { ja: '大きなものを抱えて育てる強さ。情熱的で、やると決めたら徹底的。', en: 'Strength to carry and nurture big things. Passionate and thorough once decided.' } },
  { name: 'Krittika', symbol: { ja: '刃・炎', en: 'Blade / flame' }, keyword: { ja: '切りひらく力', en: 'Cutting through' }, text: { ja: '本質を見抜き、はっきり言える正直さ。改革や仕上げで力を発揮します。', en: 'Honesty that sees the essence and says it. Strong in reform and finishing work.' } },
  { name: 'Rohini', symbol: { ja: '牛車', en: 'Ox cart' }, keyword: { ja: '魅力と豊かさ', en: 'Charm & abundance' }, text: { ja: '人を惹きつける魅力と、美しいものを育てるセンスの持ち主。', en: 'Natural charm and a sense for growing beautiful things.' } },
  { name: 'Mrigashira', symbol: { ja: '鹿の頭', en: 'Deer’s head' }, keyword: { ja: '探求心', en: 'Seeker' }, text: { ja: '「もっと知りたい」が止まらない探求者。やわらかな好奇心で世界を広げます。', en: 'A seeker who always wants to know more, widening the world with gentle curiosity.' } },
  { name: 'Ardra', symbol: { ja: '涙のしずく', en: 'Teardrop' }, keyword: { ja: '変化と再生', en: 'Change & renewal' }, text: { ja: '嵐のあとに空が澄むように、変化を力に変えられる人。', en: 'Like the clear sky after a storm, you turn change into strength.' } },
  { name: 'Punarvasu', symbol: { ja: '矢筒', en: 'Quiver' }, keyword: { ja: '何度でも戻る光', en: 'Returning light' }, text: { ja: 'つまずいても何度でも立ち直れる、明るい回復力の持ち主。', en: 'Bright resilience — you bounce back no matter how many times you stumble.' } },
  { name: 'Pushya', symbol: { ja: '花・乳房', en: 'Flower' }, keyword: { ja: '育む力', en: 'Nourishing' }, text: { ja: '人や物事を育てる、面倒見のよさと誠実さが光ります。', en: 'Your caring nature and sincerity shine as you nurture people and things.' } },
  { name: 'Ashlesha', symbol: { ja: '蛇', en: 'Serpent' }, keyword: { ja: '洞察力', en: 'Insight' }, text: { ja: '人の心の奥を読む鋭さがあり、戦略を立てるのが得意です。', en: 'Sharp at reading what’s deep in people’s hearts, and good at strategy.' } },
  { name: 'Magha', symbol: { ja: '玉座', en: 'Throne' }, keyword: { ja: '誇りと伝統', en: 'Pride & legacy' }, text: { ja: 'ルーツや受け継いだものを大切にし、堂々と人を率いる力があります。', en: 'You honor your roots and lead others with dignity.' } },
  { name: 'Purva Phalguni', symbol: { ja: 'ハンモック', en: 'Hammock' }, keyword: { ja: '楽しむ力', en: 'Joy' }, text: { ja: '人生を楽しむ天才。あなたがいると場がやわらかく華やぎます。', en: 'A genius at enjoying life — rooms soften and brighten around you.' } },
  { name: 'Uttara Phalguni', symbol: { ja: 'ベッドの脚', en: 'Bed legs' }, keyword: { ja: '約束と支え', en: 'Commitment' }, text: { ja: '約束を守り、仲間を支える頼もしさ。長いパートナーシップに強い。', en: 'Reliable — you keep promises and support others. Strong in long partnerships.' } },
  { name: 'Hasta', symbol: { ja: '手', en: 'Hand' }, keyword: { ja: '器用さ', en: 'Skillful hands' }, text: { ja: '手先や工夫で物事を形にするのが得意。ユーモアのセンスも。', en: 'Good at making things real with your hands and ideas — with a sense of humor too.' } },
  { name: 'Chitra', symbol: { ja: '宝石', en: 'Jewel' }, keyword: { ja: '美とデザイン', en: 'Beauty & design' }, text: { ja: '美しいものを生み出すセンスと、目を引く存在感があります。', en: 'A sense for creating beauty, and a presence that catches the eye.' } },
  { name: 'Swati', symbol: { ja: '風に揺れる若芽', en: 'Sprout in the wind' }, keyword: { ja: '自由と自立', en: 'Freedom' }, text: { ja: '風のようにしなやかで自由。自分のペースで世界を広げていきます。', en: 'Flexible and free like the wind, widening your world at your own pace.' } },
  { name: 'Vishakha', symbol: { ja: '凱旋門', en: 'Triumphal arch' }, keyword: { ja: '目標達成', en: 'Goal-driven' }, text: { ja: '決めたゴールに向かって粘り強く進む集中力の持ち主。', en: 'Focused and persistent on the way to the goals you set.' } },
  { name: 'Anuradha', symbol: { ja: '蓮の花', en: 'Lotus' }, keyword: { ja: '友情と献身', en: 'Friendship & devotion' }, text: { ja: '仲間との絆を大切にし、どんな場所でも花を咲かせられる人。', en: 'You treasure bonds with friends and can bloom anywhere.' } },
  { name: 'Jyeshtha', symbol: { ja: 'お守り', en: 'Amulet' }, keyword: { ja: '責任と保護', en: 'Protector' }, text: { ja: '頼られると力が出る、面倒見のいいリーダー気質。', en: 'A caring leader who grows stronger when relied upon.' } },
  { name: 'Mula', symbol: { ja: '根っこ', en: 'Roots' }, keyword: { ja: '本質の追求', en: 'Getting to the root' }, text: { ja: '物事の根本を掘り下げる探究心。ゼロから作り直す力があります。', en: 'Curiosity that digs to the root, with power to rebuild from scratch.' } },
  { name: 'Purva Ashadha', symbol: { ja: '扇', en: 'Fan' }, keyword: { ja: '不屈の情熱', en: 'Unstoppable passion' }, text: { ja: '信じたことを貫く情熱と、人を説得する力の持ち主。', en: 'Passion to see your beliefs through, and the power to persuade.' } },
  { name: 'Uttara Ashadha', symbol: { ja: '象の牙', en: 'Elephant tusk' }, keyword: { ja: '揺るがない勝利', en: 'Lasting victory' }, text: { ja: '誠実に積み上げ、最後に勝ちきる粘り強さがあります。', en: 'You build sincerely and have the grit to win in the end.' } },
  { name: 'Shravana', symbol: { ja: '耳', en: 'Ear' }, keyword: { ja: '聴く力', en: 'Listening' }, text: { ja: '人の話をよく聴き、学びを吸収する力。つなぎ役として信頼されます。', en: 'You listen well and absorb learning — trusted as a connector.' } },
  { name: 'Dhanishta', symbol: { ja: '太鼓', en: 'Drum' }, keyword: { ja: 'リズムと豊かさ', en: 'Rhythm & plenty' }, text: { ja: 'リズム感とノリのよさで、チームに勢いを与えます。', en: 'Your sense of rhythm and good vibes give the team momentum.' } },
  { name: 'Shatabhisha', symbol: { ja: '空っぽの円', en: 'Empty circle' }, keyword: { ja: '癒やしと独立', en: 'Healing & independence' }, text: { ja: 'ひとりの時間に強く、独自の視点で問題を解決する力があります。', en: 'Strong in solitude, solving problems with your own unique view.' } },
  { name: 'Purva Bhadrapada', symbol: { ja: '剣', en: 'Sword' }, keyword: { ja: '理想への情熱', en: 'Idealism' }, text: { ja: '高い理想を掲げ、本気で世界をよくしようとする熱さがあります。', en: 'High ideals and a real passion to make the world better.' } },
  { name: 'Uttara Bhadrapada', symbol: { ja: '深海の蛇', en: 'Serpent of the deep' }, keyword: { ja: '深い落ち着き', en: 'Deep calm' }, text: { ja: '深い知恵と落ち着きで、まわりを静かに支える人。', en: 'With deep wisdom and calm, you quietly support those around you.' } },
  { name: 'Revati', symbol: { ja: '魚', en: 'Fish' }, keyword: { ja: 'やさしい導き', en: 'Gentle guide' }, text: { ja: '思いやりにあふれ、迷う人を安全な場所へ導けるやさしさがあります。', en: 'Full of compassion — you can guide lost people to a safe place.' } },
];

const NAKSHATRA_JA = [
  'アシュヴィニー', 'バラニー', 'クリッティカー', 'ローヒニー', 'ムリガシラー', 'アールドラー', 'プナルヴァス',
  'プシュヤ', 'アーシュレーシャー', 'マガー', 'プールヴァ・パルグニー', 'ウッタラ・パルグニー', 'ハスタ', 'チトラー',
  'スヴァーティー', 'ヴィシャーカー', 'アヌラーダー', 'ジェーシュター', 'ムーラ', 'プールヴァ・アーシャーダー',
  'ウッタラ・アーシャーダー', 'シュラヴァナ', 'ダニシュター', 'シャタビシャー', 'プールヴァ・バードラパダー',
  'ウッタラ・バードラパダー', 'レーヴァティー',
];

/** ナクシャトラの表示名（日本語はカタカナ） */
export function nakshatraName(i: number, lang: 'ja' | 'en'): string {
  return lang === 'en' ? NAKSHATRAS[i].name : NAKSHATRA_JA[i];
}
