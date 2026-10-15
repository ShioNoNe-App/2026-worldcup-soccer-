// 命式の計算結果（五行・通変星・年運・相性）に対応する解釈文。
import type { BranchRelation, StarGroup, StemRelation, TenGod } from '../engine/bazi/analysis';
import type { TraitId } from '../engine/diagnosis/types';

export interface StarGroupContent {
  name: string;
  stars: string;
  keyword: string;
  strong: string;
  /** 星が多いときの仮説（数に応じて強める） */
  priors: Partial<Record<TraitId, number>>;
}

export const STAR_GROUPS: Record<StarGroup, StarGroupContent> = {
  self: {
    name: '自分の星',
    stars: '比肩・劫財',
    keyword: 'マイペース',
    strong: '自分の考えをしっかり持ち、自分の足で立とうとする力が強めに出ています。',
    priors: { love_distance: -1, work_collab: -0.8, love_lead: 0.8 },
  },
  expression: {
    name: '表現の星',
    stars: '食神・傷官',
    keyword: '表現力',
    strong: '感じたことを言葉や形にする力が強めに出ています。センスやアイデアで人を楽しませられるかも。',
    priors: { love_express: 1, work_structure: -0.8, self_energy: 0.5 },
  },
  wealth: {
    name: '現実の星',
    stars: '偏財・正財',
    keyword: '現実感覚',
    strong: '人や物事を上手にやりくりする、現実的なバランス感覚が強めに出ています。',
    priors: { marriage_view: 1, work_drive: 0.6 },
  },
  authority: {
    name: '責任の星',
    stars: '偏官・正官',
    keyword: '責任感',
    strong: '期待に応えようとする責任感や、ルールを大切にする力が強めに出ています。',
    priors: { work_structure: 1, rel_conflict: -0.6, love_reassure: 0.6 },
  },
  learning: {
    name: '学びの星',
    stars: '偏印・印綬',
    keyword: '探究心',
    strong: '知ること・考えることへの関心が強めに出ています。納得するまで深く掘り下げたいタイプかも。',
    priors: { work_pace: -1, self_decide: -0.8, self_energy: -0.6 },
  },
};

export interface ElementContent {
  name: string;
  image: string;
  many: string;
  none: string;
  prior?: Partial<Record<TraitId, number>>;
}

export const ELEMENTS: ElementContent[] = [
  {
    name: '木',
    image: '成長',
    many: '「伸びたい・広げたい」エネルギーが多め。新しいことへの意欲が出やすそう。',
    none: '「木」がない命式。成長を急がず、自分のペースで育てるくらいがちょうどいいかも。',
    prior: { life_mode: 0.15 },
  },
  {
    name: '火',
    image: '情熱',
    many: '「燃える・照らす」エネルギーが多め。気持ちが表に出やすく、ノリのよさが魅力に。',
    none: '「火」がない命式。熱さを外に出すより、静かに温めていくタイプかもしれません。',
    prior: { love_pace: 0.15, work_pace: 0.1 },
  },
  {
    name: '土',
    image: '安定',
    many: '「守る・育てる」エネルギーが多め。安定感があり、まわりの支えになりやすそう。',
    none: '「土」がない命式。ひとつの場所に縛られない身軽さが、あなたらしさかも。',
    prior: { marriage_view: 0.15 },
  },
  {
    name: '金',
    image: '決断',
    many: '「切る・決める」エネルギーが多め。白黒はっきりさせる判断力が強みになりそう。',
    none: '「金」がない命式。きっちり線を引くより、ゆるやかにつながる関係が得意かも。',
    prior: { rel_conflict: 0.15 },
  },
  {
    name: '水',
    image: '知恵',
    many: '「流れる・考える」エネルギーが多め。柔軟な発想と、深く考える力がありそう。',
    none: '「水」がない命式。考えこむより、まず動いて感じるほうが合っているかもしれません。',
    prior: { love_distance: -0.15 },
  },
];

/** 年運: その年の天干が日干に対して何の星にあたるか */
export const YEAR_THEMES: Record<TenGod, { title: string; text: string; hint: string }> = {
  hikenn: {
    title: '自分の足で立つ年',
    text: '「自分はどうしたいか」がはっきりしやすい流れ。仲間と肩を並べて進むイメージです。',
    hint: '人と比べず、自分のペースを守ることが追い風に。',
  },
  gouzai: {
    title: '仲間と競い合う年',
    text: 'いい意味でのライバルや仲間が刺激になりやすい流れ。勢いが出る一方、張り合いすぎには注意。',
    hint: '「勝つ」より「一緒に伸びる」を意識すると吉。',
  },
  shokujin: {
    title: '楽しみが広がる年',
    text: '好きなことや楽しいことに目が向きやすい流れ。自然体でいるほど、いいものが生まれやすそう。',
    hint: '「楽しい」と感じることに、少し多めに時間を使ってみて。',
  },
  shoukan: {
    title: '個性が光る年',
    text: '感性やアイデアが冴えやすい流れ。言いたいことが増えるぶん、伝え方がポイントに。',
    hint: '鋭いひと言は、やわらかい言葉で包んで届けて。',
  },
  henzai: {
    title: '動きと出会いの年',
    text: '人や物事が活発に動きやすい流れ。新しいつながりや、思わぬチャンスがありそう。',
    hint: '誘いには、まずは軽い気持ちで乗ってみるのが◎。',
  },
  seizai: {
    title: 'コツコツ実る年',
    text: '積み重ねてきたことが形になりやすい流れ。生活や仕事の足場を整えるのに向いています。',
    hint: '地道な習慣をひとつ決めると、ぐっと実りやすい。',
  },
  henkan: {
    title: 'チャレンジの年',
    text: 'ちょっとハードな課題や変化が来やすい流れ。乗りこえるたびに、たくましくなれそう。',
    hint: '無理をしすぎないよう、休む日を先に決めておいて。',
  },
  seikan: {
    title: '信頼が育つ年',
    text: '役割や責任を任されやすい流れ。きちんと応えるほど、まわりからの信頼が厚くなりそう。',
    hint: '「ちゃんとしすぎ」で疲れたら、肩の力を抜く時間を。',
  },
  henin: {
    title: 'ひらめきの年',
    text: '直感や独自の発想が冴えやすい流れ。新しい学びや、ひとりで考える時間が実りにつながりそう。',
    hint: '気になったことは、メモに残しておくと後で役立つかも。',
  },
  inju: {
    title: '学びと充電の年',
    text: '知識を吸収したり、支えられたりしやすい流れ。インプットを増やすのに向いています。',
    hint: '頼れる人や本に、遠慮なく頼ってみて。',
  },
};

export const YEAR_BRANCH_NOTES: Partial<Record<BranchRelation, string>> = {
  clash: 'また、この年の地支はあなたの日柱の地支と「冲（ちゅう）」の関係。環境や気持ちが動きやすいので、変化を前向きに使えるかがポイントです。',
  sixCombine: 'また、この年の地支はあなたの日柱の地支と「支合（しごう）」の関係。人とのご縁がつながりやすい年と読めます。',
  trine: 'また、この年の地支はあなたの日柱の地支と「三合（さんごう）」の仲間。流れに乗りやすい年と読めます。',
  same: 'また、この年の地支はあなたの日柱の地支と同じ。自分らしさが強く出やすい年と読めます。',
};

export const STEM_RELATION_TEXTS: Record<StemRelation, { title: string; text: string; tip: string }> = {
  combine: {
    title: '引き合うふたり（干合）',
    text: '二人の日干は「干合（かんごう）」という、引き合う組み合わせ。占いの解釈では、自然と気になったり、一緒にいると落ち着いたりしやすい関係とされます。',
    tip: '近づきやすいぶん、相手に合わせすぎていないかときどき振り返ってみて。',
  },
  same: {
    title: '似た者どうし（比和）',
    text: '二人の日干は同じ五行。占いの解釈では、価値観やペースが似ていて、わかり合いやすい関係とされます。',
    tip: '似ているからこそ、意見がぶつかったときは「どっちも正しい」から始めると◎。',
  },
  iGenerate: {
    title: 'あなたが与える関係（相生）',
    text: 'あなたの日干が、相手の日干を「生む」組み合わせ。占いの解釈では、あなたが相手を応援したり、支えたりしやすい関係とされます。',
    tip: '与えるのが得意なぶん、あなたが疲れていないかも大事にしてね。',
  },
  theyGenerate: {
    title: '支えてもらえる関係（相生）',
    text: '相手の日干が、あなたの日干を「生む」組み合わせ。占いの解釈では、相手からの支えや安心感を受けとりやすい関係とされます。',
    tip: '受けとった分の「ありがとう」を、言葉にして返すと関係が深まりそう。',
  },
  iControl: {
    title: '刺激し合う関係（相剋）',
    text: 'あなたの日干が、相手の日干を「剋す（コントロールする）」組み合わせ。占いの解釈では、あなたが主導権を握りやすく、相手にとって刺激になる関係とされます。',
    tip: 'リードするときほど、相手のペースを聞いてあげると心地よい関係に。',
  },
  theyControl: {
    title: '鍛え合う関係（相剋）',
    text: '相手の日干が、あなたの日干を「剋す」組み合わせ。占いの解釈では、相手から刺激や緊張感を受けとりやすく、成長につながる関係とされます。',
    tip: '「なんだか緊張する」は、意識している証拠かも。無理に合わせなくて大丈夫。',
  },
};

export const BRANCH_RELATION_TEXTS: Record<BranchRelation, string> = {
  sixCombine: '日柱の地支どうしは「支合（しごう）」。生活のリズムや居心地が合いやすい組み合わせと読めます。',
  clash: '日柱の地支どうしは「冲（ちゅう）」。正反対の部分があり、刺激的なぶん、ぶつかることもある組み合わせと読めます。違いを楽しめるかがポイント。',
  trine: '日柱の地支どうしは「三合（さんごう）」の仲間。同じ方向を向いて協力しやすい組み合わせと読めます。',
  same: '日柱の地支が同じ。似たところが多く、わかり合いやすい反面、同じところでつまずくことも。',
  neutral: '日柱の地支どうしには、特に強い結びつきや衝突の関係はありません。ふたりの関係は、日々の積み重ねで育っていくタイプです。',
};
