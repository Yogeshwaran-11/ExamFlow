import React, { useEffect, useRef } from 'react'
import type { SyllabusTopicStatus } from '@/store/useSyllabusStore'
import { useSyllabusStore } from '@/store/useSyllabusStore'
import { Check } from 'lucide-react'

interface TopicStatusDropdownProps {
  topicId: string
  subjectId: string
  unitNumber: number
  topicName: string
  currentStatus: SyllabusTopicStatus
  priority: 'high' | 'medium' | 'low'
  onClose?: () => void
}

const ALL_STATUSES: Array<{
  value: SyllabusTopicStatus
  label: string
  className: string
  activeClassName: string
}> = [
  {
    value: 'not_started',
    label: 'Not Started',
    className:
      'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
    activeClassName: 'bg-gray-100 dark:bg-gray-800 font-bold',
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    className:
      'text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40',
    activeClassName: 'bg-blue-100 dark:bg-blue-950/60 font-bold',
  },
  {
    value: 'basic_understanding',
    label: 'Basic ✓',
    className:
      'text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-950/40',
    activeClassName: 'bg-yellow-100 dark:bg-yellow-950/60 font-bold',
  },
  {
    value: 'practiced',
    label: 'Practiced',
    className:
      'text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/40',
    activeClassName: 'bg-orange-100 dark:bg-orange-950/60 font-bold',
  },
  {
    value: 'revised',
    label: 'Revised',
    className:
      'text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40',
    activeClassName: 'bg-teal-100 dark:bg-teal-950/60 font-bold',
  },
  {
    value: 'exam_ready',
    label: 'Exam Ready ⭐',
    className:
      'text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/40',
    activeClassName: 'bg-green-100 dark:bg-green-950/60 font-bold',
  },
]

export const TopicStatusDropdown: React.FC<TopicStatusDropdownProps> = ({
  topicId,
  subjectId,
  unitNumber,
  topicName,
  currentStatus,
  priority,
  onClose,
}) => {
  const setTopicStatus = useSyllabusStore((s) => s.setTopicStatus)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose?.()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSelect = (status: SyllabusTopicStatus) => {
    setTopicStatus(topicId, status, subjectId, unitNumber, topicName ?? topicId, priority ?? 'medium')
    onClose?.()
  }

  return (
    <div
      ref={ref}
      className="absolute z-50 mt-1 left-0 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      role="listbox"
      aria-label="Select topic status"
    >
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Update Status
        </p>
      </div>
      {ALL_STATUSES.map((opt) => {
        const isActive = opt.value === currentStatus
        return (
          <button
            key={opt.value}
            role="option"
            aria-selected={isActive}
            onClick={() => handleSelect(opt.value)}
            className={`w-full flex items-center justify-between gap-3 px-3 text-sm transition-colors min-h-[44px] ${
              opt.className
            } ${isActive ? opt.activeClassName : ''}`}
          >
            <span>{opt.label}</span>
            {isActive && <Check className="w-4 h-4 shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

export default TopicStatusDropdown
