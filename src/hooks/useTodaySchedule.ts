import { useState, useMemo, useCallback } from 'react'
import studyPlan from '@/data/study_plan.json'
import { getTodayISODate } from '@/lib/date-utils'
import { useStudyPlanStore } from '@/store/useStudyPlanStore'
import type { Subject, TaskCompletion } from '@/models'

export interface DailyScheduleBlock {
  id: string
  blockName: string
  blockLabel: string
  subjectId: string | null
  plannedMinutes: number
  topics: string[]
  taskType: string
  isHandwritten: boolean
  isNumerical: boolean
  isLightDay: boolean
  isExamDay: boolean
  priority: number
  isSkimmed: boolean
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
  notes?: string
  blocks: DailyScheduleBlock[]
}

export function useTodaySchedule() {
  const realTodayIso = useMemo(() => {
    try {
      return getTodayISODate()
    } catch {
      return '2026-11-15'
    }
  }, [])

  // Allow previewing Day 1 (or other dates) if today is before the plan starts
  const [overrideDate, setOverrideDate] = useState<string | null>(null)

  const planStart = studyPlan.meta.planStart || '2026-11-16'
  const planEnd = studyPlan.meta.planEnd || '2026-12-09'

  const isBeforePlan = realTodayIso < planStart
  const isAfterPlan = realTodayIso > planEnd

  // Effective date: if user requested a preview, use that; otherwise use real today
  const effectiveDate = overrideDate ?? realTodayIso

  // Read task completions from store
  const taskCompletions = useStudyPlanStore((s) => s.taskCompletions)
  const markBlockCompleteAction = useStudyPlanStore((s) => s.markBlockComplete)
  const skipBlockAction = useStudyPlanStore((s) => s.skipBlock)

  // Find DaySchedule for effective date
  const todaySchedule = useMemo(() => {
    const rawDaily = studyPlan.dailySchedule as unknown as DaySchedule[]
    return rawDaily.find((d) => d.date === effectiveDate) || null
  }, [effectiveDate])

  // Map subjects for quick lookup
  const subjectsMap = useMemo(() => {
    const map = new Map<string, Subject>()
    ;(studyPlan.subjects as unknown as Subject[]).forEach((sub) => {
      map.set(sub.id, sub)
    })
    return map
  }, [])

  // Exam subject if today is an exam day
  const examSubject = useMemo(() => {
    if (!todaySchedule?.isExamDay) return null
    if (todaySchedule.examSubjectId) {
      return subjectsMap.get(todaySchedule.examSubjectId) || null
    }
    // Fallback: look for subject with examDate matching effectiveDate
    return (
      (studyPlan.subjects as unknown as Subject[]).find(
        (s) => s.examDate === effectiveDate
      ) || null
    )
  }, [todaySchedule, effectiveDate, subjectsMap])

  const blocks: DailyScheduleBlock[] = useMemo(() => {
    if (!todaySchedule?.blocks) return []
    return todaySchedule.blocks
  }, [todaySchedule])

  // Completed & Pending blocks
  const { completedBlocks, pendingBlocks, skippedBlocks, completedMinutes } =
    useMemo(() => {
      let completedMins = 0
      const completed: DailyScheduleBlock[] = []
      const pending: DailyScheduleBlock[] = []
      const skipped: DailyScheduleBlock[] = []

      blocks.forEach((block) => {
        const completion = taskCompletions[block.id]
        const isDone =
          completion?.status === 'complete' ||
          completion?.status === 'completed'
        const isSkip = completion?.status === 'skipped'
        const isPartial = completion?.status === 'partial'

        if (isDone) {
          completed.push(block)
          completedMins += completion.actualMinutes ?? block.plannedMinutes
        } else if (isSkip) {
          skipped.push(block)
        } else {
          pending.push(block)
          if (isPartial) {
            completedMins += completion.actualMinutes ?? 0
          }
        }
      })

      return {
        completedBlocks: completed,
        pendingBlocks: pending,
        skippedBlocks: skipped,
        completedMinutes: completedMins,
      }
    }, [blocks, taskCompletions])

  const totalPlannedMinutes = todaySchedule?.totalPlannedMinutes ?? 0

  const completionRate = useMemo(() => {
    if (totalPlannedMinutes <= 0) return 0
    return Math.min(100, Math.round((completedMinutes / totalPlannedMinutes) * 100))
  }, [completedMinutes, totalPlannedMinutes])

  const markBlockComplete = useCallback(
    (blockId: string, actualMinutes?: number, notes?: string) => {
      markBlockCompleteAction(blockId, actualMinutes, notes)
    },
    [markBlockCompleteAction]
  )

  const skipBlock = useCallback(
    (blockId: string, reason: string) => {
      skipBlockAction(blockId, reason)
    },
    [skipBlockAction]
  )

  return {
    todayDate: realTodayIso,
    effectiveDate,
    overrideDate,
    setOverrideDate,
    isBeforePlan,
    isAfterPlan,
    planStart,
    planEnd,
    todaySchedule,
    blocks,
    isLightDay: Boolean(todaySchedule?.isLightDay),
    isExamDay: Boolean(todaySchedule?.isExamDay),
    examSubject,
    totalPlannedMinutes,
    completedMinutes,
    pendingBlocks,
    completedBlocks,
    skippedBlocks,
    completionRate,
    subjectsMap,
    markBlockComplete,
    skipBlock,
  }
}
