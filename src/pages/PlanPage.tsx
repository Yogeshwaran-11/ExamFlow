import React, { useState, useMemo } from 'react'
import studyPlan from '@/data/study_plan.json'
import { DayView } from '@/components/plan/DayView'
import { WeekView } from '@/components/plan/WeekView'
import { CalendarView } from '@/components/plan/CalendarView'
import { TaskCompletion } from '@/models'
import { getTodayISODate } from '@/lib/date-utils'
import { useStudyPlanStore } from '@/store/useStudyPlanStore'
import { ChevronLeft, ChevronRight, Calendar, Filter, Moon, Award } from 'lucide-react'

export default function PlanPage() {
  const todayIso = useMemo(() => {
    try {
      return getTodayISODate()
    } catch {
      return '2026-11-16'
    }
  }, [])

  // Start with today if within plan range, or first plan day (2026-11-16)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const hasToday = studyPlan.dailySchedule.some((d) => d.date === todayIso)
    return hasToday ? todayIso : studyPlan.dailySchedule[0]?.date || '2026-11-16'
  })

  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'full'>('day')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('all')

  // Load task completions from localStorage + merge with Zustand store
  const storeCompletions = useStudyPlanStore((s) => s.taskCompletions)

  const [localCompletions, setLocalCompletions] = useState<Record<string, TaskCompletion>>(() => {
    try {
      const raw = localStorage.getItem('examflow_completions')
      if (raw) {
        const list: TaskCompletion[] = JSON.parse(raw)
        const map: Record<string, TaskCompletion> = {}
        list.forEach((item) => {
          map[item.blockId] = item
        })
        return map
      }
    } catch {}
    return {}
  })

  // Merged: Zustand store takes priority (it has canonical status values)
  const completions = useMemo<Record<string, TaskCompletion>>(() => {
    const merged: Record<string, TaskCompletion> = { ...localCompletions }
    if (storeCompletions instanceof Map) {
      storeCompletions.forEach((val, key) => { merged[key] = val })
    } else if (storeCompletions && typeof storeCompletions === 'object') {
      Object.assign(merged, storeCompletions)
    }
    return merged
  }, [localCompletions, storeCompletions])

  // Toggle completion (writes to localStorage + local state)
  const handleToggleComplete = (blockId: string) => {
    setLocalCompletions((prev) => {
      const existing = prev[blockId]
      const isComplete =
        existing?.status === 'complete' ||
        existing?.status === 'completed'
      const updatedItem: TaskCompletion = {
        id: blockId,
        blockId,
        userId: 'default_user',
        date: selectedDate,
        status: isComplete ? 'not_started' : 'completed',
        actualMinutes: isComplete ? 0 : 60,
        syncStatus: 'local',
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const next = { ...prev, [blockId]: updatedItem }
      try {
        localStorage.setItem('examflow_completions', JSON.stringify(Array.from(Object.values(next))))
      } catch (e) {
        console.error(e)
      }
      return next
    })
  }

  // Subjects lookup map
  const subjectsMap = useMemo(() => {
    const map: Record<string, any> = {}
    studyPlan.subjects.forEach((s) => {
      map[s.id] = s
    })
    return map
  }, [])

  // Current day schedule
  const currentDayIndex = studyPlan.dailySchedule.findIndex((d) => d.date === selectedDate)
  const currentDay = studyPlan.dailySchedule[currentDayIndex >= 0 ? currentDayIndex : 0]

  // Date navigation
  const handlePrevDate = () => {
    if (currentDayIndex > 0) {
      setSelectedDate(studyPlan.dailySchedule[currentDayIndex - 1].date)
    }
  }

  const handleNextDate = () => {
    if (currentDayIndex < studyPlan.dailySchedule.length - 1) {
      setSelectedDate(studyPlan.dailySchedule[currentDayIndex + 1].date)
    }
  }

  // Get week window (7 days around current selected day)
  const weekDays = useMemo(() => {
    if (currentDayIndex < 0) return studyPlan.dailySchedule.slice(0, 7)
    // Find window of 7 days
    const start = Math.max(0, Math.min(studyPlan.dailySchedule.length - 7, currentDayIndex - 3))
    return studyPlan.dailySchedule.slice(start, start + 7)
  }, [currentDayIndex])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Study Plan</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            24-day strategic blueprint (16 Nov – 9 Dec 2026)
          </p>
        </div>

        {/* View Tabs: Day | Week | Full Plan */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('day')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-touch ${
              activeTab === 'day'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-touch ${
              activeTab === 'week'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setActiveTab('full')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-touch ${
              activeTab === 'full'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Full Plan (24d)
          </button>
        </div>
      </div>

      {/* Date Navigation Bar (for Day & Week tabs) */}
      {activeTab !== 'full' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevDate}
              disabled={currentDayIndex <= 0}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-all min-touch"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 block uppercase tracking-widest">
                {currentDay?.dayLabel}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Day {currentDayIndex + 1} of 24
              </span>
              {currentDay?.date === todayIso && (
                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 block mt-0.5">▶ Today</span>
              )}
              {currentDay?.isLightDay && (
                <span className="text-[10px] font-semibold text-amber-500 block mt-0.5">🌙 Light Day</span>
              )}
              {currentDay?.isExamDay && (
                <span className="text-[10px] font-semibold text-purple-500 block mt-0.5">🎓 Exam Day</span>
              )}
            </div>

            <button
              onClick={handleNextDate}
              disabled={currentDayIndex >= studyPlan.dailySchedule.length - 1}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-all min-touch"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Jump to Today */}
          {currentDay?.date !== todayIso && (
            <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800/80 flex justify-center">
              <button
                onClick={() => {
                  const hasToday = studyPlan.dailySchedule.some((d) => d.date === todayIso)
                  if (hasToday) setSelectedDate(todayIso)
                }}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline py-0.5"
              >
                Jump to Today
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-1 overflow-x-auto">
        <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </span>

        {/* Subject filter chips */}
        <button
          onClick={() => setSubjectFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 min-touch ${
            subjectFilter === 'all'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          All Subjects
        </button>

        {studyPlan.subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSubjectFilter(sub.id === subjectFilter ? 'all' : sub.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 min-touch ${
              subjectFilter === sub.id
                ? 'ring-2 ring-offset-2 ring-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
            style={{
              backgroundColor: subjectFilter === sub.id ? sub.color : undefined,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: sub.color }}
            />
            {sub.shortName || sub.name}
          </button>
        ))}

        {/* Task Type Filter dropdown */}
        <select
          value={taskTypeFilter}
          onChange={(e) => setTaskTypeFilter(e.target.value)}
          className="text-xs font-semibold px-3 py-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 cursor-pointer shrink-0"
        >
          <option value="all">All Task Types</option>
          <option value="study">Study</option>
          <option value="practice">Practice</option>
          <option value="numericals">Numericals</option>
          <option value="handwritten">Handwritten</option>
          <option value="mock">Mock Exam</option>
          <option value="recall">Recall</option>
        </select>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'day' && (
        <DayView
          daySchedule={currentDay}
          completions={completions}
          onToggleComplete={handleToggleComplete}
        />
      )}

      {activeTab === 'week' && (
        <WeekView
          days={weekDays}
          currentDateIso={selectedDate}
          todayIso={todayIso}
          completions={completions}
          subjectsMap={subjectsMap}
          onSelectDate={(dateIso) => {
            setSelectedDate(dateIso)
            setActiveTab('day')
          }}
        />
      )}

      {activeTab === 'full' && (
        <CalendarView
          days={studyPlan.dailySchedule}
          milestones={studyPlan.milestones}
          completions={completions}
          subjectsMap={subjectsMap}
          selectedSubjectFilter={subjectFilter}
          selectedTaskTypeFilter={taskTypeFilter}
          onSelectDate={(dateIso) => {
            setSelectedDate(dateIso)
            setActiveTab('day')
          }}
        />
      )}
    </div>
  )
}
