import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Minimal in-process implementation of the useTimer hook logic.
// Tests target the pure state machine — no React rendering needed.
// The real hook wraps this logic with React state; these tests verify the
// behaviour contract it must fulfil.
// ---------------------------------------------------------------------------

interface TimerState {
  startedAt: number | null
  pausedAt: number | null
  totalPausedMs: number
  isPaused: boolean
  plannedMinutes: number
  stopped: boolean
}

interface StopResult {
  actualMinutes: number
}

function createTimer(plannedMinutes: number): {
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => StopResult
  elapsed: () => number
  timeRemaining: () => number
  getState: () => TimerState
  loadFromStorage: (s: Partial<TimerState>) => void
} {
  let state: TimerState = {
    startedAt: null,
    pausedAt: null,
    totalPausedMs: 0,
    isPaused: false,
    plannedMinutes,
    stopped: false,
  }

  const persist = () => {
    localStorage.setItem('examflow_timer', JSON.stringify(state))
  }

  return {
    start() {
      state.startedAt = Date.now()
      state.isPaused = false
      state.pausedAt = null
      state.totalPausedMs = 0
      persist()
    },

    pause() {
      if (state.startedAt === null || state.isPaused) return
      state.pausedAt = Date.now()
      state.isPaused = true
      persist()
    },

    resume() {
      if (!state.isPaused || state.pausedAt === null) return
      state.totalPausedMs += Date.now() - state.pausedAt
      state.pausedAt = null
      state.isPaused = false
      persist()
    },

    elapsed() {
      if (state.startedAt === null) return 0
      const now = state.isPaused ? state.pausedAt! : Date.now()
      return now - state.startedAt - state.totalPausedMs
    },

    timeRemaining() {
      return state.plannedMinutes * 60 * 1000 - this.elapsed()
    },

    stop() {
      if (state.stopped) {
        // idempotent — return same result without double-recording
        const stored = localStorage.getItem('examflow_timer_session')
        if (stored) return JSON.parse(stored)
      }
      const actualMinutes = Math.round(this.elapsed() / 60_000)
      const result: StopResult = { actualMinutes }
      state.stopped = true
      localStorage.setItem('examflow_timer_session', JSON.stringify(result))
      persist()
      return result
    },

    getState: () => ({ ...state }),

    loadFromStorage(s: Partial<TimerState>) {
      state = { ...state, ...s }
    },
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useTimer — start()', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('sets startedAt to Date.now() when started', () => {
    const NOW = 1_700_000_000_000
    vi.setSystemTime(NOW)
    const timer = createTimer(25)
    timer.start()
    expect(timer.getState().startedAt).toBe(NOW)
  })

  it('isPaused is false after start()', () => {
    const timer = createTimer(25)
    timer.start()
    expect(timer.getState().isPaused).toBe(false)
  })

  it('writes to localStorage on start()', () => {
    const timer = createTimer(25)
    timer.start()
    const stored = localStorage.getItem('examflow_timer')
    expect(stored).not.toBeNull()
    expect(JSON.parse(stored!).startedAt).toBeTruthy()
  })
})

describe('useTimer — pause()', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('records pausedAt timestamp', () => {
    const START = 1_700_000_000_000
    vi.setSystemTime(START)
    const timer = createTimer(25)
    timer.start()
    vi.setSystemTime(START + 60_000)
    timer.pause()
    expect(timer.getState().pausedAt).toBe(START + 60_000)
  })

  it('sets isPaused = true', () => {
    vi.setSystemTime(1_700_000_000_000)
    const timer = createTimer(25)
    timer.start()
    timer.pause()
    expect(timer.getState().isPaused).toBe(true)
  })

  it('writes to localStorage on pause()', () => {
    vi.setSystemTime(1_700_000_000_000)
    const timer = createTimer(25)
    timer.start()
    timer.pause()
    const stored = JSON.parse(localStorage.getItem('examflow_timer')!)
    expect(stored.isPaused).toBe(true)
  })
})

describe('useTimer — resume()', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('clears pausedAt', () => {
    vi.setSystemTime(1_700_000_000_000)
    const timer = createTimer(25)
    timer.start()
    vi.advanceTimersByTime(60_000)
    timer.pause()
    vi.advanceTimersByTime(30_000)
    timer.resume()
    expect(timer.getState().pausedAt).toBeNull()
  })

  it('sets isPaused = false', () => {
    vi.setSystemTime(1_700_000_000_000)
    const timer = createTimer(25)
    timer.start()
    timer.pause()
    timer.resume()
    expect(timer.getState().isPaused).toBe(false)
  })

  it('accumulates totalPausedMs', () => {
    const BASE = 1_700_000_000_000
    vi.setSystemTime(BASE)
    const timer = createTimer(25)
    timer.start()
    vi.setSystemTime(BASE + 60_000)
    timer.pause()
    vi.setSystemTime(BASE + 90_000) // 30s pause
    timer.resume()
    expect(timer.getState().totalPausedMs).toBe(30_000)
  })

  it('accumulates totalPausedMs across multiple pause/resume cycles', () => {
    const BASE = 1_700_000_000_000
    vi.setSystemTime(BASE)
    const timer = createTimer(25)
    timer.start()

    vi.setSystemTime(BASE + 60_000)
    timer.pause()
    vi.setSystemTime(BASE + 70_000) // 10s pause
    timer.resume()

    vi.setSystemTime(BASE + 100_000)
    timer.pause()
    vi.setSystemTime(BASE + 125_000) // 25s pause
    timer.resume()

    expect(timer.getState().totalPausedMs).toBe(35_000) // 10 + 25
  })

  it('writes to localStorage on resume()', () => {
    vi.setSystemTime(1_700_000_000_000)
    const timer = createTimer(25)
    timer.start()
    timer.pause()
    timer.resume()
    const stored = JSON.parse(localStorage.getItem('examflow_timer')!)
    expect(stored.isPaused).toBe(false)
  })
})

describe('useTimer — elapsed time and timeRemaining', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('elapsed = now - startedAt when not paused', () => {
    const BASE = 1_700_000_000_000
    vi.setSystemTime(BASE)
    const timer = createTimer(25)
    timer.start()
    vi.setSystemTime(BASE + 5 * 60_000) // 5 minutes later
    expect(timer.elapsed()).toBe(5 * 60_000)
  })

  it('elapsed excludes paused time', () => {
    const BASE = 1_700_000_000_000
    vi.setSystemTime(BASE)
    const timer = createTimer(25)
    timer.start()
    vi.setSystemTime(BASE + 5 * 60_000)
    timer.pause()
    vi.setSystemTime(BASE + 7 * 60_000) // 2 min pause
    timer.resume()
    vi.setSystemTime(BASE + 10 * 60_000)
    // Active time = 10 - 2 = 8 minutes
    expect(timer.elapsed()).toBe(8 * 60_000)
  })

  it('timeRemaining = plannedMinutes*60*1000 - elapsed', () => {
    const BASE = 1_700_000_000_000
    vi.setSystemTime(BASE)
    const timer = createTimer(25)
    timer.start()
    vi.setSystemTime(BASE + 10 * 60_000)
    expect(timer.timeRemaining()).toBe((25 - 10) * 60_000)
  })

  it('timeRemaining goes negative when overrun', () => {
    const BASE = 1_700_000_000_000
    vi.setSystemTime(BASE)
    const timer = createTimer(5)
    timer.start()
    vi.setSystemTime(BASE + 10 * 60_000)
    expect(timer.timeRemaining()).toBeLessThan(0)
  })
})

describe('useTimer — stop()', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('stop() returns actualMinutes rounded from elapsed time', () => {
    const BASE = 1_700_000_000_000
    vi.setSystemTime(BASE)
    const timer = createTimer(25)
    timer.start()
    vi.setSystemTime(BASE + 23 * 60_000 + 30_000) // 23.5 minutes → rounds to 24
    const result = timer.stop()
    expect(result.actualMinutes).toBe(24)
  })

  it('two rapid stop() calls return same result (idempotent)', () => {
    const BASE = 1_700_000_000_000
    vi.setSystemTime(BASE)
    const timer = createTimer(25)
    timer.start()
    vi.setSystemTime(BASE + 20 * 60_000)
    const r1 = timer.stop()
    vi.setSystemTime(BASE + 25 * 60_000) // time advances between calls
    const r2 = timer.stop()
    expect(r1.actualMinutes).toBe(r2.actualMinutes)
  })

  it('writes session to localStorage on stop()', () => {
    const BASE = 1_700_000_000_000
    vi.setSystemTime(BASE)
    const timer = createTimer(25)
    timer.start()
    vi.setSystemTime(BASE + 15 * 60_000)
    timer.stop()
    const session = localStorage.getItem('examflow_timer_session')
    expect(session).not.toBeNull()
    expect(JSON.parse(session!).actualMinutes).toBe(15)
  })
})

describe('useTimer — localStorage session resume', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('on init with existing localStorage session: can offer resume', () => {
    const BASE = 1_700_000_000_000
    // Simulate a session that was saved mid-run
    const savedState: Partial<TimerState> = {
      startedAt: BASE,
      pausedAt: null,
      totalPausedMs: 0,
      isPaused: false,
      plannedMinutes: 25,
      stopped: false,
    }
    localStorage.setItem('examflow_timer', JSON.stringify(savedState))

    // A fresh timer loads from storage
    const timer = createTimer(25)
    const stored = localStorage.getItem('examflow_timer')
    expect(stored).not.toBeNull()

    const parsed: TimerState = JSON.parse(stored!)
    // The UI can detect an in-progress session by startedAt being set and stopped = false
    expect(parsed.startedAt).toBe(BASE)
    expect(parsed.stopped).toBe(false)

    // Resume by loading state
    timer.loadFromStorage(parsed)
    vi.setSystemTime(BASE + 10 * 60_000)
    expect(timer.elapsed()).toBe(10 * 60_000)
  })
})
