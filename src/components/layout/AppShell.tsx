import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Zap } from 'lucide-react'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
}

function applyTheme() {
  const stored = localStorage.getItem('examflow-theme') ?? 'system'
  if (stored === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (stored === 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

export function AppShell({ children }: AppShellProps) {
  useEffect(() => {
    applyTheme()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const stored = localStorage.getItem('examflow-theme') ?? 'system'
      if (stored === 'system') applyTheme()
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Glassy top bar */}
      <header className="sticky top-0 z-40 glass border-b border-gray-200/70 dark:border-gray-800/70 px-4 flex items-center justify-between h-14 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2 group"
          aria-label="ExamFlow home"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-base font-black text-gray-900 dark:text-white tracking-tight">
            Exam<span className="text-primary-500">Flow</span>
          </span>
        </Link>

        <Link
          to="/settings"
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Settings"
        >
          <Settings size={20} />
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  )
}
