import React, { useState, useEffect } from 'react'
import { AppearanceSettings } from '@/components/settings/AppearanceSettings'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { BackupRestore } from '@/components/settings/BackupRestore'
import { useAuthStore } from '@/store/useAuthStore'
import { Settings, User, Clock, LogOut, Trash2, ShieldCheck, Sparkles } from 'lucide-react'

export default function SettingsPage() {
  const { user, signOut } = useAuthStore()

  // Timer defaults
  const [focusDuration, setFocusDuration] = useState(50)
  const [breakDuration, setBreakDuration] = useState(10)

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('examflow_settings')
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings)
        if (parsed.defaultFocusMinutes) setFocusDuration(parsed.defaultFocusMinutes)
        if (parsed.defaultBreakMinutes) setBreakDuration(parsed.defaultBreakMinutes)
      }
    } catch {}
  }, [])

  const handleUpdateTimerSettings = (focus: number, rest: number) => {
    setFocusDuration(focus)
    setBreakDuration(rest)
    try {
      const current = (() => {
        try {
          const s = localStorage.getItem('examflow_settings')
          return s ? JSON.parse(s) : {}
        } catch {
          return {}
        }
      })()
      localStorage.setItem(
        'examflow_settings',
        JSON.stringify({ ...current, defaultFocusMinutes: focus, defaultBreakMinutes: rest })
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your local profile and all progress? This action cannot be undone.'
    )
    if (confirmed) {
      localStorage.clear()
      signOut()
      window.location.href = '/auth/login'
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-500" />
          Settings & Preferences
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Configure app appearance, session durations, reminders, and data backups
        </p>
      </div>

      {/* 1. Appearance / Theme */}
      <AppearanceSettings />

      {/* 2. Timer Preferences */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            Timer Durations
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Set default lengths for your focus cycles
          </p>
        </div>

        {/* Focus duration */}
        <div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
            Default Focus Session:
          </span>
          <div className="flex gap-2">
            {[25, 40, 50].map((mins) => (
              <button
                key={mins}
                onClick={() => handleUpdateTimerSettings(mins, breakDuration)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-touch ${
                  focusDuration === mins
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {mins} Minutes
              </button>
            ))}
          </div>
        </div>

        {/* Break duration */}
        <div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
            Default Rest Break:
          </span>
          <div className="flex gap-2">
            {[5, 10].map((mins) => (
              <button
                key={mins}
                onClick={() => handleUpdateTimerSettings(focusDuration, mins)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-touch ${
                  breakDuration === mins
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {mins} Minutes
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Notifications */}
      <NotificationSettings />

      {/* 4. Backup & Restore */}
      <BackupRestore userId={user?.uid || 'default_user'} />

      {/* 5. Account Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary-500" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Account & Profile</h3>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">Signed in as:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {user?.email || 'yogesh@university.edu (Demo Mode)'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => signOut()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl text-xs font-semibold transition-colors min-touch"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <button
            onClick={handleDeleteAccount}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-semibold transition-colors min-touch"
          >
            <Trash2 className="w-4 h-4" />
            Reset All Local Data
          </button>
        </div>
      </div>

      {/* App Version Info */}
      <div className="text-center pt-4 pb-2 text-[11px] text-gray-400 dark:text-gray-500">
        <p className="font-semibold text-gray-600 dark:text-gray-400">ExamFlow PWA v1.0.0</p>
        <p className="mt-0.5">Offline-first university exam tracker with active spaced recall</p>
      </div>
    </div>
  )
}
