export type UserRole = 'USER' | 'ADMIN';
export type TaskType = 'MATCHING' | 'MULTIPLE_CHOICE' | 'SPRACHBAUSTEINE' | 'AUDIO_CHOICE';

// JSONB Content Payload Types (PRD Section 4)

export interface TaskTranslations {
  instructions?: Record<string, string>; // e.g. { uk: "Прочитайте тексти...", en: "Read the texts..." }
  explanations?: Record<string, string>; // e.g. { uk: "Пояснення: Слово X означає Y...", de: "Erklärung..." }
  sentence_translations?: Record<string, string>; // e.g. for text sentences or passage lines
}

export interface MatchingTaskContent {
  instructions: string;
  instructions_i18n?: Record<string, string>;
  explanation_i18n?: Record<string, string>;
  texts: Array<{
    id: string;
    text: string;
    translation_i18n?: Record<string, string>;
  }>;
  options: Array<{
    id: string;
    text: string;
    translation_i18n?: Record<string, string>;
  }>;
  correct_answers: Record<string, string>;
}

export interface SprachbausteineTaskContent {
  instructions: string;
  instructions_i18n?: Record<string, string>;
  explanation_i18n?: Record<string, string>;
  text_template: string;
  template_translation_i18n?: Record<string, string>;
  gaps: Record<
    string,
    {
      options: string[];
      correct: string;
      explanation_i18n?: Record<string, string>;
    }
  >;
}

export interface AudioChoiceTaskContent {
  instructions: string;
  instructions_i18n?: Record<string, string>;
  audio_url: string;
  play_limit: number;
  questions: Array<{
    id: string;
    text: string;
    translation_i18n?: Record<string, string>;
    options: string[];
    correct: string;
    explanation_i18n?: Record<string, string>;
  }>;
}

export interface MultipleChoiceTaskContent {
  instructions: string;
  instructions_i18n?: Record<string, string>;
  passage?: string;
  passage_translation_i18n?: Record<string, string>;
  questions: Array<{
    id: string;
    text: string;
    translation_i18n?: Record<string, string>;
    options: string[];
    correct: string;
    explanation_i18n?: Record<string, string>;
  }>;
}

export type TelcPartId =
  | 'TELC_L1'  // Lesen Teil 1 (Q1-5: Matching 1-5 to A-H)
  | 'TELC_L2'  // Lesen Teil 2 (Q6-9: Text Block 1 -> Q6 T/F, Q7 A/B/C; Text Block 2 -> Q8 T/F, Q9 A/B/C)
  | 'TELC_L3'  // Lesen Teil 3 (Q10-13: Matching 10-13 to A-F + Option X)
  | 'TELC_L4'  // Lesen Teil 4 (Q14-18: Protocol text + Q14-18 A/B/C)
  | 'TELC_LS'  // Lesen & Schreiben (Q19-20: 2 Emails + Q19-20 A/B/C)
  | 'TELC_H1'  // Hören Teil 1 (Q22-27: Audio + Q22 T/F, Q23 A/B/C; Q24 T/F, Q25 A/B/C; Q26 T/F, Q27 A/B/C)
  | 'TELC_H2'  // Hören Teil 2 (Q28-31: Audio + Statement matching A-F)
  | 'TELC_H3'  // Hören Teil 3 (Q32-35: Audio + Q32-35 A/B/C)
  | 'TELC_H4'  // Hören Teil 4 (Q36-40: Audio + Q36-40 A/B/C)
  | 'TELC_HS'  // Hören & Schreiben (Q41-45: Audio + Q41 A/B/C + Q42-45 Free Text Memo)
  | 'TELC_SB1' // Sprachbausteine Teil 1 (Q46-51: Text gaps [46]-[51] + Word Bank & Distractors)
  | 'TELC_SB2';// Sprachbausteine Teil 2 (Q52-57: Text gaps [52]-[57] + Q52-57 A/B/C dropdowns)

export interface TelcL2Content {
  telc_part: 'TELC_L2';
  instructions: string;
  instructions_i18n?: Record<string, string>;
  blocks: Array<{
    id: string;
    title: string;
    text: string;
    text_i18n?: Record<string, string>;
    tf_question: {
      id: string; // e.g. "q6" or "q8"
      text: string;
      correct: 'Richtig' | 'Falsch';
      explanation_i18n?: Record<string, string>;
    };
    mc_question: {
      id: string; // e.g. "q7" or "q9"
      text: string;
      options: string[];
      correct: string;
      explanation_i18n?: Record<string, string>;
    };
  }>;
}

export interface TelcL3Content {
  telc_part: 'TELC_L3';
  instructions: string;
  instructions_i18n?: Record<string, string>;
  texts: Array<{
    id: string; // e.g. "q10", "q11", "q12", "q13"
    text: string;
    translation_i18n?: Record<string, string>;
  }>;
  options: Array<{
    id: string; // e.g. "o_a", "o_b", ..., "o_x"
    text: string;
    is_option_x?: boolean; // Option X: "Passt keine" / "Does not fit"
    translation_i18n?: Record<string, string>;
  }>;
  correct_answers: Record<string, string>;
}

export interface TelcHSContent {
  telc_part: 'TELC_HS';
  instructions: string;
  instructions_i18n?: Record<string, string>;
  audio_url?: string;
  play_limit?: number;
  mc_question: {
    id: string; // "q41"
    text: string;
    options: string[];
    correct: string;
  };
  memo_fields: Array<{
    id: string; // e.g. "q42_name", "q43_tel", "q44_info", "q45_todo"
    label: string; // e.g. "Name des Anrufers", "Telefonnummer"
    placeholder?: string;
  }>;
}

export interface TelcSB1Content {
  telc_part: 'TELC_SB1';
  instructions: string;
  instructions_i18n?: Record<string, string>;
  text_template: string;
  template_translation_i18n?: Record<string, string>;
  gaps: Record<
    string,
    {
      correct: string;
      explanation_i18n?: Record<string, string>;
    }
  >;
  distractor_words: string[]; // Extra distractor words in the word bank
}

export type TaskContent =
  | MatchingTaskContent
  | SprachbausteineTaskContent
  | AudioChoiceTaskContent
  | MultipleChoiceTaskContent
  | TelcL2Content
  | TelcL3Content
  | TelcHSContent
  | TelcSB1Content;

// Entity Models matching Supabase Database Tables

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  is_premium: boolean;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  level: string;
  time_limit_minutes: number;
  is_published: boolean;
  is_premium: boolean;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  duration_days: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

export interface ExamSection {
  id: string;
  exam_id: string;
  title: string;
  order_index: number;
  created_at: string;
}

export interface Task {
  id: string;
  section_id: string;
  teil_number: number;
  type: TaskType;
  content: TaskContent;
  order_index: number;
  is_hidden?: boolean;
  created_at: string;
}

export interface UserAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  mode: 'TRAINING' | 'SIMULATION';
  score: number;
  total_possible: number;
  duration_seconds: number;
  teil_scores: Record<string, { score: number; total: number; percentage: number }>;
  is_completed: boolean;
  completed_at: string;
}

export interface WritingAttempt {
  id: string;
  user_id: string;
  type: 'BESCHWERDE' | 'FORUMSBEITRAG';
  prompt_title: string;
  user_text: string;
  character_count: number;
  duration_seconds: number;
  created_at: string;
}

export interface SpeakingTopic {
  id: string;
  teil_number: number; // 2, 3, or 58
  title: string;
  description?: string;
  bullet_points?: string[];
  is_hidden?: boolean;
  created_at: string;
}

// Supabase Database Generic Type Helper
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at'> & { created_at?: string };
        Update: Partial<UserProfile>;
      };
      exams: {
        Row: Exam;
        Insert: Omit<Exam, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Exam>;
      };
      promo_codes: {
        Row: PromoCode;
        Insert: Omit<PromoCode, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<PromoCode>;
      };
      exam_sections: {
        Row: ExamSection;
        Insert: Omit<ExamSection, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<ExamSection>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Task>;
      };
      user_attempts: {
        Row: UserAttempt;
        Insert: Omit<UserAttempt, 'id' | 'completed_at'> & { id?: string; completed_at?: string };
        Update: Partial<UserAttempt>;
      };
      writing_attempts: {
        Row: WritingAttempt;
        Insert: Omit<WritingAttempt, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<WritingAttempt>;
      };
      speaking_topics: {
        Row: SpeakingTopic;
        Insert: Omit<SpeakingTopic, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<SpeakingTopic>;
      };
    };
    Enums: {
      user_role: UserRole;
      task_type: TaskType;
    };
  };
}
