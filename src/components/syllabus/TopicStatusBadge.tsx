import React from 'react'
import type { SyllabusTopicStatus } from '@/store/useSyllabusStore'

interface TopicStatusBadgeProps {
  status: SyllabusTopicStatus
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<
  SyllabusTopicStatus,
  { label: string; className: string }
> = {
  not_started: {
    label: 'Not Started',
    className:
      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  in_progress: {
    label: 'In Progress',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  },
  basic_understanding: {
    label: 'Basic ✓',
    className:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300',
  },
  practiced: {
    label: 'Practiced',
    className:
      'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  },
  revised: {
    label: 'Revised',
    className:
      'bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
  },
  exam_ready: {
    label: 'Exam Ready ⭐',
    className:
      'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
  },
}

const SIZE_CLASSES = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
}

export const TopicStatusBadge: React.FC<TopicStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started
  return (
    <span
      className={`inline-flex items-center font-bold rounded-full whitespace-nowrap ${config.className} ${SIZE_CLASSES[size]}`}
    >
      {config.label}
    </span>
  )
}

export default TopicStatusBadge
