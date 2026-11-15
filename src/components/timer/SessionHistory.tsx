import React, { useMemo } from 'react'
import studyPlan from '@/data/study_plan.json'
import { Clock, Calendar, CheckCircle, Coffee, BookOpen } from 'lucide-react'

export const SessionHistory: React.FC = () => {
  const sessions = useMemo(() => {
    try {
      const raw = localStorage.getItem('examflow_sessions')
      if (raw) {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.slice(0, 7) : []
      }
    } catch {}
    return []
  }, [])

  const subjectMap = useMemo(() => {
    const map: Record<string, any> = {}
    studyPlan.subjects.forEach((s) => {
      map[s.id] = s
    })
    return map
  }, [])

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Study Sessions</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 logged focus sessions</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">
          No sessions recorded yet. Start a focus session above to see your history!
        </div>
      ) : (
        <div className="space-y-2.5">
          {sessions.map((sess: any) => {
            const sub = sess.subjectId ? subjectMap[sess.subjectId] : null
            const isBreak = sess.sessionType === 'break'

            return (
              <div
                key={sess.id}
                className="p-3 bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isBreak
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400'
                    }`}
                  >
                    {isBreak ? <Coffee className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {isBreak ? 'Break Session' : sub?.name || 'General Focus'}
                      </span>
                      {sub && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sub.color }}
                        />
                      )}
                    </div>
                    {sess.topicName && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {sess.topicName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white block">
                    {sess.actualMinutes ?? sess.plannedMinutes ?? 0} mins
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {sess.startedAt
                      ? new Date(sess.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Just now'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
