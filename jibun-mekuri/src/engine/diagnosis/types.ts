// 診断エンジンの型定義。質問・選択肢・分岐条件・結果テンプレートはデータ（content/）で定義する。
import type { ChartAnalysis, StarGroup } from '../bazi/analysis';
import type { Element } from '../bazi/constants';

/** 日英併記のテキスト */
export interface L {
  ja: string;
  en: string;
}

export type ThemeId = 'love' | 'work' | 'relations' | 'self' | 'life';

export type TraitId =
  | 'love_pace'
  | 'love_express'
  | 'love_reassure'
  | 'love_distance'
  | 'love_lead'
  | 'marriage_view'
  | 'work_pace'
  | 'work_structure'
  | 'work_collab'
  | 'work_drive'
  | 'rel_role'
  | 'rel_circle'
  | 'rel_conflict'
  | 'self_energy'
  | 'self_decide'
  | 'life_mode';

export interface PoleText {
  /** 短いキーワード（例: ひとめぼれ体質） */
  keyword: string;
  /** 一文の説明 */
  summary: string;
  strength: string;
  caution: string;
  tip: string;
}

export interface TraitDef {
  id: TraitId;
  theme: ThemeId;
  /** 軸の名前（例: 好きになるスピード） */
  label: string;
  pos: PoleText;
  neg: PoleText;
  /** 中間（相手や状況による） */
  mid: { keyword: string; summary: string };
}

/** 仮説の根拠（表示時に言語に合わせて文章化する） */
export type BasisRef =
  | { kind: 'dayMaster'; stem: number }
  | { kind: 'group'; group: StarGroup; count: number }
  | { kind: 'element'; element: Element; count: number };

/** 命式から導いた仮説の初期値 */
export interface Prior {
  value: number;
  basis: BasisRef[];
}

export type TraitStatus =
  /** まだ情報がない */
  | 'unexplored'
  /** 命式からの仮説だけがある */
  | 'hypothesis'
  /** 仮説と回答が重なった */
  | 'matched'
  /** 仮説と回答が違った（または本人が否定した） */
  | 'different'
  /** 仮説はないが回答で見えてきた */
  | 'specified';

export interface TraitState {
  id: TraitId;
  prior: number;
  basis: BasisRef[];
  /** 本人の回答による位置（-1〜1）。未回答は null */
  self: number | null;
  selfCount: number;
  /** 「全然ちがう」で仮説を否定された */
  rejected: boolean;
  /** 「わからない」と答えた回数 */
  unsure: number;
  status: TraitStatus;
  /** 解釈に使う値 */
  value: number;
}

export type TraitMap = Record<TraitId, TraitState>;

export type OptionKind = 'normal' | 'unknown' | 'none' | 'skip';

export interface OptionDef {
  id: string;
  label: string;
  effects?: Partial<Record<TraitId, number>>;
  tags?: string[];
  kind?: OptionKind;
  /** キャラクターのひとこと */
  reaction?: string;
  /** 回答後に表示するキーワード */
  keyword?: string;
  /** 仮説の否定（確認質問のみ） */
  rejects?: TraitId;
}

export interface QuestionDef {
  id: string;
  theme: ThemeId;
  topics: string[];
  text: string;
  sub?: string;
  /** この質問で具体化される特性 */
  targets: TraitId[];
  options: OptionDef[];
  /** いずれかのタグが立っているときだけ出す */
  requiresAnyTag?: string[];
  /** いずれかのタグが立っていたら出さない */
  excludesTags?: string[];
  /** 状況を聞く質問。特性が判明済みでも省略しない */
  fact?: boolean;
  /** 大きいほど先に出る */
  priority?: number;
  /** 確認質問: どちらの向きの仮説を確かめているか */
  checkPole?: 'pos' | 'neg';
}

export interface AnswerRecord {
  optionId: string;
  topic: string;
  at: number;
}

export type Answers = Record<string, AnswerRecord>;

export interface DiagnosisContext {
  chart: ChartAnalysis;
  traits: TraitMap;
  tags: Set<string>;
  answers: Answers;
}

export type PointKind = 'strength' | 'caution' | 'tip' | 'note';
export type PointSource = 'chart' | 'answer' | 'both';

export interface ResultPoint {
  kind: PointKind;
  text: string;
  source: PointSource;
}

export type IntroDef =
  /** 日干の解釈文を使う */
  | { kind: 'dm'; field: 'love' | 'work' | 'relations' | 'essenceSelf' }
  /** 固定文＋（あれば）命式の仮説ひとこと＋後文 */
  | { kind: 'text'; text: L; hyp?: TraitId[]; after?: L }
  | { kind: 'backfire' }
  | { kind: 'balance' };

export interface ExtraDef {
  /** いずれかのタグが立っていれば追加（空配列なら常に） */
  any: string[];
  kind: PointKind;
  text: L;
  source?: PointSource;
}

export interface TopicDef {
  id: string;
  theme: ThemeId;
  title: L;
  /** 選択肢として表示する問いかけ */
  ask: L;
  traits: TraitId[];
  maxQuestions: number;
  /** テーマを開いたときの最初の解釈（命式ベース） */
  intro: IntroDef;
  /** 回答タグに応じた追加ポイント */
  extras?: ExtraDef[];
  /** 日干の強み・注意点を結果に加える */
  dmExtras?: ('strength0' | 'caution0')[];
  related: string[];
  special?: 'compat' | 'yearly';
  /** 結果で注意点を強調する（強みが裏目に出る条件など） */
  emphasis?: 'caution' | 'tip';
}

export interface TopicResult {
  topicId: string;
  headline: string;
  lead: string;
  points: ResultPoint[];
  keywords: string[];
  /** 何が具体化したかの説明 */
  progressNote: string;
}
