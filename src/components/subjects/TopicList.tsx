import React, { useState } from 'react'
import { TopicStatus } from '@/models'
import { Check, Search, RotateCcw } from 'lucide-react'

export type ExtendedTopicStatus = 'not_started' | 'learning' | 'learned' | 'revised' | 'needs_practice' | 'mastered'

export interface TopicItem {
  id: string
  name: string
  subjectId: string
  status: ExtendedTopicStatus
  lastRevised?: string
  recallCount: number
  isSkimmed?: boolean
  dayLabel?: string
  blockType?: string
}

interface TopicListProps {
  topics: TopicItem[]
  onStatusChange: (topicName: string, status: ExtendedTopicStatus) => void
}

const STATUS_CONFIG: Record<
  ExtendedTopicStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  not_started: {
    label: 'Not Started',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
  },
  learning: {
    label: 'Learning',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  learned: {
    label: 'Learned',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  revised: {
    label: 'Revised',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  needs_practice: {
    label: 'Needs Practice',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
  mastered: {
    label: 'Mastered',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
}

export const TopicList: React.FC<TopicListProps> = ({ topics, onStatusChange }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  const filteredTopics = topics.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'needs_attention') return t.status === 'needs_practice' || t.status === 'not_started'
    return t.status === selectedFilter
  })

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Curriculum Topics & Tracking</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {topics.length} topics mapped across 24-day schedule
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {['all', 'not_started', 'learning', 'learned', 'revised', 'needs_practice', 'mastered'].map((filterKey) => (
          <button
            key={filterKey}
            onClick={() => setSelectedFilter(filterKey)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              selectedFilter === filterKey
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {filterKey.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredTopics.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
            No topics found matching your query.
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const currentCfg = STATUS_CONFIG[topic.status] || STATUS_CONFIG.not_started

            return (
              <div
                key={topic.id}
                className="p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{topic.name}</span>
                    {topic.isSkimmed && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium">
                        Skimmed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {topic.dayLabel && <span>Scheduled: {topic.dayLabel}</span>}
                    {topic.lastRevised && (
                      <span className="flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 text-emerald-500" />
                        Revised {topic.lastRevised}
                      </span>
                    )}
                    {topic.recallCount > 0 && <span>Recalls: {topic.recallCount}x</span>}
                  </div>
                </div>

                {/* Status Selector */}
                <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
                  <select
                    value={topic.status}
                    onChange={(e) => onStatusChange(topic.name, e.target.value as ExtendedTopicStatus)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer ${currentCfg.bg} ${currentCfg.text} ${currentCfg.border}`}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="learning">Learning</option>
                    <option value="learned">Learned (Trigger Recalls)</option>
                    <option value="revised">Revised</option>
                    <option value="needs_practice">Needs Practice</option>
                    <option value="mastered">Mastered</option>
                  </select>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
