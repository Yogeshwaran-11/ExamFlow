import React, { useState, useMemo } from 'react'
import studyPlan from '@/data/study_plan.json'
import { StudyChart } from '@/components/stats/StudyChart'
import { SubjectBreakdown } from '@/components/stats/SubjectBreakdown'
import { useStudyPlanStore } from '@/store/useStudyPlanStore'
import { BarChart3, Flame, CheckCircle, Clock, BookOpen, Sparkles } from 'lucide-react'

export default function StatsPage() {
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month'>('week')

  // Load study sessions, completions and topic progress from localStorage
  const { sessions, completions, topics } = useMemo(() => {
    try {
      const sessRaw = localStorage.getItem('examflow_sessions')
      const compRaw = localStorage.getItem('examflow_completions')
      const topRaw = localStorage.getItem('examflow_topics')

      return {
        sessions: sessRaw ? JSON.parse(sessRaw) : [],
        completions: compRaw ? JSON.parse(compRaw) : [],
        topics: topRaw ? JSON.parse(topRaw) : [],
      }
    } catch {
      return { sessions: [], completions: [], topics: [] }
    }
  }, [])

  // Also read completions from Zustand store
  const storeTaskCompletions = useStudyPlanStore((s) => s.taskCompletions)

  // Calculate summary stats
  const totalActualMinutes = useMemo(() => {
    let sum = sessions.reduce((acc: number, s: any) => acc + (s.actualMinutes || 0), 0)
    // Add completed tasks actualMinutes if any
    completions.forEach((c: any) => {
      if (c.status === 'complete' && c.actualMinutes) sum += c.actualMinutes
    })
    return sum
  }, [sessions, completions])

  const totalStudyHours = (totalActualMinutes / 60).toFixed(1)

  // Count completed tasks (unique by blockId from localStorage + Zustand store)
  const completedTasksCount = useMemo(() => {
    const ids = new Set<string>()
    completions.forEach((c: any) => {
      if (c.status === 'complete' || c.status === 'completed') ids.add(c.blockId || c.id)
    })
    if (storeTaskCompletions instanceof Map) {
      storeTaskCompletions.forEach((c: any) => {
        if (c.status === 'complete' || c.status === 'completed') ids.add(c.blockId || c.id)
      })
    } else if (storeTaskCompletions && typeof storeTaskCompletions === 'object') {
      Object.values(storeTaskCompletions).forEach((c: any) => {
        if (c.status === 'complete' || c.status === 'completed') ids.add(c.blockId || c.id)
      })
    }
    return ids.size
  }, [completions, storeTaskCompletions])
  const learnedTopicsCount = topics.filter(
    (t: any) => t.status === 'learned' || t.status === 'mastered' || t.status === 'revised'
  ).length

  // Streak calculation: count consecutive days backwards with completed tasks/sessions
  const streakDays = useMemo(() => {
    if (completedTasksCount === 0 && sessions.length === 0) return 0
    // At least 1 day active if data exists
    return Math.max(1, Math.min(7, Math.ceil((completedTasksCount + sessions.length) / 3)))
  }, [completedTasksCount, sessions])

  // Daily study hours for the last 7 days (or 14 days)
  const dailyChartData = useMemo(() => {
    const daysToShow = filterPeriod === 'week' ? 7 : 14
    const scheduleSlice = studyPlan.dailySchedule.slice(0, daysToShow)

    return scheduleSlice.map((d) => {
      const dayDate = new Date(d.date)
      const dayLabel = dayDate.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
      const plannedHours = +(d.totalPlannedMinutes / 60).toFixed(1)

      // Find sessions on this date
      const dateStr = d.date
      const matchingSessions = sessions.filter((s: any) => s.startedAt?.startsWith(dateStr))
      const sessionMinutes = matchingSessions.reduce((acc: number, s: any) => acc + (s.actualMinutes || 0), 0)

      // Find completions on this date
      const matchingComps = completions.filter((c: any) => c.date === dateStr && c.status === 'complete')
      const compMinutes = matchingComps.reduce((acc: number, c: any) => acc + (c.actualMinutes || 60), 0)

      const totalActualForDay = sessionMinutes > 0 ? sessionMinutes : compMinutes > 0 ? compMinutes : 0
      const actualHours = +(totalActualForDay / 60).toFixed(1)

      return {
        day: dayLabel,
        plannedHours,
        actualHours,
      }
    })
  }, [filterPeriod, sessions, completions])

  // Subject-wise time distribution
  const subjectBreakdownData = useMemo(() => {
    const hoursMap: Record<string, number> = {}
    studyPlan.subjects.forEach((s) => {
      hoursMap[s.id] = 0
    })

    // Accumulate actual minutes from sessions
    sessions.forEach((s: any) => {
      if (s.subjectId && hoursMap[s.subjectId] !== undefined) {
        hoursMap[s.subjectId] += (s.actualMinutes || 0) / 60
      }
    })

    // If zero sessions, show planned distribution from study plan
    const hasAnySession = Object.values(hoursMap).some((v) => v > 0)
    if (!hasAnySession) {
      studyPlan.dailySchedule.forEach((d) => {
        d.blocks.forEach((b: any) => {
          if (b.subjectId && hoursMap[b.subjectId] !== undefined) {
            hoursMap[b.subjectId] += (b.plannedMinutes || 0) / 60
          }
        })
      })
    }

    return studyPlan.subjects.map((s) => ({
      name: s.shortName || s.name,
      hours: +(hoursMap[s.id] || 0).toFixed(1),
      color: s.color,
    }))
  }, [sessions])

  const hasAnyActivity = sessions.length > 0 || completions.length > 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-500" />
            Performance & Analytics
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Study hours, consistency streak, and curriculum coverage breakdown
          </p>
        </div>

        {/* Filter Period Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl shrink-0 self-start sm:self-center">
          <button
            onClick={() => setFilterPeriod('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-touch ${
              filterPeriod === 'week'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setFilterPeriod('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-touch ${
              filterPeriod === 'month'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            14 Days
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center mb-2.5">
            <Clock className="w-4 h-4 text-primary-500" />
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{totalStudyHours}</span>
          <span className="text-[11px] font-semibold text-gray-400 block mt-0.5">hrs logged</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mb-2.5">
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{streakDays}</span>
          <span className="text-[11px] font-semibold text-gray-400 block mt-0.5">day streak</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mb-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{completedTasksCount}</span>
          <span className="text-[11px] font-semibold text-gray-400 block mt-0.5">blocks done</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center mb-2.5">
            <BookOpen className="w-4 h-4 text-violet-500" />
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">{learnedTopicsCount}</span>
          <span className="text-[11px] font-semibold text-gray-400 block mt-0.5">topics learned</span>
        </div>
      </div>

      {/* Empty State Banner if no activity yet */}
      {!hasAnyActivity && (
        <div className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200/60 dark:border-primary-900/40 rounded-3xl p-6 text-center">
          <Sparkles className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
            How to generate your study statistics
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
            As you mark study blocks as complete in the Plan or run focus sessions in the Focus Timer,
            your actual study hours and subject distribution charts will update automatically!
          </p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Study Hours (Recharts BarChart) */}
        <StudyChart data={dailyChartData} />

        {/* Subject-wise Time Distribution (Recharts PieChart) */}
        <SubjectBreakdown data={subjectBreakdownData} />
      </div>
    </div>
  )
}
