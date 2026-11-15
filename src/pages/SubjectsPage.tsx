import React, { useMemo } from 'react'
import { SubjectCard } from '@/components/subjects/SubjectCard'
import { useSubjectProgress } from '@/hooks/useSubjectProgress'
import { BookOpen, Calendar } from 'lucide-react'

export default function SubjectsPage() {
  const { allReadiness } = useSubjectProgress()

  // Sorted by exam date
  const sortedSubjects = useMemo(() => {
    return [...allReadiness].sort(
      (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    )
  }, [allReadiness])

  const nextExam = sortedSubjects.find((s) => s.daysLeft >= 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 mb-0.5">
          <BookOpen className="w-6 h-6 text-primary-500" />
          Subjects
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          6 core modules · Ordered by exam date · Tap for readiness details
        </p>
      </div>

      {/* Next exam highlight */}
      {nextExam && (
        <div
          className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl border"
          style={{
            backgroundColor: `${nextExam.subjectColor}12`,
            borderColor: `${nextExam.subjectColor}30`,
          }}
        >
          <Calendar className="w-4 h-4 shrink-0" style={{ color: nextExam.subjectColor }} />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Next: <span style={{ color: nextExam.subjectColor }}>{nextExam.subjectName}</span>
            {' '}
            <span className="text-gray-500 dark:text-gray-400 font-normal">
              in {nextExam.daysLeft === 0 ? 'today' : `${nextExam.daysLeft} day${nextExam.daysLeft !== 1 ? 's' : ''}`}
            </span>
          </span>
        </div>
      )}

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sortedSubjects.map((readiness) => (
          <SubjectCard key={readiness.subjectId} readiness={readiness} />
        ))}
      </div>
    </div>
  )
}
