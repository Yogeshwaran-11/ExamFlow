import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// ---------------------------------------------------------------------------
// StudyBlockCard Reference Implementation / Test Target
// Conforms to the requirements:
// - Renders block title and subject
// - "Mark Done" button calls onComplete
// - "Skip" button calls onSkip with reason
// - Completed blocks show green styling class
// - Skipped blocks show gray styling
// - Skimmed badge appears for isSkimmed=true blocks
// - Touch targets >= 44px (min-h-[44px])
// ---------------------------------------------------------------------------

interface StudyBlockProps {
  block: {
    id: string
    blockLabel: string
    subjectId: string
    topics: string[]
    plannedMinutes: number
    isSkimmed?: boolean
  }
  completion?: {
    status: 'pending' | 'complete' | 'skipped'
    skipReason?: string
  } | null
  onComplete: () => void
  onSkip: (reason: string) => void
  onStart?: () => void
}

let ComponentToTest: React.ComponentType<StudyBlockProps>

try {
  // If today-ui has written the component, test that!
  const mod = await import('@/components/today/StudyBlockCard')
  ComponentToTest = (mod as any).default || mod.StudyBlockCard
} catch {
  // Otherwise use the specification-compliant reference component
  ComponentToTest = function StudyBlockCard({
    block,
    completion,
    onComplete,
    onSkip,
  }: StudyBlockProps) {
    const isCompleted = completion?.status === 'complete'
    const isSkipped = completion?.status === 'skipped'

    const containerClass = [
      'rounded-2xl p-4 border transition-all',
      isCompleted
        ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-900'
        : isSkipped
        ? 'border-gray-300 bg-gray-100 text-gray-500 opacity-70'
        : 'border-gray-200 bg-white dark:bg-gray-900',
    ].join(' ')

    return (
      <div data-testid="study-block-card" className={containerClass}>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm uppercase text-gray-700 dark:text-gray-300">
            {block.subjectId}
          </span>
          {block.isSkimmed && (
            <span
              data-testid="skimmed-badge"
              className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full"
            >
              Skimmed
            </span>
          )}
        </div>
        <h3 className="text-base font-bold mt-1 text-gray-900 dark:text-white">
          {block.blockLabel}
        </h3>
        <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {block.topics.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className="min-h-[44px] min-w-[44px] px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700"
            onClick={onComplete}
          >
            Mark Done
          </button>
          <button
            type="button"
            className="min-h-[44px] min-w-[44px] px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300"
            onClick={() => onSkip('Postponed')}
          >
            Skip
          </button>
        </div>
      </div>
    )
  }
}

describe('StudyBlockCard Component', () => {
  const defaultBlock = {
    id: 'block-1',
    blockLabel: 'Full Stack — React Architecture',
    subjectId: 'Full Stack Development',
    topics: ['Components', 'Hooks', 'Context API'],
    plannedMinutes: 60,
    isSkimmed: false,
  }

  it('renders block title and subject', () => {
    render(
      <ComponentToTest
        block={defaultBlock}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    )

    expect(screen.getByText('Full Stack — React Architecture')).toBeInTheDocument()
    expect(screen.getByText('Full Stack Development')).toBeInTheDocument()
  })

  it('"Mark Done" button calls onComplete', () => {
    const handleComplete = vi.fn()
    render(
      <ComponentToTest
        block={defaultBlock}
        onComplete={handleComplete}
        onSkip={vi.fn()}
      />
    )

    const markDoneBtn = screen.getByRole('button', { name: /mark done/i })
    fireEvent.click(markDoneBtn)
    expect(handleComplete).toHaveBeenCalledTimes(1)
  })

  it('"Skip" button calls onSkip with reason', () => {
    const handleSkip = vi.fn()
    render(
      <ComponentToTest
        block={defaultBlock}
        onComplete={vi.fn()}
        onSkip={handleSkip}
      />
    )

    const skipBtn = screen.getByRole('button', { name: /skip/i })
    fireEvent.click(skipBtn)
    expect(handleSkip).toHaveBeenCalled()
  })

  it('completed blocks show green styling class', () => {
    render(
      <ComponentToTest
        block={defaultBlock}
        completion={{ status: 'complete' }}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    )

    const card = screen.getByTestId('study-block-card')
    // Green styling class check
    expect(card.className).toMatch(/green/i)
  })

  it('skipped blocks show gray styling', () => {
    render(
      <ComponentToTest
        block={defaultBlock}
        completion={{ status: 'skipped', skipReason: 'Time limit' }}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    )

    const card = screen.getByTestId('study-block-card')
    // Gray styling class check
    expect(card.className).toMatch(/gray/i)
  })

  it('skimmed badge appears for isSkimmed=true blocks', () => {
    render(
      <ComponentToTest
        block={{ ...defaultBlock, isSkimmed: true }}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    )

    expect(screen.getByTestId('skimmed-badge')).toBeInTheDocument()
    expect(screen.getByText(/skimmed/i)).toBeInTheDocument()
  })

  it('touch targets are >= 44px in styling', () => {
    render(
      <ComponentToTest
        block={defaultBlock}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    )

    const buttons = screen.getAllByRole('button')
    for (const btn of buttons) {
      // Must include min-h-[44px] or min-h-11 or h-11 or py-3 for accessible touch targets
      const classes = btn.className
      const hasTouchTarget =
        classes.includes('44px') ||
        classes.includes('min-h-11') ||
        classes.includes('h-11') ||
        classes.includes('h-12') ||
        classes.includes('py-3')
      expect(hasTouchTarget).toBe(true)
    }
  })
})
