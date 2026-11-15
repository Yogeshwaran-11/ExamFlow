import React from 'react'
import { Moon, CheckCircle2, Clock, Sparkles, TrendingUp } from 'lucide-react'
import { minutesToHoursLabel } from '@/lib/date-utils'

interface DailyProgressProps {
  completedMinutes: number
  totalPlannedMinutes: number
  completedBlocksCount: number
  totalBlocksCount: number
  isLightDay?: boolean
  isExamDay?: boolean
  examSubjectName?: string
}

export function DailyProgress({
  completedMinutes,
  totalPlannedMinutes,
  completedBlocksCount,
  totalBlocksCount,
  isLightDay = false,
  isExamDay = false,
  examSubjectName,
}: DailyProgressProps) {
  const percentage =
    totalPlannedMinutes > 0
      ? Math.min(100, Math.round((completedMinutes / totalPlannedMinutes) * 100))
      : totalBlocksCount > 0
      ? Math.min(100, Math.round((completedBlocksCount / totalBlocksCount) * 100))
      : 0

  const remaining = Math.max(0, totalPlannedMinutes - completedMinutes)
  const radius = 26
  const circumference = 2 * Math.PI * radius

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Light day banner */}
      {isLightDay && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-100 dark:border-amber-900/40">
          <Moon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
            Light Day — Finish early & rest well tonight
          </span>
        </div>
      )}

      {/* Exam day banner */}
      {isExamDay && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 dark:bg-purple-950/50 border-b border-purple-100 dark:border-purple-900/40">
          <Sparkles className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-purple-800 dark:text-purple-200">
            Exam Day{examSubjectName ? ` — ${examSubjectName}` : ''} · Afternoon light study only
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Circular progress ring */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90" aria-hidden="true">
              <circle
                cx="32" cy="32" r={radius}
                strokeWidth="5" stroke="currentColor"
                className="text-gray-100 dark:text-gray-800"
                fill="transparent"
              />
              <circle
                cx="32" cy="32" r={radius}
                strokeWidth="5"
                stroke={percentage >= 100 ? '#22c55e' : '#0ea5e9'}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - percentage / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-sm font-black text-gray-900 dark:text-white leading-none">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
              Today's Progress
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {completedBlocksCount}/{totalBlocksCount} blocks done
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {minutesToHoursLabel(completedMinutes)} studied
                </span>
              </div>
              {remaining > 0 ? (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {minutesToHoursLabel(remaining)} remaining
                  </span>
                </div>
              ) : percentage >= 100 ? (
                <span className="text-xs font-bold text-green-600 dark:text-green-400">
                  🎉 All blocks complete!
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3.5 w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              percentage >= 100
                ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                : 'bg-gradient-to-r from-primary-600 to-primary-400'
            }`}
            style={{ width: `${Math.max(percentage > 0 ? Math.max(percentage, 2) : 0, 0)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
