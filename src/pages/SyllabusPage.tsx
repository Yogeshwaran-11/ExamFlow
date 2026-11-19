import React, { useState, useMemo } from 'react'
import { Calendar, BookOpen, ChevronRight } from 'lucide-react'
import { ALL_SUBJECTS_SYLLABUS } from '@/data/syllabusData'
import { useSyllabusStore } from '@/store/useSyllabusStore'
import { SyllabusUnitAccordion } from '@/components/syllabus/SyllabusUnitAccordion'
import { TopicStatusBadge } from '@/components/syllabus/TopicStatusBadge'

type PriorityFilter = 'all' | 'high' | 'medium' | 'low'

const SUBJECT_TABS = ALL_SUBJECTS_SYLLABUS.map((s) => ({
  id: s.subjectId,
  label: s.shortCode,
  color: s.color,
  examDate: s.examDate,
  fullName: s.subjectName,
}))

function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  )
}

export default function SyllabusPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    SUBJECT_TABS[0]?.id ?? '',
  )
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [openUnits, setOpenUnits] = useState<Record<number, boolean>>({
    1: true,
  })

  const getSubjectCompletion = useSyllabusStore((s) => s.getSubjectCompletion)
  const topicStatuses = useSyllabusStore((s) => s.topicStatuses)

  const selectedSubjectData = useMemo(
    () => ALL_SUBJECTS_SYLLABUS.find((s) => s.subjectId === selectedSubjectId),
    [selectedSubjectId],
  )

  const selectedTab = SUBJECT_TABS.find((t) => t.id === selectedSubjectId)
  const daysLeft = selectedTab ? daysUntil(selectedTab.examDate) : 0

  // Filter units/topics by priority
  const filteredUnits = useMemo(() => {
    if (!selectedSubjectData) return []
    if (priorityFilter === 'all') return selectedSubjectData.units
    return selectedSubjectData.units.map((unit) => ({
      ...unit,
      topics: unit.topics.filter((t) => t.priority === priorityFilter),
    })).filter((u) => u.topics.length > 0)
  }, [selectedSubjectData, priorityFilter])

  const completion = selectedSubjectId
    ? getSubjectCompletion(selectedSubjectId)
    : 0

  // High priority incomplete topics for bottom section
  const highPriorityIncomplete = useMemo(() => {
    if (!selectedSubjectData) return []
    return selectedSubjectData.units.flatMap((u) =>
      u.topics.filter((t) => {
        const rec = topicStatuses[t.id]
        const st = rec?.status ?? 'not_started'
        return (
          t.priority === 'high' &&
          (st === 'not_started' || st === 'in_progress')
        )
      }),
    )
  }, [selectedSubjectData, topicStatuses])

  const toggleUnit = (unitNumber: number) => {
    setOpenUnits((prev) => ({ ...prev, [unitNumber]: !prev[unitNumber] }))
  }

  const daysColor =
    daysLeft <= 3
      ? 'text-rose-600 dark:text-rose-400'
      : daysLeft <= 7
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-primary-600 dark:text-primary-400'

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Syllabus
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          6 Subjects · Track your topic coverage
        </p>
      </div>

      {/* Priority filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {(['all', 'high', 'medium', 'low'] as PriorityFilter[]).map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors min-h-[36px] ${
              priorityFilter === p
                ? p === 'high'
                  ? 'bg-red-600 text-white'
                  : p === 'medium'
                  ? 'bg-amber-500 text-white'
                  : p === 'low'
                  ? 'bg-gray-500 text-white'
                  : 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Subject selector tabs (horizontal scrollable) */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {SUBJECT_TABS.map((tab) => {
          const isActive = tab.id === selectedSubjectId
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedSubjectId(tab.id)
                setOpenUnits({ 1: true })
              }}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl border transition-all min-h-[56px] min-w-[64px] ${
                isActive
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              style={isActive ? { backgroundColor: tab.color } : undefined}
            >
              <span className="font-black text-sm">{tab.label}</span>
              <span
                className={`text-[10px] mt-0.5 ${
                  isActive ? 'text-white/80' : 'text-gray-400'
                }`}
              >
                {daysUntil(tab.examDate)}d
              </span>
            </button>
          )
        })}
      </div>

      {/* Subject overview */}
      {selectedSubjectData && selectedTab && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-black text-base text-gray-900 dark:text-white">
                {selectedSubjectData.subjectName}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(selectedTab.examDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <span className={`font-bold ${daysColor}`}>
                  · {daysLeft <= 0 ? 'Today!' : `${daysLeft} days`}
                </span>
              </div>
            </div>

            {/* Completion badge */}
            <div className="text-right">
              <span
                className="text-2xl font-black"
                style={{ color: selectedTab.color }}
              >
                {completion}%
              </span>
              <p className="text-[10px] text-gray-400">complete</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completion}%`,
                backgroundColor: selectedTab.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Unit accordions */}
      <div className="space-y-3">
        {filteredUnits.map((unit) => (
          <SyllabusUnitAccordion
            key={unit.unitNumber}
            unit={unit}
            subjectId={selectedSubjectId}
            examDate={selectedTab?.examDate}
            isOpen={!!openUnits[unit.unitNumber]}
            onToggle={() => toggleUnit(unit.unitNumber)}
          />
        ))}

        {filteredUnits.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            No topics match the selected priority filter.
          </div>
        )}
      </div>

      {/* High Priority Must Complete section */}
      {highPriorityIncomplete.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-4 border border-red-200 dark:border-red-900/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔴</span>
            <h3 className="font-black text-sm text-red-900 dark:text-red-200">
              High Priority — Must Complete
            </h3>
          </div>
          <div className="space-y-2">
            {highPriorityIncomplete.map((topic) => {
              const rec = topicStatuses[topic.id]
              const st = rec?.status ?? 'not_started'
              return (
                <div
                  key={topic.id}
                  className="flex items-center gap-3 p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-900/40"
                >
                  <BookOpen className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                    {topic.name}
                  </span>
                  <TopicStatusBadge status={st} size="sm" />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
