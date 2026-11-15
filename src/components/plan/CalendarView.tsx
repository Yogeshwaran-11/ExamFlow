import React from 'react'
import { TaskCompletion } from '@/models'
import { Moon, Award, Flag, ChevronRight, CheckCircle2 } from 'lucide-react'

interface CalendarViewProps {
  days: any[]
  milestones: any[]
  completions: Record<string, TaskCompletion>
  subjectsMap: Record<string, any>
  selectedSubjectFilter: string
  selectedTaskTypeFilter: string
  onSelectDate: (dateIso: string) => void
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  days,
  milestones,
  completions,
  subjectsMap,
  selectedSubjectFilter,
  selectedTaskTypeFilter,
  onSelectDate,
}) => {
  // Group days by Phase
  const phase1Days = days.filter((d) => d.phase === 1)
  const phase2Days = days.filter((d) => d.phase === 2)

  const milestoneMap = new Map<string, any>()
  milestones.forEach((m) => milestoneMap.set(m.date, m))

  const renderPhase = (phaseNum: number, phaseDays: any[], phaseTitle: string) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          Phase {phaseNum}: {phaseTitle}
        </h3>
        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">
          {phaseDays.length} days
        </span>
      </div>

      <div className="space-y-3">
        {phaseDays.map((day) => {
          const milestone = milestoneMap.get(day.date)
          const totalBlocks = day.blocks?.length || 0

          // Filter matching blocks
          const matchingBlocks = day.blocks.filter((b: any) => {
            if (selectedSubjectFilter !== 'all' && b.subjectId !== selectedSubjectFilter) return false
            if (selectedTaskTypeFilter !== 'all' && b.taskType !== selectedTaskTypeFilter) return false
            return true
          })

          if (
            (selectedSubjectFilter !== 'all' || selectedTaskTypeFilter !== 'all') &&
            matchingBlocks.length === 0
          ) {
            return null
          }

          const completedCount = day.blocks.filter((b: any) => {
            const c = completions[b.id]
            return c?.status === 'complete' || (c?.status as any) === 'completed'
          }).length

          const isFullyDone = totalBlocks > 0 && completedCount === totalBlocks

          return (
            <div key={day.date} className="space-y-2">
              {/* Milestone Marker if present */}
              {milestone && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 flex items-start gap-2.5 my-2">
                  <Flag className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                      Milestone
                    </span>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Day Row Card */}
              <div
                onClick={() => onSelectDate(day.date)}
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-600 transition-all cursor-pointer shadow-sm group min-touch"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 text-center shrink-0">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block uppercase">
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                      <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {day.dayLabel}
                        </span>

                        {day.isLightDay && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                            <Moon className="w-3 h-3" /> Light Day
                          </span>
                        )}

                        {day.isExamDay && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold">
                            <Award className="w-3 h-3" /> Exam Day
                          </span>
                        )}

                        {isFullyDone && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        )}
                      </div>

                      {/* Blocks preview summary */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {day.blocks.map((block: any) => {
                          const sub = subjectsMap[block.subjectId]
                          return (
                            <span
                              key={block.id}
                              className="text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: sub?.color || '#9ca3af' }}
                              />
                              {block.blockName} ({block.plannedMinutes}m)
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-gray-50 dark:border-gray-800/60">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                        {(day.totalPlannedMinutes / 60).toFixed(1)} hrs
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {completedCount}/{totalBlocks} done
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div>
      {renderPhase(1, phase1Days, 'Balanced Coverage & Foundations (16 Nov - 26 Nov)')}
      {renderPhase(2, phase2Days, 'Exam Run & Targeted Revisions (27 Nov - 9 Dec)')}
    </div>
  )
}
