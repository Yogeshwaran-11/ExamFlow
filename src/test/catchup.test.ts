import { describe, it, expect } from 'vitest'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type BlockPriority = 'next-exam-practice' | 'it-numerical' | 'prob-anova' | 'core' | 'skimmed'

interface StudyBlockMeta {
  id: string
  date: string        // yyyy-MM-dd
  subject: string
  topic: string
  status: 'not_started' | 'completed' | 'skipped'
  priority: BlockPriority
  isSkimmed: boolean
  isProtected: boolean // cannot be dropped
}

// ---------------------------------------------------------------------------
// Pure catchup engine (mirrors src/lib/catchup/index.ts)
// ---------------------------------------------------------------------------

/** Returns blocks that are past-due (before today) and not completed. */
function getMissedBlocks(blocks: StudyBlockMeta[], today: string): StudyBlockMeta[] {
  return blocks.filter((b) => b.date < today && b.status === 'not_started')
}

const PRIORITY_ORDER: BlockPriority[] = [
  'next-exam-practice',
  'it-numerical',
  'prob-anova',
  'core',
  'skimmed',
]

/** Sorts missed blocks by catch-up priority (most urgent first). */
function sortByCatchupPriority(blocks: StudyBlockMeta[]): StudyBlockMeta[] {
  return [...blocks].sort(
    (a, b) =>
      PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  )
}

/**
 * Returns blocks that CAN be dropped (not protected).
 * Skimmed topics appear first; protected tasks never appear.
 */
function getDropCandidates(blocks: StudyBlockMeta[]): StudyBlockMeta[] {
  const droppable = blocks.filter((b) => !b.isProtected)
  return [...droppable].sort((a, b) => {
    // skimmed first
    if (a.isSkimmed && !b.isSkimmed) return -1
    if (!a.isSkimmed && b.isSkimmed) return 1
    return 0
  })
}

/**
 * Detects multi-day slip: returns true if there are missed blocks
 * on 2 or more consecutive dates before today.
 */
function detectMultiDaySlip(missedBlocks: StudyBlockMeta[], today: string): boolean {
  const dates = [...new Set(missedBlocks.map((b) => b.date))].sort()
  if (dates.length < 2) return false

  for (let i = 0; i < dates.length - 1; i++) {
    const a = new Date(dates[i] + 'T00:00:00Z')
    const b = new Date(dates[i + 1] + 'T00:00:00Z')
    const diffDays = (b.getTime() - a.getTime()) / 86_400_000
    if (diffDays === 1) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const TODAY = '2026-11-20'

function makeBlock(overrides: Partial<StudyBlockMeta> & { id: string; date: string }): StudyBlockMeta {
  return {
    subject: 'Math',
    topic: 'Integration',
    status: 'not_started',
    priority: 'core',
    isSkimmed: false,
    isProtected: false,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getMissedBlocks — catch-up detection', () => {
  it('a not-started block before today appears in catch-up list', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b1', date: '2026-11-18', status: 'not_started' }),
    ]
    const missed = getMissedBlocks(blocks, TODAY)
    expect(missed.map((b) => b.id)).toContain('b1')
  })

  it('a completed block before today does NOT appear in catch-up list', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b2', date: '2026-11-18', status: 'completed' }),
    ]
    expect(getMissedBlocks(blocks, TODAY)).toHaveLength(0)
  })

  it('a skipped block before today does NOT appear in catch-up list', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b3', date: '2026-11-18', status: 'skipped' }),
    ]
    expect(getMissedBlocks(blocks, TODAY)).toHaveLength(0)
  })

  it('a not-started block for today does NOT appear (not past-due)', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b4', date: TODAY, status: 'not_started' }),
    ]
    expect(getMissedBlocks(blocks, TODAY)).toHaveLength(0)
  })

  it('a not-started block in the future does NOT appear', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b5', date: '2026-11-25', status: 'not_started' }),
    ]
    expect(getMissedBlocks(blocks, TODAY)).toHaveLength(0)
  })
})

describe('sortByCatchupPriority — priority ordering', () => {
  it('next-exam-practice appears before it-numerical', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b1', date: '2026-11-18', priority: 'it-numerical' }),
      makeBlock({ id: 'b2', date: '2026-11-18', priority: 'next-exam-practice' }),
    ]
    const sorted = sortByCatchupPriority(blocks)
    expect(sorted[0].priority).toBe('next-exam-practice')
  })

  it('it-numerical appears before prob-anova', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b1', date: '2026-11-18', priority: 'prob-anova' }),
      makeBlock({ id: 'b2', date: '2026-11-18', priority: 'it-numerical' }),
    ]
    const sorted = sortByCatchupPriority(blocks)
    expect(sorted[0].priority).toBe('it-numerical')
  })

  it('prob-anova appears before core', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b1', date: '2026-11-18', priority: 'core' }),
      makeBlock({ id: 'b2', date: '2026-11-18', priority: 'prob-anova' }),
    ]
    const sorted = sortByCatchupPriority(blocks)
    expect(sorted[0].priority).toBe('prob-anova')
  })

  it('core appears before skimmed', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b1', date: '2026-11-18', priority: 'skimmed' }),
      makeBlock({ id: 'b2', date: '2026-11-18', priority: 'core' }),
    ]
    const sorted = sortByCatchupPriority(blocks)
    expect(sorted[0].priority).toBe('core')
  })

  it('full priority chain: next-exam > it-numerical > prob-anova > core > skimmed', () => {
    const priorities: BlockPriority[] = ['skimmed', 'core', 'prob-anova', 'it-numerical', 'next-exam-practice']
    const blocks = priorities.map((p, i) =>
      makeBlock({ id: `b${i}`, date: '2026-11-18', priority: p })
    )
    const sorted = sortByCatchupPriority(blocks)
    expect(sorted.map((b) => b.priority)).toEqual([
      'next-exam-practice',
      'it-numerical',
      'prob-anova',
      'core',
      'skimmed',
    ])
  })
})

describe('detectMultiDaySlip', () => {
  it('two consecutive missed days triggers multi-day slip detection', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b1', date: '2026-11-17' }),
      makeBlock({ id: 'b2', date: '2026-11-18' }),
    ]
    expect(detectMultiDaySlip(blocks, TODAY)).toBe(true)
  })

  it('missed days with a gap do NOT trigger multi-day slip', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b1', date: '2026-11-16' }),
      makeBlock({ id: 'b2', date: '2026-11-18' }),
    ]
    expect(detectMultiDaySlip(blocks, TODAY)).toBe(false)
  })

  it('single missed day does NOT trigger multi-day slip', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b1', date: '2026-11-17' }),
    ]
    expect(detectMultiDaySlip(blocks, TODAY)).toBe(false)
  })

  it('three consecutive missed days triggers multi-day slip', () => {
    const blocks: StudyBlockMeta[] = [
      makeBlock({ id: 'b1', date: '2026-11-16' }),
      makeBlock({ id: 'b2', date: '2026-11-17' }),
      makeBlock({ id: 'b3', date: '2026-11-18' }),
    ]
    expect(detectMultiDaySlip(blocks, TODAY)).toBe(true)
  })
})

describe('getDropCandidates — can-drop list', () => {
  const blocks: StudyBlockMeta[] = [
    makeBlock({ id: 'protected-exam', date: '2026-11-18', priority: 'next-exam-practice', isProtected: true }),
    makeBlock({ id: 'protected-it', date: '2026-11-18', priority: 'it-numerical', isProtected: true }),
    makeBlock({ id: 'protected-anova', date: '2026-11-18', priority: 'prob-anova', isProtected: true }),
    makeBlock({ id: 'skimmed-1', date: '2026-11-18', priority: 'skimmed', isSkimmed: true }),
    makeBlock({ id: 'core-1', date: '2026-11-18', priority: 'core' }),
    makeBlock({ id: 'skimmed-2', date: '2026-11-18', priority: 'skimmed', isSkimmed: true }),
  ]

  it('protected next-exam-practice never appears in can-drop list', () => {
    const candidates = getDropCandidates(blocks)
    expect(candidates.map((b) => b.id)).not.toContain('protected-exam')
  })

  it('protected IT numericals never appear in can-drop list', () => {
    const candidates = getDropCandidates(blocks)
    expect(candidates.map((b) => b.id)).not.toContain('protected-it')
  })

  it('protected Prob ANOVA never appears in can-drop list', () => {
    const candidates = getDropCandidates(blocks)
    expect(candidates.map((b) => b.id)).not.toContain('protected-anova')
  })

  it('skimmed topics appear first in can-drop list', () => {
    const candidates = getDropCandidates(blocks)
    expect(candidates[0].isSkimmed).toBe(true)
    expect(candidates[1].isSkimmed).toBe(true)
  })

  it('non-skimmed non-protected core blocks appear after skimmed', () => {
    const candidates = getDropCandidates(blocks)
    const coreIdx = candidates.findIndex((b) => b.id === 'core-1')
    const lastSkimmedIdx = candidates.map((b) => b.isSkimmed).lastIndexOf(true)
    expect(coreIdx).toBeGreaterThan(lastSkimmedIdx)
  })

  it('returns only droppable (non-protected) blocks', () => {
    const candidates = getDropCandidates(blocks)
    for (const c of candidates) {
      expect(c.isProtected).toBe(false)
    }
  })
})
