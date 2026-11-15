import React, { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { getTodayIST } from '@/lib/date-utils'
import { format } from 'date-fns'

interface TodayHeaderProps {
  streak?: number
  studentName?: string
}

export function TodayHeader({ streak = 0, studentName = 'Yogesh' }: TodayHeaderProps) {
  const { greeting, formattedDate } = useMemo(() => {
    let nowIst: Date
    try {
      nowIst = getTodayIST()
    } catch {
      nowIst = new Date()
    }
    const hour = nowIst.getHours()
    let greet = 'Good morning'
    if (hour >= 12 && hour < 17) greet = 'Good afternoon'
    else if (hour >= 17) greet = 'Good evening'

    return {
      greeting: greet,
      formattedDate: format(nowIst, 'EEEE, d MMMM'),
    }
  }, [studentName])

  return (
    <div className="pt-2 pb-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary-500 dark:text-primary-400 mb-1">
        {formattedDate}
      </p>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            {greeting},
          </h1>
          <h1 className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400 tracking-tight leading-tight">
            {studentName}! 👋
          </h1>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm shrink-0 mb-1 ${
            streak > 0
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <Flame
            className={`w-3.5 h-3.5 ${streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`}
          />
          <span>{streak > 0 ? `${streak}d streak` : 'Start streak'}</span>
        </div>
      </div>
    </div>
  )
}
