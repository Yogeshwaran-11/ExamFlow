import React, { useState, useEffect } from 'react'
import { Bell, BellRing, AlertCircle, CheckCircle2 } from 'lucide-react'

export const NotificationSettings: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [reminderEnabled, setReminderEnabled] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      const stored = localStorage.getItem('examflow_reminders')
      setReminderEnabled(stored === 'true' && Notification.permission === 'granted')
    }
  }, [])

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Notifications are not supported in this browser.')
      return
    }

    try {
      const res = await Notification.requestPermission()
      setPermission(res)
      if (res === 'granted') {
        setReminderEnabled(true)
        localStorage.setItem('examflow_reminders', 'true')
        new Notification('ExamFlow Notifications Enabled', {
          body: "You'll receive daily recall prompts and break alerts on time!",
          icon: '/favicon.ico',
        })
      } else {
        setReminderEnabled(false)
        localStorage.setItem('examflow_reminders', 'false')
      }
    } catch (e) {
      console.error('Notification permission error:', e)
    }
  }

  const handleToggle = () => {
    if (permission !== 'granted') {
      handleRequestPermission()
    } else {
      const next = !reminderEnabled
      setReminderEnabled(next)
      localStorage.setItem('examflow_reminders', String(next))
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary-500" />
            Study & Recall Notifications
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            ExamFlow uses intelligent notifications to deliver your 1-day, 3-day, and 7-day spaced recall prompts,
            and timer break alerts so you never lose revision momentum.
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none min-touch ${
            reminderEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
          role="switch"
          aria-checked={reminderEnabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              reminderEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Permission Status Information */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">System Permission:</span>
        <span
          className={`font-semibold flex items-center gap-1 ${
            permission === 'granted'
              ? 'text-emerald-600 dark:text-emerald-400'
              : permission === 'denied'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {permission === 'granted' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
            </>
          ) : permission === 'denied' ? (
            <>
              <AlertCircle className="w-3.5 h-3.5" /> Blocked in browser settings
            </>
          ) : (
            'Not requested yet'
          )}
        </span>
      </div>
    </div>
  )
}
