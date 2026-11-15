import React from 'react'
import { Brain, Check, AlertCircle, HelpCircle, RotateCcw } from 'lucide-react'
import type { Subject, RecallTask, RecallResult } from '@/models'

interface RecallTaskCardProps {
  task: RecallTask | any
  subject?: Subject
  onCompleteRecall?: (
    recallId: string,
    result: RecallResult,
    confidence: 1 | 2 | 3 | 4 | 5,
    notes?: string
  ) => void
  onComplete?: (result: 'remembered' | 'forgot' | 'partial') => void
  onWeakTopic?: (topicName: string) => void
}

export function RecallTaskCard({
  task,
  subject,
  onCompleteRecall,
  onComplete,
  onWeakTopic,
}: RecallTaskCardProps) {
  const isDone =
    task.status === 'completed' || task.status === 'done' || Boolean(task.result)

  const repNumber = task.repetition ?? task.recallNumber ?? 1
  const recallLabel =
    repNumber === 1
      ? '1st Recall (1d)'
      : repNumber === 2
      ? '2nd Recall (3d)'
      : '3rd Recall (7d)'

  const subjectColor = subject?.color || '#0ea5e9'
  const subjectName = subject?.shortName || subject?.name || 'Subject'

  const handleAction = (result: 'remembered' | 'partial' | 'forgot', confidence: 1 | 2 | 3 | 4 | 5) => {
    onCompleteRecall?.(task.id, result as RecallResult, confidence)
    onComplete?.(result)
    if (result === 'forgot' && onWeakTopic) {
      onWeakTopic(task.topicName)
    }
  }

  return (
    <div data-testid="recall-task-card" className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-3 transition-all">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: subjectColor }}
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
            {subjectName}
          </span>
          <span
            data-testid="recall-badge"
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
          >
            <Brain className="w-3 h-3" />
            <span>{recallLabel}</span>
          </span>
        </div>

        {task.isWeak && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
            Weak Topic
          </span>
        )}
      </div>

      <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
        {task.topicName}
      </h4>

      {!isDone ? (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <button
            type="button"
            onClick={() => handleAction('remembered', 5)}
            className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-green-50 hover:bg-green-100 dark:bg-green-950/50 dark:hover:bg-green-900/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/80 text-xs font-bold active:scale-95 transition-all min-h-[44px]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Remembered</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('partial', 3)}
            className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 text-xs font-bold active:scale-95 transition-all min-h-[44px]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Partial</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('forgot', 1)}
            className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/80 text-xs font-bold active:scale-95 transition-all min-h-[44px]"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Forgot</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {task.result === 'remembered' && (
              <span className="text-green-600 dark:text-green-400">
                ✓ Remembered (Confident)
              </span>
            )}
            {task.result === 'partial' && (
              <span className="text-amber-600 dark:text-amber-400">
                ⚠️ Partially recalled
              </span>
            )}
            {task.result === 'forgot' && (
              <span className="text-red-600 dark:text-red-400">
                ❌ Forgot (Flagged for practice)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onCompleteRecall?.(task.id, 'remembered', 3)}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 min-h-[44px] px-2"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Redo</span>
          </button>
        </div>
      )}
    </div>
  )
}
