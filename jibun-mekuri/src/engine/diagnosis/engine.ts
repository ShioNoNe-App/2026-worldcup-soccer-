// 適応的な質問エンジン。
// 回答の履歴から人物像の仮説を毎回組み立て直し（純粋関数）、次に聞く質問を選ぶ。
import type { ChartAnalysis } from '../bazi/analysis';
import { QUESTION_BY_ID, QUESTIONS } from '../../content/questions';
import { TOPIC_BY_ID, TOPICS } from '../../content/topics';
import { TRAIT_BY_ID, TRAIT_IDS } from '../../content/traits';
import { localizeQuestion, traitText } from '../../content/localize';
import type { Lang } from '../../i18n/lang';
import { combinedPriors } from './priors';
import type {
  Answers,
  ExtraSources,
  ThemeId,
  DiagnosisContext,
  OptionDef,
  QuestionDef,
  TraitId,
  TraitMap,
  TraitState,
  TraitStatus,
  TopicDef,
} from './types';

export const HYPOTHESIS_THRESHOLD = 0.2;
export const CHECK_PREFIX = 'check:';

// ---- 仮説の確認質問（命式からの仮説を本人に聞く） ----

export function checkQuestionFor(trait: TraitId, prior: number, topics: string[] = []): QuestionDef {
  const def = TRAIT_BY_ID[trait];
  const sign = prior >= 0 ? 1 : -1;
  const pole = sign > 0 ? def.pos : def.neg;
  return {
    id: CHECK_PREFIX + trait,
    theme: def.theme,
    topics,
    text: `占いでは「${pole.keyword}」の傾向が出ています。心当たりはありますか？`,
    sub: pole.summary,
    targets: [trait],
    checkPole: sign > 0 ? 'pos' : 'neg',
    options: [
      { id: 'yes2', label: 'すごくある！', effects: { [trait]: 0.9 * sign }, reaction: 'やっぱり！' },
      { id: 'yes1', label: 'ちょっとある', effects: { [trait]: 0.5 * sign }, reaction: 'ふむふむ、少しね。' },
      { id: 'no', label: 'あまりない', effects: { [trait]: -0.4 * sign }, reaction: 'そっか、違う面もあるんだね。' },
      {
        id: 'wrong',
        label: '全然ちがう',
        kind: 'none',
        effects: { [trait]: -0.7 * sign },
        rejects: trait,
        reaction: '教えてくれてありがとう。この解釈は押しつけないね。',
      },
      { id: 'unknown', label: 'わからない', kind: 'unknown' },
    ],
  };
}

export function isCheckQuestion(id: string): boolean {
  return id.startsWith(CHECK_PREFIX);
}

/** 回答履歴にある質問IDから定義を引く（確認質問は命式の仮説から再生成） */
export function resolveQuestion(id: string, priors: Record<TraitId, { value: number }>): QuestionDef | undefined {
  if (isCheckQuestion(id)) {
    const trait = id.slice(CHECK_PREFIX.length) as TraitId;
    if (!TRAIT_BY_ID[trait]) return undefined;
    return checkQuestionFor(trait, priors[trait].value);
  }
  return QUESTION_BY_ID[id];
}

export function findOption(q: QuestionDef, optionId: string): OptionDef | undefined {
  return q.options.find((o) => o.id === optionId);
}

// ---- 仮説の組み立て ----

function statusOf(prior: number, self: number | null, rejected: boolean): TraitStatus {
  const hasPrior = Math.abs(prior) >= HYPOTHESIS_THRESHOLD;
  if (self === null) {
    if (rejected) return 'different';
    return hasPrior ? 'hypothesis' : 'unexplored';
  }
  if (!hasPrior) return 'specified';
  if (rejected) return 'different';
  if (Math.abs(self) < HYPOTHESIS_THRESHOLD) return 'specified';
  return Math.sign(self) === Math.sign(prior) ? 'matched' : 'different';
}

export function buildContext(chart: ChartAnalysis, answers: Answers, sources: ExtraSources = {}): DiagnosisContext {
  const { priors, systems } = combinedPriors(chart, sources);
  const sums: Partial<Record<TraitId, { total: number; n: number }>> = {};
  const unsure: Partial<Record<TraitId, number>> = {};
  const rejected = new Set<TraitId>();
  const tags = new Set<string>();
  const evidence: Partial<Record<TraitId, { qid: string; optionId: string }[]>> = {};

  const ordered = Object.entries(answers).sort((a, b) => a[1].at - b[1].at);
  for (const [qid, rec] of ordered) {
    const q = resolveQuestion(qid, priors);
    if (!q) continue;
    const opt = findOption(q, rec.optionId);
    if (!opt) continue;
    opt.tags?.forEach((t) => tags.add(t));
    if (opt.rejects) rejected.add(opt.rejects);
    if (opt.kind === 'unknown') q.targets.forEach((t) => (unsure[t] = (unsure[t] ?? 0) + 1));
    for (const [trait, v] of Object.entries(opt.effects ?? {}) as [TraitId, number][]) {
      (evidence[trait] ??= []).push({ qid, optionId: rec.optionId });
      const s = (sums[trait] ??= { total: 0, n: 0 });
      s.total += v;
      s.n += 1;
    }
  }

  const traits = {} as TraitMap;
  for (const id of TRAIT_IDS) {
    const prior = priors[id].value;
    const s = sums[id];
    const self = s ? Math.max(-1, Math.min(1, s.total / s.n)) : null;
    const isRejected = rejected.has(id);
    const effectivePrior = isRejected ? 0 : prior;
    const state: TraitState = {
      id,
      prior,
      basis: priors[id].basis,
      self,
      selfCount: s?.n ?? 0,
      rejected: isRejected,
      unsure: unsure[id] ?? 0,
      status: statusOf(prior, self, isRejected),
      value: self === null ? effectivePrior : self * 0.75 + effectivePrior * 0.25,
      evidence: evidence[id] ?? [],
    };
    traits[id] = state;
  }
  return { chart, traits, tags, answers, sources, systems };
}

/** 別の角度からも答えてもらい、十分にわかった特性 */
export function isTraitWellKnown(t: TraitState): boolean {
  return t.selfCount >= 2 || t.rejected || t.unsure >= 2;
}

/** 特性について回答がある（確認質問はもう聞かなくてよい） */
export function isTraitSettled(t: TraitState): boolean {
  return t.self !== null || t.rejected || t.unsure >= 2;
}

// ---- 次の質問の選択 ----

export function questionsForTopic(topicId: string, ctx: DiagnosisContext): QuestionDef[] {
  const topic = TOPIC_BY_ID[topicId];
  if (!topic) return [];
  const statics = QUESTIONS.filter((q) => q.topics.includes(topicId));
  const checks = topic.traits
    .filter((t) => {
      const s = ctx.traits[t];
      return s.status === 'hypothesis' && Math.abs(s.prior) >= 0.3;
    })
    .map((t) => checkQuestionFor(t, ctx.traits[t].prior, [topicId]));
  return [...statics, ...checks];
}

function isEligible(q: QuestionDef, ctx: DiagnosisContext): boolean {
  if (ctx.answers[q.id]) return false;
  if (q.requiresAnyTag && !q.requiresAnyTag.some((t) => ctx.tags.has(t))) return false;
  if (q.excludesTags?.some((t) => ctx.tags.has(t))) return false;
  if (q.fact || q.targets.length === 0) return true;
  // 確認質問は一度わかれば十分。通常の質問は、同じ特性を2回まで別の角度から聞いて精度を上げる
  if (isCheckQuestion(q.id)) return !q.targets.every((t) => isTraitSettled(ctx.traits[t]));
  return !q.targets.every((t) => isTraitWellKnown(ctx.traits[t]));
}

function score(q: QuestionDef, ctx: DiagnosisContext, topicTraits: TraitId[]): number {
  let s = (q.priority ?? 0) * 10;
  if (isCheckQuestion(q.id)) {
    // 確認質問は「え、なんでわかるの？」の驚きを生むので、仮説が強いほど先に
    s += 6 + Math.abs(ctx.traits[q.targets[0]].prior) * 10;
  }
  for (const t of q.targets) {
    const st = ctx.traits[t];
    if (isTraitSettled(st)) continue;
    s += topicTraits.includes(t) ? 5 - topicTraits.indexOf(t) * 0.5 : 1;
  }
  return s;
}

/** このトピックで回答済みの質問数 */
export function answeredInTopic(topicId: string, answers: Answers): number {
  return Object.values(answers).filter((a) => a.topic === topicId).length;
}

function pickBest(candidates: QuestionDef[], ctx: DiagnosisContext, traits: TraitId[]): QuestionDef | null {
  if (candidates.length === 0) return null;
  // 安定した順序のため、同点は定義順
  let best = candidates[0];
  let bestScore = score(best, ctx, traits);
  for (const q of candidates.slice(1)) {
    const sc = score(q, ctx, traits);
    if (sc > bestScore) {
      best = q;
      bestScore = sc;
    }
  }
  return best;
}

/** トピックの次の質問。トピック内の質問は、聞く必要があるものを最後まで続けて聞く（途中で区切らない） */
export function nextQuestion(topicId: string, ctx: DiagnosisContext): QuestionDef | null {
  const topic = TOPIC_BY_ID[topicId];
  if (!topic) return null;
  return pickBest(
    questionsForTopic(topicId, ctx).filter((q) => isEligible(q, ctx)),
    ctx,
    topic.traits,
  );
}

/** まだ聞く予定の質問数（回答によって省略されることがあるので「約」） */
export function remainingQuestions(topicId: string, ctx: DiagnosisContext): number {
  return availableQuestions(topicId, ctx);
}

export function availableQuestions(topicId: string, ctx: DiagnosisContext): number {
  return questionsForTopic(topicId, ctx).filter((q) => isEligible(q, ctx)).length;
}

// ---- テーマをまとめて答える ----

/** テーマの最初に聞く「今の状況」の質問（トピックの出し分けに使う） */
export function themeIntroQuestions(theme: ThemeId): QuestionDef[] {
  return QUESTIONS.filter((q) => q.topics.includes(`theme:${theme}`));
}

/** まとめて答えるときに含めるトピック（状況に合わないトピックは除く） */
export function themeRunTopics(theme: ThemeId, ctx: DiagnosisContext): TopicDef[] {
  return TOPICS.filter(
    (t) => t.theme === theme && t.special !== 'compat' && t.special !== 'blood' && (!t.gate || t.gate.some((tag) => ctx.tags.has(tag))),
  );
}

export interface ThemeStep {
  question: QuestionDef;
  /** 回答を記録するトピック */
  topic: string;
}

export function nextThemeStep(theme: ThemeId, ctx: DiagnosisContext): ThemeStep | null {
  const intro = themeIntroQuestions(theme).filter((q) => isEligible(q, ctx));
  if (intro.length > 0) return { question: intro[0], topic: `theme:${theme}` };
  for (const topic of themeRunTopics(theme, ctx)) {
    const q = nextQuestion(topic.id, ctx);
    if (q) return { question: q, topic: topic.id };
  }
  return null;
}

/** テーマで、まだ聞く予定の質問（重複を除く） */
export function themeRemainingIds(theme: ThemeId, ctx: DiagnosisContext): Set<string> {
  const ids = new Set<string>();
  themeIntroQuestions(theme)
    .filter((q) => isEligible(q, ctx))
    .forEach((q) => ids.add(q.id));
  for (const topic of themeRunTopics(theme, ctx)) {
    questionsForTopic(topic.id, ctx)
      .filter((q) => isEligible(q, ctx))
      .forEach((q) => ids.add(q.id));
  }
  return ids;
}

/** テーマで、まだ聞く予定の質問数（重複を除いた概算） */
export function themeRemaining(theme: ThemeId, ctx: DiagnosisContext): number {
  return themeRemainingIds(theme, ctx).size;
}

/** テーマで回答済みの質問数 */
export function themeAnswered(theme: ThemeId, answers: Answers): number {
  const topics = new Set([`theme:${theme}`, ...TOPICS.filter((t) => t.theme === theme).map((t) => t.id)]);
  return Object.values(answers).filter((a) => topics.has(a.topic)).length;
}

// ---- 回答への反応 ----

export interface AnswerFeedback {
  reaction: string | null;
  keyword: string | null;
  /** 回答で新しく具体化・変化した特性 */
  changedTraits: TraitId[];
}

export function poleOf(value: number): 'pos' | 'neg' | 'mid' {
  if (value >= HYPOTHESIS_THRESHOLD) return 'pos';
  if (value <= -HYPOTHESIS_THRESHOLD) return 'neg';
  return 'mid';
}

export function keywordOf(t: TraitState, lang: Lang = 'ja'): string {
  const def = traitText(t.id, lang);
  const pole = poleOf(t.value);
  return pole === 'mid' ? def.mid.keyword : def[pole].keyword;
}

export function feedbackFor(
  before: DiagnosisContext,
  after: DiagnosisContext,
  q: QuestionDef,
  optionId: string,
  lang: Lang = 'ja',
): AnswerFeedback {
  const opt = findOption(localizeQuestion(q, lang), optionId);
  const changed = TRAIT_IDS.filter((id) => {
    const a = before.traits[id];
    const b = after.traits[id];
    return a.status !== b.status || poleOf(a.value) !== poleOf(b.value);
  });
  let keyword = opt?.keyword ?? null;
  if (!keyword) {
    const target = changed.find((id) => after.traits[id].self !== null);
    if (target) keyword = keywordOf(after.traits[target], lang);
  }
  return { reaction: opt?.reaction ?? null, keyword, changedTraits: changed };
}
