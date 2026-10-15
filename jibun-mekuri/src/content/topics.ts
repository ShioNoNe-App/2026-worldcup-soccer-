// サブテーマ（「今、何が気になっているか」）の定義。
import type { DiagnosisContext, ResultPoint, ThemeId, TopicDef, TraitId } from '../engine/diagnosis/types';
import { DAY_MASTERS } from './dayMasters';
import { TRAIT_BY_ID } from './traits';

const dm = (ctx: DiagnosisContext) => DAY_MASTERS[ctx.chart.dayStem];

/** 命式からの仮説を、占いの解釈としてやわらかく述べる */
function hypothesisLine(ctx: DiagnosisContext, trait: TraitId): string | null {
  const t = ctx.traits[trait];
  if (t.status !== 'hypothesis' || Math.abs(t.prior) < 0.2) return null;
  const pole = t.prior > 0 ? TRAIT_BY_ID[trait].pos : TRAIT_BY_ID[trait].neg;
  return `占いの解釈では「${pole.keyword}」の傾向が示唆されています。`;
}

function firstHypothesis(ctx: DiagnosisContext, traits: TraitId[]): string {
  for (const t of traits) {
    const line = hypothesisLine(ctx, t);
    if (line) return line;
  }
  return '';
}

const note = (text: string, source: ResultPoint['source'] = 'answer'): ResultPoint => ({ kind: 'note', text, source });
const tip = (text: string, source: ResultPoint['source'] = 'answer'): ResultPoint => ({ kind: 'tip', text, source });
const has = (ctx: DiagnosisContext, tag: string) => ctx.tags.has(tag);

export const THEMES: { id: ThemeId; title: string; short: string; lead: string; featured: boolean }[] = [
  { id: 'love', title: '恋愛・結婚・相性', short: '恋愛', lead: '片思い、相性、結婚観。恋のクセを知ろう', featured: true },
  { id: 'work', title: '仕事・才能・キャリア', short: '仕事', lead: '強み、向いている働き方、次の一手', featured: true },
  { id: 'relations', title: '友達・家族・人間関係', short: '人間関係', lead: 'グループでの役割や、すれ違いの解き方', featured: false },
  { id: 'self', title: '自分の性格・本当の自分', short: '本当の自分', lead: '人から見た自分と、内側の自分', featured: false },
  { id: 'life', title: '人生全体・これからの運勢', short: '運勢', lead: '今年と来年の流れ、これからの方向', featured: false },
];

export const THEME_BY_ID = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<ThemeId, (typeof THEMES)[number]>;

export const TOPICS: TopicDef[] = [
  // ================= 恋愛 =================
  {
    id: 'love_style',
    theme: 'love',
    title: '自分の恋愛傾向',
    ask: '私って、どんな恋をするタイプ？',
    traits: ['love_pace', 'love_express', 'love_reassure', 'love_distance'],
    maxQuestions: 3,
    intro: (ctx) => dm(ctx).love,
    related: ['pattern', 'fit', 'closer'],
  },
  {
    id: 'crush',
    theme: 'love',
    title: '片思い',
    ask: '片思い中。どう動けばいい？',
    traits: ['love_express', 'love_pace', 'love_reassure'],
    maxQuestions: 3,
    intro: (ctx) => `片思いは、あなたらしさがいちばん出やすい時期。${firstHypothesis(ctx, ['love_express', 'love_pace', 'love_reassure'])}今の状況を少しだけ教えてください。`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'crush:far')) p.push(tip('まだ遠い距離なら、「あいさつ＋ひと言」を続けるだけで印象はぐっと変わります。'));
      if (has(ctx, 'approach:intro')) p.push(tip('共通の友達を通すなら、まずはグループで会う機会をつくるのが自然です。'));
      if (has(ctx, 'crush:some')) p.push(tip('たまに話す関係なら、前に話した話題を覚えておいて「あれどうなった？」と聞くと、印象に残りやすくなります。'));
      if (has(ctx, 'crush:close')) p.push(note('仲のいい関係は、恋に進むための大きな土台。「友達のままがいい」と決めつけなくて大丈夫。'));
      if (has(ctx, 'signal:hidden') || has(ctx, 'signal:hiding')) p.push(tip('好意は「あなたと話すのが楽しい」くらいの軽いひと言から伝えてみては？'));
      if (has(ctx, 'next:anxious')) p.push(note('相手の気持ちは、占いでは断定できません。次に会う約束ができるかどうかが、いちばん確かなサインです。'));
      if (has(ctx, 'next:closer')) p.push(tip('次は「この前の続き」を口実に誘うと、自然に距離が縮まりやすいはず。'));
      return p;
    },
    related: ['closer', 'compat', 'love_style'],
  },
  {
    id: 'compat',
    theme: 'love',
    title: '好きな人との相性',
    ask: 'あの人との相性は？',
    traits: ['love_distance', 'love_lead'],
    maxQuestions: 2,
    special: 'compat',
    intro: () => '相手の生年月日がわかれば、二人の「日柱」から相性の傾向を計算します。わからなくても、あなたに合いやすい関係性を見ていけます。',
    related: ['closer', 'fit', 'partner'],
  },
  {
    id: 'partner',
    theme: 'love',
    title: '交際中の相手との関係',
    ask: '今の恋人との関係、どうしたらいい？',
    traits: ['love_reassure', 'love_distance', 'rel_conflict', 'love_express'],
    maxQuestions: 3,
    intro: (ctx) => `長く付き合うほど、ふたりの「ちょうどいい距離」が大切に。${firstHypothesis(ctx, ['love_distance', 'love_reassure'])}`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'rel:stable')) p.push(note('安定しているときこそ、小さな「ありがとう」が関係を長持ちさせます。'));
      if (has(ctx, 'rel:gap')) p.push(tip('すれ違いが増えたら、解決よりもまず「最近どう？」と話す時間をつくるところから。'));
      if (has(ctx, 'rel:future')) p.push(tip('将来の話は、結論を求めずに「どんな暮らしが好き？」から始めると話しやすいです。'));
      if (has(ctx, 'hide')) p.push(note('気にしないふりが続くと、モヤモヤが大きくなりがち。小さいうちに伝えるのがコツです。'));
      return p;
    },
    related: ['marriage', 'fit', 'pattern'],
  },
  {
    id: 'marriage',
    theme: 'love',
    title: '結婚観',
    ask: '私の結婚観って？',
    traits: ['marriage_view', 'love_distance'],
    maxQuestions: 3,
    intro: (ctx) => `結婚観は、人それぞれ。正解はありません。${firstHypothesis(ctx, ['marriage_view', 'love_distance'])}`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'm:want')) p.push(tip('「いつかしたい」なら、どんな毎日を送りたいかを言葉にしておくと、合う相手が見えやすくなります。'));
      if (has(ctx, 'm:notnow')) p.push(note('今は考えていない、も立派な答え。今の自分を大切にする時期なのかもしれません。'));
      if (has(ctx, 'm:free')) p.push(note('形にこだわらない関係は、二人でルールをつくれるのが魅力。言葉にして共有することが大切です。'));
      p.push(note('占いは結婚の時期や成否を決めるものではありません。考えるきっかけとして使ってください。', 'chart'));
      return p;
    },
    related: ['fit', 'partner', 'year'],
  },
  {
    id: 'meet',
    theme: 'love',
    title: '出会い',
    ask: 'どんな場所で出会いやすい？',
    traits: ['love_pace', 'self_energy', 'rel_circle'],
    maxQuestions: 3,
    intro: (ctx) => `出会いは「どこで」より「どんな自分でいられるか」が大事。${firstHypothesis(ctx, ['love_pace', 'self_energy', 'rel_circle'])}`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'meet:party')) p.push(tip('にぎやかな場が得意なら、イベントや友達の集まりに積極的に顔を出してみて。'));
      if (has(ctx, 'meet:small')) p.push(tip('少人数が得意なら、信頼できる友達に「いい人いたら紹介して」と伝えておくのが近道かも。'));
      if (has(ctx, 'meet:hobby')) p.push(tip('趣味や学びの場は、自然体の自分を見てもらえるのが強み。好きなことを続けるのが一番の出会い対策です。'));
      if (has(ctx, 'meet:online')) p.push(tip('オンラインの出会いは、会う前のやりとりで「話しやすさ」を確かめるのがコツ。安全のため、最初は人の多い場所で会いましょう。'));
      return p;
    },
    related: ['love_style', 'crush', 'year'],
  },
  {
    id: 'reunion',
    theme: 'love',
    title: '復縁',
    ask: '元の恋人のことが忘れられない',
    traits: ['love_reassure', 'love_distance'],
    maxQuestions: 3,
    intro: () => '復縁できるかどうかは、占いでは断定できません。ここでは「あなたの気持ちの整理」に役立つヒントを一緒に探します。',
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 're:fresh')) p.push(tip('別れて間もない時期は、気持ちが大きく揺れやすいもの。大きな決断は少し時間をおいてからでも遅くありません。'));
      if (has(ctx, 're:long')) p.push(note('時間がたっても思い出すなら、それだけ大切な経験だったということ。今の自分が何を求めているかを見つめてみて。'));
      if (has(ctx, 're:lonely')) p.push(tip('さびしさが大きいときは、まず友達や好きなことで心を満たしてから考えると、本当の気持ちが見えやすくなります。'));
      if (has(ctx, 're:regret')) p.push(tip('後悔があるなら、「あのとき伝えたかったこと」を一度書き出してみると、気持ちが整理されやすいです。'));
      if (has(ctx, 're:love')) p.push(note('「今も好き」という気持ちは大切に。そのうえで、別れた理由が今どう変わったかを考えてみて。'));
      p.push(note('相手の気持ちや連絡の有無を、占いで決めつける必要はありません。', 'chart'));
      return p;
    },
    related: ['pattern', 'love_style', 'energy'],
  },
  {
    id: 'closer',
    theme: 'love',
    title: '距離の縮め方',
    ask: '相手との距離を縮めるには？',
    traits: ['love_express', 'love_lead'],
    maxQuestions: 3,
    intro: (ctx) => `距離の縮め方には、その人らしい「得意なやり方」があります。${firstHypothesis(ctx, ['love_express', 'love_lead'])}`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'talk:self')) p.push(tip('話すのが得意なら、最後に「あなたはどう？」と質問で返すと、会話のキャッチボールが続きます。'));
      if (has(ctx, 'talk:listen')) p.push(tip('聞き上手は大きな武器。ときどき自分の話も混ぜると、相手もあなたを知りたくなります。'));
      if (has(ctx, 'talk:nervous')) p.push(tip('緊張するなら、話す内容を1つだけ決めておくと安心。上手に話すより、楽しそうにしていることが伝わります。'));
      if (has(ctx, 'talk:fun')) p.push(note('笑わせようとがんばれるのは、相手を大事に思っている証拠。ときには素の自分を見せるのも◎。'));
      return p;
    },
    related: ['crush', 'compat', 'fit'],
  },
  {
    id: 'pattern',
    theme: 'love',
    title: '恋愛でくり返すパターン',
    ask: 'いつも同じところでつまずく気がする',
    traits: ['love_reassure', 'love_pace', 'love_lead', 'love_express'],
    maxQuestions: 3,
    emphasis: 'caution',
    intro: (ctx) => `くり返すパターンは「あなたの弱点」ではなく、「強みの裏側」であることが多いもの。${firstHypothesis(ctx, ['love_reassure', 'love_pace'])}`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'pt:over')) p.push(tip('夢中になりやすいなら、恋以外の「好きなこと」も同じくらい大切にしておくと、振り回されにくくなります。'));
      if (has(ctx, 'pt:adapt')) p.push(tip('合わせすぎて疲れるなら、「今日は私が決めていい？」と1回だけ言ってみる練習を。'));
      if (has(ctx, 'pt:fade')) p.push(note('冷めるのが早いのは、ときめきに敏感な証拠。「安心」にもときめけるか、試してみる価値ありです。'));
      if (has(ctx, 'pt:stall')) p.push(tip('進展しないまま終わるなら、気持ちの3割くらいを、言葉で伝えてみることから。'));
      return p;
    },
    related: ['love_style', 'fit', 'reunion'],
  },
  {
    id: 'fit',
    theme: 'love',
    title: '自分に合う関係性',
    ask: 'どんな関係が、私に合ってる？',
    traits: ['love_distance', 'love_lead', 'marriage_view', 'love_pace'],
    maxQuestions: 3,
    intro: (ctx) => `合う関係は、相手の条件より「心地いい距離感」で決まることが多いもの。${firstHypothesis(ctx, ['love_distance', 'love_lead'])}`,
    related: ['compat', 'marriage', 'meet'],
  },

  // ================= 仕事 =================
  {
    id: 'strengths',
    theme: 'work',
    title: '自分の強み',
    ask: '私の強みって、何だろう？',
    traits: ['work_pace', 'work_drive', 'rel_role'],
    maxQuestions: 3,
    intro: (ctx) => dm(ctx).work,
    extras: (ctx) => {
      const p: ResultPoint[] = [{ kind: 'strength', text: dm(ctx).strengths[0], source: 'chart' }];
      if (has(ctx, 'wrole:accurate')) p.push({ kind: 'strength', text: '正確さで頼られるのは、見えにくいけれど大きな強み。', source: 'answer' });
      if (has(ctx, 'wrole:mood')) p.push({ kind: 'strength', text: '場を明るくする力は、チームの生産性まで上げる立派なスキル。', source: 'answer' });
      return p;
    },
    related: ['backfire', 'style', 'career'],
  },
  {
    id: 'avoid',
    theme: 'work',
    title: '苦手な環境',
    ask: 'どんな環境だと、しんどくなる？',
    traits: ['work_structure', 'work_collab'],
    maxQuestions: 3,
    emphasis: 'caution',
    intro: (ctx) => `苦手を知るのは、自分を守るための大事な情報。${firstHypothesis(ctx, ['work_structure', 'work_collab'])}`,
    extras: stressExtras,
    related: ['stress', 'style', 'career'],
  },
  {
    id: 'style',
    theme: 'work',
    title: '向いている働き方',
    ask: '向いている働き方は？',
    traits: ['work_structure', 'work_collab', 'work_pace'],
    maxQuestions: 3,
    intro: (ctx) => `向いている働き方は、職種名よりも「どんな環境で力が出るか」で考えると見つけやすくなります。${firstHypothesis(ctx, ['work_structure', 'work_collab', 'work_pace'])}`,
    related: ['strengths', 'career', 'avoid'],
  },
  {
    id: 'people',
    theme: 'work',
    title: '仕事での人間関係',
    ask: '職場の人間関係、どう付き合う？',
    traits: ['rel_role', 'work_collab', 'rel_conflict'],
    maxQuestions: 3,
    intro: (ctx) => `仕事の人間関係は、役割の取り方で楽にも重くもなります。${firstHypothesis(ctx, ['rel_role', 'work_collab', 'rel_conflict'])}`,
    related: ['conflict', 'stress', 'role'],
  },
  {
    id: 'career',
    theme: 'work',
    title: 'キャリア・転職',
    ask: 'このままでいい？キャリアの考え方',
    traits: ['work_drive', 'work_structure'],
    maxQuestions: 3,
    intro: (ctx) => `キャリアは「正解を当てる」より「自分に合う条件を知る」ことが近道です。${firstHypothesis(ctx, ['work_drive', 'work_structure'])}`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'career:grow')) p.push(tip('今の場所で伸びたいなら、「任されたい仕事」を1つ上司や先輩に伝えてみるのが近道。'));
      if (has(ctx, 'cc:want')) p.push(tip('やりたいことが別にあるなら、まず週末や副業で「小さく試す」と、合うかどうかが見えてきます。'));
      if (has(ctx, 'cc:env')) p.push(note('環境が理由なら、次の場所選びでは「仕事内容」と同じくらい「どんな人と働くか」を確認しましょう。'));
      if (has(ctx, 'cc:future')) p.push(tip('待遇や将来性が気になるなら、今の自分の市場価値を調べてみるだけでも判断材料になります。'));
      if (has(ctx, 'cc:unsure') || has(ctx, 'career:explore')) p.push(tip('模索中なら、「楽しかった仕事」と「しんどかった仕事」を3つずつ書き出すと、条件が見えてきます。'));
      p.push(note('転職するかどうかなど大きな決断は、占いだけで決めず、現実の情報と合わせて考えてください。', 'chart'));
      return p;
    },
    related: ['challenge', 'next', 'style'],
  },
  {
    id: 'challenge',
    theme: 'work',
    title: '挑戦・独立',
    ask: '新しい挑戦、してもいい？',
    traits: ['work_drive', 'work_pace'],
    maxQuestions: 3,
    intro: (ctx) => `挑戦のしかたにも向き不向きがあります。${firstHypothesis(ctx, ['work_drive', 'work_pace'])}`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'brake:eyes')) p.push(tip('周りの目が気になるなら、最初は身近な1人にだけ話して始めると、心理的なハードルが下がります。'));
      if (has(ctx, 'brake:money')) p.push(tip('お金の不安があるなら、「生活費の何か月分があれば安心か」を数字にしておくと、挑戦の計画が立てやすくなります。'));
      if (has(ctx, 'brake:start')) p.push(tip('何から始めればいいかわからないときは、「今週15分でできること」に分解してみて。'));
      if (has(ctx, 'brake:none')) p.push(note('ブレーキが少ないのは強み。そのぶん、「やめる基準」を先に決めておくと安心です。'));
      return p;
    },
    related: ['next', 'decide', 'year'],
  },
  {
    id: 'decide',
    theme: 'work',
    title: '意思決定の傾向',
    ask: '私の決め方のクセは？',
    traits: ['work_pace', 'self_decide'],
    maxQuestions: 2,
    intro: (ctx) => `決め方のクセを知っておくと、大事な場面で迷いにくくなります。${firstHypothesis(ctx, ['work_pace', 'self_decide'])}`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'dec:consult')) p.push(tip('相談するときは「どうしたらいい？」より「AとB、どっちが私らしい？」と聞くと、自分で決めた感覚が残ります。'));
      if (has(ctx, 'dec:hesitate')) p.push(tip('迷いが長引くときは、「決める期限」を先に決めておくのがおすすめ。'));
      return p;
    },
    related: ['backfire', 'challenge', 'decide_self'],
  },
  {
    id: 'stress',
    theme: 'work',
    title: 'ストレスを感じやすい状況',
    ask: '何に疲れやすい？',
    traits: ['work_collab', 'work_structure'],
    maxQuestions: 2,
    emphasis: 'caution',
    intro: (ctx) => `ストレスのもとがわかると、対策が立てやすくなります。${firstHypothesis(ctx, ['work_collab', 'work_structure'])}`,
    extras: stressExtras,
    related: ['avoid', 'energy', 'people'],
  },
  {
    id: 'backfire',
    theme: 'work',
    title: '強みが裏目に出る条件',
    ask: '強みが空回りするのはどんなとき？',
    traits: ['work_pace', 'rel_role', 'self_decide'],
    maxQuestions: 3,
    emphasis: 'caution',
    intro: (ctx) => `どんな強みにも、裏目に出やすい条件があります。あなたの命式から読める強みのひとつは「${dm(ctx).strengths[0]}」。その裏側を見ていきましょう。`,
    extras: (ctx) => [{ kind: 'caution', text: dm(ctx).cautions[0], source: 'chart' }],
    related: ['strengths', 'decide', 'people'],
  },
  {
    id: 'next',
    theme: 'work',
    title: '次の一手',
    ask: '次に何をすればいい？',
    traits: ['work_drive', 'self_decide'],
    maxQuestions: 3,
    emphasis: 'tip',
    intro: (ctx) => `次の一手は、大きな決断より「小さく試せること」から。${firstHypothesis(ctx, ['work_drive', 'self_decide'])}`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'career:grow')) p.push(tip('今週、今の仕事で「ひとつだけ工夫できること」を決めてみて。'));
      if (has(ctx, 'career:change') || has(ctx, 'career:indie')) p.push(tip('興味のある分野の人に、1人だけ話を聞いてみるのがおすすめの一手。'));
      if (has(ctx, 'career:explore')) p.push(tip('気になることを3つ書き出して、いちばん手軽なものを今月中に試してみて。'));
      return p;
    },
    related: ['challenge', 'career', 'year'],
  },

  // ================= 人間関係 =================
  {
    id: 'friends',
    theme: 'relations',
    title: '友達との関係',
    ask: '友達との付き合い方、これでいい？',
    traits: ['rel_circle', 'rel_role', 'rel_conflict'],
    maxQuestions: 3,
    intro: (ctx) => dm(ctx).relations,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'fr:closer')) p.push(tip('仲良くなりたい人には、「この前の話の続き」をきっかけに声をかけると自然です。'));
      if (has(ctx, 'fr:tired')) p.push(tip('気をつかって疲れるときは、会う頻度を少し減らすだけでも楽になります。距離をとるのは悪いことではありません。'));
      if (has(ctx, 'fr:new')) p.push(tip('新しい友達は、「好きなこと」のつながりから生まれやすいもの。趣味の場に足を運んでみて。'));
      return p;
    },
    related: ['role', 'conflict', 'energy'],
  },
  {
    id: 'family',
    theme: 'relations',
    title: '家族との関係',
    ask: '家族との距離感が気になる',
    traits: ['rel_conflict'],
    maxQuestions: 2,
    intro: () => '家族との関係は、近いからこそ難しいこともあります。ここでは、あなたが楽になるためのヒントを探します。',
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'fam:close')) p.push(note('何でも話せる家族は、大きな安心の土台。その安心感を、ほかの人間関係にも活かせそうです。'));
      if (has(ctx, 'fam:moderate')) p.push(note('ほどよい距離は、お互いを尊重できている証拠かもしれません。'));
      if (has(ctx, 'fam:careful')) p.push(tip('気をつかう相手には、「話す内容」より「話す時間」を短くするのも一つの方法です。'));
      if (has(ctx, 'fam:distance') || has(ctx, 'fam:careful'))
        p.push(note('つらさが続くときは、ひとりで抱えずに、信頼できる人や学校・地域の相談窓口に話してみてください。', 'chart'));
      return p;
    },
    related: ['conflict', 'energy', 'true_self'],
  },
  {
    id: 'role',
    theme: 'relations',
    title: 'グループでの役割',
    ask: 'グループで、どんな役まわり？',
    traits: ['rel_role', 'rel_circle'],
    maxQuestions: 2,
    intro: (ctx) => `グループの中の役割には、その人らしさが出ます。${firstHypothesis(ctx, ['rel_role', 'rel_circle'])}`,
    related: ['friends', 'people', 'conflict'],
  },
  {
    id: 'conflict',
    theme: 'relations',
    title: 'すれ違ったとき',
    ask: 'すれ違ったとき、どうすればいい？',
    traits: ['rel_conflict', 'rel_role'],
    maxQuestions: 2,
    intro: (ctx) => `すれ違いの解き方は、人によって「得意なタイミング」が違います。${firstHypothesis(ctx, ['rel_conflict'])}`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'hide')) p.push(tip('飲みこみやすいなら、その日のうちにメモに書くだけでも気持ちが整理されます。'));
      if (has(ctx, 'distance')) p.push(note('距離をおくのは、関係を守るための選択でもあります。戻るタイミングは自分で決めて大丈夫。'));
      return p;
    },
    related: ['friends', 'partner', 'people'],
  },

  // ================= 自分 =================
  {
    id: 'true_self',
    theme: 'self',
    title: '本当の自分',
    ask: '人から見た私と、本当の私',
    traits: ['self_energy', 'self_decide'],
    maxQuestions: 3,
    intro: (ctx) => `${dm(ctx).essence} ${dm(ctx).self}`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'gapk:sensitive')) p.push(note('明るさと繊細さ、どちらも本当のあなた。繊細な部分を見せられる人が1人いると、ぐっと楽になります。'));
      if (has(ctx, 'gapk:soft')) p.push(tip('しっかり者ほど、甘える練習が必要かも。「ちょっと手伝って」から始めてみて。'));
      if (has(ctx, 'gapk:passion')) p.push(note('静かな熱さは、ここぞという場面で大きな力になります。熱くなれるものを大切に。'));
      if (has(ctx, 'gapk:warm')) p.push(tip('情の厚さは、言葉にするともっと伝わります。「心配してたよ」のひと言を惜しまずに。'));
      if (has(ctx, 'gap:none')) p.push(note('印象と本当の自分が近いのは、自然体でいられている証拠です。'));
      return p;
    },
    related: ['energy', 'decide_self', 'love_style'],
  },
  {
    id: 'energy',
    theme: 'self',
    title: '元気の回復法',
    ask: '疲れたとき、どう回復する？',
    traits: ['self_energy', 'rel_circle'],
    maxQuestions: 2,
    intro: (ctx) => `元気の回復法は、人によって正反対のことも。${firstHypothesis(ctx, ['self_energy', 'rel_circle'])}`,
    related: ['true_self', 'stress', 'balance'],
  },
  {
    id: 'decide_self',
    theme: 'self',
    title: '決め方のクセ',
    ask: '迷ったとき、何を頼りにしてる？',
    traits: ['self_decide'],
    maxQuestions: 2,
    intro: (ctx) => `決め方にも、その人らしさがあります。${firstHypothesis(ctx, ['self_decide'])}`,
    related: ['decide', 'true_self', 'direction'],
  },

  // ================= 人生 =================
  {
    id: 'year',
    theme: 'life',
    title: '今年と来年の流れ',
    ask: 'これからの運勢は？',
    traits: ['life_mode'],
    maxQuestions: 1,
    special: 'yearly',
    intro: () => 'その年の干支と、あなたの日干との関係から「その年のテーマ」を読みます。良い・悪いではなく、流れのイメージとして楽しんでください。',
    related: ['direction', 'next', 'balance'],
  },
  {
    id: 'direction',
    theme: 'life',
    title: 'これからの方向性',
    ask: 'これから、どっちに進めばいい？',
    traits: ['life_mode', 'work_drive', 'self_decide'],
    maxQuestions: 3,
    emphasis: 'tip',
    intro: (ctx) => `方向性は、一度決めたら変えられないものではありません。${firstHypothesis(ctx, ['life_mode', 'self_decide'])}`,
    extras: (ctx) => {
      const p: ResultPoint[] = [];
      if (has(ctx, 'life:rest')) p.push(note('休みたいと感じているなら、それ自体が大事なサイン。休むことも、前に進むための準備です。'));
      if (has(ctx, 'focus:love')) p.push(tip('今は恋愛やパートナーとの関係に目を向ける時期。「恋愛・結婚・相性」のテーマもめくってみて。'));
      if (has(ctx, 'focus:work')) p.push(tip('今は仕事や学びに力を入れたい時期。「仕事・才能・キャリア」のテーマで強みを確認してみて。'));
      if (has(ctx, 'focus:relations')) p.push(tip('今は人とのつながりを大切にしたい時期。「人間関係」のテーマもおすすめです。'));
      if (has(ctx, 'focus:self')) p.push(tip('今は自分の心と体を大切にしたい時期。「本当の自分」のテーマで、充電の仕方を見てみて。'));
      return p;
    },
    related: ['year', 'next', 'true_self'],
  },
  {
    id: 'balance',
    theme: 'life',
    title: '人生のバランス',
    ask: '仕事、恋愛、自分。バランスのとり方は？',
    traits: ['life_mode', 'self_energy'],
    maxQuestions: 3,
    intro: (ctx) => {
      const counts = ctx.chart.elementCounts;
      const spread = Math.max(...counts) - Math.min(...counts);
      return spread >= 3
        ? 'あなたの命式は、五行の偏りがはっきりしたタイプ。得意なことに集中しやすい反面、バランスを意識すると楽になる場面もありそうです。'
        : 'あなたの命式は、五行が比較的まんべんなく入ったタイプ。いろいろなことをバランスよくこなせる素質がありそうです。';
    },
    related: ['energy', 'direction', 'year'],
  },
];

function stressExtras(ctx: DiagnosisContext): ResultPoint[] {
  const p: ResultPoint[] = [];
  if (has(ctx, 'stress:micro')) p.push(tip('細かい管理がつらいなら、先に「進め方の提案」を出してしまうと、任せてもらいやすくなります。'));
  if (has(ctx, 'stress:vague')) p.push(tip('ゴールがあいまいなときは、「完成したらどうなっていればOK？」を最初に確認しましょう。'));
  if (has(ctx, 'stress:people')) p.push(tip('人への気づかいで疲れるなら、ひとりで集中できる時間をカレンダーに先に確保しておくのがおすすめ。'));
  if (has(ctx, 'stress:routine')) p.push(tip('くり返しがつらいなら、毎回ひとつだけ「やり方を変えてみる」実験をすると楽しくなります。'));
  if (has(ctx, 'stress:change')) p.push(tip('急な変更がつらいなら、「変わりそうなところ」と「変わらないところ」を早めに確認しておくと安心です。'));
  return p;
}

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<string, TopicDef>;

export function topicsOfTheme(theme: ThemeId): TopicDef[] {
  return TOPICS.filter((t) => t.theme === theme);
}
