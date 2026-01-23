export type Mode = 'practice' | 'mock';
export type SessionStatus = 'idle' | 'ready' | 'running' | 'ended';

export type SessionTimers = {
  totalMs: number;
  sectionMs: number;
  questionMs: number;
};

export type QuestionStatus = 'unanswered' | 'correct' | 'wrong' | 'skip';

export interface QuestionType {
  id: string;
  name: string;
  shortName?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  totalQuestions: number;
  totalPlannedTime: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateItem {
  id: string;
  templateId: string;
  questionTypeId: string;
  questionCount: number;
  plannedTime: number;
  orderIndex: number;
}

export interface Session {
  id: string;
  mode: Mode;
  templateId: string;
  customOrder: string[];
  status: 'running' | 'ended';
  startedAt: string;
  endedAt?: string;
  totalTimeMs: number;
  pausedCount: number;
}

export interface SessionItem {
  id: string;
  sessionId: string;
  templateItemId: string;
  actualTimeMs: number;
  plannedTime: number;
  questionCount: number;
  overtimeCount: number;
  orderIndex: number;
}

export interface QuestionRecord {
  id: string;
  sessionId: string;
  sessionItemId: string;
  questionIndex: number;
  actualTimeMs: number;
  plannedTime: number;
  status: QuestionStatus;
}

export interface DailyStat {
  date: string;
  totalSessions: number;
  totalTimeMs: number;
  completionRate: number;
}

export interface AppSettings {
  id: 'app';
  themeMode: 'light' | 'dark' | 'system';
  colorScheme: 'azure' | 'citrus' | 'slate' | 'rose';
  examTotalTime?: number;
  examTypeRatio?: Record<string, number>;
}
