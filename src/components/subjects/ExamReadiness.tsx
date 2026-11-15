import React from 'react'
import { SubjectReadiness } from '@/hooks/useSubjectProgress'
import { AlertCircle, CheckCircle2, FileEdit, BookOpen, RotateCcw, PenTool } from 'lucide-react'

interface ExamReadinessProps {
  readiness: SubjectReadiness
}

export const ExamReadiness: React.FC<ExamReadinessProps> = ({ readiness }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exam Readiness Profile</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Multi-factor preparation indicators (no misleading single score)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* 1. Topic Coverage */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
              <BookOpen className="w-4 h-4 text-primary-500" />
              1. Topic Coverage
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {readiness.coveragePercent}%{' '}
              <span className="text-xs text-gray-400 font-normal">
                ({readiness.learnedTopics}/{readiness.totalTopics} learned)
              </span>
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${readiness.coveragePercent}%` }}
            />
          </div>
        </div>

        {/* 2. Revision Completion */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
              <RotateCcw className="w-4 h-4 text-emerald-500" />
              2. Revision Completion
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {readiness.revisionPercent}%{' '}
              <span className="text-xs text-gray-400 font-normal">
                ({readiness.revisedTopics}/{readiness.totalTopics} revised)
              </span>
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${readiness.revisionPercent}%` }}
            />
          </div>
        </div>

        {/* 3. Practice Completion */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
              <FileEdit className="w-4 h-4 text-violet-500" />
              3. Practice & Problem Solving
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">{readiness.practicePercent}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-violet-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${readiness.practicePercent}%` }}
            />
          </div>
        </div>

        {/* 4. Weak Topics */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
              <AlertCircle
                className={`w-4 h-4 ${readiness.weakTopicsCount > 0 ? 'text-rose-500' : 'text-gray-400'}`}
              />
              4. Weak Topics Alert
            </span>
            <span
              className={`font-semibold ${
                readiness.weakTopicsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {readiness.weakTopicsCount > 0
                ? `${readiness.weakTopicsCount} topics need attention`
                : 'None flagged (all solid)'}
            </span>
          </div>
          {readiness.weakTopicsCount > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {readiness.weakTopics.map((wt, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-md border border-rose-200 dark:border-rose-900/50"
                >
                  {wt}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 5. Handwritten Practice */}
        {readiness.isHandwrittenRequired && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                <PenTool className="w-4 h-4 text-amber-500" />
                5. Handwritten Paper Practice
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">{readiness.handwrittenPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${readiness.handwrittenPercent}%` }}
              />
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              ✍️ Paper answers required for this exam. Practice by hand without typing.
            </p>
          </div>
        )}
      </div>

      {/* Top Remaining Actions */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          Top Remaining Actions
        </h4>
        <ul className="space-y-1.5">
          {readiness.remainingActions.map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 mt-0.5 shrink-0" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
