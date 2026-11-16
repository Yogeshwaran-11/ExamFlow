import React, { useState } from 'react'
import {
  Play,
  CheckCircle2,
  SkipForward,
  ChevronDown,
  ChevronUp,
  FileEdit,
  Hash,
  Brain,
  BookOpen,
  Award,
  Clock,
  RotateCcw,
  Sparkles,
  MessageSquare,
  X,
} from 'lucide-react'
import type { Subject, TaskCompletion } from '@/models'
import type { DailyScheduleBlock } from '@/hooks/useTodaySchedule'
import { minutesToHoursLabel } from '@/lib/date-utils'
import { getTopicWeightage } from '@/data/examWeightage'
import { ExamWeightageBadge } from '@/components/common/ExamWeightageBadge'

interface StudyBlockCardProps {
  block: DailyScheduleBlock
  subject?: Subject
  completion?: TaskCompletion | null
  onComplete: (blockId: string, actualMinutes?: number, notes?: string) => void
  onSkip: (blockId: string, reason: string) => void
  onAddNote?: (blockId: string) => void
  onStartTimer?: (
    blockId: string,
    topicName: string,
    plannedMinutes: number,
    subjectId?: string
  ) => void
}

export function StudyBlockCard({
  block,
  subject,
  completion,
  onComplete,
  onSkip,
  onAddNote,
  onStartTimer,
}: StudyBlockCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [skipReason, setSkipReason] = useState('Lack of time')
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [actualMinutesInput, setActualMinutesInput] = useState(
    String(block.plannedMinutes)
  )
  const [completionNotes, setCompletionNotes] = useState('')

  const isDone =
    completion?.status === 'complete' || completion?.status === 'completed'
  const isSkipped = completion?.status === 'skipped'
  const isPartial = completion?.status === 'partial'

  // Task type icon selection
  const renderTaskTypeIcon = () => {
    if (block.isHandwritten || block.taskType === 'handwritten') {
      return (
        <span
          title="Handwritten practice (on paper)"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full"
        >
          <FileEdit className="w-3 h-3" />
          <span>✍️ Paper</span>
        </span>
      )
    }
    if (block.isNumerical || block.taskType === 'numericals') {
      return (
        <span
          title="Numerical problem solving"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-full"
        >
          <Hash className="w-3 h-3" />
          <span>🔢 Numericals</span>
        </span>
      )
    }
    if (block.taskType === 'recall') {
      return (
        <span
          title="Spaced recall session"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/60 px-2 py-0.5 rounded-full"
        >
          <Brain className="w-3 h-3" />
          <span>🧠 Recall</span>
        </span>
      )
    }
    if (block.taskType === 'mock' || block.taskType === 'review') {
      return (
        <span
          title="Exam review / mock test"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full"
        >
          <Award className="w-3 h-3" />
          <span>📝 Mock</span>
        </span>
      )
    }
    return (
      <span
        title="Core study session"
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full"
      >
        <BookOpen className="w-3 h-3" />
        <span>📖 Study</span>
      </span>
    )
  }

  // Priority badge
  const renderPriorityBadge = () => {
    if (block.priority === 1) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
          P1
        </span>
      )
    }
    if (block.priority === 2) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          P2
        </span>
      )
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
        P3
      </span>
    )
  }

  // Topics preview
  const topics = block.topics || []
  const visibleTopics = expanded ? topics : topics.slice(0, 2)
  const remainingCount = topics.length - 2

  const has16MTopic = topics.some((t) => {
    const w = getTopicWeightage(block.subjectId, t)
    return w?.weightage === '16M'
  })

  const subjectColor = subject?.color || '#0ea5e9'
  const subjectName = subject?.name || subject?.shortName || block.subjectId || 'General'

  const handleStartTimer = () => {
    if (onStartTimer) {
      const firstTopic = topics[0] || block.blockLabel
      onStartTimer(block.id, firstTopic, block.plannedMinutes, block.subjectId || undefined)
    }
  }

  const handleConfirmComplete = () => {
    const mins = parseInt(actualMinutesInput, 10) || block.plannedMinutes
    onComplete(block.id, mins, completionNotes)
    setShowCompleteModal(false)
  }

  const handleConfirmSkip = () => {
    onSkip(block.id, skipReason)
    setShowSkipModal(false)
  }

  // Card appearance based on completion
  let cardClass =
    'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm'
  if (isDone) {
    cardClass =
      'border-green-200 bg-green-50/40 dark:bg-green-950/20 dark:border-green-900 shadow-sm'
  } else if (isSkipped) {
    cardClass =
      'border-gray-200 bg-gray-50 dark:bg-gray-900/40 dark:border-gray-800 opacity-55'
  } else if (isPartial) {
    cardClass =
      'border-amber-200 bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-900 shadow-sm'
  }

  return (
    <div
      data-testid="study-block-card"
      className={`rounded-2xl border p-4 mb-3 transition-all duration-200 relative ${cardClass}`}
    >
      {/* Subject accent bar on left */}
      <div
        className="absolute top-4 left-0 bottom-4 w-1.5 rounded-r-md"
        style={{ backgroundColor: subjectColor }}
      />

      {/* Header row: Subject, Badges & Duration */}
      <div className="flex items-start justify-between gap-2 mb-2 pl-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: subjectColor }}
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
            {subjectName}
          </span>
          {renderPriorityBadge()}
          {renderTaskTypeIcon()}
          {block.isSkimmed && (
            <span
              data-testid="skimmed-badge"
              className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 rounded-full"
            >
              ⚡ Skimmed
            </span>
          )}
          {has16MTopic && (
            <span
              title="Contains high-weightage 16-mark semester exam questions"
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/20 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 flex items-center gap-1 shadow-xs"
            >
              <Award className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-amber-500/20" />
              <span>⭐ 16M Target</span>
            </span>
          )}
        </div>

        {/* Duration badge */}
        <div className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full flex-shrink-0">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>{minutesToHoursLabel(block.plannedMinutes)}</span>
        </div>
      </div>

      {/* Block label */}
      <div className="pl-2 mb-2">
        <div className="flex items-center justify-between">
          <h3
            className={`text-base font-bold text-gray-900 dark:text-white ${
              isDone ? 'line-through text-gray-500 dark:text-gray-400' : ''
            }`}
          >
            {block.blockLabel}
          </h3>

          {/* Status badge */}
          {isDone && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Done</span>
            </span>
          )}
          {isSkipped && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skipped</span>
            </span>
          )}
        </div>

        {/* Topics list */}
        {topics.length > 0 && (
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
              {visibleTopics.map((top, idx) => {
                const weightage = getTopicWeightage(block.subjectId, top)
                return (
                  <li key={idx} className="leading-relaxed flex items-center justify-between gap-2 py-0.5">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0" />
                      <span className="truncate">{top}</span>
                    </span>
                    {weightage && <ExamWeightageBadge weightage={weightage} compact />}
                  </li>
                )
              })}
            </ul>

            {remainingCount > 0 && !expanded && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5 mt-1 pt-1 min-h-[44px]"
              >
                <span>+{remainingCount} more topics</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}

            {expanded && topics.length > 2 && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5 mt-1 pt-1 min-h-[44px]"
              >
                <span>Show less</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Notes if completed */}
        {completion?.notes && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic bg-white/70 dark:bg-gray-800/70 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
            Note: {completion.notes}
          </div>
        )}

        {/* Skip reason display */}
        {isSkipped && completion?.skipReason && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
            Reason: {completion.skipReason}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pl-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2 flex-wrap">
        {!isDone && !isSkipped ? (
          <>
            <button
              type="button"
              onClick={handleStartTimer}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all min-h-[44px]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onComplete(block.id, block.plannedMinutes, '')}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all min-h-[44px]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Done</span>
              </button>

              <button
                type="button"
                onClick={() => onSkip(block.id, 'Postponed')}
                className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 text-xs font-medium transition-all min-h-[44px]"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-gray-400">
              {isDone
                ? `Finished (${completion?.actualMinutes ?? block.plannedMinutes}m)`
                : 'Skipped'}
            </span>
            <button
              type="button"
              onClick={() => onComplete(block.id, 0, '')}
              className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 min-h-[44px] px-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-5 shadow-xl border border-gray-100 dark:border-gray-800 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Complete {block.blockLabel}
              </h4>
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Actual Study Time (minutes)
                </label>
                <input
                  type="number"
                  value={actualMinutesInput}
                  onChange={(e) => setActualMinutesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Optional Reflection Notes
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Cleared all exercises, remember to review formula sheet"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold min-h-[44px]"
              >
                Confirm Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Reason Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-5 shadow-xl border border-gray-100 dark:border-gray-800 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Skip Task
              </h4>
              <button
                type="button"
                onClick={() => setShowSkipModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Skipping helps adjust your catch-up plan without guilt. Choose a reason:
            </p>

            <div className="space-y-2 mb-4">
              {[
                'Lack of time',
                'Already mastered topic',
                'Tired / Need rest',
                'Moved to catch-up list',
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
                onClick={() => setShowSkipModal(false)}
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
