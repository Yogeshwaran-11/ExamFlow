import { useMemo } from 'react'
import { useStudyPlanStore } from '@/store/useStudyPlanStore'
import { getTodayISODate, addDaysToISO, daysUntil } from '@/lib/date-utils'
import studyPlan from '@/data/study_plan.json'

export function useStudyStats() {
  const taskCompletions = useStudyPlanStore((s) => s.taskCompletions)
  const studySessions = useStudyPlanStore((s) => s.studySessions)

  const todayIso = useMemo(() => {
    try {
      return getTodayISODate()
    } catch {
      return '2026-11-15'
    }
  }, [])

  // Consecutive days with >= 1 completed task
  const studyStreak = useMemo(() => {
    // Map of dates with completed tasks
    const completedDates = new Set<string>()
    Object.values(taskCompletions).forEach((tc) => {
      if (tc.status === 'completed' || tc.status === 'complete') {
        const dateStr = tc.date || (tc.createdAt ? tc.createdAt.slice(0, 10) : '')
        if (dateStr) completedDates.add(dateStr)
      }
    })

    // Also include study sessions that ended successfully
    studySessions.forEach((ss) => {
      if (ss.status === 'completed' && ss.startedAt) {
        completedDates.add(ss.startedAt.slice(0, 10))
      }
    })

    let streak = 0
    let checkDate = todayIso

    // If today hasn't had any completed task yet, streak can continue from yesterday
    if (!completedDates.has(todayIso)) {
      const yesterday = addDaysToISO(todayIso, -1)
      if (completedDates.has(yesterday)) {
        checkDate = yesterday
      } else {
        return 0
      }
    }

    while (completedDates.has(checkDate)) {
      streak++
      checkDate = addDaysToISO(checkDate, -1)
    }

    return streak
  }, [taskCompletions, studySessions, todayIso])

  // Weekly study minutes (last 7 days up to today)
  const weeklyMinutes = useMemo(() => {
    let total = 0
    const sevenDaysAgo = addDaysToISO(todayIso, -6)

    // Sum from task completions
    Object.values(taskCompletions).forEach((tc) => {
      if (tc.status === 'completed' || tc.status === 'complete' || tc.status === 'partial') {
        const d = tc.date || (tc.createdAt ? tc.createdAt.slice(0, 10) : '')
        if (d >= sevenDaysAgo && d <= todayIso) {
          total += tc.actualMinutes ?? 0
        }
      }
    })

    // Sum from study sessions if any session isn't linked to a completed block
    studySessions.forEach((ss) => {
      if (ss.status === 'completed' && ss.startedAt) {
        const d = ss.startedAt.slice(0, 10)
        if (d >= sevenDaysAgo && d <= todayIso) {
          total += ss.actualMinutes ?? ss.plannedMinutes ?? 0
        }
      }
    })

    return total
  }, [taskCompletions, studySessions, todayIso])

  // Today actual minutes
  const todayActualMinutes = useMemo(() => {
    let total = 0

    Object.values(taskCompletions).forEach((tc) => {
      const d = tc.date || (tc.createdAt ? tc.createdAt.slice(0, 10) : '')
      if (d === todayIso) {
        if (tc.status === 'completed' || tc.status === 'complete' || tc.status === 'partial') {
          total += tc.actualMinutes ?? 0
        }
      }
    })

    studySessions.forEach((ss) => {
      if (ss.startedAt && ss.startedAt.slice(0, 10) === todayIso) {
        total += ss.actualMinutes ?? 0
      }
    })

    return total
  }, [taskCompletions, studySessions, todayIso])

  // Completion rate for today's blocks or overall
  const completionRate = useMemo(() => {
    const rawDaily = studyPlan.dailySchedule as Array<{
      date: string
      blocks: Array<{ id: string; plannedMinutes: number }>
    }>

    const todayDay = rawDaily.find((d) => d.date === todayIso)
    if (todayDay && todayDay.blocks.length > 0) {
      const completedCount = todayDay.blocks.filter((b) => {
        const comp = taskCompletions[b.id]
        return comp?.status === 'complete' || comp?.status === 'completed'
      }).length
      return Math.round((completedCount / todayDay.blocks.length) * 100)
    }

    // Fallback: overall completed blocks in plan
    let totalBlocks = 0
    let completedBlocks = 0
    rawDaily.forEach((day) => {
      day.blocks.forEach((b) => {
        totalBlocks++
        const comp = taskCompletions[b.id]
        if (comp?.status === 'complete' || comp?.status === 'completed') {
          completedBlocks++
        }
      })
    })

    return totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0
  }, [taskCompletions, todayIso])

  return {
    studyStreak,
    weeklyMinutes,
    todayActualMinutes,
    completionRate,
  }
}
