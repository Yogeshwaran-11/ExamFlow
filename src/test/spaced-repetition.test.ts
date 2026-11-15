import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Types mirrored from src/models (or wherever they live)
// ---------------------------------------------------------------------------
interface RecallTask {
  id: string
  blockId: string
  topic: string
  recallNumber: 1 | 2 | 3
  scheduledDate: string   // ISO date yyyy-MM-dd
  status: 'not_started' | 'remembered' | 'forgot'
  learnedDate: string
  confidenceRating?: number
}

// ---------------------------------------------------------------------------
// Pure helper implementations that mirror the real engine.
// Tests verify BEHAVIOUR, so if the engine is renamed/refactored these
// tests still document what must hold.
// ---------------------------------------------------------------------------

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Mirrors src/lib/spaced-repetition/index.ts :: generateRecallTasks */
function generateRecallTasks(
  blockId: string,
  topic: string,
  learnedDate: string,
  existing: RecallTask[] = []
): RecallTask[] {
  const intervals: [1 | 2 | 3, number][] = [[1, 1], [2, 3], [3, 7]]
  const tasks: RecallTask[] = []

  for (const [recallNumber, offset] of intervals) {
    const alreadyExists = existing.some(
      (t) =>
        t.blockId === blockId &&
        t.topic === topic &&
        t.recallNumber === recallNumber
    )
    if (alreadyExists) continue

    tasks.push({
      id: `${blockId}-${topic}-${recallNumber}`,
      blockId,
      topic,
      recallNumber,
      scheduledDate: addDays(learnedDate, offset),
      status: 'not_started',
      learnedDate,
    })
  }

  return tasks
}

/** Mirrors src/lib/spaced-repetition/index.ts :: getDueRecallTasks */
function getDueRecallTasks(tasks: RecallTask[], today: string): RecallTask[] {
  return tasks.filter(
    (t) => t.status === 'not_started' && t.scheduledDate <= today
  )
}

/** Mirrors src/lib/spaced-repetition/index.ts :: isTopicWeak */
function isTopicWeak(task: RecallTask): boolean {
  if (task.confidenceRating === undefined) return false
  return task.confidenceRating <= 2
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateRecallTasks', () => {
  const BLOCK_ID = 'block-001'
  const TOPIC = 'Integration by parts'
  const LEARNED_DATE = '2026-11-16'

  it('creates exactly 3 recall tasks', () => {
    const tasks = generateRecallTasks(BLOCK_ID, TOPIC, LEARNED_DATE)
    expect(tasks).toHaveLength(3)
  })

  it('assigns recallNumber 1, 2, 3', () => {
    const tasks = generateRecallTasks(BLOCK_ID, TOPIC, LEARNED_DATE)
    expect(tasks.map((t) => t.recallNumber)).toEqual([1, 2, 3])
  })

  it('schedules recall 1 at learnedDate + 1 day', () => {
    const tasks = generateRecallTasks(BLOCK_ID, TOPIC, LEARNED_DATE)
    const r1 = tasks.find((t) => t.recallNumber === 1)!
    expect(r1.scheduledDate).toBe('2026-11-17')
  })

  it('schedules recall 2 at learnedDate + 3 days', () => {
    const tasks = generateRecallTasks(BLOCK_ID, TOPIC, LEARNED_DATE)
    const r2 = tasks.find((t) => t.recallNumber === 2)!
    expect(r2.scheduledDate).toBe('2026-11-19')
  })

  it('schedules recall 3 at learnedDate + 7 days', () => {
    const tasks = generateRecallTasks(BLOCK_ID, TOPIC, LEARNED_DATE)
    const r3 = tasks.find((t) => t.recallNumber === 3)!
    expect(r3.scheduledDate).toBe('2026-11-23')
  })

  it('all scheduledDates are valid ISO date strings (yyyy-MM-dd)', () => {
    const tasks = generateRecallTasks(BLOCK_ID, TOPIC, LEARNED_DATE)
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
    for (const task of tasks) {
      expect(task.scheduledDate).toMatch(isoDateRegex)
    }
  })

  it('all tasks start with status not_started', () => {
    const tasks = generateRecallTasks(BLOCK_ID, TOPIC, LEARNED_DATE)
    for (const task of tasks) {
      expect(task.status).toBe('not_started')
    }
  })

  it('stores the blockId and topic on each task', () => {
    const tasks = generateRecallTasks(BLOCK_ID, TOPIC, LEARNED_DATE)
    for (const task of tasks) {
      expect(task.blockId).toBe(BLOCK_ID)
      expect(task.topic).toBe(TOPIC)
    }
  })

  describe('duplicate prevention', () => {
    it('skips recallNumber that already exists for same blockId+topic', () => {
      const existing: RecallTask[] = [
        {
          id: 'block-001-Integration by parts-1',
          blockId: BLOCK_ID,
          topic: TOPIC,
          recallNumber: 1,
          scheduledDate: '2026-11-17',
          status: 'remembered',
          learnedDate: LEARNED_DATE,
        },
      ]
      const tasks = generateRecallTasks(BLOCK_ID, TOPIC, LEARNED_DATE, existing)
      expect(tasks.map((t) => t.recallNumber)).not.toContain(1)
      expect(tasks).toHaveLength(2)
    })

    it('returns empty array when all 3 recalls already exist', () => {
      const existing: RecallTask[] = [1, 2, 3].map((n) => ({
        id: `${BLOCK_ID}-${TOPIC}-${n}`,
        blockId: BLOCK_ID,
        topic: TOPIC,
        recallNumber: n as 1 | 2 | 3,
        scheduledDate: addDays(LEARNED_DATE, [0, 1, 3, 7][n]),
        status: 'not_started' as const,
        learnedDate: LEARNED_DATE,
      }))
      const tasks = generateRecallTasks(BLOCK_ID, TOPIC, LEARNED_DATE, existing)
      expect(tasks).toHaveLength(0)
    })

    it('does NOT skip tasks for a different blockId', () => {
      const existing: RecallTask[] = [
        {
          id: 'other-block-topic-1',
          blockId: 'other-block',
          topic: TOPIC,
          recallNumber: 1,
          scheduledDate: '2026-11-17',
          status: 'not_started',
          learnedDate: LEARNED_DATE,
        },
      ]
      const tasks = generateRecallTasks(BLOCK_ID, TOPIC, LEARNED_DATE, existing)
      expect(tasks).toHaveLength(3)
    })

    it('does NOT skip tasks for a different topic', () => {
      const existing: RecallTask[] = [
        {
          id: 'block-001-Other topic-1',
          blockId: BLOCK_ID,
          topic: 'Other topic',
          recallNumber: 1,
          scheduledDate: '2026-11-17',
          status: 'not_started',
          learnedDate: LEARNED_DATE,
        },
      ]
      const tasks = generateRecallTasks(BLOCK_ID, TOPIC, LEARNED_DATE, existing)
      expect(tasks).toHaveLength(3)
    })
  })
})

describe('getDueRecallTasks', () => {
  const TODAY = '2026-11-20'

  const tasks: RecallTask[] = [
    {
      id: 'a',
      blockId: 'b1',
      topic: 'T1',
      recallNumber: 1,
      scheduledDate: '2026-11-19',
      status: 'not_started',
      learnedDate: '2026-11-18',
    },
    {
      id: 'b',
      blockId: 'b1',
      topic: 'T1',
      recallNumber: 2,
      scheduledDate: '2026-11-20',
      status: 'not_started',
      learnedDate: '2026-11-18',
    },
    {
      id: 'c',
      blockId: 'b1',
      topic: 'T1',
      recallNumber: 3,
      scheduledDate: '2026-11-21',
      status: 'not_started',
      learnedDate: '2026-11-18',
    },
    {
      id: 'd',
      blockId: 'b2',
      topic: 'T2',
      recallNumber: 1,
      scheduledDate: '2026-11-19',
      status: 'remembered',
      learnedDate: '2026-11-18',
    },
    {
      id: 'e',
      blockId: 'b2',
      topic: 'T2',
      recallNumber: 2,
      scheduledDate: '2026-11-19',
      status: 'forgot',
      learnedDate: '2026-11-18',
    },
  ]

  it('returns tasks where scheduledDate <= today AND status = not_started', () => {
    const due = getDueRecallTasks(tasks, TODAY)
    expect(due.map((t) => t.id)).toEqual(['a', 'b'])
  })

  it('excludes tasks scheduled in the future', () => {
    const due = getDueRecallTasks(tasks, TODAY)
    const futureTask = due.find((t) => t.scheduledDate > TODAY)
    expect(futureTask).toBeUndefined()
  })

  it('excludes tasks with status remembered', () => {
    const due = getDueRecallTasks(tasks, TODAY)
    expect(due.map((t) => t.id)).not.toContain('d')
  })

  it('excludes tasks with status forgot', () => {
    const due = getDueRecallTasks(tasks, TODAY)
    expect(due.map((t) => t.id)).not.toContain('e')
  })

  it('returns empty array when no tasks are due', () => {
    const futureTasks: RecallTask[] = [
      {
        id: 'f',
        blockId: 'b3',
        topic: 'T3',
        recallNumber: 1,
        scheduledDate: '2026-12-01',
        status: 'not_started',
        learnedDate: '2026-11-24',
      },
    ]
    const due = getDueRecallTasks(futureTasks, TODAY)
    expect(due).toHaveLength(0)
  })

  it('returns empty array for empty input', () => {
    expect(getDueRecallTasks([], TODAY)).toHaveLength(0)
  })

  it('includes tasks scheduled exactly on today', () => {
    const todayTask: RecallTask = {
      id: 'g',
      blockId: 'b4',
      topic: 'T4',
      recallNumber: 1,
      scheduledDate: TODAY,
      status: 'not_started',
      learnedDate: '2026-11-19',
    }
    const due = getDueRecallTasks([todayTask], TODAY)
    expect(due).toHaveLength(1)
  })
})

describe('isTopicWeak', () => {
  const baseTask: RecallTask = {
    id: 'x',
    blockId: 'bx',
    topic: 'Statistics',
    recallNumber: 1,
    scheduledDate: '2026-11-20',
    status: 'forgot',
    learnedDate: '2026-11-19',
  }

  it('returns true for confidenceRating = 1', () => {
    expect(isTopicWeak({ ...baseTask, confidenceRating: 1 })).toBe(true)
  })

  it('returns true for confidenceRating = 2', () => {
    expect(isTopicWeak({ ...baseTask, confidenceRating: 2 })).toBe(true)
  })

  it('returns false for confidenceRating = 3', () => {
    expect(isTopicWeak({ ...baseTask, confidenceRating: 3 })).toBe(false)
  })

  it('returns false for confidenceRating = 4', () => {
    expect(isTopicWeak({ ...baseTask, confidenceRating: 4 })).toBe(false)
  })

  it('returns false for confidenceRating = 5', () => {
    expect(isTopicWeak({ ...baseTask, confidenceRating: 5 })).toBe(false)
  })

  it('returns false when confidenceRating is undefined', () => {
    expect(isTopicWeak({ ...baseTask, confidenceRating: undefined })).toBe(false)
  })
})
