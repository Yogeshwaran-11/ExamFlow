import { create } from 'zustand'
import studyPlanJson from '@/data/study_plan.json'
import {
  StudyPlan,
  TaskCompletion,
  TopicProgress,
  RecallTask,
  StudySession,
  Note,
  UserSettings,
  ActiveTimer,
  CompletionStatus,
  TopicStatus,
  RecallResult,
  PendingChange,
} from '@/models'
import {
  getTaskCompletions,
  upsertTaskCompletion,
  getAllTopicProgress,
  upsertTopicProgress,
  getRecallTasks,
  upsertRecallTask,
  getStudySessions,
  upsertStudySession,
  getNotes,
  upsertNote,
  deleteNote as deleteNoteFirestore,
  getUserSettings,
  updateUserSettings as updateUserSettingsFirestore,
  syncLocalChanges,
} from '@/lib/firebase/firestore'
import { generateRecallTasks } from '@/lib/spaced-repetition'
import { getTodayISODate } from '@/lib/date-utils'

const defaultSettings: UserSettings = {
  userId: 'default_user',
  dailyGoalMinutes: 360,
  reminderEnabled: true,
  reminderTime: '08:00',
  theme: 'system',
  weekStartsOn: 1, // Monday
  showCompletedBlocks: true,
  defaultFocusMinutes: 50,
  syncStatus: 'local',
  updatedAt: new Date().toISOString(),
}

export interface StudyPlanState {
  // ── State ──────────────────────────────────────────────────
  studyPlan: StudyPlan | null
  taskCompletions: Map<string, TaskCompletion>
  topicProgress: Map<string, TopicProgress>
  recallTasks: RecallTask[]
  studySessions: StudySession[]
  notes: Note[]
  settings: UserSettings | null
  syncStatus: 'idle' | 'syncing' | 'error'
  pendingSync: string[]
  activeTimer: ActiveTimer | null
  currentUserId: string

  // ── Actions ────────────────────────────────────────────────
  initializeStore: (userId?: string) => Promise<void>
  loadFromFirestore: (userId: string) => Promise<void>
  syncPending: () => Promise<void>

  // Task completions
  markBlockComplete: (blockId: string, actualMinutes?: number, notes?: string) => Promise<void>
  markBlockPartial: (blockId: string, actualMinutes: number, notes?: string) => Promise<void>
  skipBlock: (blockId: string, reason?: string) => Promise<void>

  // Topic progress & Spaced repetition
  setTopicStatus: (
    topicId: string,
    status: TopicStatus,
    subjectId?: string,
    topicName?: string
  ) => Promise<void>
  createRecallTasksForTopic: (
    userId: string,
    subjectId: string,
    blockId: string,
    topicName: string,
    learnedDate: string
  ) => Promise<void>
  completeRecall: (
    recallId: string,
    result: RecallResult,
    confidence?: number,
    notes?: string
  ) => Promise<void>

  // Focus Timer & Study Sessions
  startFocusSession: (
    subjectId?: string,
    topicName?: string,
    plannedMinutes?: number
  ) => StudySession
  pauseSession: () => void
  resumeSession: () => void
  stopSession: (actualMinutes?: number) => Promise<StudySession | null>

  // Notes
  createNote: (note: Partial<Note> & { title: string; content: string }) => Promise<Note>
  updateNote: (noteId: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (noteId: string) => Promise<void>

  // Settings
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>

  // Backup / Export / Import
  exportData: () => string
  importData: (json: string | Record<string, any>) => boolean
  clearStore: () => void
}

// Helpers for localStorage sync
function saveToLocalStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e)
  }
}

function loadFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e)
    return fallback
  }
}

export const useStudyPlanStore = create<StudyPlanState>((set, get) => ({
  studyPlan: studyPlanJson as unknown as StudyPlan,
  taskCompletions: new Map<string, TaskCompletion>(),
  topicProgress: new Map<string, TopicProgress>(),
  recallTasks: [],
  studySessions: [],
  notes: [],
  settings: null,
  syncStatus: 'idle',
  pendingSync: [],
  activeTimer: null,
  currentUserId: 'default_user',

  initializeStore: async (userId = 'default_user') => {
    // 1. Load initial study plan from json
    const plan = studyPlanJson as unknown as StudyPlan

    // 2. Load from localStorage first (for instant offline render)
    const localCompletionsList: TaskCompletion[] = loadFromLocalStorage(
      `examflow_${userId}_completions`,
      loadFromLocalStorage('examflow_completions', [])
    )
    const completionsMap = new Map<string, TaskCompletion>()
    localCompletionsList.forEach((c) => completionsMap.set(c.blockId, c))

    const localProgressList: TopicProgress[] = loadFromLocalStorage(
      `examflow_${userId}_topics`,
      loadFromLocalStorage('examflow_topics', [])
    )
    const progressMap = new Map<string, TopicProgress>()
    localProgressList.forEach((p) => progressMap.set(p.id, p))

    const localRecalls: RecallTask[] = loadFromLocalStorage(
      `examflow_${userId}_recalls`,
      loadFromLocalStorage('examflow_recalls', [])
    )

    const localSessions: StudySession[] = loadFromLocalStorage(
      `examflow_${userId}_sessions`,
      loadFromLocalStorage('examflow_sessions', [])
    )

    const localNotes: Note[] = loadFromLocalStorage(
      `examflow_${userId}_notes`,
      loadFromLocalStorage('examflow_notes', [])
    )

    const localSettings: UserSettings = loadFromLocalStorage(
      `examflow_${userId}_settings`,
      { ...defaultSettings, userId }
    )

    const activeTimer: ActiveTimer | null = loadFromLocalStorage(
      `examflow_${userId}_activeTimer`,
      null
    )

    set({
      studyPlan: plan,
      taskCompletions: completionsMap,
      topicProgress: progressMap,
      recallTasks: localRecalls,
      studySessions: localSessions,
      notes: localNotes,
      settings: localSettings,
      activeTimer,
      currentUserId: userId,
      syncStatus: 'idle',
    })

    // 3. Fetch from Firestore if user is logged in
    if (userId && userId !== 'default_user') {
      await get().loadFromFirestore(userId)
    }
  },

  loadFromFirestore: async (userId: string) => {
    if (!userId || userId === 'default_user') return

    set({ syncStatus: 'syncing' })
    try {
      const [remoteCompletions, remoteProgress, remoteRecalls, remoteSessions, remoteNotes, remoteSettings] =
        await Promise.all([
          getTaskCompletions(userId),
          getAllTopicProgress(userId),
          getRecallTasks(userId),
          getStudySessions(userId),
          getNotes(userId),
          getUserSettings(userId),
        ])

      // Merge completions
      const nextCompletions = new Map(get().taskCompletions)
      remoteCompletions.forEach((rc) => {
        nextCompletions.set(rc.blockId, { ...rc, syncStatus: 'synced' })
      })

      // Merge topic progress
      const nextProgress = new Map(get().topicProgress)
      remoteProgress.forEach((rp) => {
        nextProgress.set(rp.id, { ...rp, syncStatus: 'synced' })
      })

      // Merge recalls
      const currentRecalls = get().recallTasks
      const recallMap = new Map<string, RecallTask>()
      currentRecalls.forEach((r) => recallMap.set(r.id, r))
      remoteRecalls.forEach((rr) => recallMap.set(rr.id, { ...rr, syncStatus: 'synced' }))
      const mergedRecalls = Array.from(recallMap.values())

      // Merge sessions
      const currentSessions = get().studySessions
      const sessionMap = new Map<string, StudySession>()
      currentSessions.forEach((s) => sessionMap.set(s.id, s))
      remoteSessions.forEach((rs) => sessionMap.set(rs.id, { ...rs, syncStatus: 'synced' }))
      const mergedSessions = Array.from(sessionMap.values())

      // Merge notes
      const currentNotes = get().notes
      const noteMap = new Map<string, Note>()
      currentNotes.forEach((n) => noteMap.set(n.id, n))
      remoteNotes.forEach((rn) => noteMap.set(rn.id, { ...rn, syncStatus: 'synced' }))
      const mergedNotes = Array.from(noteMap.values())

      const nextSettings = remoteSettings
        ? { ...remoteSettings, syncStatus: 'synced' as const }
        : get().settings || { ...defaultSettings, userId }

      // Update state
      set({
        taskCompletions: nextCompletions,
        topicProgress: nextProgress,
        recallTasks: mergedRecalls,
        studySessions: mergedSessions,
        notes: mergedNotes,
        settings: nextSettings,
        syncStatus: 'idle',
      })

      // Sync local storage mirror
      saveToLocalStorage(`examflow_${userId}_completions`, Array.from(nextCompletions.values()))
      saveToLocalStorage(`examflow_${userId}_topics`, Array.from(nextProgress.values()))
      saveToLocalStorage(`examflow_${userId}_recalls`, mergedRecalls)
      saveToLocalStorage(`examflow_${userId}_sessions`, mergedSessions)
      saveToLocalStorage(`examflow_${userId}_notes`, mergedNotes)
      saveToLocalStorage(`examflow_${userId}_settings`, nextSettings)
    } catch (err) {
      console.error('Error loading data from Firestore:', err)
      set({ syncStatus: 'error' })
    }
  },

  syncPending: async () => {
    const { currentUserId, pendingSync, taskCompletions, topicProgress, recallTasks, studySessions, notes, settings } =
      get()

    if (!currentUserId || currentUserId === 'default_user' || pendingSync.length === 0) {
      set({ syncStatus: 'idle' })
      return
    }

    set({ syncStatus: 'syncing' })
    try {
      const pendingChanges: PendingChange[] = []

      for (const id of pendingSync) {
        if (taskCompletions.has(id)) {
          pendingChanges.push({
            collection: 'taskCompletions',
            id,
            data: taskCompletions.get(id) as unknown as Record<string, unknown>,
          })
        } else if (topicProgress.has(id)) {
          pendingChanges.push({
            collection: 'topicProgress',
            id,
            data: topicProgress.get(id) as unknown as Record<string, unknown>,
          })
        } else {
          const recall = recallTasks.find((r) => r.id === id)
          if (recall) {
            pendingChanges.push({
              collection: 'recalls',
              id,
              data: recall as unknown as Record<string, unknown>,
            })
            continue
          }
          const session = studySessions.find((s) => s.id === id)
          if (session) {
            pendingChanges.push({
              collection: 'studySessions',
              id,
              data: session as unknown as Record<string, unknown>,
            })
            continue
          }
          const note = notes.find((n) => n.id === id)
          if (note) {
            pendingChanges.push({
              collection: 'notes',
              id,
              data: note as unknown as Record<string, unknown>,
            })
            continue
          }
          if (id === 'settings' && settings) {
            pendingChanges.push({
              collection: 'settings',
              id: 'preferences',
              data: settings as unknown as Record<string, unknown>,
            })
          }
        }
      }

      if (pendingChanges.length > 0) {
        await syncLocalChanges(currentUserId, pendingChanges)
      }

      set({
        pendingSync: [],
        syncStatus: 'idle',
      })
    } catch (error) {
      console.error('Error syncing pending changes:', error)
      set({ syncStatus: 'error' })
    }
  },

  // ── Block Completions ───────────────────────────────────────

  markBlockComplete: async (blockId: string, actualMinutes?: number, notes?: string) => {
    const { currentUserId, taskCompletions, pendingSync } = get()
    const now = new Date().toISOString()
    const date = blockId.split('-').slice(0, 3).join('-') || getTodayISODate()

    const existing = taskCompletions.get(blockId)
    const updated: TaskCompletion = {
      id: blockId,
      blockId,
      userId: currentUserId,
      date: existing?.date || date,
      status: 'complete',
      actualMinutes: actualMinutes ?? existing?.actualMinutes ?? 60,
      notes: notes !== undefined ? notes : existing?.notes,
      syncStatus: 'local',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }

    const nextMap = new Map(taskCompletions)
    nextMap.set(blockId, updated)
    const nextPending = Array.from(new Set([...pendingSync, blockId]))

    set({ taskCompletions: nextMap, pendingSync: nextPending })
    saveToLocalStorage(`examflow_${currentUserId}_completions`, Array.from(nextMap.values()))
    saveToLocalStorage('examflow_completions', Array.from(nextMap.values()))

    // Upsert to Firestore
    if (currentUserId && currentUserId !== 'default_user') {
      try {
        await upsertTaskCompletion(currentUserId, updated)
        updated.syncStatus = 'synced'
        nextMap.set(blockId, updated)
        set({
          taskCompletions: new Map(nextMap),
          pendingSync: get().pendingSync.filter((id) => id !== blockId),
        })
      } catch (err) {
        console.error('Failed to sync task completion, queued for retry:', err)
      }
    }
  },

  markBlockPartial: async (blockId: string, actualMinutes: number, notes?: string) => {
    const { currentUserId, taskCompletions, pendingSync } = get()
    const now = new Date().toISOString()
    const date = blockId.split('-').slice(0, 3).join('-') || getTodayISODate()

    const existing = taskCompletions.get(blockId)
    const updated: TaskCompletion = {
      id: blockId,
      blockId,
      userId: currentUserId,
      date: existing?.date || date,
      status: 'partial',
      actualMinutes,
      notes: notes ?? existing?.notes,
      syncStatus: 'local',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }

    const nextMap = new Map(taskCompletions)
    nextMap.set(blockId, updated)
    const nextPending = Array.from(new Set([...pendingSync, blockId]))

    set({ taskCompletions: nextMap, pendingSync: nextPending })
    saveToLocalStorage(`examflow_${currentUserId}_completions`, Array.from(nextMap.values()))
    saveToLocalStorage('examflow_completions', Array.from(nextMap.values()))

    if (currentUserId && currentUserId !== 'default_user') {
      try {
        await upsertTaskCompletion(currentUserId, updated)
        updated.syncStatus = 'synced'
        nextMap.set(blockId, updated)
        set({
          taskCompletions: new Map(nextMap),
          pendingSync: get().pendingSync.filter((id) => id !== blockId),
        })
      } catch (err) {
        console.error('Failed to sync partial task completion:', err)
      }
    }
  },

  skipBlock: async (blockId: string, reason?: string) => {
    const { currentUserId, taskCompletions, pendingSync } = get()
    const now = new Date().toISOString()
    const date = blockId.split('-').slice(0, 3).join('-') || getTodayISODate()

    const existing = taskCompletions.get(blockId)
    const updated: TaskCompletion = {
      id: blockId,
      blockId,
      userId: currentUserId,
      date: existing?.date || date,
      status: 'skipped',
      actualMinutes: 0,
      skipReason: reason,
      syncStatus: 'local',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }

    const nextMap = new Map(taskCompletions)
    nextMap.set(blockId, updated)
    const nextPending = Array.from(new Set([...pendingSync, blockId]))

    set({ taskCompletions: nextMap, pendingSync: nextPending })
    saveToLocalStorage(`examflow_${currentUserId}_completions`, Array.from(nextMap.values()))
    saveToLocalStorage('examflow_completions', Array.from(nextMap.values()))

    if (currentUserId && currentUserId !== 'default_user') {
      try {
        await upsertTaskCompletion(currentUserId, updated)
        updated.syncStatus = 'synced'
        nextMap.set(blockId, updated)
        set({
          taskCompletions: new Map(nextMap),
          pendingSync: get().pendingSync.filter((id) => id !== blockId),
        })
      } catch (err) {
        console.error('Failed to sync skipped block:', err)
      }
    }
  },

  // ── Topic Progress & Spaced Repetition ───────────────────────

  setTopicStatus: async (
    topicId: string,
    status: TopicStatus,
    subjectId = '',
    topicName = ''
  ) => {
    const { currentUserId, topicProgress, pendingSync } = get()
    const now = new Date().toISOString()
    const progressId = `${currentUserId}_${topicId}`

    const existing = topicProgress.get(progressId)
    const updated: TopicProgress = {
      id: progressId,
      userId: currentUserId,
      topicId,
      subjectId: subjectId || existing?.subjectId || '',
      topicName: topicName || existing?.topicName || topicId,
      status,
      confidenceScore:
        status === 'mastered' ? 100 : status === 'learned' ? 75 : status === 'in_progress' ? 40 : 0,
      confidenceRating: status === 'mastered' ? 5 : status === 'learned' ? 4 : status === 'in_progress' ? 3 : 1,
      lastStudiedAt: now,
      isWeak: status === 'needs_practice',
      syncStatus: 'local',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }

    const nextProgress = new Map(topicProgress)
    nextProgress.set(progressId, updated)
    const nextPending = Array.from(new Set([...pendingSync, progressId]))

    set({ topicProgress: nextProgress, pendingSync: nextPending })
    saveToLocalStorage(`examflow_${currentUserId}_topics`, Array.from(nextProgress.values()))
    saveToLocalStorage('examflow_topics', Array.from(nextProgress.values()))

    if (currentUserId && currentUserId !== 'default_user') {
      try {
        await upsertTopicProgress(currentUserId, updated)
        updated.syncStatus = 'synced'
        nextProgress.set(progressId, updated)
        set({
          topicProgress: new Map(nextProgress),
          pendingSync: get().pendingSync.filter((id) => id !== progressId),
        })
      } catch (err) {
        console.error('Failed to sync topic progress:', err)
      }
    }

    // If status is learned or mastered, generate spaced repetition recalls
    if (status === 'learned' || status === 'mastered') {
      await get().createRecallTasksForTopic(
        currentUserId,
        updated.subjectId,
        `topic-${topicId}`,
        updated.topicName,
        getTodayISODate()
      )
    }
  },

  createRecallTasksForTopic: async (
    userId: string,
    subjectId: string,
    blockId: string,
    topicName: string,
    learnedDate: string
  ) => {
    const { recallTasks, pendingSync } = get()
    const newTasks = generateRecallTasks(
      userId,
      subjectId,
      blockId,
      topicName,
      learnedDate,
      recallTasks
    )

    if (newTasks.length === 0) return

    const combinedRecalls = [...recallTasks, ...newTasks]
    const addedIds = newTasks.map((t) => t.id)
    const nextPending = Array.from(new Set([...pendingSync, ...addedIds]))

    set({ recallTasks: combinedRecalls, pendingSync: nextPending })
    saveToLocalStorage(`examflow_${userId}_recalls`, combinedRecalls)
    saveToLocalStorage('examflow_recalls', combinedRecalls)

    if (userId && userId !== 'default_user') {
      for (const t of newTasks) {
        try {
          await upsertRecallTask(userId, t)
          t.syncStatus = 'synced'
        } catch (e) {
          console.error(`Failed to sync recall task ${t.id}:`, e)
        }
      }
      set({
        recallTasks: [...combinedRecalls],
        pendingSync: get().pendingSync.filter((id) => !addedIds.includes(id)),
      })
    }
  },

  completeRecall: async (
    recallId: string,
    result: RecallResult,
    confidence?: number,
    notes?: string
  ) => {
    const { currentUserId, recallTasks, topicProgress, pendingSync } = get()
    const now = new Date().toISOString()

    const targetIndex = recallTasks.findIndex((r) => r.id === recallId)
    if (targetIndex === -1) return

    const target = recallTasks[targetIndex]
    const updatedRecall: RecallTask = {
      ...target,
      status: 'done',
      result,
      confidence: confidence ?? (result === 'remembered' ? 5 : result === 'partial' ? 3 : 1),
      notes: notes ?? target.notes,
      isWeak: result === 'forgot',
      updatedAt: now,
      syncStatus: 'local',
    }

    const nextRecalls = [...recallTasks]
    nextRecalls[targetIndex] = updatedRecall

    const nextPending = Array.from(new Set([...pendingSync, recallId]))
    set({ recallTasks: nextRecalls, pendingSync: nextPending })
    saveToLocalStorage(`examflow_${currentUserId}_recalls`, nextRecalls)
    saveToLocalStorage('examflow_recalls', nextRecalls)

    // If forgotten, mark related topic as weak/needs_practice
    if (result === 'forgot' && target.topicName) {
      for (const [pId, prog] of topicProgress.entries()) {
        if (prog.topicName === target.topicName || prog.topicId === target.topicId) {
          prog.isWeak = true
          prog.status = 'needs_practice'
          prog.updatedAt = now
          topicProgress.set(pId, prog)
          saveToLocalStorage(`examflow_${currentUserId}_topics`, Array.from(topicProgress.values()))
          if (currentUserId && currentUserId !== 'default_user') {
            upsertTopicProgress(currentUserId, prog).catch(console.error)
          }
          break
        }
      }
    }

    if (currentUserId && currentUserId !== 'default_user') {
      try {
        await upsertRecallTask(currentUserId, updatedRecall)
        updatedRecall.syncStatus = 'synced'
        nextRecalls[targetIndex] = updatedRecall
        set({
          recallTasks: [...nextRecalls],
          pendingSync: get().pendingSync.filter((id) => id !== recallId),
        })
      } catch (err) {
        console.error('Failed to sync completed recall:', err)
      }
    }
  },

  // ── Focus Sessions & Timer ──────────────────────────────────

  startFocusSession: (subjectId = '', topicName = '', plannedMinutes = 50) => {
    const { currentUserId, studySessions, pendingSync } = get()
    const now = new Date().toISOString()
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const newSession: StudySession = {
      id: sessionId,
      userId: currentUserId,
      subjectId,
      topicName,
      plannedMinutes,
      startedAt: now,
      totalPausedMs: 0,
      status: 'running',
      syncStatus: 'local',
      createdAt: now,
      updatedAt: now,
    }

    const activeTimer: ActiveTimer = {
      sessionId,
      startedAt: now,
      totalPausedMs: 0,
      subjectId,
      topicName,
      plannedMinutes,
      status: 'running',
    }

    const nextSessions = [newSession, ...studySessions]
    const nextPending = Array.from(new Set([...pendingSync, sessionId]))

    set({
      studySessions: nextSessions,
      activeTimer,
      pendingSync: nextPending,
    })

    saveToLocalStorage(`examflow_${currentUserId}_sessions`, nextSessions)
    saveToLocalStorage('examflow_sessions', nextSessions)
    saveToLocalStorage(`examflow_${currentUserId}_activeTimer`, activeTimer)

    if (currentUserId && currentUserId !== 'default_user') {
      upsertStudySession(currentUserId, newSession).catch(console.error)
    }

    return newSession
  },

  pauseSession: () => {
    const { activeTimer, studySessions, currentUserId } = get()
    if (!activeTimer || activeTimer.status !== 'running') return

    const now = new Date().toISOString()
    const updatedTimer: ActiveTimer = {
      ...activeTimer,
      status: 'paused',
      pausedAt: now,
    }

    const sessionIndex = studySessions.findIndex((s) => s.id === activeTimer.sessionId)
    let nextSessions = studySessions
    if (sessionIndex !== -1) {
      nextSessions = [...studySessions]
      nextSessions[sessionIndex] = {
        ...nextSessions[sessionIndex],
        status: 'paused',
        pausedAt: now,
        updatedAt: now,
      }
    }

    set({ activeTimer: updatedTimer, studySessions: nextSessions })
    saveToLocalStorage(`examflow_${currentUserId}_activeTimer`, updatedTimer)
    saveToLocalStorage(`examflow_${currentUserId}_sessions`, nextSessions)
  },

  resumeSession: () => {
    const { activeTimer, studySessions, currentUserId } = get()
    if (!activeTimer || activeTimer.status !== 'paused' || !activeTimer.pausedAt) return

    const now = new Date().toISOString()
    const pauseDuration = Math.max(0, Date.now() - new Date(activeTimer.pausedAt).getTime())
    const totalPausedMs = (activeTimer.totalPausedMs || 0) + pauseDuration

    const updatedTimer: ActiveTimer = {
      ...activeTimer,
      status: 'running',
      pausedAt: undefined,
      totalPausedMs,
    }

    const sessionIndex = studySessions.findIndex((s) => s.id === activeTimer.sessionId)
    let nextSessions = studySessions
    if (sessionIndex !== -1) {
      nextSessions = [...studySessions]
      nextSessions[sessionIndex] = {
        ...nextSessions[sessionIndex],
        status: 'running',
        pausedAt: undefined,
        totalPausedMs,
        updatedAt: now,
      }
    }

    set({ activeTimer: updatedTimer, studySessions: nextSessions })
    saveToLocalStorage(`examflow_${currentUserId}_activeTimer`, updatedTimer)
    saveToLocalStorage(`examflow_${currentUserId}_sessions`, nextSessions)
  },

  stopSession: async (actualMinutes?: number) => {
    const { activeTimer, studySessions, currentUserId, pendingSync } = get()
    if (!activeTimer) return null

    const now = new Date().toISOString()
    const sessionIndex = studySessions.findIndex((s) => s.id === activeTimer.sessionId)
    if (sessionIndex === -1) {
      set({ activeTimer: null })
      return null
    }

    const session = studySessions[sessionIndex]
    const elapsedMs = Math.max(
      0,
      Date.now() - new Date(session.startedAt).getTime() - (session.totalPausedMs || 0)
    )
    const computedMinutes = Math.max(1, Math.round(elapsedMs / 60000))
    const finalMinutes = actualMinutes ?? computedMinutes

    const updatedSession: StudySession = {
      ...session,
      actualMinutes: finalMinutes,
      endedAt: now,
      status: 'completed',
      updatedAt: now,
      syncStatus: 'local',
    }

    const nextSessions = [...studySessions]
    nextSessions[sessionIndex] = updatedSession

    const nextPending = Array.from(new Set([...pendingSync, session.id]))

    set({
      studySessions: nextSessions,
      activeTimer: null,
      pendingSync: nextPending,
    })

    saveToLocalStorage(`examflow_${currentUserId}_sessions`, nextSessions)
    saveToLocalStorage('examflow_sessions', nextSessions)
    localStorage.removeItem(`examflow_${currentUserId}_activeTimer`)

    if (currentUserId && currentUserId !== 'default_user') {
      try {
        await upsertStudySession(currentUserId, updatedSession)
        updatedSession.syncStatus = 'synced'
        nextSessions[sessionIndex] = updatedSession
        set({
          studySessions: [...nextSessions],
          pendingSync: get().pendingSync.filter((id) => id !== session.id),
        })
      } catch (err) {
        console.error('Failed to sync completed session:', err)
      }
    }

    return updatedSession
  },

  // ── Notes ───────────────────────────────────────────────────

  createNote: async (noteData) => {
    const { currentUserId, notes, pendingSync } = get()
    const now = new Date().toISOString()
    const id = noteData.id || `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

    const newNote: Note = {
      id,
      userId: currentUserId,
      title: noteData.title,
      content: noteData.content,
      subjectId: noteData.subjectId,
      topicId: noteData.topicId,
      topicName: noteData.topicName,
      tags: noteData.tags || [],
      isPinned: noteData.isPinned || false,
      syncStatus: 'local',
      createdAt: now,
      updatedAt: now,
    }

    const nextNotes = [newNote, ...notes]
    const nextPending = Array.from(new Set([...pendingSync, id]))

    set({ notes: nextNotes, pendingSync: nextPending })
    saveToLocalStorage(`examflow_${currentUserId}_notes`, nextNotes)
    saveToLocalStorage('examflow_notes', nextNotes)

    if (currentUserId && currentUserId !== 'default_user') {
      try {
        await upsertNote(currentUserId, newNote)
        newNote.syncStatus = 'synced'
        set({
          notes: [...nextNotes],
          pendingSync: get().pendingSync.filter((p) => p !== id),
        })
      } catch (err) {
        console.error('Failed to sync created note:', err)
      }
    }

    return newNote
  },

  updateNote: async (noteId: string, updates: Partial<Note>) => {
    const { currentUserId, notes, pendingSync } = get()
    const targetIndex = notes.findIndex((n) => n.id === noteId)
    if (targetIndex === -1) return

    const now = new Date().toISOString()
    const updatedNote: Note = {
      ...notes[targetIndex],
      ...updates,
      updatedAt: now,
      syncStatus: 'local',
    }

    const nextNotes = [...notes]
    nextNotes[targetIndex] = updatedNote
    const nextPending = Array.from(new Set([...pendingSync, noteId]))

    set({ notes: nextNotes, pendingSync: nextPending })
    saveToLocalStorage(`examflow_${currentUserId}_notes`, nextNotes)
    saveToLocalStorage('examflow_notes', nextNotes)

    if (currentUserId && currentUserId !== 'default_user') {
      try {
        await upsertNote(currentUserId, updatedNote)
        updatedNote.syncStatus = 'synced'
        nextNotes[targetIndex] = updatedNote
        set({
          notes: [...nextNotes],
          pendingSync: get().pendingSync.filter((p) => p !== noteId),
        })
      } catch (err) {
        console.error('Failed to sync updated note:', err)
      }
    }
  },

  deleteNote: async (noteId: string) => {
    const { currentUserId, notes, pendingSync } = get()
    const nextNotes = notes.filter((n) => n.id !== noteId)

    set({
      notes: nextNotes,
      pendingSync: pendingSync.filter((p) => p !== noteId),
    })

    saveToLocalStorage(`examflow_${currentUserId}_notes`, nextNotes)
    saveToLocalStorage('examflow_notes', nextNotes)

    if (currentUserId && currentUserId !== 'default_user') {
      try {
        await deleteNoteFirestore(currentUserId, noteId)
      } catch (err) {
        console.error('Failed to delete note from Firestore:', err)
      }
    }
  },

  // ── Settings ────────────────────────────────────────────────

  updateSettings: async (updates: Partial<UserSettings>) => {
    const { currentUserId, settings, pendingSync } = get()
    const now = new Date().toISOString()

    const updated: UserSettings = {
      ...(settings || defaultSettings),
      ...updates,
      userId: currentUserId,
      updatedAt: now,
      syncStatus: 'local',
    }

    const nextPending = Array.from(new Set([...pendingSync, 'settings']))

    set({ settings: updated, pendingSync: nextPending })
    saveToLocalStorage(`examflow_${currentUserId}_settings`, updated)
    saveToLocalStorage('examflow_settings', updated)

    if (currentUserId && currentUserId !== 'default_user') {
      try {
        await updateUserSettingsFirestore(currentUserId, updated)
        updated.syncStatus = 'synced'
        set({
          settings: updated,
          pendingSync: get().pendingSync.filter((p) => p !== 'settings'),
        })
      } catch (err) {
        console.error('Failed to sync updated settings:', err)
      }
    }
  },

  // ── Backup / Export / Import ────────────────────────────────

  exportData: () => {
    const state = get()
    const backupObj = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      userId: state.currentUserId,
      taskCompletions: Array.from(state.taskCompletions.values()),
      topicProgress: Array.from(state.topicProgress.values()),
      recallTasks: state.recallTasks,
      studySessions: state.studySessions,
      notes: state.notes,
      settings: state.settings,
    }
    return JSON.stringify(backupObj, null, 2)
  },

  importData: (input: string | Record<string, any>) => {
    try {
      const data = typeof input === 'string' ? JSON.parse(input) : input
      if (!data || typeof data !== 'object') return false

      const { currentUserId } = get()
      const completionsMap = new Map<string, TaskCompletion>()
      if (Array.isArray(data.taskCompletions)) {
        data.taskCompletions.forEach((c: TaskCompletion) => completionsMap.set(c.blockId, c))
      }

      const progressMap = new Map<string, TopicProgress>()
      if (Array.isArray(data.topicProgress)) {
        data.topicProgress.forEach((p: TopicProgress) => progressMap.set(p.id, p))
      }

      const recalls = Array.isArray(data.recallTasks) ? data.recallTasks : []
      const sessions = Array.isArray(data.studySessions) ? data.studySessions : []
      const notes = Array.isArray(data.notes) ? data.notes : []
      const settings = data.settings || get().settings

      set({
        taskCompletions: completionsMap,
        topicProgress: progressMap,
        recallTasks: recalls,
        studySessions: sessions,
        notes,
        settings,
      })

      // Mirror imported data into local storage
      saveToLocalStorage(`examflow_${currentUserId}_completions`, Array.from(completionsMap.values()))
      saveToLocalStorage(`examflow_${currentUserId}_topics`, Array.from(progressMap.values()))
      saveToLocalStorage(`examflow_${currentUserId}_recalls`, recalls)
      saveToLocalStorage(`examflow_${currentUserId}_sessions`, sessions)
      saveToLocalStorage(`examflow_${currentUserId}_notes`, notes)
      if (settings) saveToLocalStorage(`examflow_${currentUserId}_settings`, settings)

      return true
    } catch (e) {
      console.error('Failed to import data:', e)
      return false
    }
  },

  clearStore: () => {
    set({
      taskCompletions: new Map(),
      topicProgress: new Map(),
      recallTasks: [],
      studySessions: [],
      notes: [],
      settings: defaultSettings,
      pendingSync: [],
      activeTimer: null,
      syncStatus: 'idle',
    })
  },
}))
