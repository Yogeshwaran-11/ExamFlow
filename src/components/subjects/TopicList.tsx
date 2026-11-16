import React, { useState, useMemo } from 'react'
import { TopicStatus } from '@/models'
import { Check, Search, RotateCcw, Award, Zap, Sparkles, Filter } from 'lucide-react'
import { getTopicWeightage } from '@/data/examWeightage'
import { ExamWeightageBadge } from '@/components/common/ExamWeightageBadge'

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

  // Calculate 16-Mark readiness stats
  const { total16M, ready16M, percent16M } = useMemo(() => {
    let total = 0
    let ready = 0
    topics.forEach((t) => {
      const w = getTopicWeightage(t.subjectId, t.name)
      if (w?.weightage === '16M') {
        total++
        if (t.status === 'learned' || t.status === 'revised' || t.status === 'mastered') {
          ready++
        }
      }
    })
    const percent = total > 0 ? Math.round((ready / total) * 100) : 0
    return { total16M: total, ready16M: ready, percent16M: percent }
  }, [topics])

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase())
      if (!matchesSearch) return false

      if (selectedFilter === 'all') return true
      if (selectedFilter === '16M') {
        const w = getTopicWeightage(t.subjectId, t.name)
        return w?.weightage === '16M'
      }
      if (selectedFilter === '8M') {
        const w = getTopicWeightage(t.subjectId, t.name)
        return w?.weightage === '8M'
      }
      if (selectedFilter === 'needs_attention') {
        return t.status === 'needs_practice' || t.status === 'not_started'
      }
      return t.status === selectedFilter
    })
  }, [topics, searchTerm, selectedFilter])

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Curriculum Topics & Exam Intelligence
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
              PYQ Mapped
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {topics.length} topics mapped across 24-day schedule with Anna University weightage
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search topics or formulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* 16-Mark Exam Readiness Banner */}
      {total16M > 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 dark:text-amber-200">
                <span>16-Mark Sure-Shot Coverage</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/60 dark:bg-amber-900 text-amber-900 dark:text-amber-300">
                  Part B & C Core
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                {ready16M} of {total16M} critical questions learned ({percent16M}% complete)
              </p>
            </div>
          </div>

          <div className="w-full sm:w-40 flex items-center gap-2 shrink-0">
            <div className="w-full h-2 rounded-full bg-amber-200/60 dark:bg-amber-900/60 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${percent16M}%` }}
              />
            </div>
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 shrink-0">
              {percent16M}%
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
            selectedFilter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Topics ({topics.length})
        </button>

        <button
          onClick={() => setSelectedFilter('16M')}
          className={`px-2.5 py-1 text-xs rounded-lg font-bold flex items-center gap-1 transition-colors ${
            selectedFilter === '16M'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
          }`}
        >
          <Award className="w-3 h-3" />
          <span>⭐ 16-Mark Sure Shot ({total16M})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('8M')}
          className={`px-2.5 py-1 text-xs rounded-lg font-bold flex items-center gap-1 transition-colors ${
            selectedFilter === '8M'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>⚡ 8-Mark Frequent</span>
        </button>

        <button
          onClick={() => setSelectedFilter('needs_attention')}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
            selectedFilter === 'needs_attention'
              ? 'bg-rose-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Needs Attention
        </button>

        {['learning', 'learned', 'revised', 'mastered'].map((statusKey) => (
          <button
            key={statusKey}
            onClick={() => setSelectedFilter(statusKey)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              selectedFilter === statusKey
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {statusKey.toUpperCase()}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
        {filteredTopics.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
            No topics found matching your query or filter.
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const currentCfg = STATUS_CONFIG[topic.status] || STATUS_CONFIG.not_started
            const weightage = getTopicWeightage(topic.subjectId, topic.name)

            return (
              <div
                key={topic.id}
                className="p-3 bg-gray-50/60 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {topic.name}
                    </span>

                    {weightage && <ExamWeightageBadge weightage={weightage} />}

                    {topic.isSkimmed && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium">
                        Skimmed
                      </span>
                    )}
                  </div>

                  {/* Exam tip callout if available */}
                  {weightage?.examTip && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 italic flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0 inline" />
                      <span>{weightage.examTip}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {topic.dayLabel && <span>Scheduled: {topic.dayLabel}</span>}
                    {topic.lastRevised && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <RotateCcw className="w-3 h-3" />
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
