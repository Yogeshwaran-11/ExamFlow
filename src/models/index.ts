// ============================================================
// ExamFlow — Shared Data Models
// ============================================================

// ── Study Plan (loaded from JSON) ──────────────────────────

export interface StudyBlock {
  id: string
  date?: string            // ISO date "YYYY-MM-DD"
  subjectId: string | null
  topicId?: string
  topicName?: string
  topics?: string[]
  plannedMinutes: number
  blockName?: string
  blockLabel?: string
  blockType?: 'study' | 'review' | 'practice' | 'mock'
  taskType?: string
  notes?: string
  isHandwritten?: boolean
  isNumerical?: boolean
  isLightDay?: boolean
  isExamDay?: boolean
  priority?: number
  isSkimmed?: boolean
  skimmedTopicsInBlock?: string[]
  completionStatus?: string
  sourceReference?: string
}

export interface DaySchedule {
  date: string
  dayLabel: string
  phase: number
  isLightDay: boolean
  isExamDay: boolean
  examSubjectId: string | null
  maxStudyMinutes: number
  totalPlannedMinutes: number
  notes: string
  blocks: StudyBlock[]
}

export interface Topic {
  id: string
  name: string
  subjectId?: string
  estimatedMinutes?: number
  priority?: 'high' | 'medium' | 'low' | number
  tags?: string[]
}

export interface Subject {
  id: string
  name: string
  shortName?: string
  color: string
  examDate: string        // ISO date
  examTime?: string
  examDay?: string
  priority?: number
  handwritingRequired?: boolean
  formulaSheetRequired?: boolean
  handwritingNote?: string
  topics?: Topic[]
}

export interface StudyPlan {
  id?: string
  userId?: string
  meta?: {
    title: string
    student: string
    generatedFrom: string
    timezone: string
    schemaVersion: string
    planStart: string
    planEnd: string
  }
  examDate?: string
  subjects: Subject[]
  blocks?: StudyBlock[]
  dailySchedule?: DaySchedule[]
  studyConstraints?: Record<string, any>
  recallRules?: Record<string, any>
  catchUpRules?: Record<string, any>
  milestones?: any[]
  skimmedTopics?: Record<string, string[]>
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

// ── Task Completion ─────────────────────────────────────────

export type CompletionStatus = 'pending' | 'complete' | 'partial' | 'skipped' | 'not_started' | 'completed'

export interface TaskCompletion {
  id: string              // == blockId
  blockId: string
  userId: string
  date: string            // ISO date
  status: CompletionStatus
  actualMinutes?: number
  notes?: string
  skipReason?: string
  syncStatus: 'local' | 'synced' | 'error'
  createdAt: string
  updatedAt: string
}

// ── Topic Progress ──────────────────────────────────────────

export type TopicStatus = 'not_started' | 'in_progress' | 'learned' | 'mastered' | 'needs_practice'

export interface TopicProgress {
  id: string              // topicProgressId (userId_topicId)
  userId: string
  topicId: string
  subjectId: string
  topicName: string
  status: TopicStatus
  confidenceScore?: number // 0-100
  confidenceRating?: number // 1-5
  recallCount?: number
  isWeak?: boolean
  lastStudiedAt?: string
  weakAreas?: string[]
  syncStatus: 'local' | 'synced' | 'error'
  createdAt: string
  updatedAt: string
}

// ── Spaced Repetition / Recall ──────────────────────────────

export type RecallResult = 'remembered' | 'forgot' | 'partial'
export type RecallStatus = 'pending' | 'done' | 'skipped' | 'not_started' | 'completed'

export interface RecallTask {
  id: string
  userId: string
  subjectId: string
  topicId?: string
  blockId?: string
  topicName: string
  scheduledDate: string   // ISO date
  interval?: number       // days
  recallNumber?: 1 | 2 | 3 | number
  basedOnLearnedDate?: string
  repetition?: number     // which repetition (1,2,3…)
  easeFactor?: number     // SM-2 ease factor
  status: RecallStatus
  result?: RecallResult
  confidence?: number     // 1-5
  notes?: string
  learnedDate?: string
  isWeak?: boolean
  syncStatus: 'local' | 'synced' | 'error'
  createdAt: string
  updatedAt: string
}

// ── Study Sessions (focus timer) ───────────────────────────

export type SessionStatus = 'running' | 'paused' | 'completed' | 'cancelled'

export interface StudySession {
  id: string
  userId: string
  subjectId?: string
  topicName?: string
  plannedMinutes: number
  actualMinutes?: number
  startedAt: string
  endedAt?: string
  pausedAt?: string
  totalPausedMs: number
  status: SessionStatus
  syncStatus: 'local' | 'synced' | 'error'
  createdAt: string
  updatedAt: string
}

// ── Notes ───────────────────────────────────────────────────

export interface Note {
  id: string
  userId: string
  subjectId?: string
  topicId?: string
  topicName?: string
  title: string
  content: string
  tags?: string[]
  isPinned?: boolean
  syncStatus: 'local' | 'synced' | 'error'
  createdAt: string
  updatedAt: string
}

// ── User Settings ───────────────────────────────────────────

export interface UserSettings {
  userId: string
  dailyGoalMinutes: number
  reminderEnabled: boolean
  reminderTime?: string   // "HH:MM"
  theme: 'light' | 'dark' | 'system'
  weekStartsOn: 0 | 1    // 0=Sunday, 1=Monday
  showCompletedBlocks: boolean
  defaultFocusMinutes: number
  syncStatus: 'local' | 'synced' | 'error'
  updatedAt: string
}

// ── Active Timer State ─────────────────────────────────────

export interface ActiveTimer {
  sessionId: string
  startedAt: string
  pausedAt?: string
  totalPausedMs: number
  subjectId?: string
  topicName?: string
  plannedMinutes: number
  status: 'running' | 'paused'
}

// ── Pending Sync ────────────────────────────────────────────

export type SyncCollection =
  | 'taskCompletions'
  | 'topicProgress'
  | 'recalls'
  | 'studySessions'
  | 'notes'
  | 'settings'

export interface PendingChange {
  collection: SyncCollection
  id: string
  data: Record<string, unknown>
}
