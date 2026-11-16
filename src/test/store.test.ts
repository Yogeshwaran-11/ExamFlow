import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStudyPlanStore } from '@/store/useStudyPlanStore'

describe('useStudyPlanStore completions & reactivity', () => {
  beforeEach(() => {
    localStorage.clear()
    useStudyPlanStore.getState().clearStore()
  })

  it('marks a block as complete and updates taskCompletions Record object', async () => {
    const store = useStudyPlanStore.getState()
    const blockId = '2026-11-17-b1'

    await store.markBlockComplete(blockId, 60, 'Reviewed successfully')

    const updatedState = useStudyPlanStore.getState()
    // Test direct object property lookup
    const comp = updatedState.taskCompletions[blockId]

    expect(comp).toBeDefined()
    expect(comp.blockId).toBe(blockId)
    expect(comp.status).toBe('completed')
    expect(comp.actualMinutes).toBe(60)
    expect(comp.notes).toBe('Reviewed successfully')

    // Test localStorage persistence
    const saved = JSON.parse(localStorage.getItem('examflow_completions') || '[]')
    expect(saved).toHaveLength(1)
    expect(saved[0].blockId).toBe(blockId)
    expect(saved[0].status).toBe('completed')
  })

  it('resets a block when actualMinutes is 0', async () => {
    const store = useStudyPlanStore.getState()
    const blockId = '2026-11-17-b2'

    // First complete it
    await store.markBlockComplete(blockId, 50)
    expect(useStudyPlanStore.getState().taskCompletions[blockId]).toBeDefined()

    // Reset with actualMinutes === 0
    await store.markBlockComplete(blockId, 0)

    const updatedState = useStudyPlanStore.getState()
    expect(updatedState.taskCompletions[blockId]).toBeUndefined()

    // Verify localStorage also reflects the removal
    const saved = JSON.parse(localStorage.getItem('examflow_completions') || '[]')
    expect(saved.find((c: any) => c.blockId === blockId)).toBeUndefined()
  })

  it('deletes block cleanly when resetBlock is directly called', async () => {
    const store = useStudyPlanStore.getState()
    const blockId = '2026-11-17-b3'

    await store.markBlockComplete(blockId, 45)
    expect(useStudyPlanStore.getState().taskCompletions[blockId]).toBeDefined()

    await store.resetBlock(blockId)
    expect(useStudyPlanStore.getState().taskCompletions[blockId]).toBeUndefined()
  })

  it('skips a block properly', async () => {
    const store = useStudyPlanStore.getState()
    const blockId = '2026-11-17-b4'

    await store.skipBlock(blockId, 'Postponed to buffer')

    const comp = useStudyPlanStore.getState().taskCompletions[blockId]
    expect(comp).toBeDefined()
    expect(comp.status).toBe('skipped')
    expect(comp.skipReason).toBe('Postponed to buffer')
  })

  it('loads completions from localStorage into Record on initializeStore', async () => {
    const mockCompletions = [
      {
        id: '2026-11-18-b1',
        blockId: '2026-11-18-b1',
        userId: 'test_user',
        date: '2026-11-18',
        status: 'completed',
        actualMinutes: 60,
        syncStatus: 'local',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('examflow_test_user_completions', JSON.stringify(mockCompletions))

    await useStudyPlanStore.getState().initializeStore('test_user')

    const state = useStudyPlanStore.getState()
    expect(state.currentUserId).toBe('test_user')
    expect(state.taskCompletions['2026-11-18-b1']).toBeDefined()
    expect(state.taskCompletions['2026-11-18-b1'].status).toBe('completed')
  })
})
