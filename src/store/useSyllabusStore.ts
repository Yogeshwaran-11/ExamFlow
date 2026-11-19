import { create } from 'zustand'

// ── Types ──────────────────────────────────────────────────────────────────

export type SyllabusTopicStatus =
  | 'not_started'
  | 'in_progress'
  | 'basic_understanding'
  | 'practiced'
  | 'revised'
  | 'exam_ready'

export interface SyllabusTopicRecord {
  topicId: string
  subjectId: string
  unitNumber: number
  topicName: string
  status: SyllabusTopicStatus
  priority: 'high' | 'medium' | 'low'
  notes?: string
  actualMinutesSpent?: number
  lastUpdated: string
}

export interface PendingRescheduleTask {
  topicId: string
  subjectId: string
  topicName: string
  unitNumber: number
  originalScheduledDate: string
  suggestedDate: string
  /** Alias for suggestedDate — used by some components */
  suggestedRescheduleDate: string
  priority: 'high' | 'medium' | 'low'
  reason: string
}

// ── Store interface ────────────────────────────────────────────────────────

export interface SyllabusState {
  // Per-topic status records
  topicRecords: Record<string, SyllabusTopicRecord> // keyed by topicId
  /** Alias for topicRecords — used by some components */
  topicStatuses: Record<string, SyllabusTopicRecord>

  // Pending/rescheduled topics
  pendingTasks: PendingRescheduleTask[]

  // Actions
  initializeSyllabus: (userId: string) => void
  setTopicStatus: (
    topicId: string,
    status: SyllabusTopicStatus,
    subjectId: string,
    unitNumber: number,
    topicName: string,
    priority?: 'high' | 'medium' | 'low'
  ) => void
  setTopicPriority: (topicId: string, priority: 'high' | 'medium' | 'low') => void
  addNotes: (topicId: string, notes: string) => void
  addPendingTask: (task: PendingRescheduleTask) => void
  removePendingTask: (topicId: string) => void
  reschedulePendingTask: (topicId: string, newDate: string) => void

  // Computed
  getSubjectCompletion: (subjectId: string) => number
  getSubjectTopicCounts: (subjectId: string) => {
    total: number
    completed: number
    inProgress: number
    notStarted: number
  }
  getAllPendingHighPriority: () => PendingRescheduleTask[]

  clearSyllabus: () => void
}

// ── Helpers ────────────────────────────────────────────────────────────────

function saveToLocalStorage(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e)
  }
}

function loadFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e)
    return fallback
  }
}

/**
 * Suggest a reschedule date:
 * - After today (IST)
 * - Before the subject's exam date
 * - Simple heuristic: return tomorrow, or 2 days before exam if exam is imminent
 */
function suggestRescheduleDate(_subjectId: string, examDate: string): string {
  const today = new Date()
  const exam = new Date(examDate)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const twoBeforeExam = new Date(exam)
  twoBeforeExam.setDate(exam.getDate() - 2)
  // Pick the earlier of tomorrow or 2 days before exam
  const suggested = tomorrow < twoBeforeExam ? tomorrow : twoBeforeExam
  return suggested.toISOString().split('T')[0]
}

/** Statuses that count as "completed" for percentage calculation */
const COMPLETED_STATUSES: SyllabusTopicStatus[] = [
  'basic_understanding',
  'practiced',
  'revised',
  'exam_ready',
]

function isCompleted(status: SyllabusTopicStatus): boolean {
  return COMPLETED_STATUSES.includes(status)
}

// ── Store creation ─────────────────────────────────────────────────────────

export const useSyllabusStore = create<SyllabusState>((set, get) => ({
  topicRecords: loadFromLocalStorage<Record<string, SyllabusTopicRecord>>(
    'examflow_syllabus_default',
    {}
  ),
  topicStatuses: loadFromLocalStorage<Record<string, SyllabusTopicRecord>>(
    'examflow_syllabus_default',
    {}
  ),
  pendingTasks: [],

  // ── initializeSyllabus ───────────────────────────────────────────────────

  initializeSyllabus: (userId: string) => {
    const now = new Date().toISOString()

    // Always load any existing saved progress first
    const savedRecords = loadFromLocalStorage<Record<string, SyllabusTopicRecord>>(
      `examflow_syllabus_${userId}`,
      loadFromLocalStorage<Record<string, SyllabusTopicRecord>>('examflow_syllabus_default', {})
    )

    const alreadyInitialized = localStorage.getItem('examflow_syllabus_initialized')

    if (alreadyInitialized) {
      // Just restore from localStorage — don't reset
      set({ topicRecords: savedRecords, topicStatuses: savedRecords })
      return
    }

    // First-time initialization: pre-mark topics per initialCompletion percentages
    // We import syllabusData dynamically to avoid circular dep issues at module load time
    let preMarked: Record<string, SyllabusTopicRecord> = { ...savedRecords }

    try {
      // Dynamic require so the store still loads even before syllabusData.ts exists
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { ALL_SUBJECTS_SYLLABUS } = require('@/data/syllabusData') as {
        ALL_SUBJECTS_SYLLABUS: Array<{
          id: string
          subjectId: string
          initialCompletion?: number
          units: Array<{
            number: number
            unitNumber: number
            topics: Array<{
              id: string
              name: string
              topicId?: string
              topicName?: string
              priority?: 'high' | 'medium' | 'low'
            }>
          }>
        }>
      }

      for (const subject of ALL_SUBJECTS_SYLLABUS) {
        const pct = subject.initialCompletion ?? 0
        if (pct <= 0) continue

        // Flatten all topics in order (Unit 1, then 2, …)
        const allTopics: Array<{
          topicId: string
          topicName: string
          unitNumber: number
          priority: 'high' | 'medium' | 'low'
        }> = []

        for (const unit of subject.units) {
          for (const topic of unit.topics) {
            allTopics.push({
              topicId: topic.id ?? topic.topicId ?? '',
              topicName: topic.name ?? topic.topicName ?? '',
              unitNumber: unit.number ?? unit.unitNumber,
              priority: topic.priority ?? 'medium',
            })
          }
        }

        // How many topics to pre-mark
        const countToMark = Math.floor((pct / 100) * allTopics.length)
        const subjectId = subject.id ?? subject.subjectId

        for (let i = 0; i < countToMark; i++) {
          const t = allTopics[i]
          if (!preMarked[t.topicId]) {
            preMarked[t.topicId] = {
              topicId: t.topicId,
              subjectId,
              unitNumber: t.unitNumber,
              topicName: t.topicName,
              status: 'basic_understanding',
              priority: t.priority,
              lastUpdated: now,
            }
          }
        }
      }
    } catch (err) {
      console.warn('useSyllabusStore: syllabusData not yet available for pre-marking:', err)
    }

    // Persist
    saveToLocalStorage(`examflow_syllabus_${userId}`, preMarked)
    saveToLocalStorage('examflow_syllabus_default', preMarked)
    localStorage.setItem('examflow_syllabus_initialized', 'true')

    set({ topicRecords: preMarked, topicStatuses: preMarked })
  },

  // ── setTopicStatus ───────────────────────────────────────────────────────

  setTopicStatus: (
    topicId: string,
    status: SyllabusTopicStatus,
    subjectId: string,
    unitNumber: number,
    topicName: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const { topicRecords } = get()
    const existing = topicRecords[topicId]
    const now = new Date().toISOString()

    const updated: SyllabusTopicRecord = {
      topicId,
      subjectId,
      unitNumber,
      topicName,
      status,
      priority: existing?.priority ?? priority,
      notes: existing?.notes,
      actualMinutesSpent: existing?.actualMinutesSpent,
      lastUpdated: now,
    }

    const nextRecords = { ...topicRecords, [topicId]: updated }
    set({ topicRecords: nextRecords, topicStatuses: nextRecords })

    // Persist — we need userId; use default key for anonymous sessions
    const userId = _getCurrentUserId()
    saveToLocalStorage(`examflow_syllabus_${userId}`, nextRecords)
    saveToLocalStorage('examflow_syllabus_default', nextRecords)
  },

  // ── setTopicPriority ─────────────────────────────────────────────────────

  setTopicPriority: (topicId: string, priority: 'high' | 'medium' | 'low') => {
    const { topicRecords } = get()
    const existing = topicRecords[topicId]
    if (!existing) return

    const now = new Date().toISOString()
    const updated: SyllabusTopicRecord = { ...existing, priority, lastUpdated: now }
    const nextRecords = { ...topicRecords, [topicId]: updated }
    set({ topicRecords: nextRecords, topicStatuses: nextRecords })

    const userId = _getCurrentUserId()
    saveToLocalStorage(`examflow_syllabus_${userId}`, nextRecords)
    saveToLocalStorage('examflow_syllabus_default', nextRecords)
  },

  // ── addNotes ─────────────────────────────────────────────────────────────

  addNotes: (topicId: string, notes: string) => {
    const { topicRecords } = get()
    const existing = topicRecords[topicId]
    if (!existing) return

    const now = new Date().toISOString()
    const updated: SyllabusTopicRecord = { ...existing, notes, lastUpdated: now }
    const nextRecords = { ...topicRecords, [topicId]: updated }
    set({ topicRecords: nextRecords, topicStatuses: nextRecords })

    const userId = _getCurrentUserId()
    saveToLocalStorage(`examflow_syllabus_${userId}`, nextRecords)
    saveToLocalStorage('examflow_syllabus_default', nextRecords)
  },

  // ── addPendingTask ───────────────────────────────────────────────────────

  addPendingTask: (task: PendingRescheduleTask) => {
    const { pendingTasks } = get()
    // Replace if already present for same topicId
    const filtered = pendingTasks.filter((t) => t.topicId !== task.topicId)
    set({ pendingTasks: [...filtered, task] })
  },

  // ── removePendingTask ────────────────────────────────────────────────────

  removePendingTask: (topicId: string) => {
    const { pendingTasks } = get()
    set({ pendingTasks: pendingTasks.filter((t) => t.topicId !== topicId) })
  },

  // ── reschedulePendingTask ────────────────────────────────────────────────

  reschedulePendingTask: (topicId: string, newDate: string) => {
    const { pendingTasks } = get()
    const nextTasks = pendingTasks.map((t) =>
      t.topicId === topicId ? { ...t, suggestedDate: newDate } : t
    )
    set({ pendingTasks: nextTasks })
  },

  // ── Computed ─────────────────────────────────────────────────────────────

  getSubjectCompletion: (subjectId: string): number => {
    const { topicRecords } = get()
    const subjectTopics = Object.values(topicRecords).filter(
      (r) => r.subjectId === subjectId
    )
    if (subjectTopics.length === 0) return 0
    const completed = subjectTopics.filter((r) => isCompleted(r.status)).length
    return Math.round((completed / subjectTopics.length) * 100)
  },

  getSubjectTopicCounts: (subjectId: string) => {
    const { topicRecords } = get()
    const subjectTopics = Object.values(topicRecords).filter(
      (r) => r.subjectId === subjectId
    )
    const total = subjectTopics.length
    const completed = subjectTopics.filter((r) => isCompleted(r.status)).length
    const inProgress = subjectTopics.filter((r) => r.status === 'in_progress').length
    const notStarted = subjectTopics.filter((r) => r.status === 'not_started').length
    return { total, completed, inProgress, notStarted }
  },

  getAllPendingHighPriority: (): PendingRescheduleTask[] => {
    return get().pendingTasks.filter((t) => t.priority === 'high')
  },

  // ── clearSyllabus ────────────────────────────────────────────────────────

  clearSyllabus: () => {
    set({ topicRecords: {}, topicStatuses: {}, pendingTasks: [] })
    try {
      localStorage.removeItem('examflow_syllabus_default')
      localStorage.removeItem('examflow_syllabus_initialized')
    } catch (e) {
      console.error('Error clearing syllabus from localStorage:', e)
    }
  },
}))

// ── Utilities exported for other modules ──────────────────────────────────

/**
 * Returns a suggested reschedule date for a topic in a given subject.
 * Pass the subject's exam date as an ISO date string (YYYY-MM-DD).
 */
export { suggestRescheduleDate }

// ── Internal helpers ───────────────────────────────────────────────────────

/**
 * Best-effort current userId from the study plan store without creating a
 * circular import. Falls back to 'default_user'.
 */
function _getCurrentUserId(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useStudyPlanStore } = require('@/store/useStudyPlanStore') as {
      useStudyPlanStore: { getState: () => { currentUserId: string } }
    }
    return useStudyPlanStore.getState().currentUserId ?? 'default_user'
  } catch {
    return 'default_user'
  }
}
