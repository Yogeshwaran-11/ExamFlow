import React, { useMemo } from 'react'
import { CheckCircle2, X, Calendar, PartyPopper } from 'lucide-react'
import { useSyllabusStore } from '@/store/useSyllabusStore'

interface PendingTasksPanelProps {
  maxItems?: number
  showAll?: boolean
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

const SUBJECT_COLORS: Record<string, string> = {
  fsd: '#6366f1',
  ads: '#0ea5e9',
  itc: '#f59e0b',
  co: '#10b981',
  java: '#f97316',
  prob: '#8b5cf6',
}

export function PendingTasksPanel({
  maxItems = 10,
  showAll = false,
}: PendingTasksPanelProps) {
  const pendingTasks = useSyllabusStore((s) => s.pendingTasks)
  const setTopicStatus = useSyllabusStore((s) => s.setTopicStatus)
  const removePendingTask = useSyllabusStore((s) => s.removePendingTask)

  const displayedTasks = useMemo(
    () => (showAll ? pendingTasks : pendingTasks.slice(0, maxItems)),
    [pendingTasks, maxItems, showAll],
  )

  if (displayedTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
        <div className="flex justify-center mb-3">
          <PartyPopper className="w-8 h-8 text-green-500" />
        </div>
        <p className="font-bold text-gray-900 dark:text-white">
          All caught up! 🎉
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          No pending or overdue topics right now.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-gray-900 dark:text-white">
            ⏳ Pending &amp; Overdue Topics
          </h3>
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {pendingTasks.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
        {displayedTasks.map((task) => {
          const priorityBadge = PRIORITY_BADGE[task.priority]
          const subjectColor =
            SUBJECT_COLORS[task.subjectId.toLowerCase()] ?? '#6366f1'

          return (
            <div
              key={task.topicId}
              className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              {/* Left: subject + topic */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {/* Subject chip */}
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: subjectColor }}
                  >
                    {task.subjectId.toUpperCase()}
                  </span>

                  {/* Priority badge */}
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${priorityBadge.className}`}
                  >
                    {priorityBadge.label}
                  </span>
                </div>

                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {task.topicName}
                </p>

                {(task.suggestedDate || task.suggestedRescheduleDate) && (
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>Suggested: {task.suggestedDate ?? task.suggestedRescheduleDate}</span>
                  </div>
                )}
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    setTopicStatus(
                      task.topicId,
                      'basic_understanding',
                      task.subjectId,
                      task.unitNumber,
                      task.topicName,
                      task.priority,
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-xs font-bold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors min-h-[36px]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Done
                </button>
                <button
                  onClick={() => removePendingTask(task.topicId)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {!showAll && pendingTasks.length > maxItems && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            +{pendingTasks.length - maxItems} more pending tasks
          </p>
        </div>
      )}
    </div>
  )
}

export default PendingTasksPanel
