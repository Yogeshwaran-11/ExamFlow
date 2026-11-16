import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play,
  Calendar,
  Sparkles,
  BookOpen,
  Brain,
  CheckCircle,
  Eye,
  RotateCcw,
  Clock,
  ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import studyPlan from '@/data/study_plan.json'
import { useTodaySchedule } from '@/hooks/useTodaySchedule'
import { useStudyStats } from '@/hooks/useStudyStats'
import { useStudyPlanStore } from '@/store/useStudyPlanStore'
import { TodayHeader } from '@/components/today/TodayHeader'
import { ExamCountdown } from '@/components/today/ExamCountdown'
import { DailyProgress } from '@/components/today/DailyProgress'
import { StudyBlockCard } from '@/components/today/StudyBlockCard'
import { RecallTaskCard } from '@/components/today/RecallTaskCard'
import { WeakTopicsPanel, WeakTopicItem } from '@/components/today/WeakTopicsPanel'
import { CatchUpSection, OverdueTask } from '@/components/today/CatchUpSection'
import { formatDate, daysUntil } from '@/lib/date-utils'
import type { RecallResult } from '@/models'

export default function TodayPage() {
  const navigate = useNavigate()
  const {
    todayDate,
    effectiveDate,
    overrideDate,
    setOverrideDate,
    isBeforePlan,
    isAfterPlan,
    planStart,
    todaySchedule,
    blocks,
    isLightDay,
    isExamDay,
    examSubject,
    totalPlannedMinutes,
    completedMinutes,
    completedBlocks,
    pendingBlocks,
    subjectsMap,
    markBlockComplete,
    skipBlock,
  } = useTodaySchedule()

  const { studyStreak, todayActualMinutes } = useStudyStats()

  // Store data for recalls, weak topics, and study plan
  const recallTasks = useStudyPlanStore((s) => s.recallTasks)
  const completeRecall = useStudyPlanStore((s) => s.completeRecall)
  const topicProgress = useStudyPlanStore((s) => s.topicProgress)
  const taskCompletions = useStudyPlanStore((s) => s.taskCompletions)
  const [isLoading, setIsLoading] = useState(false)

  // Due recall tasks for active date
  const dueRecallTasks = useMemo(() => {
    return recallTasks.filter((task) => {
      const isPending =
        task.status === 'not_started' ||
        task.status === 'pending' ||
        (!task.result && task.status !== 'completed' && task.status !== 'done')
      const isDue = task.scheduledDate <= effectiveDate
      return isPending && isDue
    })
  }, [recallTasks, effectiveDate])

  // Weak topics
  const weakTopics = useMemo<WeakTopicItem[]>(() => {
    const list: WeakTopicItem[] = []
    const seen = new Set<string>()

    // Check topicProgress from store
    Object.values(topicProgress).forEach((tp) => {
      if (tp.isWeak || tp.status === 'needs_practice' || (tp.confidenceRating && tp.confidenceRating <= 2)) {
        const key = `${tp.subjectId}-${tp.topicName}`
        if (!seen.has(key)) {
          seen.add(key)
          list.push({
            id: tp.id,
            subjectId: tp.subjectId,
            topicName: tp.topicName,
            reason: tp.isWeak ? 'Flagged as weak' : 'Needs practice',
          })
        }
      }
    })

    // Also check recall tasks marked forgot
    recallTasks.forEach((rt) => {
      if (rt.result === 'forgot' || rt.isWeak) {
        const key = `${rt.subjectId}-${rt.topicName}`
        if (!seen.has(key)) {
          seen.add(key)
          list.push({
            id: rt.id,
            subjectId: rt.subjectId,
            topicName: rt.topicName,
            reason: 'Forgot during spaced recall',
          })
        }
      }
    })

    return list
  }, [topicProgress, recallTasks])

  // Overdue tasks from previous days
  const overdueTasks = useMemo<OverdueTask[]>(() => {
    const list: OverdueTask[] = []
    const rawDaily = studyPlan.dailySchedule as Array<{
      date: string
      blocks: any[]
    }>

    rawDaily.forEach((day) => {
      // Look at days strictly before effectiveDate
      if (day.date < effectiveDate) {
        day.blocks.forEach((block) => {
          const comp = taskCompletions[block.id]
          const isDone =
            comp?.status === 'complete' ||
            comp?.status === 'completed' ||
            comp?.status === 'skipped'
          if (!isDone) {
            list.push({
              date: day.date,
              block,
            })
          }
        })
      }
    })

    return list
  }, [effectiveDate, taskCompletions])

  // Handlers
  const handleCompleteBlock = (
    blockId: string,
    actualMinutes?: number,
    notes?: string
  ) => {
    if (actualMinutes === 0) {
      markBlockComplete(blockId, 0, notes)
      toast('Block reset to uncompleted', { icon: '🔄' })
      return
    }
    markBlockComplete(blockId, actualMinutes, notes)
    toast.success('Block marked as complete!')
  }

  const handleSkipBlock = (blockId: string, reason: string) => {
    skipBlock(blockId, reason)
    toast('Block skipped: ' + reason, { icon: '⏭️' })
  }

  const handleStartTimer = (
    blockId: string,
    topicName: string,
    plannedMinutes: number,
    subjectId?: string
  ) => {
    const params = new URLSearchParams()
    if (subjectId) params.set('subject', subjectId)
    if (topicName) params.set('topic', topicName)
    if (plannedMinutes) params.set('duration', String(plannedMinutes))
    if (blockId) params.set('blockId', blockId)
    navigate(`/timer?${params.toString()}`)
  }

  const handleCompleteRecall = (
    recallId: string,
    result: RecallResult,
    confidence: 1 | 2 | 3 | 4 | 5,
    notes?: string
  ) => {
    completeRecall(recallId, result, confidence, notes)
    if (result === 'remembered') {
      toast.success('Great recall! Spacing interval increased.')
    } else if (result === 'forgot') {
      toast.error('Flagged as weak topic for extra practice.')
    } else {
      toast('Partial recall recorded.', { icon: '📝' })
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-3/4 mb-4" />
        <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4" />
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4" />
        <div className="space-y-3">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-28">
      {/* 1. Header with greeting, date, streak, settings */}
      <TodayHeader streak={studyStreak} studentName={studyPlan.meta.student || 'Yogesh'} />

      {/* 2. Before Plan Notice & Preview Switch */}
      {isBeforePlan && !overrideDate && (
        <div className="bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-950/40 dark:to-indigo-950/40 border border-primary-200 dark:border-primary-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Plan Starts Tomorrow ({formatDate(planStart)})
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                  Your 24-day Final Exam Plan begins on Monday, 16 November. Prepare your desk, review your formula sheets, and get ready!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-primary-200/60 dark:border-primary-800/60 flex items-center justify-between">
            <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
              Want to inspect Day 1's schedule now?
            </span>
            <button
              type="button"
              onClick={() => setOverrideDate(planStart)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition-all min-h-[44px]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Day 1</span>
            </button>
          </div>
        </div>
      )}

      {/* Preview active banner */}
      {overrideDate && (
        <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              Previewing Schedule for {formatDate(overrideDate)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOverrideDate(null)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline min-h-[44px] px-2 flex items-center"
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* Plan Completed banner */}
      {isAfterPlan && (
        <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl p-4 text-center">
          <h3 className="text-base font-bold text-green-900 dark:text-green-200">
            🎓 Exam Period Finished!
          </h3>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            Congratulations on completing all exam preparation days up to 9 Dec 2026.
          </p>
        </div>
      )}

      {/* 3. Next Exam Countdown */}
      <ExamCountdown currentDate={effectiveDate} />

      {/* 4. Daily Progress stats bar */}
      <DailyProgress
        completedMinutes={completedMinutes}
        totalPlannedMinutes={totalPlannedMinutes}
        completedBlocksCount={completedBlocks.length}
        totalBlocksCount={blocks.length}
        isLightDay={isLightDay}
        isExamDay={isExamDay}
        examSubjectName={examSubject?.name}
      />

      {/* 5. Today's Study Blocks List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {overrideDate ? 'Preview Study Blocks' : "Today's Study Blocks"}
            </h2>
          </div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
            {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
          </span>
        </div>

        {blocks.length > 0 ? (
          <div>
            {blocks.map((block) => (
              <StudyBlockCard
                key={block.id}
                block={block}
                subject={
                  block.subjectId
                    ? subjectsMap.get(block.subjectId)
                    : undefined
                }
                completion={taskCompletions[block.id] || null}
                onComplete={handleCompleteBlock}
                onSkip={handleSkipBlock}
                onStartTimer={handleStartTimer}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
            <CheckCircle className="w-10 h-10 text-primary-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No Study Blocks Scheduled Today
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              {isBeforePlan
                ? 'Your study plan starts tomorrow. Take today to rest or preview Day 1 above!'
                : 'Enjoy your rest, review formula sheets, or focus on pending recall tasks.'}
            </p>
          </div>
        )}
      </section>

      {/* 6. Spaced Repetition Due Recalls */}
      {dueRecallTasks.length > 0 && (
        <section className="space-y-2 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Due Recall Tasks
              </h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              {dueRecallTasks.length} due
            </span>
          </div>

          <div>
            {dueRecallTasks.map((task) => (
              <RecallTaskCard
                key={task.id}
                task={task}
                subject={subjectsMap.get(task.subjectId)}
                onCompleteRecall={handleCompleteRecall}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. Weak Topics Panel (if any) */}
      <WeakTopicsPanel
        weakTopics={weakTopics}
        subjectsMap={subjectsMap}
        onPracticeTopic={(topicName, subjectId) => {
          handleStartTimer('', topicName, 25, subjectId)
        }}
      />

      {/* 8. Catch Up Section (if any overdue blocks) */}
      <CatchUpSection
        overdueTasks={overdueTasks}
        subjectsMap={subjectsMap}
        onCompleteBlock={handleCompleteBlock}
        onSkipBlock={handleSkipBlock}
      />

      {/* 9. Floating FAB — Start Focus Session */}
      <div className="fixed bottom-20 right-4 z-30">
        <button
          type="button"
          onClick={() => navigate('/timer')}
          aria-label="Start Focus Session"
          title="Start Focus Session"
          className="w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 active:scale-95 text-white shadow-xl shadow-primary-500/30 flex items-center justify-center transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/40 border-2 border-white dark:border-gray-900"
        >
          <Play className="w-6 h-6 fill-current" />
        </button>
      </div>
    </div>
  )
}
