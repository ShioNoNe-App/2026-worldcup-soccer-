// 適応的な質問エンジン。
// 回答の履歴から人物像の仮説を毎回組み立て直し（純粋関数）、次に聞く質問を選ぶ。
import type { ChartAnalysis } from '../bazi/analysis';
import { QUESTION_BY_ID, QUESTIONS } from '../../content/questions';
import { TOPIC_BY_ID } from '../../content/topics';
import { TRAIT_BY_ID, TRAIT_IDS } from '../../content/traits';
import { priorsFromChart } from './priors';
import type {
  Answers,
  DiagnosisContext,
  OptionDef,
  QuestionDef,
  TraitId,
  TraitMap,
  TraitState,
  TraitStatus,
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

export function buildContext(chart: ChartAnalysis, answers: Answers): DiagnosisContext {
  const priors = priorsFromChart(chart);
  const sums: Partial<Record<TraitId, { total: number; n: number }>> = {};
  const unsure: Partial<Record<TraitId, number>> = {};
  const rejected = new Set<TraitId>();
  const tags = new Set<string>();

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
    };
    traits[id] = state;
  }
  return { chart, traits, tags, answers };
}

/** 特性について十分な情報がある（もう聞かなくてよい） */
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
  if (!q.fact && q.targets.length > 0 && q.targets.every((t) => isTraitSettled(ctx.traits[t]))) return false;
  return true;
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

export function nextQuestion(topicId: string, ctx: DiagnosisContext, extra = 0): QuestionDef | null {
  const topic = TOPIC_BY_ID[topicId];
  if (!topic) return null;
  if (answeredInTopic(topicId, ctx.answers) >= topic.maxQuestions + extra) return null;
  const candidates = questionsForTopic(topicId, ctx).filter((q) => isEligible(q, ctx));
  if (candidates.length === 0) return null;
  // 安定した順序のため、同点は定義順
  let best = candidates[0];
  let bestScore = score(best, ctx, topic.traits);
  for (const q of candidates.slice(1)) {
    const sc = score(q, ctx, topic.traits);
    if (sc > bestScore) {
      best = q;
      bestScore = sc;
    }
  }
  return best;
}

/** 残りの最大質問数（表示用。精度ではなく「あと何問まで」） */
export function remainingQuestions(topicId: string, ctx: DiagnosisContext, extra = 0): number {
  const topic = TOPIC_BY_ID[topicId];
  if (!topic) return 0;
  const left = topic.maxQuestions + extra - answeredInTopic(topicId, ctx.answers);
  return Math.max(0, Math.min(left, availableQuestions(topicId, ctx)));
}

/** 上限を考えずに、まだ聞ける質問の数（「もっと深掘り」できるか） */
export function availableQuestions(topicId: string, ctx: DiagnosisContext): number {
  return questionsForTopic(topicId, ctx).filter((q) => isEligible(q, ctx)).length;
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

export function keywordOf(t: TraitState): string {
  const def = TRAIT_BY_ID[t.id];
  const pole = poleOf(t.value);
  return pole === 'mid' ? def.mid.keyword : def[pole].keyword;
}

export function feedbackFor(before: DiagnosisContext, after: DiagnosisContext, q: QuestionDef, optionId: string): AnswerFeedback {
  const opt = findOption(q, optionId);
  const changed = TRAIT_IDS.filter((id) => {
    const a = before.traits[id];
    const b = after.traits[id];
    return a.status !== b.status || poleOf(a.value) !== poleOf(b.value);
  });
  let keyword = opt?.keyword ?? null;
  if (!keyword) {
    const target = changed.find((id) => after.traits[id].self !== null);
    if (target) keyword = keywordOf(after.traits[target]);
  }
  return { reaction: opt?.reaction ?? null, keyword, changedTraits: changed };
}
