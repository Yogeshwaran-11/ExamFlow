import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import studyPlan from '@/data/study_plan.json'
import { Note } from '@/models'
import { ArrowLeft, Award, Sparkles, BookOpen, AlertCircle, FileText, CheckCircle2 } from 'lucide-react'

export default function ExamMorningPage() {
  const { subjectId } = useParams<{ subjectId: string }>()

  const subject = studyPlan.subjects.find((s) => s.id === subjectId)

  // Find formula sheet note for this subject
  const formulaNote = useMemo(() => {
    try {
      const raw = localStorage.getItem('examflow_notes')
      if (raw) {
        const list: Note[] = JSON.parse(raw)
        return (
          list.find((n) => n.subjectId === subjectId && n.tags?.includes('formulasheet')) ||
          list.find((n) => n.subjectId === subjectId && n.isPinned) ||
          list.find((n) => n.subjectId === subjectId)
        )
      }
    } catch {}
    return null
  }, [subjectId])

  // Weak topics for this subject
  const weakTopics = useMemo(() => {
    try {
      const raw = localStorage.getItem('examflow_topics')
      if (raw) {
        const list: any[] = JSON.parse(raw)
        return list.filter((t) => t.subjectId === subjectId && (t.status === 'needs_practice' || (t.confidenceScore && t.confidenceScore < 50)))
      }
    } catch {}
    return []
  }, [subjectId])

  // Key algorithm traces / critical topics for this subject
  const keyTopics = useMemo(() => {
    const list: string[] = []
    studyPlan.dailySchedule.forEach((d) => {
      d.blocks.forEach((b: any) => {
        if (b.subjectId === subjectId && (b.taskType === 'formulasheet' || b.taskType === 'mock' || b.priority === 1)) {
          b.topics?.forEach((t: string) => {
            if (!list.includes(t)) list.push(t)
          })
        }
      })
    })
    return list.slice(0, 8)
  }, [subjectId])

  if (!subject) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Subject not found</h2>
        <Link to="/" className="text-primary-500 font-semibold underline">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const isLastExam = subject.id === 'prob'

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-gray-950 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top return link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded-lg transition-colors min-touch"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Morning Mode
          </Link>
        </div>

        {/* Hero Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" /> Exam Morning Mode
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {subject.name}
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Exam Date: Today, {new Date(subject.examDate).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} (Morning Session)
          </p>

          {/* 9 Dec Special Notice */}
          {isLastExam ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              ✨ Read your formula sheet only. Good luck! This is your final exam!
            </div>
          ) : (
            <div className="p-4 bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 rounded-2xl text-primary-900 dark:text-primary-200 text-xs sm:text-sm font-medium">
              Keep calm. Focus on reviewing your one-page formula sheet and high-confidence concepts.
            </div>
          )}
        </div>

        {/* Formula Sheet Section */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Formula Sheet & High-Yield Summary
              </h2>
            </div>
          </div>

          {formulaNote ? (
            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line font-mono bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
              {formulaNote.content}
            </div>
          ) : (
            <div className="text-xs text-gray-400 py-4 text-center">
              No formula sheet pinned. Open the Notes page to pin your formula summary.
            </div>
          )}
        </div>

        {/* Weak Topics to double-check */}
        {weakTopics.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Last-Minute Weak Topic Checklist
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Take 2 minutes to review these specific areas before entering the exam hall:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {weakTopics.map((wt: any, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                >
                  {wt.topicName || wt.name || wt}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Core Algorithms & Topics */}
        {keyTopics.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Key Algorithms & Priority Traces
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {keyTopics.map((topic, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
