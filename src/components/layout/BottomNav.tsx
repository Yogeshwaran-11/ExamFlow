import { NavLink } from 'react-router-dom'
import { Home, Calendar, BookOpen, BarChart2, FileText } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Today', icon: Home, exact: true },
  { to: '/plan', label: 'Plan', icon: Calendar, exact: false },
  { to: '/subjects', label: 'Subjects', icon: BookOpen, exact: false },
  { to: '/stats', label: 'Stats', icon: BarChart2, exact: false },
  { to: '/notes', label: 'Notes', icon: FileText, exact: false },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-200/70 dark:border-gray-800/70"
      aria-label="Main navigation"
    >
      <div
        className="flex items-stretch"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {tabs.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[58px] transition-colors relative ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active top indicator */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-b-full bg-primary-500" />
                )}
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/60'
                      : ''
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                </div>
                <span
                  className={`text-[10px] leading-none ${
                    isActive ? 'font-bold' : 'font-medium'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
