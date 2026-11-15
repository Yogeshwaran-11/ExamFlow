import React from 'react'
import { TaskCompletion } from '@/models'
import { Moon, Award, CheckCircle } from 'lucide-react'

interface WeekViewProps {
  days: any[]
  currentDateIso: string
  todayIso: string
  completions: Record<string, TaskCompletion>
  subjectsMap: Record<string, any>
  onSelectDate: (dateIso: string) => void
}

export const WeekView: React.FC<WeekViewProps> = ({
  days,
  currentDateIso,
  todayIso,
  completions,
  subjectsMap,
  onSelectDate,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
      {days.map((day: any) => {
        const isSelected = day.date === currentDateIso
        const isToday = day.date === todayIso
        const totalBlocks = day.blocks?.length || 0

        const completedCount = day.blocks.filter((b: any) => {
          const c = completions[b.id]
          return c?.status === 'complete' || (c?.status as any) === 'completed'
        }).length

        const completionPercent = totalBlocks > 0 ? Math.round((completedCount / totalBlocks) * 100) : 0

        // Extract subjects in this day for dots
        const daySubjectIds = Array.from(new Set(day.blocks.map((b: any) => b.subjectId).filter(Boolean)))

        return (
          <button
            key={day.date}
            onClick={() => onSelectDate(day.date)}
            className={`min-h-[140px] p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group min-touch ${
              isSelected
                ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/10 dark:bg-primary-950/20'
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
            }`}
          >
            <div>
              {/* Header: Date + Badges */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 block uppercase tracking-wider">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                  <span
                    className={`text-base font-bold ${
                      isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {new Date(day.date).getDate()}{' '}
                    <span className="text-xs font-normal text-gray-500">
                      {new Date(day.date).toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {day.isLightDay && (
                    <span title="Light Day" className="text-amber-500">
                      <Moon className="w-4 h-4 fill-amber-500/20" />
                    </span>
                  )}
                  {day.isExamDay && (
                    <span title="Exam Day" className="text-rose-500">
                      <Award className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>

              {/* Subject Color Dots */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {daySubjectIds.map((subId: any) => {
                  const sub = subjectsMap[subId]
                  return (
                    <span
                      key={subId}
                      title={sub?.name || subId}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sub?.color || '#0ea5e9' }}
                    />
                  )
                })}
              </div>
            </div>

            {/* Bottom Progress */}
            <div className="mt-4 pt-2 border-t border-gray-50 dark:border-gray-800/80">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-gray-500 dark:text-gray-400">
                  {completedCount}/{totalBlocks} blocks
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {completionPercent}%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
