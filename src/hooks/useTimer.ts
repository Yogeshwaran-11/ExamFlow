import { useState, useEffect, useRef, useCallback } from 'react'

export interface TimerSessionData {
  sessionId?: string
  startedAt: number | null
  pausedAt: number | null
  totalPausedMs: number
  isPaused: boolean
  plannedMinutes: number
  stopped: boolean
  subjectId?: string
  topicName?: string
  sessionType?: 'focus' | 'break'
}

export interface StopResult {
  actualMinutes: number
}

const STORAGE_KEY = 'examflow-timer'
const LEGACY_STORAGE_KEY = 'examflow_timer'
const STOP_RESULT_KEY = 'examflow_timer_session'

export function useTimer(initialPlannedMinutes = 50, initialSubjectId = '', initialTopicName = '') {
  const [plannedMinutes, setPlannedMinutes] = useState(initialPlannedMinutes)
  const [subjectId, setSubjectId] = useState(initialSubjectId)
  const [topicName, setTopicName] = useState(initialTopicName)
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus')

  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [pausedAt, setPausedAt] = useState<number | null>(null)
  const [totalPausedMs, setTotalPausedMs] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [hasUnfinishedSession, setHasUnfinishedSession] = useState(false)

  // Display timer tick
  const [, setTick] = useState(0)
  const intervalRef = useRef<any>(null)

  // Persist state to localStorage
  const persistState = useCallback(
    (data: TimerSessionData) => {
      try {
        const serialized = JSON.stringify(data)
        localStorage.setItem(STORAGE_KEY, serialized)
        localStorage.setItem(LEGACY_STORAGE_KEY, serialized)
      } catch (e) {
        console.error('Failed to save timer state:', e)
      }
    },
    []
  )

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
      if (savedRaw) {
        const saved: TimerSessionData = JSON.parse(savedRaw)
        if (saved.startedAt && !saved.stopped) {
          setHasUnfinishedSession(true)
          setStartedAt(saved.startedAt)
          setPausedAt(saved.pausedAt)
          setTotalPausedMs(saved.totalPausedMs || 0)
          setIsPaused(!!saved.isPaused)
          setPlannedMinutes(saved.plannedMinutes || initialPlannedMinutes)
          if (saved.subjectId) setSubjectId(saved.subjectId)
          if (saved.topicName) setTopicName(saved.topicName)
          if (saved.sessionType) setSessionType(saved.sessionType)
          if (saved.sessionId) setSessionId(saved.sessionId)
        }
      }
    } catch (e) {
      console.error('Failed to load timer from localStorage:', e)
    }
  }, [initialPlannedMinutes])

  // Periodic display refresh (every 500ms)
  useEffect(() => {
    if (startedAt !== null && !isPaused && !stopped) {
      intervalRef.current = setInterval(() => {
        setTick((t) => (t + 1) % 100000)
      }, 500)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startedAt, isPaused, stopped])

  // Compute elapsed time in ms
  const getElapsedMs = useCallback(() => {
    if (startedAt === null) return 0
    const now = isPaused && pausedAt !== null ? pausedAt : Date.now()
    const elapsed = now - startedAt - totalPausedMs
    return Math.max(0, elapsed)
  }, [startedAt, isPaused, pausedAt, totalPausedMs])

  const elapsedMs = getElapsedMs()
  const totalPlannedMs = plannedMinutes * 60 * 1000
  const timeRemainingMs = Math.max(0, totalPlannedMs - elapsedMs)
  const isRunning = startedAt !== null && !isPaused && !stopped

  // Start timer
  const start = useCallback(
    (customMinutes?: number, customSubjectId?: string, customTopicName?: string, type: 'focus' | 'break' = 'focus') => {
      const now = Date.now()
      const newPlanned = customMinutes ?? plannedMinutes
      const newSubject = customSubjectId ?? subjectId
      const newTopic = customTopicName ?? topicName
      const newSessionId = `session_${now}_${Math.random().toString(36).substring(2, 7)}`

      setStartedAt(now)
      setPausedAt(null)
      setTotalPausedMs(0)
      setIsPaused(false)
      setStopped(false)
      setSessionId(newSessionId)
      setSessionType(type)
      setHasUnfinishedSession(false)
      if (customMinutes) setPlannedMinutes(customMinutes)
      if (customSubjectId) setSubjectId(customSubjectId)
      if (customTopicName) setTopicName(customTopicName)

      persistState({
        sessionId: newSessionId,
        startedAt: now,
        pausedAt: null,
        totalPausedMs: 0,
        isPaused: false,
        plannedMinutes: newPlanned,
        stopped: false,
        subjectId: newSubject,
        topicName: newTopic,
        sessionType: type,
      })
    },
    [plannedMinutes, subjectId, topicName, persistState]
  )

  // Pause timer
  const pause = useCallback(() => {
    if (startedAt === null || isPaused || stopped) return
    const now = Date.now()
    setPausedAt(now)
    setIsPaused(true)

    persistState({
      sessionId,
      startedAt,
      pausedAt: now,
      totalPausedMs,
      isPaused: true,
      plannedMinutes,
      stopped: false,
      subjectId,
      topicName,
      sessionType,
    })
  }, [startedAt, isPaused, stopped, sessionId, totalPausedMs, plannedMinutes, subjectId, topicName, sessionType, persistState])

  // Resume timer
  const resume = useCallback(() => {
    if (startedAt === null || !isPaused || pausedAt === null || stopped) return
    const now = Date.now()
    const addedPaused = now - pausedAt
    const newTotalPaused = totalPausedMs + addedPaused

    setTotalPausedMs(newTotalPaused)
    setPausedAt(null)
    setIsPaused(false)

    persistState({
      sessionId,
      startedAt,
      pausedAt: null,
      totalPausedMs: newTotalPaused,
      isPaused: false,
      plannedMinutes,
      stopped: false,
      subjectId,
      topicName,
      sessionType,
    })
  }, [startedAt, isPaused, pausedAt, stopped, totalPausedMs, sessionId, plannedMinutes, subjectId, topicName, sessionType, persistState])

  // Stop timer (idempotent)
  const stop = useCallback((): StopResult => {
    if (stopped) {
      try {
        const stored = localStorage.getItem(STOP_RESULT_KEY)
        if (stored) return JSON.parse(stored)
      } catch {}
      return { actualMinutes: Math.round(getElapsedMs() / 60000) }
    }

    const elapsed = getElapsedMs()
    const actualMinutes = Math.round(elapsed / 60000)
    const result: StopResult = { actualMinutes }

    setStopped(true)
    setIsPaused(false)
    setHasUnfinishedSession(false)

    try {
      localStorage.setItem(STOP_RESULT_KEY, JSON.stringify(result))

      // Record study session into localStorage sessions history
      const nowIso = new Date().toISOString()
      const sessionRecord = {
        id: sessionId || `session_${Date.now()}`,
        startedAt: startedAt ? new Date(startedAt).toISOString() : nowIso,
        endedAt: nowIso,
        actualMinutes,
        plannedMinutes,
        subjectId,
        topicName,
        sessionType,
        status: 'completed',
        createdAt: nowIso,
      }

      const existingSessions = (() => {
        try {
          const s = localStorage.getItem('examflow_sessions')
          return s ? JSON.parse(s) : []
        } catch {
          return []
        }
      })()

      // Avoid duplicate recording
      if (!existingSessions.some((s: any) => s.id === sessionRecord.id)) {
        localStorage.setItem('examflow_sessions', JSON.stringify([sessionRecord, ...existingSessions]))
      }
    } catch (e) {
      console.error('Failed to record session:', e)
    }

    persistState({
      sessionId,
      startedAt,
      pausedAt,
      totalPausedMs,
      isPaused: false,
      plannedMinutes,
      stopped: true,
      subjectId,
      topicName,
      sessionType,
    })

    return result
  }, [stopped, getElapsedMs, sessionId, startedAt, plannedMinutes, subjectId, topicName, sessionType, pausedAt, totalPausedMs, persistState])

  // Reset timer
  const reset = useCallback(() => {
    setStartedAt(null)
    setPausedAt(null)
    setTotalPausedMs(0)
    setIsPaused(false)
    setStopped(false)
    setHasUnfinishedSession(false)

    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
      localStorage.removeItem(STOP_RESULT_KEY)
    } catch {}
  }, [])

  return {
    timeRemaining: timeRemainingMs,
    elapsedMs,
    isRunning,
    isPaused,
    stopped,
    sessionType,
    setSessionType,
    plannedMinutes,
    setPlannedMinutes,
    subjectId,
    setSubjectId,
    topicName,
    setTopicName,
    currentSession: {
      sessionId,
      startedAt,
      pausedAt,
      totalPausedMs,
      plannedMinutes,
      subjectId,
      topicName,
      sessionType,
    },
    hasUnfinishedSession,
    start,
    pause,
    resume,
    stop,
    reset,
  }
}
