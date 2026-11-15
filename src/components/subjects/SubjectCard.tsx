import React from 'react'
import { Link } from 'react-router-dom'
import { SubjectReadiness } from '@/hooks/useSubjectProgress'
import { Calendar, ChevronRight, PenTool, AlertTriangle } from 'lucide-react'

interface SubjectCardProps {
  readiness: SubjectReadiness
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ readiness }) => {
  const {
    subjectId,
    subjectName,
    subjectColor,
    examDate,
    daysLeft,
    coveragePercent,
    isHandwrittenRequired,
    weakTopicsCount,
    learnedTopics,
    totalTopics,
  } = readiness

  const radius = 22
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (coveragePercent / 100) * circumference

  const isUrgent = daysLeft >= 0 && daysLeft <= 3
  const isSoon = daysLeft >= 0 && daysLeft <= 7 && daysLeft > 3
  const isPast = daysLeft < 0

  const daysLabel = isPast
    ? 'Exam passed'
    : daysLeft === 0
    ? 'Exam today!'
    : daysLeft === 1
    ? 'Tomorrow'
    : `${daysLeft} days`

  const daysColor = isPast
    ? 'text-gray-400'
    : isUrgent
    ? 'text-rose-600 dark:text-rose-400'
    : isSoon
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-primary-600 dark:text-primary-400'

  return (
    <Link
      to={`/subjects/${subjectId}`}
      className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all overflow-hidden"
    >
      {/* Top color accent */}
      <div className="h-1.5 w-full" style={{ backgroundColor: subjectColor }} />

      <div className="p-4 flex-1 flex flex-col">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {subjectName}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {new Date(examDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              <span className={`text-[11px] font-bold ${daysColor}`}>
                · {daysLabel}
              </span>
            </div>
          </div>

          {/* Progress ring */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 -rotate-90" aria-label={`${coveragePercent}% complete`}>
              <circle
                cx="24" cy="24" r={radius}
                strokeWidth="4" stroke="currentColor"
                className="text-gray-100 dark:text-gray-800"
                fill="transparent"
              />
              <circle
                cx="24" cy="24" r={radius}
                strokeWidth="4"
                stroke={coveragePercent >= 80 ? '#22c55e' : coveragePercent >= 50 ? '#f59e0b' : subjectColor}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-gray-800 dark:text-gray-200">
              {coveragePercent}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${coveragePercent}%`,
              backgroundColor: coveragePercent >= 80 ? '#22c55e' : coveragePercent >= 50 ? '#f59e0b' : subjectColor,
            }}
          />
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {learnedTopics}/{totalTopics} topics
            </span>
            {isHandwrittenRequired && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded-md">
                <PenTool className="w-2.5 h-2.5" />
                Paper
              </span>
            )}
            {weakTopicsCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-md">
                <AlertTriangle className="w-2.5 h-2.5" />
                {weakTopicsCount} weak
              </span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>
    </Link>
  )
}
