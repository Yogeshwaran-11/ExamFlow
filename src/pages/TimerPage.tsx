import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FocusTimer } from '@/components/timer/FocusTimer'
import { SessionHistory } from '@/components/timer/SessionHistory'
import { useTimer } from '@/hooks/useTimer'
import { Timer, Zap } from 'lucide-react'

export default function TimerPage() {
  const [searchParams] = useSearchParams()
  const timerHook = useTimer(50)

  // Pre-populate from URL query params (set by StudyBlockCard "Start" button)
  useEffect(() => {
    const subject = searchParams.get('subject')
    const topic = searchParams.get('topic')
    const duration = searchParams.get('duration')

    if (subject && timerHook.setSubjectId) {
      timerHook.setSubjectId(subject)
    }
    if (topic && timerHook.setTopicName) {
      timerHook.setTopicName(topic)
    }
    if (duration) {
      const mins = parseInt(duration, 10)
      if (!isNaN(mins) && mins > 0 && timerHook.setPlannedMinutes) {
        timerHook.setPlannedMinutes(mins)
      }
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Timer className="w-6 h-6 text-primary-500" />
            Focus Timer
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Timestamp-backed Pomodoro — resilient to tab switches & refreshes
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          50m Focus / 10m Break
        </div>
      </div>

      {/* Large Circular Focus Timer */}
      <FocusTimer timerHook={timerHook} />

      {/* Session History */}
      <SessionHistory />
    </div>
  )
}
