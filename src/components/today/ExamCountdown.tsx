import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight, Award, Sun } from 'lucide-react'
import studyPlan from '@/data/study_plan.json'
import { daysUntil, formatDate } from '@/lib/date-utils'

interface SubjectMeta {
  id: string
  name: string
  shortName: string
  examDate: string
  color: string
}

interface ExamCountdownProps {
  currentDate?: string
}

export function ExamCountdown({ currentDate }: ExamCountdownProps) {
  const subjects = useMemo(() => {
    return (studyPlan.subjects as SubjectMeta[]).slice().sort((a, b) =>
      a.examDate.localeCompare(b.examDate)
    )
  }, [])

  const nextExam = useMemo(() => {
    for (const sub of subjects) {
      const remaining = daysUntil(sub.examDate)
      if (remaining >= 0) return { ...sub, daysLeft: remaining }
    }
    return null
  }, [subjects, currentDate])

  const followingExams = useMemo(() => {
    if (!nextExam) return []
    return subjects
      .filter((s) => s.id !== nextExam.id && daysUntil(s.examDate) > 0)
      .slice(0, 3)
      .map((s) => ({ ...s, daysLeft: daysUntil(s.examDate) }))
  }, [subjects, nextExam])

  if (!nextExam) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">All Exams Completed!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Outstanding work finishing your exam schedule.</p>
          </div>
        </div>
      </div>
    )
  }

  const isExamToday = nextExam.daysLeft === 0
  const isTomorrow = nextExam.daysLeft === 1
  const isUrgent = nextExam.daysLeft <= 3
  const isSoon = nextExam.daysLeft <= 7

  let cardBg = 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
  let accentColor = nextExam.color
  let badgeBg = 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
  let countdownLabel = `${nextExam.daysLeft} days`

  if (isExamToday) {
    cardBg = 'bg-gradient-to-br from-red-50 to-amber-50 dark:from-red-950/30 dark:to-amber-950/30 border-red-200 dark:border-red-800'
    badgeBg = 'bg-red-600 text-white animate-pulse'
    countdownLabel = 'TODAY!'
  } else if (isTomorrow) {
    cardBg = 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
    badgeBg = 'bg-amber-500 text-white'
    countdownLabel = 'Tomorrow'
  } else if (isUrgent) {
    cardBg = 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-800'
    badgeBg = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
  } else if (isSoon) {
    cardBg = 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/50'
    badgeBg = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  }

  return (
    <div className={`rounded-2xl shadow-sm border p-4 transition-all duration-200 ${cardBg}`}>
      <div className="flex items-start gap-3">
        {/* Colored subject dot / icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: `${accentColor}20`, border: `1.5px solid ${accentColor}50` }}
        >
          {isExamToday ? (
            <Sun className="w-5 h-5" style={{ color: accentColor }} />
          ) : (
            <Calendar className="w-5 h-5" style={{ color: accentColor }} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Next Exam
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${badgeBg}`}>
              {countdownLabel}
            </span>
          </div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
            {nextExam.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formatDate(nextExam.examDate)} · Morning
          </p>
        </div>

        {/* Morning Mode link */}
        <Link
          to={`/exam-morning/${nextExam.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 min-h-[44px] px-1 shrink-0"
        >
          <span className="hidden sm:inline">Morning Mode</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Following exams chips */}
      {followingExams.length > 0 && (
        <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Also:</span>
          {followingExams.map((fe) => (
            <Link
              key={fe.id}
              to={`/subjects/${fe.id}`}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 text-[11px] font-semibold hover:bg-white dark:hover:bg-gray-800 transition-colors border border-black/5 dark:border-white/5"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: fe.color }} />
              {fe.shortName}
              <span className="text-gray-400">· {fe.daysLeft}d</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
