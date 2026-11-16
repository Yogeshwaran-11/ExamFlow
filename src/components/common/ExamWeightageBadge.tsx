import React, { useState } from 'react'
import { TopicExamWeightage } from '@/data/examWeightage'
import { Award, Zap, HelpCircle, Sparkles, BookOpen } from 'lucide-react'

interface ExamWeightageBadgeProps {
  weightage: TopicExamWeightage | null
  compact?: boolean
  showTipOnHover?: boolean
}

export const ExamWeightageBadge: React.FC<ExamWeightageBadgeProps> = ({
  weightage,
  compact = false,
  showTipOnHover = true,
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  if (!weightage) return null

  const is16M = weightage.weightage === '16M'
  const is8M = weightage.weightage === '8M'

  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
  let icon = <BookOpen className="w-2.5 h-2.5" />

  if (is16M) {
    badgeColor = 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900 border-amber-300 dark:from-amber-950/80 dark:to-amber-900/60 dark:text-amber-200 dark:border-amber-700 shadow-xs'
    icon = <Award className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-amber-500/20" />
  } else if (is8M) {
    badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
    icon = <Zap className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400 fill-indigo-400/20" />
  }

  return (
    <div className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.stopPropagation()
          setShowTooltip(!showTooltip)
        }}
        className={`inline-flex items-center gap-1 font-bold border rounded-md cursor-pointer transition-transform hover:scale-105 active:scale-95 ${badgeColor} ${
          compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
        }`}
        title={weightage.examTip}
      >
        {icon}
        <span>{weightage.label}</span>
      </span>

      {/* Tooltip on hover/click */}
      {showTipOnHover && showTooltip && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2.5 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white text-[11px] rounded-xl shadow-xl border border-gray-700 leading-snug animate-in fade-in zoom-in-95 pointer-events-none"
        >
          <div className="flex items-center gap-1 font-bold text-amber-400 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Anna Univ Exam Intelligence</span>
          </div>
          <p className="text-gray-200">{weightage.examTip}</p>
          {weightage.yearOccurrences && (
            <p className="mt-1.5 text-[10px] text-gray-400 border-t border-gray-700/60 pt-1">
              📌 {weightage.yearOccurrences}
            </p>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
        </div>
      )}
    </div>
  )
}
