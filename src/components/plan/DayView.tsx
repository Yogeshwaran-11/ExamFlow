import React from 'react'
import { StudyBlock, TaskCompletion } from '@/models'
import { Clock, CheckCircle2, ChevronRight, PenTool, Hash, Moon, Award } from 'lucide-react'
import { getTopicWeightage } from '@/data/examWeightage'
import { ExamWeightageBadge } from '@/components/common/ExamWeightageBadge'

interface DayViewProps {
  daySchedule: any
  completions: Record<string, TaskCompletion>
  onToggleComplete: (blockId: string) => void
  onSelectBlock?: (block: any) => void
}

const TASK_TYPE_ICONS: Record<string, { label: string; icon: string; bg: string }> = {
  study: { label: 'Study', icon: '📖', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  practice: { label: 'Practice', icon: '✏️', bg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300' },
  numericals: { label: 'Numericals', icon: '🔢', bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300' },
  handwritten: { label: 'Handwritten', icon: '✍️', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  mock: { label: 'Mock Exam', icon: '📝', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
  formulasheet: { label: 'Formula Sheet', icon: '📜', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  recall: { label: 'Recall', icon: '🧠', bg: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/60 dark:text-fuchsia-300' },
  buffer: { label: 'Buffer', icon: '🛡️', bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  exam: { label: 'University Exam', icon: '🎓', bg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
}

export const DayView: React.FC<DayViewProps> = ({
  daySchedule,
  completions,
  onToggleComplete,
  onSelectBlock,
}) => {
  if (!daySchedule) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center text-gray-500 border border-gray-100 dark:border-gray-800">
        No schedule available for this date.
      </div>
    )
  }

  const { blocks, isLightDay, isExamDay, notes, dayLabel, totalPlannedMinutes } = daySchedule

  return (
    <div className="space-y-4">
      {/* Day Overview Banner */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{dayLabel}</h2>
            {isLightDay && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                <Moon className="w-3.5 h-3.5" /> Light Day
              </span>
            )}
            {isExamDay && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold">
                <Award className="w-3.5 h-3.5" /> Exam Day
              </span>
            )}
          </div>
          {notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">{notes}</p>}
        </div>

        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0">
          <Clock className="w-4 h-4 text-primary-500" />
          Planned: {(totalPlannedMinutes / 60).toFixed(1)} hrs ({totalPlannedMinutes}m)
        </div>
      </div>

      {/* Blocks List */}
      <div className="space-y-3">
        {blocks.map((block: any) => {
          const completion = completions[block.id]
          const isCompleted = completion?.status === 'complete' || (completion?.status as any) === 'completed'
          const taskCfg = TASK_TYPE_ICONS[block.taskType] || TASK_TYPE_ICONS.study

          return (
            <div
              key={block.id}
              className={`bg-white dark:bg-gray-900 rounded-2xl p-4 border transition-all shadow-sm ${
                isCompleted
                  ? 'border-emerald-200 bg-emerald-50/20 dark:bg-emerald-950/10 dark:border-emerald-800'
                  : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {/* Mark complete button */}
                  <button
                    onClick={() => onToggleComplete(block.id)}
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-colors shrink-0 min-touch ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 fill-current" />
                  </button>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {block.blockLabel || block.blockName}
                      </span>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${taskCfg.bg}`}
                      >
                        <span>{taskCfg.icon}</span>
                        {taskCfg.label}
                      </span>

                      {block.isHandwritten && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                          <PenTool className="w-3 h-3" /> Handwritten
                        </span>
                      )}

                      {block.isNumerical && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center gap-0.5">
                          <Hash className="w-3 h-3" /> Numericals
                        </span>
                      )}

                      {block.isSkimmed && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          Skimmed
                        </span>
                      )}
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {block.topics?.map((topic: string, i: number) => {
                        const weightage = getTopicWeightage(block.subjectId, topic)
                        return (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md ${
                              weightage?.weightage === '16M'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800 font-medium'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {weightage?.weightage === '16M' && <span className="text-[10px]">⭐</span>}
                            <span>{topic}</span>
                            {weightage && <ExamWeightageBadge weightage={weightage} compact />}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                    {block.plannedMinutes} min
                  </span>
                  {isCompleted && (
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
