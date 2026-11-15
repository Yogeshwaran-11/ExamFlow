import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import studyPlan from '@/data/study_plan.json'
import { ExamReadiness } from '@/components/subjects/ExamReadiness'
import { TopicList, TopicItem, ExtendedTopicStatus } from '@/components/subjects/TopicList'
import { useSubjectProgress } from '@/hooks/useSubjectProgress'
import { Note } from '@/models'
import {
  Calendar,
  FileText,
  ArrowLeft,
  PenTool,
  Clock,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'

export default function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const { getSubjectReadiness } = useSubjectProgress()

  const readiness = subjectId ? getSubjectReadiness(subjectId) : undefined
  const subjectMeta = studyPlan.subjects.find((s) => s.id === subjectId)

  // Collect all topic items across 24 days for this subject
  const initialTopics = useMemo(() => {
    if (!subjectId) return []

    // Read saved topic status from localStorage
    const savedTopicsRaw = localStorage.getItem('examflow_topics')
    const savedTopicsList: any[] = savedTopicsRaw ? JSON.parse(savedTopicsRaw) : []
    const savedStatusMap = new Map<string, ExtendedTopicStatus>()
    savedTopicsList.forEach((t) => {
      if (t.subjectId === subjectId) savedStatusMap.set(t.topicName, t.status)
    })

    const items: TopicItem[] = []
    const seenTopicNames = new Set<string>()

    studyPlan.dailySchedule.forEach((day) => {
      day.blocks.forEach((b: any) => {
        if (b.subjectId === subjectId) {
          b.topics?.forEach((top: string) => {
            if (!seenTopicNames.has(top)) {
              seenTopicNames.add(top)
              items.push({
                id: `${subjectId}_${top}`,
                name: top,
                subjectId,
                status: savedStatusMap.get(top) || 'not_started',
                recallCount: 0,
                isSkimmed: !!b.isSkimmed,
                dayLabel: day.dayLabel,
                blockType: b.taskType,
              })
            }
          })
        }
      })
    })

    return items
  }, [subjectId])

  const [topics, setTopics] = useState<TopicItem[]>(initialTopics)

  // Handle topic status change & trigger Spaced Repetition recalls when status='learned'
  const handleStatusChange = (topicName: string, status: ExtendedTopicStatus) => {
    setTopics((prev) => {
      const next = prev.map((t) => (t.name === topicName ? { ...t, status } : t))

      // Persist to localStorage
      try {
        const savedTopicsRaw = localStorage.getItem('examflow_topics')
        const currentSaved: any[] = savedTopicsRaw ? JSON.parse(savedTopicsRaw) : []
        const otherSubjects = currentSaved.filter((t) => t.subjectId !== subjectId)
        const updatedThisSubject = next.map((t) => ({
          id: `${t.subjectId}_${t.name}`,
          userId: 'default_user',
          topicId: t.id,
          subjectId: t.subjectId,
          topicName: t.name,
          status: t.status,
          confidenceScore: t.status === 'mastered' ? 100 : t.status === 'learned' ? 75 : 40,
          updatedAt: new Date().toISOString(),
        }))
        localStorage.setItem('examflow_topics', JSON.stringify([...otherSubjects, ...updatedThisSubject]))

        // If learned, generate 1, 3, 7 day spaced repetition recall tasks
        if (status === 'learned') {
          const now = new Date()
          const learnedDate = now.toISOString().slice(0, 10)
          const offsets = [1, 3, 7]

          const savedRecallsRaw = localStorage.getItem('examflow_recalls')
          const existingRecalls: any[] = savedRecallsRaw ? JSON.parse(savedRecallsRaw) : []

          offsets.forEach((offset, idx) => {
            const scheduled = new Date(now)
            scheduled.setDate(scheduled.getDate() + offset)
            const scheduledDate = scheduled.toISOString().slice(0, 10)
            const recallId = `recall_${subjectId}_${topicName}_${idx + 1}`

            if (!existingRecalls.some((r) => r.id === recallId)) {
              existingRecalls.push({
                id: recallId,
                userId: 'default_user',
                subjectId,
                topicName,
                scheduledDate,
                interval: offset,
                repetition: idx + 1,
                easeFactor: 2.5,
                status: 'pending',
                learnedDate,
                syncStatus: 'local',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            }
          })
          localStorage.setItem('examflow_recalls', JSON.stringify(existingRecalls))
        }
      } catch (e) {
        console.error(e)
      }

      return next
    })
  }

  // Load subject-specific notes
  const subjectNotes = useMemo(() => {
    try {
      const raw = localStorage.getItem('examflow_notes')
      if (raw) {
        const list: Note[] = JSON.parse(raw)
        return list.filter((n) => n.subjectId === subjectId)
      }
    } catch {}
    return []
  }, [subjectId])

  // Load upcoming recalls for this subject
  const upcomingRecalls = useMemo(() => {
    try {
      const raw = localStorage.getItem('examflow_recalls')
      if (raw) {
        const list: any[] = JSON.parse(raw)
        return list.filter((r) => r.subjectId === subjectId && r.status === 'pending').slice(0, 5)
      }
    } catch {}
    return []
  }, [subjectId])

  // Handwritten tasks checklist for java, co, fs
  const handwrittenBlocks = useMemo(() => {
    const list: any[] = []
    studyPlan.dailySchedule.forEach((d) => {
      d.blocks.forEach((b: any) => {
        if (b.subjectId === subjectId && b.isHandwritten) {
          list.push({ ...b, dayLabel: d.dayLabel })
        }
      })
    })
    return list
  }, [subjectId])

  if (!subjectMeta) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
        Subject not found.{' '}
        <Link to="/subjects" className="text-primary-500 font-bold underline">
          Back to subjects
        </Link>
      </div>
    )
  }

  const daysLeft = readiness ? readiness.daysLeft : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/subjects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-touch"
        >
          <ArrowLeft className="w-4 h-4" /> All Subjects
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-4 h-12 rounded-full shrink-0 mt-1"
              style={{ backgroundColor: subjectMeta.color }}
            />
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {subjectMeta.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  Exam Date:{' '}
                  {new Date(subjectMeta.examDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {daysLeft <= 0 ? 'Exam Today/Passed' : `${daysLeft} days remaining`}
                </span>
              </div>
            </div>
          </div>

          {/* Formula Sheet Button */}
          <Link
            to="/notes"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/60 dark:hover:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold text-xs transition-colors shrink-0 self-start sm:self-center min-touch"
          >
            <FileText className="w-4 h-4" />
            Formula Sheet
          </Link>
        </div>
      </div>

      {/* 5-Factor Exam Readiness Component */}
      {readiness && <ExamReadiness readiness={readiness} />}

      {/* Handwritten Practice Section (for fs, co, java) */}
      {subjectMeta.handwritingRequired && handwrittenBlocks.length > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-3xl p-6 border border-amber-200/60 dark:border-amber-900/40">
          <div className="flex items-center gap-2 mb-2">
            <PenTool className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              Handwritten Practice Checklist (Paper Required)
            </h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            {subjectMeta.handwritingNote ||
              'Exam questions must be answered by hand on paper. Verify code traces without typing.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {handwrittenBlocks.map((hb) => (
              <div
                key={hb.id}
                className="p-3 bg-white dark:bg-gray-900 rounded-2xl border border-amber-100 dark:border-amber-950/60 flex items-start gap-2.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-xs text-gray-900 dark:text-white block truncate">
                    {hb.blockLabel}
                  </span>
                  <span className="text-[10px] text-gray-400 block">{hb.dayLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Recall Schedule */}
      {upcomingRecalls.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <RotateCcw className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Upcoming Spaced Recalls for {subjectMeta.name}
            </h3>
          </div>
          <div className="space-y-2">
            {upcomingRecalls.map((rec) => (
              <div
                key={rec.id}
                className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">{rec.topicName}</span>
                  <span className="text-[10px] text-gray-400">
                    Repetition #{rec.repetition} (every {rec.interval} days)
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Due {rec.scheduledDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curriculum Topic List with Status Selectors */}
      <TopicList topics={topics} onStatusChange={handleStatusChange} />

      {/* Subject Notes */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Subject Revision Notes</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Formulas, snippets, and review notes created for {subjectMeta.name}
            </p>
          </div>
          <Link
            to="/notes"
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            Open Notes <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {subjectNotes.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            No notes logged for this subject yet. Create one from the Notes tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjectNotes.map((note) => (
              <Link
                key={note.id}
                to="/notes"
                className="p-4 bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary-400 transition-all block group"
              >
                <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary-600 truncate">
                  {note.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                  {note.content}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
