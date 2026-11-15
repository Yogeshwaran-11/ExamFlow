import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronDown, ChevronUp, Play, CheckCircle } from 'lucide-react'
import type { Subject } from '@/models'

export interface WeakTopicItem {
  id: string
  subjectId: string
  topicName: string
  subjectName?: string
  color?: string
  reason?: string
}

interface WeakTopicsPanelProps {
  weakTopics: WeakTopicItem[]
  subjectsMap?: Map<string, Subject>
  onPracticeTopic?: (topicName: string, subjectId?: string) => void
}

export function WeakTopicsPanel({
  weakTopics,
  subjectsMap,
  onPracticeTopic,
}: WeakTopicsPanelProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (weakTopics.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-red-100 dark:border-red-950/60 p-4 mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left min-h-[44px]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>{weakTopics.length} Weak Topics Need Attention</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                Action Required
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Flagged from missed recalls or difficult practice sessions
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
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          {weakTopics.map((item) => {
            const subject = subjectsMap?.get(item.subjectId)
            const subjectColor = item.color || subject?.color || '#ef4444'
            const subjectName =
              item.subjectName || subject?.shortName || subject?.name || 'General'

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: subjectColor }}
                    />
                    <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase">
                      {subjectName}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {item.topicName}
                  </p>
                  {item.reason && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
                      {item.reason}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {onPracticeTopic ? (
                    <button
                      type="button"
                      onClick={() => onPracticeTopic(item.topicName, item.subjectId)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold active:scale-95 transition-all min-h-[44px]"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Practice</span>
                    </button>
                  ) : (
                    <Link
                      to={`/timer?topic=${encodeURIComponent(
                        item.topicName
                      )}&subject=${item.subjectId}`}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold active:scale-95 transition-all min-h-[44px]"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Practice</span>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
