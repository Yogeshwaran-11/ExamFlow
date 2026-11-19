import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ALL_SUBJECTS_SYLLABUS } from '@/data/syllabusData'
import { useSyllabusStore } from '@/store/useSyllabusStore'
import { TopicStatusBadge } from './TopicStatusBadge'
import type { SyllabusTopicStatus } from '@/store/useSyllabusStore'

interface HighPriorityPanelProps {
  maxItems?: number
}

const INCOMPLETE_STATUSES: Set<SyllabusTopicStatus> = new Set([
  'not_started',
  'in_progress',
])

const SUBJECT_COLORS: Record<string, string> = {
  fsd: '#6366f1',
  ads: '#0ea5e9',
  itc: '#f59e0b',
  co: '#10b981',
  java: '#f97316',
  prob: '#8b5cf6',
}

export function HighPriorityPanel({ maxItems = 8 }: HighPriorityPanelProps) {
  const topicStatuses = useSyllabusStore((s) => s.topicStatuses)

  const highPriorityTopics = useMemo(() => {
    const results: Array<{
      subjectId: string
      topicId: string
      topicName: string
      status: SyllabusTopicStatus
    }> = []

    for (const subject of ALL_SUBJECTS_SYLLABUS) {
      for (const unit of subject.units) {
        for (const topic of unit.topics) {
          if (topic.priority !== 'high') continue
          const rec = topicStatuses[topic.id]
          const status: SyllabusTopicStatus = rec?.status ?? 'not_started'
          if (!INCOMPLETE_STATUSES.has(status)) continue
          results.push({
            subjectId: subject.id,
            topicId: topic.id,
            topicName: topic.name,
            status,
          })
          if (results.length >= maxItems) return results
        }
      }
    }

    return results
  }, [topicStatuses, maxItems])

  if (highPriorityTopics.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-950/20 rounded-2xl p-4 border border-green-200 dark:border-green-900/40 shadow-sm text-center">
        <p className="font-bold text-green-800 dark:text-green-300 text-sm">
          🎉 All high priority topics are on track!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🔴</span>
          <h3 className="font-black text-sm text-gray-900 dark:text-white">
            High Priority — Must Complete
          </h3>
        </div>
        <Link
          to="/syllabus"
          className="flex items-center gap-0.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Topic rows */}
      <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
        {highPriorityTopics.map((item) => {
          const color =
            SUBJECT_COLORS[item.subjectId.toLowerCase()] ?? '#6366f1'
          return (
            <div
              key={item.topicId}
              className="flex items-center gap-3 px-4 py-3"
            >
              {/* Subject chip */}
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                style={{ backgroundColor: color }}
              >
                {item.subjectId.toUpperCase()}
              </span>

              {/* Topic name */}
              <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.topicName}
              </span>

              {/* Status badge */}
              <TopicStatusBadge status={item.status} size="sm" />
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
        <Link
          to="/syllabus"
          className="flex items-center justify-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors py-1"
        >
          Open Full Syllabus <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

export default HighPriorityPanel
