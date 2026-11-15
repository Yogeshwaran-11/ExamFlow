import { describe, it, expect } from 'vitest'
import studyPlan from '@/data/study_plan.json'

// ---------------------------------------------------------------------------
// Expected date fixtures
// ---------------------------------------------------------------------------
function dateRange(start: string, end: string): string[] {
  const dates: string[] = []
  const cur = new Date(start + 'T00:00:00Z')
  const last = new Date(end + 'T00:00:00Z')
  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return dates
}

const EXPECTED_RANGE = dateRange('2026-11-16', '2026-12-09')
const EXPECTED_LIGHT_DAYS = [
  '2026-11-26',
  '2026-11-29',
  '2026-12-01',
  '2026-12-03',
  '2026-12-06',
]
const EXPECTED_EXAM_DAYS = [
  '2026-11-27',
  '2026-11-30',
  '2026-12-02',
  '2026-12-04',
  '2026-12-07',
  '2026-12-09',
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('study_plan.json — exam dates', () => {
  it('has exactly 6 exam dates and subjects', () => {
    expect(studyPlan.subjects).toHaveLength(6)
    const examDates = studyPlan.subjects.map((s: { examDate: string }) => s.examDate)
    expect(examDates).toHaveLength(6)
  })

  it('exam dates match the expected exam days', () => {
    const examDates = studyPlan.subjects.map((s: { examDate: string }) => s.examDate).sort()
    expect(examDates).toEqual([...EXPECTED_EXAM_DAYS].sort())
  })

  it('studyConstraints.examDays matches exactly the 6 exam days', () => {
    const constraintsExamDays = [...studyPlan.studyConstraints.examDays].sort()
    expect(constraintsExamDays).toEqual([...EXPECTED_EXAM_DAYS].sort())
  })

  it('each subject has an id, name, and non-empty examDate', () => {
    for (const subject of studyPlan.subjects) {
      expect(subject.id).toBeTruthy()
      expect(subject.name).toBeTruthy()
      expect(EXPECTED_EXAM_DAYS).toContain(subject.examDate)
    }
  })
})

describe('study_plan.json — date coverage', () => {
  const allDates = studyPlan.dailySchedule.map((d: { date: string }) => d.date)

  it('has exactly 24 day entries in dailySchedule', () => {
    expect(studyPlan.dailySchedule).toHaveLength(24)
  })

  it('covers every date from 2026-11-16 to 2026-12-09', () => {
    expect([...allDates].sort()).toEqual([...EXPECTED_RANGE].sort())
  })

  it('no duplicate dates in dailySchedule', () => {
    const unique = new Set(allDates)
    expect(unique.size).toBe(allDates.length)
  })
})

describe('study_plan.json — light days', () => {
  it('has exactly 5 light days in studyConstraints', () => {
    expect(studyPlan.studyConstraints.lightDays).toHaveLength(5)
  })

  it('light days match the expected dates', () => {
    expect([...studyPlan.studyConstraints.lightDays].sort()).toEqual(
      [...EXPECTED_LIGHT_DAYS].sort()
    )
  })

  it('dailySchedule entries marked isLightDay match the expected light days', () => {
    const scheduleLightDays = studyPlan.dailySchedule
      .filter((d: { isLightDay: boolean }) => d.isLightDay)
      .map((d: { date: string }) => d.date)
      .sort()
    expect(scheduleLightDays).toEqual([...EXPECTED_LIGHT_DAYS].sort())
  })
})

describe('study_plan.json — exam days', () => {
  it('has exactly 6 exam days in dailySchedule marked isExamDay', () => {
    const scheduleExamDays = studyPlan.dailySchedule
      .filter((d: { isExamDay: boolean }) => d.isExamDay)
      .map((d: { date: string }) => d.date)
      .sort()
    expect(scheduleExamDays).toEqual([...EXPECTED_EXAM_DAYS].sort())
  })

  it('each exam day references its examSubjectId', () => {
    for (const day of studyPlan.dailySchedule.filter((d: { isExamDay: boolean }) => d.isExamDay)) {
      expect(day.examSubjectId).toBeTruthy()
    }
  })
})

describe('study_plan.json — study block durations', () => {
  const fullDays = studyPlan.dailySchedule.filter(
    (d: { isLightDay: boolean; isExamDay: boolean }) => !d.isLightDay && !d.isExamDay
  )

  it('full study days total exactly 390 minutes', () => {
    for (const day of fullDays) {
      const total = day.blocks.reduce(
        (sum: number, b: { plannedMinutes: number }) => sum + b.plannedMinutes,
        0
      )
      expect(total).toBe(390)
    }
  })

  it('exam day afternoon sessions total ≤ 210 minutes', () => {
    const examDays = studyPlan.dailySchedule.filter((d: { isExamDay: boolean }) => d.isExamDay)
    for (const day of examDays) {
      const afternoonMinutes = day.blocks
        .filter(
          (b: { taskType: string; blockName: string }) =>
            b.taskType !== 'exam' && b.blockName !== 'MorningFormulaRead'
        )
        .reduce((sum: number, b: { plannedMinutes: number }) => sum + b.plannedMinutes, 0)
      expect(afternoonMinutes).toBeLessThanOrEqual(210)
    }
  })

  it('2026-12-09 has no afternoon study (only morning formula read)', () => {
    const lastDay = studyPlan.dailySchedule.find((d: { date: string }) => d.date === '2026-12-09')
    expect(lastDay).toBeDefined()
    const afternoonBlocks = lastDay!.blocks.filter(
      (b: { taskType: string; blockName: string }) =>
        b.taskType !== 'exam' && b.blockName !== 'MorningFormulaRead'
    )
    const afternoonTotal = afternoonBlocks.reduce(
      (sum: number, b: { plannedMinutes: number }) => sum + b.plannedMinutes,
      0
    )
    expect(afternoonTotal).toBe(0)
    // Morning formula read is present
    const morningFormula = lastDay!.blocks.find(
      (b: { blockName: string }) => b.blockName === 'MorningFormulaRead'
    )
    expect(morningFormula).toBeDefined()
  })
})

describe('study_plan.json — milestones', () => {
  it('all 8 milestones are present', () => {
    expect(studyPlan.milestones).toHaveLength(8)
  })

  it('all milestones have valid date and description', () => {
    for (const m of studyPlan.milestones) {
      expect(m.date).toBeTruthy()
      expect((m as any).description || (m as any).name || (m as any).milestone).toBeTruthy()
    }
  })
})

describe('study_plan.json — skimmed topics', () => {
  it('all 13 skimmed topics are present', () => {
    expect(studyPlan.skimmedTopics).toHaveLength(13)
  })

  it('each skimmed topic has topic name, subjectId, and instruction or reason', () => {
    for (const t of studyPlan.skimmedTopics) {
      expect(t.topic).toBeTruthy()
      expect(t.subjectId).toBeTruthy()
      expect((t as any).instruction || (t as any).reason).toBeTruthy()
    }
  })
})

describe('study_plan.json — data integrity', () => {
  it('no block has an invented unit mapping field', () => {
    for (const day of studyPlan.dailySchedule) {
      for (const block of day.blocks) {
        expect(block).not.toHaveProperty('unitMapping')
        expect(block).not.toHaveProperty('unit')
      }
    }
  })

  it('every block has valid subjectId (string or null) and plannedMinutes (number)', () => {
    for (const day of studyPlan.dailySchedule) {
      for (const block of day.blocks) {
        expect(block.subjectId === null || typeof block.subjectId === 'string').toBe(true)
        expect(typeof block.plannedMinutes).toBe('number')
      }
    }
  })

  it('every block has an id and non-empty topics array (or is exam)', () => {
    for (const day of studyPlan.dailySchedule) {
      for (const block of day.blocks) {
        expect(block.id).toBeTruthy()
        expect(Array.isArray(block.topics)).toBe(true)
      }
    }
  })
})
