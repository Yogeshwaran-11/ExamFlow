import React from 'react'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'teal' | 'purple'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  primary:  'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300',
  success:  'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  warning:  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  danger:   'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  teal:     'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  purple:   'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
}

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  )
}
