import { useEffect, useRef, useState, useCallback } from 'react'
import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore'
import { db, isDemoMode } from '@/lib/firebase/config'
import { useStudyPlanStore } from '@/store/useStudyPlanStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useOfflineStatus } from './useOfflineStatus'
import { TaskCompletion, TopicProgress, RecallTask, Note } from '@/models'

export function useFirestoreSync() {
  const { isOnline } = useOfflineStatus()
  const { user } = useAuthStore()
  const {
    syncPending,
    syncStatus,
    pendingSync,
    initializeStore,
  } = useStudyPlanStore()

  const [bannerMessage, setBannerMessage] = useState<string | null>(null)
  const isSyncingRef = useRef(false)
  const unsubsRef = useRef<Unsubscribe[]>([])

  // Trigger sync when coming back online
  const handleSync = useCallback(async () => {
    if (!isOnline || isSyncingRef.current || pendingSync.length === 0) return
    isSyncingRef.current = true
    try {
      await syncPending()
    } catch (e) {
      console.error('Error during auto-sync:', e)
    } finally {
      isSyncingRef.current = false
    }
  }, [isOnline, pendingSync.length, syncPending])

  useEffect(() => {
    if (isOnline) {
      handleSync()
    }
  }, [isOnline, handleSync])

  // Setup real-time Firestore listeners for logged in non-demo user
  useEffect(() => {
    // Clean up any previous listeners
    unsubsRef.current.forEach((unsub) => unsub())
    unsubsRef.current = []

    const uid = user?.uid
    if (!uid || isDemoMode) {
      return
    }

    try {
      // 1. Task completions listener
      const completionsCol = collection(db, 'users', uid, 'taskCompletions')
      const unsubCompletions = onSnapshot(
        completionsCol,
        (snap) => {
          if (snap.metadata.hasPendingWrites) return // skip local uncommitted echo
          const state = useStudyPlanStore.getState()
          const nextMap = new Map(state.taskCompletions)
          snap.docChanges().forEach((change) => {
            const data = change.doc.data() as TaskCompletion
            if (change.type === 'removed') {
              nextMap.delete(change.doc.id)
            } else {
              nextMap.set(change.doc.id, {
                ...data,
                id: change.doc.id,
                blockId: data.blockId || change.doc.id,
                syncStatus: 'synced',
              })
            }
          })
          useStudyPlanStore.setState({ taskCompletions: nextMap })
        },
        (err) => console.error('Firestore completions snapshot error:', err)
      )
      unsubsRef.current.push(unsubCompletions)

      // 2. Topic progress listener
      const progressCol = collection(db, 'users', uid, 'topicProgress')
      const unsubProgress = onSnapshot(
        progressCol,
        (snap) => {
          if (snap.metadata.hasPendingWrites) return
          const state = useStudyPlanStore.getState()
          const nextMap = new Map(state.topicProgress)
          snap.docChanges().forEach((change) => {
            const data = change.doc.data() as TopicProgress
            if (change.type === 'removed') {
              nextMap.delete(change.doc.id)
            } else {
              nextMap.set(change.doc.id, {
                ...data,
                id: change.doc.id,
                syncStatus: 'synced',
              })
            }
          })
          useStudyPlanStore.setState({ topicProgress: nextMap })
        },
        (err) => console.error('Firestore progress snapshot error:', err)
      )
      unsubsRef.current.push(unsubProgress)

      // 3. Recalls listener
      const recallsCol = collection(db, 'users', uid, 'recalls')
      const unsubRecalls = onSnapshot(
        recallsCol,
        (snap) => {
          if (snap.metadata.hasPendingWrites) return
          const state = useStudyPlanStore.getState()
          const currentRecalls = [...state.recallTasks]
          snap.docChanges().forEach((change) => {
            const data = change.doc.data() as RecallTask
            const index = currentRecalls.findIndex((r) => r.id === change.doc.id)
            if (change.type === 'removed') {
              if (index !== -1) currentRecalls.splice(index, 1)
            } else if (index !== -1) {
              currentRecalls[index] = { ...data, id: change.doc.id, syncStatus: 'synced' }
            } else {
              currentRecalls.push({ ...data, id: change.doc.id, syncStatus: 'synced' })
            }
          })
          useStudyPlanStore.setState({ recallTasks: currentRecalls })
        },
        (err) => console.error('Firestore recalls snapshot error:', err)
      )
      unsubsRef.current.push(unsubRecalls)

      // 4. Notes listener
      const notesCol = collection(db, 'users', uid, 'notes')
      const unsubNotes = onSnapshot(
        notesCol,
        (snap) => {
          if (snap.metadata.hasPendingWrites) return
          const state = useStudyPlanStore.getState()
          const currentNotes = [...state.notes]
          snap.docChanges().forEach((change) => {
            const data = change.doc.data() as Note
            const index = currentNotes.findIndex((n) => n.id === change.doc.id)
            if (change.type === 'removed') {
              if (index !== -1) currentNotes.splice(index, 1)
            } else if (index !== -1) {
              currentNotes[index] = { ...data, id: change.doc.id, syncStatus: 'synced' }
            } else {
              currentNotes.unshift({ ...data, id: change.doc.id, syncStatus: 'synced' })
            }
          })
          useStudyPlanStore.setState({ notes: currentNotes })
        },
        (err) => console.error('Firestore notes snapshot error:', err)
      )
      unsubsRef.current.push(unsubNotes)
    } catch (e) {
      console.error('Error attaching Firestore real-time listeners:', e)
    }

    return () => {
      unsubsRef.current.forEach((unsub) => unsub())
      unsubsRef.current = []
    }
  }, [user?.uid])

  // Sync banner status
  useEffect(() => {
    if (!isOnline) {
      setBannerMessage('You are offline. Changes are saved locally and will sync once connected.')
    } else if (syncStatus === 'syncing') {
      setBannerMessage('Syncing changes with cloud...')
    } else if (syncStatus === 'error') {
      setBannerMessage('Sync failed. Will retry automatically.')
    } else if (pendingSync.length > 0) {
      setBannerMessage(`${pendingSync.length} changes waiting to sync.`)
    } else {
      setBannerMessage(null)
    }
  }, [isOnline, syncStatus, pendingSync.length])

  return {
    isOnline,
    syncStatus,
    pendingSyncCount: pendingSync.length,
    bannerMessage,
    syncPending: handleSync,
  }
}
