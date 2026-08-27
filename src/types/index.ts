export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isPremium: boolean;
  premiumExpiresAt: string | null; // ISO Date string
  dailyExamAttemptsRemaining?: number;
  lastAttemptDate?: string;
  isBanned?: boolean;
  appliedPromoCode?: string;
  createdAt?: string; // ISO Date string
  lastLoginAt?: string; // ISO Date string
}

export interface PromoCode {
  id: string;
  code: string;
  durationDays: number;
  maxUses: number;
  usedCount: number;
  createdDate: string;
  usedByEmails: string[];
  active: boolean;
  partnerName?: string;
  partnerLink?: string;
  partnerLinkTitle?: string;
  description?: string;
  discountPercent?: number;
}

export interface TaskComment {
  id: string;
  testId: string;
  tileType: string;
  variantId: string;
  targetKey: string; // "testId_tileType_variantId"
  userId: string;
  userName: string;
  userRole?: 'user' | 'admin';
  userEmail?: string;
  content: string;
  upvotes: number;
  upvotedBy: string[];
  isVerified?: boolean;
  isPinned?: boolean;
  createdAt: string;
}

export type TileType = 
  | 'lesen_1'
  | 'lesen_2'
  | 'lesen_3'
  | 'lesen_4'
  | 'lesen_schreiben'
  | 'hoeren_1'
  | 'hoeren_2'
  | 'hoeren_3'
  | 'hoeren_4'
  | 'hoeren_schreiben'
  | 'sprachbausteine_1'
  | 'sprachbausteine_2';

export interface Lesen1Variant {
  id: string;
  title: string;
  textBlock: string; // continuous text with 1-5 items
  headingsBlock: string; // A-H text
  correctAnswers: Record<string, string>; // e.g. { "1": "A", "2": "C", "3": "F", "4": "B", "5": "H" }
}

export interface Lesen2Variant {
  id: string;
  title: string;
  text1: string;
  q6Text?: string; // Aussage/Fragetext 6
  q6Correct: 'richtig' | 'falsch';
  q7: {
    questionText: string;
    options: [string, string, string]; // A, B, C
    correctIndex: number; // 0, 1, 2
  };
  text2: string;
  q8Text?: string; // Aussage/Fragetext 8
  q8Correct: 'richtig' | 'falsch';
  q9: {
    questionText: string;
    options: [string, string, string];
    correctIndex: number;
  };
}

export interface Lesen3Variant {
  id: string;
  title: string;
  text1: string;
  text2: string;
  optionsAtoF: string;
  correctAnswers: Record<string, string>; // { "10": "A", "11": "X", "12": "D", "13": "E" }
}

export interface QuestionABC {
  id: number;
  questionText: string;
  options: [string, string, string];
  correctIndex: number;
}

export interface Lesen4Variant {
  id: string;
  title: string;
  protocolText: string;
  questions: QuestionABC[]; // Q14-18
}

export interface LesenSchreibenVariant {
  id: string;
  title: string;
  emailsText: string;
  questions: QuestionABC[]; // Q19-20
  beschwerdeTopicText: string; // Q21 topic
}

export interface Hoeren1Question {
  id: number; // 22..27
  type: 'richtig_falsch' | 'choice';
  questionText: string;
  options?: [string, string, string];
  correct: 'richtig' | 'falsch' | number; // index or string
}

export interface Hoeren1Variant {
  id: string;
  title: string;
  audioUrl?: string;
  scriptText?: string;
  questions: Hoeren1Question[];
}

export interface Hoeren2Variant {
  id: string;
  title: string;
  audioUrl?: string;
  scriptText: string;
  optionsAtoF: string;
  correctAnswers: Record<string, string>; // { "28": "A", "29": "C", ... }
}

export interface Hoeren3Variant {
  id: string;
  title: string;
  audioUrl?: string;
  scriptText: string;
  questions: QuestionABC[]; // Q32-35
}

export interface Hoeren4Variant {
  id: string;
  title: string;
  audioUrl?: string;
  scriptText: string;
  questions: QuestionABC[]; // Q36-40
}

export interface HoerenSchreibenVariant {
  id: string;
  title: string;
  audioUrl?: string;
  scriptText: string;
  q41Text?: string;
  q41Options?: [string, string, string];
  q41Correct: 'a' | 'b' | 'c';
  fields: Array<{ label: string; key: string }>; // Q42-45 fields (e.g. Name, Telefonnummer...)
}

export interface Sprachbausteine1Variant {
  id: string;
  title: string;
  textWithGaps: string; // contains [46], [47], [48], [49], [50], [51]
  correctAnswers: Record<number, string>; // { 46: "geehrt", ... }
  extraDistractors: string[];
}

export interface Sprachbausteine2Variant {
  id: string;
  title: string;
  textWithGaps: string; // contains [52]...[57]
  questions: QuestionABC[]; // Q52-57
}

export interface ModelltestVariants {
  lesen_1: Lesen1Variant[];
  lesen_2: Lesen2Variant[];
  lesen_3: Lesen3Variant[];
  lesen_4: Lesen4Variant[];
  lesen_schreiben: LesenSchreibenVariant[];
  hoeren_1: Hoeren1Variant[];
  hoeren_2: Hoeren2Variant[];
  hoeren_3: Hoeren3Variant[];
  hoeren_4: Hoeren4Variant[];
  hoeren_schreiben: HoerenSchreibenVariant[];
  sprachbausteine_1: Sprachbausteine1Variant[];
  sprachbausteine_2: Sprachbausteine2Variant[];
}

export interface Modelltest {
  id: string;
  title: string;
  description: string;
  isPremium: boolean;
  isHidden?: boolean;
  variants: ModelltestVariants;
}

export interface ForumsbeitragTopic {
  id: string;
  title: string;
  promptText: string;
  isPremium?: boolean;
}

export interface SprechenTopic {
  id: string;
  title: string;
  promptText: string;
}

export interface WrittenEssayRecord {
  id: string;
  userId: string;
  date: string;
  type: 'beschwerde' | 'forumsbeitrag';
  topicTitle: string;
  text: string;
  charCount: number;
}

export interface TileResult {
  userId?: string;
  tileType: TileType;
  modelltestId: string;
  variantId: string;
  score: number;
  maxScore: number;
  completedAt: string;
}

export interface FullExamResult {
  id: string;
  userId: string;
  date: string;
  totalScore: number;
  maxTotalScore: number;
  passed: boolean;
  tileBreakdown: Array<{
    tileType: TileType;
    score: number;
    maxScore: number;
  }>;
}

export interface TrainingStatsSummary {
  startedCount: number;
  completedCount: number;
  tileSuccessRate: Record<TileType, { total: number; correct: number }>;
  premiumAttemptsCount: number;
  freeAttemptsCount: number;
}

export type WortschatzCategory = 'nvv' | 'redemittel' | 'praepositionen' | 'geschaeft' | 'konnektoren' | 'kollokationen';

export interface WortschatzItem {
  id: string;
  term: string;
  category: WortschatzCategory;
  grammar?: string;
  simpleMeaning: string;
  synonyms?: string;
  exampleSentence: string;
  gapExample?: string;
  gapAnswer?: string;
  gapOptions?: string[];
  translations: {
    ua?: string;
    en?: string;
    ru?: string;
    tr?: string;
    ar?: string;
    es?: string;
    [key: string]: string | undefined;
  };
  orderIndex?: number;
  createdAt?: string;
}

export type BlogPostCategory =
  | 'Prüfungsratgeber'
  | 'Schreiben'
  | 'Wortschatz'
  | 'Sprechen'
  | 'Hören'
  | 'Lesen'
  | 'Grammatik';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown / structured post content
  category: BlogPostCategory;
  readTime: string;
  date: string;
  author: string;
  seoKeywords: string[];
  coverEmoji?: string;
  published: boolean;
  orderIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

