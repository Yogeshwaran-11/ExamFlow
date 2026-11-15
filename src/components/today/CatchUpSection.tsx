import React, { useState } from 'react'
import {
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  SkipForward,
  Clock,
  X,
} from 'lucide-react'
import type { Subject } from '@/models'
import type { DailyScheduleBlock } from '@/hooks/useTodaySchedule'
import { formatDate, minutesToHoursLabel } from '@/lib/date-utils'

export interface OverdueTask {
  date: string
  block: DailyScheduleBlock
}

interface CatchUpSectionProps {
  overdueTasks: OverdueTask[]
  subjectsMap?: Map<string, Subject>
  onCompleteBlock: (blockId: string, actualMinutes?: number, notes?: string) => void
  onSkipBlock: (blockId: string, reason: string) => void
}

export function CatchUpSection({
  overdueTasks,
  subjectsMap,
  onCompleteBlock,
  onSkipBlock,
}: CatchUpSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [skipTargetBlockId, setSkipTargetBlockId] = useState<string | null>(null)
  const [skipReason, setSkipReason] = useState('Lack of time')

  if (overdueTasks.length === 0) {
    return null
  }

  // Group by date
  const grouped = overdueTasks.reduce((acc, curr) => {
    if (!acc[curr.date]) {
      acc[curr.date] = []
    }
    acc[curr.date].push(curr.block)
    return acc
  }, {} as Record<string, DailyScheduleBlock[]>)

  const handleConfirmSkip = () => {
    if (skipTargetBlockId) {
      onSkipBlock(skipTargetBlockId, skipReason)
      setSkipTargetBlockId(null)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-900/60 p-4 mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left min-h-[44px]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>{overdueTasks.length} Overdue Tasks Need Catching Up</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Catch Up
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Incomplete tasks from previous days to reschedule or skip
            </p>
          </div>
        </div>

        <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-4">
          {Object.entries(grouped).map(([dateStr, blocks]) => (
            <div key={dateStr} className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <span>{formatDate(dateStr)}</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span>{blocks.length} {blocks.length === 1 ? 'task' : 'tasks'}</span>
              </div>

              <div className="space-y-2">
                {blocks.map((block) => {
                  const subject = block.subjectId
                    ? subjectsMap?.get(block.subjectId)
                    : undefined
                  const subjectColor = subject?.color || '#6366f1'
                  const subjectName = subject?.shortName || subject?.name || 'General'

                  return (
                    <div
                      key={block.id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: subjectColor }}
                          />
                          <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            {subjectName}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            • {minutesToHoursLabel(block.plannedMinutes)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                          {block.blockLabel}
                        </p>
                        {block.topics && block.topics.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {block.topics.join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onCompleteBlock(block.id, block.plannedMinutes)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold active:scale-95 transition-all min-h-[44px]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSkipTargetBlockId(block.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium active:scale-95 transition-all min-h-[44px]"
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                          <span>Skip</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skip Reason Dialog */}
      {skipTargetBlockId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-5 shadow-xl border border-gray-100 dark:border-gray-800 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Skip Overdue Task
              </h4>
              <button
                type="button"
                onClick={() => setSkipTargetBlockId(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Skipping overdue tasks keeps your plan realistic and manageable:
            </p>

            <div className="space-y-2 mb-4">
              {[
                'Lack of time',
                'Already mastered topic',
                'Deprioritized for upcoming exam',
                'Covered in another session',
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer min-h-[44px]"
                >
                  <input
                    type="radio"
                    name="skipReason"
                    value={reason}
                    checked={skipReason === reason}
                    onChange={(e) => setSkipReason(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500 w-4 h-4"
                  />
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSkipTargetBlockId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSkip}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 text-white text-xs font-bold min-h-[44px]"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
