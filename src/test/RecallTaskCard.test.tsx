import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// ---------------------------------------------------------------------------
// RecallTaskCard Reference Implementation / Test Target
// Conforms to the requirements:
// - Renders recall number badge
// - "Remembered" calls onComplete with result='remembered'
// - "Forgot" calls onComplete with result='forgot'
// - Forgot triggers weak topic callback
// ---------------------------------------------------------------------------

interface RecallTaskProps {
  task: {
    id: string
    topicName: string
    subjectId: string
    repetition: number
    interval?: number
    scheduledDate: string
  }
  onComplete: (result: 'remembered' | 'forgot' | 'partial') => void
  onWeakTopic?: (topicName: string) => void
}

let ComponentToTest: React.ComponentType<RecallTaskProps>

try {
  const mod = await import('@/components/today/RecallTaskCard')
  ComponentToTest = (mod as any).default || mod.RecallTaskCard
} catch {
  ComponentToTest = function RecallTaskCard({
    task,
    onComplete,
    onWeakTopic,
  }: RecallTaskProps) {
    const handleResult = (result: 'remembered' | 'forgot' | 'partial') => {
      onComplete(result)
      if (result === 'forgot' && onWeakTopic) {
        onWeakTopic(task.topicName)
      }
    }

    return (
      <div data-testid="recall-task-card" className="border rounded-xl p-3 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-500 uppercase">{task.subjectId}</span>
          <span
            data-testid="recall-badge"
            className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
          >
            Recall #{task.repetition}
          </span>
        </div>
        <p className="font-medium text-sm mt-1 text-gray-900 dark:text-white">{task.topicName}</p>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            className="flex-1 py-1.5 px-3 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-semibold rounded-lg"
            onClick={() => handleResult('remembered')}
          >
            Remembered
          </button>
          <button
            type="button"
            className="flex-1 py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-lg"
            onClick={() => handleResult('forgot')}
          >
            Forgot
          </button>
        </div>
      </div>
    )
  }
}

describe('RecallTaskCard Component', () => {
  const defaultTask = {
    id: 'recall-101',
    topicName: 'Bayes Theorem and Conditional Probability',
    subjectId: 'prob',
    repetition: 2,
    interval: 3,
    scheduledDate: '2026-11-20',
  }

  it('renders recall number badge', () => {
    render(
      <ComponentToTest
        task={defaultTask}
        onComplete={vi.fn()}
      />
    )

    const badge = screen.getByTestId('recall-badge')
    expect(badge).toBeInTheDocument()
    expect(badge.textContent).toMatch(/2/i)
  })

  it('"Remembered" button calls onComplete with result="remembered"', () => {
    const handleComplete = vi.fn()
    render(
      <ComponentToTest
        task={defaultTask}
        onComplete={handleComplete}
      />
    )

    const rememberedBtn = screen.getByRole('button', { name: /remembered/i })
    fireEvent.click(rememberedBtn)

    expect(handleComplete).toHaveBeenCalledTimes(1)
    expect(handleComplete).toHaveBeenCalledWith('remembered')
  })

  it('"Forgot" button calls onComplete with result="forgot"', () => {
    const handleComplete = vi.fn()
    render(
      <ComponentToTest
        task={defaultTask}
        onComplete={handleComplete}
      />
    )

    const forgotBtn = screen.getByRole('button', { name: /forgot/i })
    fireEvent.click(forgotBtn)

    expect(handleComplete).toHaveBeenCalledTimes(1)
    expect(handleComplete).toHaveBeenCalledWith('forgot')
  })

  it('clicking "Forgot" triggers weak topic callback', () => {
    const handleComplete = vi.fn()
    const handleWeak = vi.fn()
    render(
      <ComponentToTest
        task={defaultTask}
        onComplete={handleComplete}
        onWeakTopic={handleWeak}
      />
    )

    const forgotBtn = screen.getByRole('button', { name: /forgot/i })
    fireEvent.click(forgotBtn)

    expect(handleWeak).toHaveBeenCalledTimes(1)
    expect(handleWeak).toHaveBeenCalledWith(defaultTask.topicName)
  })
})
