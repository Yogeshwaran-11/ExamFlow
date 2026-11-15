import React, { useState, useEffect } from 'react'
import { Sun, Moon, Laptop, Check } from 'lucide-react'

const THEME_KEY = 'examflow-theme'

function applyTheme(newTheme: 'light' | 'dark' | 'system') {
  localStorage.setItem(THEME_KEY, newTheme)
  const root = document.documentElement
  if (newTheme === 'dark') {
    root.classList.add('dark')
  } else if (newTheme === 'light') {
    root.classList.remove('dark')
  } else {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (systemDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }
}

const options = [
  { value: 'light' as const, label: 'Light', icon: Sun, desc: 'Always light' },
  { value: 'dark' as const, label: 'Dark', icon: Moon, desc: 'Always dark' },
  { value: 'system' as const, label: 'System', icon: Laptop, desc: 'Follows OS' },
]

export const AppearanceSettings: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  useEffect(() => {
    // Support old key 'theme' and new key 'examflow-theme'
    const saved = (localStorage.getItem(THEME_KEY) || localStorage.getItem('theme') || 'system') as 'light' | 'dark' | 'system'
    setTheme(saved)
  }, [])

  const handleChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Theme & Appearance</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Choose how ExamFlow looks on your device
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map(({ value, label, icon: Icon, desc }) => {
          const isActive = theme === value
          return (
            <button
              key={value}
              onClick={() => handleChange(value)}
              className={`relative flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 transition-all min-h-[80px] ${
                isActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {isActive && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
              <span className="text-xs font-bold">{label}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
