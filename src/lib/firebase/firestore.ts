import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db, isDemoMode } from './config'
import {
  TaskCompletion,
  TopicProgress,
  RecallTask,
  StudySession,
  Note,
  UserSettings,
  PendingChange,
} from '@/models'

// Helper to convert Firestore Timestamps or undefined fields safely
function sanitizeDocData<T>(docData: Record<string, any>): T {
  const result: Record<string, any> = { ...docData }
  for (const key of Object.keys(result)) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate().toISOString()
    }
  }
  return result as T
}

// ── Task Completions ─────────────────────────────────────────

export async function getTaskCompletions(
  userId: string,
  date?: string
): Promise<TaskCompletion[]> {
  if (isDemoMode || !userId) return []
  try {
    const colRef = collection(db, 'users', userId, 'taskCompletions')
    const q = date ? query(colRef, where('date', '==', date)) : colRef
    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...sanitizeDocData<TaskCompletion>(docSnap.data()),
    }))
  } catch (error) {
    console.error('Error fetching task completions from Firestore:', error)
    return []
  }
}

export async function upsertTaskCompletion(
  userId: string,
  task: TaskCompletion
): Promise<void> {
  if (isDemoMode || !userId) return
  try {
    const docId = task.id || task.blockId
    const docRef = doc(db, 'users', userId, 'taskCompletions', docId)
    const payload = {
      ...task,
      id: docId,
      updatedAt: serverTimestamp(),
      ...(task.createdAt ? {} : { createdAt: serverTimestamp() }),
    }
    await setDoc(docRef, payload, { merge: true })
  } catch (error) {
    console.error(`Error saving task completion ${task.id} to Firestore:`, error)
  }
}

// ── Topic Progress ──────────────────────────────────────────

export async function getAllTopicProgress(
  userId: string
): Promise<TopicProgress[]> {
  if (isDemoMode || !userId) return []
  try {
    const colRef = collection(db, 'users', userId, 'topicProgress')
    const snapshot = await getDocs(colRef)
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...sanitizeDocData<TopicProgress>(docSnap.data()),
    }))
  } catch (error) {
    console.error('Error fetching topic progress from Firestore:', error)
    return []
  }
}

export async function upsertTopicProgress(
  userId: string,
  progress: TopicProgress
): Promise<void> {
  if (isDemoMode || !userId) return
  try {
    const docId = progress.id || `${userId}_${progress.topicId}`
    const docRef = doc(db, 'users', userId, 'topicProgress', docId)
    const payload = {
      ...progress,
      id: docId,
      updatedAt: serverTimestamp(),
      ...(progress.createdAt ? {} : { createdAt: serverTimestamp() }),
    }
    await setDoc(docRef, payload, { merge: true })
  } catch (error) {
    console.error(`Error saving topic progress ${progress.id} to Firestore:`, error)
  }
}

// ── Recall Tasks (Spaced Repetition) ─────────────────────────

export async function getRecallTasks(userId: string): Promise<RecallTask[]> {
  if (isDemoMode || !userId) return []
  try {
    const colRef = collection(db, 'users', userId, 'recalls')
    const snapshot = await getDocs(colRef)
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...sanitizeDocData<RecallTask>(docSnap.data()),
    }))
  } catch (error) {
    console.error('Error fetching recall tasks from Firestore:', error)
    return []
  }
}

export async function upsertRecallTask(
  userId: string,
  recall: RecallTask
): Promise<void> {
  if (isDemoMode || !userId) return
  try {
    const docRef = doc(db, 'users', userId, 'recalls', recall.id)
    const payload = {
      ...recall,
      updatedAt: serverTimestamp(),
      ...(recall.createdAt ? {} : { createdAt: serverTimestamp() }),
    }
    await setDoc(docRef, payload, { merge: true })
  } catch (error) {
    console.error(`Error saving recall task ${recall.id} to Firestore:`, error)
  }
}

// ── Study Sessions ──────────────────────────────────────────

export async function getStudySessions(
  userId: string,
  sinceDate?: string
): Promise<StudySession[]> {
  if (isDemoMode || !userId) return []
  try {
    const colRef = collection(db, 'users', userId, 'studySessions')
    const q = sinceDate
      ? query(colRef, where('startedAt', '>=', sinceDate), orderBy('startedAt', 'desc'))
      : query(colRef, orderBy('startedAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...sanitizeDocData<StudySession>(docSnap.data()),
    }))
  } catch (error) {
    console.error('Error fetching study sessions from Firestore:', error)
    return []
  }
}

export async function upsertStudySession(
  userId: string,
  session: StudySession
): Promise<void> {
  if (isDemoMode || !userId) return
  try {
    const docRef = doc(db, 'users', userId, 'studySessions', session.id)
    const payload = {
      ...session,
      updatedAt: serverTimestamp(),
      ...(session.createdAt ? {} : { createdAt: serverTimestamp() }),
    }
    await setDoc(docRef, payload, { merge: true })
  } catch (error) {
    console.error(`Error saving study session ${session.id} to Firestore:`, error)
  }
}

// ── Notes ───────────────────────────────────────────────────

export async function getNotes(userId: string): Promise<Note[]> {
  if (isDemoMode || !userId) return []
  try {
    const colRef = collection(db, 'users', userId, 'notes')
    const snapshot = await getDocs(colRef)
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...sanitizeDocData<Note>(docSnap.data()),
    }))
  } catch (error) {
    console.error('Error fetching notes from Firestore:', error)
    return []
  }
}

export async function upsertNote(userId: string, note: Note): Promise<void> {
  if (isDemoMode || !userId) return
  try {
    const docRef = doc(db, 'users', userId, 'notes', note.id)
    const payload = {
      ...note,
      updatedAt: serverTimestamp(),
      ...(note.createdAt ? {} : { createdAt: serverTimestamp() }),
    }
    await setDoc(docRef, payload, { merge: true })
  } catch (error) {
    console.error(`Error saving note ${note.id} to Firestore:`, error)
  }
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  if (isDemoMode || !userId) return
  try {
    const docRef = doc(db, 'users', userId, 'notes', noteId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error(`Error deleting note ${noteId} from Firestore:`, error)
  }
}

// ── Settings ────────────────────────────────────────────────

export async function getUserSettings(
  userId: string
): Promise<UserSettings | null> {
  if (isDemoMode || !userId) return null
  try {
    const docRef = doc(db, 'users', userId, 'settings', 'preferences')
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      return {
        ...sanitizeDocData<UserSettings>(snap.data()),
        userId,
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching user settings from Firestore:', error)
    return null
  }
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  if (isDemoMode || !userId) return
  try {
    const docRef = doc(db, 'users', userId, 'settings', 'preferences')
    const payload = {
      ...settings,
      userId,
      updatedAt: serverTimestamp(),
    }
    await setDoc(docRef, payload, { merge: true })
  } catch (error) {
    console.error('Error updating user settings in Firestore:', error)
  }
}

// ── Batch Operations for Sync ────────────────────────────────

export async function syncLocalChanges(
  userId: string,
  pendingChanges: PendingChange[]
): Promise<void> {
  if (isDemoMode || !userId || pendingChanges.length === 0) return
  try {
    // Firestore batches are limited to 500 operations
    const CHUNK_SIZE = 450
    for (let i = 0; i < pendingChanges.length; i += CHUNK_SIZE) {
      const chunk = pendingChanges.slice(i, i + CHUNK_SIZE)
      const batch = writeBatch(db)

      for (const item of chunk) {
        let docRef
        if (item.collection === 'settings') {
          docRef = doc(db, 'users', userId, 'settings', 'preferences')
        } else {
          docRef = doc(db, 'users', userId, item.collection, item.id)
        }

        const payload = {
          ...item.data,
          updatedAt: serverTimestamp(),
        }
        batch.set(docRef, payload, { merge: true })
      }

      await batch.commit()
    }
  } catch (error) {
    console.error('Error batch syncing local changes to Firestore:', error)
    throw error
  }
}
