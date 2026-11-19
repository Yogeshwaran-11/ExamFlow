import React, { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import type { SyllabusUnit } from '@/data/syllabusData'
import { useSyllabusStore } from '@/store/useSyllabusStore'
import { TopicStatusBadge } from './TopicStatusBadge'
import { TopicStatusDropdown } from './TopicStatusDropdown'

interface SyllabusUnitAccordionProps {
  unit: SyllabusUnit
  subjectId: string
  examDate?: string
  isOpen?: boolean
  onToggle?: () => void
  userId?: string
  /** ignored — kept for backwards compat */
  topicRecords?: Record<string, unknown>
}

const PRIORITY_BADGE: Record<
  'high' | 'medium' | 'low',
  { label: string; className: string }
> = {
  high: {
    label: 'HIGH',
    className:
      'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
  },
  medium: {
    label: 'MED',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  },
  low: {
    label: 'LOW',
    className:
      'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  },
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export const SyllabusUnitAccordion: React.FC<SyllabusUnitAccordionProps> = ({
  unit,
  subjectId,
  examDate,
  isOpen: isOpenProp,
  onToggle: onToggleProp,
}) => {
  const [localOpen, setLocalOpen] = useState(false)
  const isOpen = isOpenProp !== undefined ? isOpenProp : localOpen
  const onToggle = onToggleProp ?? (() => setLocalOpen((p) => !p))
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const topicStatuses = useSyllabusStore((s) => s.topicStatuses)

  const daysToExam = daysUntil(examDate)

  // Completion stats
  const total = unit.topics.length
  const completedStatuses = new Set([
    'basic_understanding',
    'practiced',
    'revised',
    'exam_ready',
  ])
  const completed = unit.topics.filter((t) => {
    const rec = topicStatuses[t.id]
    const st = rec?.status ?? 'not_started'
    return completedStatuses.has(st)
  }).length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left min-h-[56px]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-black text-sm shrink-0">
          {unit.unitNumber}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
            {unit.title}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {completed}/{total} topics done
          </p>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 w-28">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor:
                  pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#6366f1',
              }}
            />
          </div>
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 w-7 text-right">
            {pct}%
          </span>
        </div>

        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>

      {/* Mobile progress bar */}
      <div className="sm:hidden px-4 pb-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor:
                  pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#6366f1',
              }}
            />
          </div>
          <span className="text-[10px] font-bold text-gray-400 w-7 text-right">
            {pct}%
          </span>
        </div>
      </div>

      {/* Topic list */}
      {isOpen && (
        <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800/60">
          {unit.topics.map((topic) => {
            const rec = topicStatuses[topic.id]
            const currentStatus = rec?.status ?? 'not_started'
            const priorityBadge = PRIORITY_BADGE[topic.priority]
            const isHighPriority = topic.priority === 'high'
            const isOverdue =
              currentStatus === 'not_started' &&
              daysToExam !== null &&
              daysToExam <= 5 &&
              daysToExam >= 0

            return (
              <div
                key={topic.id}
                className={`relative flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 cursor-pointer transition-colors ${
                  isHighPriority ? 'border-l-4 border-red-500' : 'border-l-4 border-transparent'
                }`}
                onClick={() =>
                  setOpenDropdownId(
                    openDropdownId === topic.id ? null : topic.id,
                  )
                }
              >
                {/* Topic info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
                      {topic.name}
                    </span>

                    {/* Priority badge */}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${priorityBadge.className}`}
                    >
                      {priorityBadge.label}
                    </span>

                    {/* Overdue indicator */}
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                        <AlertTriangle className="w-3 h-3" />
                        Overdue
                      </span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <TopicStatusBadge status={currentStatus} size="sm" />

                {/* Dropdown */}
                {openDropdownId === topic.id && (
                  <TopicStatusDropdown
                    topicId={topic.id}
                    subjectId={subjectId}
                    unitNumber={unit.unitNumber}
                    topicName={topic.name}
                    currentStatus={currentStatus}
                    priority={topic.priority}
                    onClose={() => setOpenDropdownId(null)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SyllabusUnitAccordion
