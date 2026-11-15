import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, RotateCcw, Coffee, BookOpen } from 'lucide-react'
import studyPlan from '@/data/study_plan.json'

interface FocusTimerProps {
  timerHook: any
  onSessionComplete?: (session: any) => void
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ timerHook, onSessionComplete }) => {
  const {
    timeRemaining,
    elapsedMs,
    isRunning,
    isPaused,
    stopped,
    sessionType,
    setSessionType,
    plannedMinutes,
    setPlannedMinutes,
    subjectId,
    setSubjectId,
    topicName,
    setTopicName,
    start,
    pause,
    resume,
    stop,
    reset,
    hasUnfinishedSession,
  } = timerHook

  // Time conversion
  const totalSeconds = Math.ceil(timeRemaining / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // Circular progress calculations
  const totalPlannedMs = plannedMinutes * 60 * 1000
  const progressRatio = totalPlannedMs > 0 ? Math.min(1, elapsedMs / totalPlannedMs) : 0
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progressRatio)

  // Handle auto-switch to break when focus timer completes
  useEffect(() => {
    if (isRunning && timeRemaining <= 0) {
      const res = stop()
      if (sessionType === 'focus') {
        // Notification & switch to break
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Focus Session Complete!', {
            body: 'Great job! Time to take a restful break.',
            icon: '/favicon.ico',
          })
        }
        setSessionType('break')
        setPlannedMinutes(10)
      } else {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Break Finished!', {
            body: 'Ready to start another focus session?',
            icon: '/favicon.ico',
          })
        }
        setSessionType('focus')
        setPlannedMinutes(50)
      }
      if (onSessionComplete) onSessionComplete(res)
    }
  }, [isRunning, timeRemaining, sessionType, stop, setSessionType, setPlannedMinutes, onSessionComplete])

  // Get subjects list
  const subjects = studyPlan.subjects

  // Collect topics for selected subject
  const currentSubjectTopics: string[] = []
  studyPlan.dailySchedule.forEach((d) => {
    d.blocks.forEach((b: any) => {
      if (b.subjectId === subjectId) {
        b.topics?.forEach((t: string) => {
          if (!currentSubjectTopics.includes(t)) currentSubjectTopics.push(t)
        })
      }
    })
  })

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center">
      {/* Resume Banner */}
      {hasUnfinishedSession && !isRunning && !isPaused && (
        <div className="w-full mb-6 p-4 bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 rounded-2xl flex items-center justify-between gap-3">
          <div className="text-xs text-primary-900 dark:text-primary-200 font-medium">
            Found an active unfinished session. Would you like to resume?
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => resume()}
              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold"
            >
              Resume
            </button>
            <button
              onClick={() => reset()}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Focus / Break Toggle Pills */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl mb-6">
        <button
          onClick={() => {
            if (!isRunning && !isPaused) {
              setSessionType('focus')
              setPlannedMinutes(50)
            }
          }}
          disabled={isRunning || isPaused}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all min-touch ${
            sessionType === 'focus'
              ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Focus Session
        </button>

        <button
          onClick={() => {
            if (!isRunning && !isPaused) {
              setSessionType('break')
              setPlannedMinutes(10)
            }
          }}
          disabled={isRunning || isPaused}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all min-touch ${
            sessionType === 'break'
              ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Coffee className="w-4 h-4" />
          Rest Break
        </button>
      </div>

      {/* Subject and Topic Selectors (enabled when stopped) */}
      {sessionType === 'focus' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mb-6">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value)
                setTopicName('')
              }}
              disabled={isRunning || isPaused}
              className="w-full text-xs font-medium px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white disabled:opacity-60"
            >
              <option value="">Select Subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
              Topic
            </label>
            <input
              type="text"
              list="topic-options"
              placeholder="Topic name..."
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              disabled={isRunning || isPaused}
              className="w-full text-xs font-medium px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white disabled:opacity-60"
            />
            <datalist id="topic-options">
              {currentSubjectTopics.map((top, idx) => (
                <option key={idx} value={top} />
              ))}
            </datalist>
          </div>
        </div>
      )}

      {/* Preset Duration Buttons */}
      {!isRunning && !isPaused && (
        <div className="flex items-center gap-2 mb-6">
          {sessionType === 'focus' ? (
            <>
              {[25, 40, 50, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setPlannedMinutes(mins)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    plannedMinutes === mins
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </>
          ) : (
            <>
              {[5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setPlannedMinutes(mins)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    plannedMinutes === mins
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Circular Timer Display */}
      <div className="relative flex items-center justify-center my-4">
        <svg className="w-72 h-72 transform -rotate-90">
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-gray-100 dark:text-gray-800"
            fill="transparent"
          />
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke={sessionType === 'break' ? '#10b981' : '#0ea5e9'}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-linear"
          />
        </svg>

        <div className="absolute flex flex-col items-center text-center">
          <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tight font-mono">
            {formattedTime}
          </span>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2">
            {isPaused ? 'PAUSED' : isRunning ? (sessionType === 'focus' ? 'FOCUSING' : 'ON BREAK') : 'READY'}
          </span>
          {subjectId && (
            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1 max-w-[180px] truncate">
              {studyPlan.subjects.find((s) => s.id === subjectId)?.name || subjectId}
            </span>
          )}
        </div>
      </div>

      {/* Control Buttons (minimum 56px touch target) */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {!isRunning && !isPaused ? (
          <button
            onClick={() => start()}
            className="h-14 px-8 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base shadow-lg shadow-primary-500/25 flex items-center gap-2 transition-all min-h-[56px] min-w-[56px]"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Focus
          </button>
        ) : isPaused ? (
          <>
            <button
              onClick={() => resume()}
              className="h-14 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all min-h-[56px] min-w-[56px]"
            >
              <Play className="w-5 h-5 fill-current" />
              Resume
            </button>
            <button
              onClick={() => {
                const res = stop()
                if (onSessionComplete) onSessionComplete(res)
              }}
              className="h-14 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all min-h-[56px] min-w-[56px]"
            >
              <Square className="w-5 h-5 fill-current" />
              Stop
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => pause()}
              className="h-14 px-7 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all min-h-[56px] min-w-[56px]"
            >
              <Pause className="w-5 h-5 fill-current" />
              Pause
            </button>
            <button
              onClick={() => {
                const res = stop()
                if (onSessionComplete) onSessionComplete(res)
              }}
              className="h-14 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all min-h-[56px] min-w-[56px]"
            >
              <Square className="w-5 h-5 fill-current" />
              Stop
            </button>
          </>
        )}

        {(isRunning || isPaused || stopped) && (
          <button
            onClick={() => reset()}
            title="Reset timer"
            className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all min-h-[56px] min-w-[56px]"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
