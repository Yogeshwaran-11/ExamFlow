import { z } from 'zod'

export interface BackupData {
  version: string
  exportedAt: string
  userId: string
  taskCompletions: any[]
  topicProgress: any[]
  recallTasks: any[]
  studySessions: any[]
  notes: any[]
  settings?: any
}

export const BackupSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  userId: z.string(),
  taskCompletions: z.array(z.any()).default([]),
  topicProgress: z.array(z.any()).default([]),
  recallTasks: z.array(z.any()).default([]),
  studySessions: z.array(z.any()).default([]),
  notes: z.array(z.any()).default([]),
  settings: z.any().optional(),
})

/**
 * Collect all data from localStorage / store and return as backup object
 */
export function exportData(userId: string): BackupData {
  const getStored = (key: string) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : []
    } catch {
      return []
    }
  }

  const getStoredObject = (key: string) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : undefined
    } catch {
      return undefined
    }
  }

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    userId,
    taskCompletions: getStored(`examflow_${userId}_completions`) || getStored('examflow_completions'),
    topicProgress: getStored(`examflow_${userId}_topics`) || getStored('examflow_topics'),
    recallTasks: getStored(`examflow_${userId}_recalls`) || getStored('examflow_recalls'),
    studySessions: getStored(`examflow_${userId}_sessions`) || getStored('examflow_sessions'),
    notes: getStored(`examflow_${userId}_notes`) || getStored('examflow_notes'),
    settings: getStoredObject(`examflow_${userId}_settings`) || getStoredObject('examflow_settings'),
  }
}

/**
 * Triggers a browser download of the backup JSON
 */
export function downloadAsJSON(data: unknown, filename = 'examflow-backup.json') {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Validates the imported JSON structure using zod
 */
export function validateImport(json: unknown): { success: boolean; data?: BackupData; error?: string } {
  try {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json
    const result = BackupSchema.safeParse(parsed)
    if (!result.success) {
      return { success: false, error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') }
    }
    return { success: true, data: result.data as BackupData }
  } catch (err: any) {
    return { success: false, error: err.message || 'Invalid JSON format' }
  }
}

/**
 * Imports backup data into localStorage / store with duplicate detection
 */
export function importData(json: unknown, userId: string): { success: boolean; count: number; error?: string } {
  const validation = validateImport(json)
  if (!validation.success || !validation.data) {
    return { success: false, count: 0, error: validation.error }
  }

  const data = validation.data
  let totalImported = 0

  const mergeList = (key: string, newItems: any[] = []) => {
    try {
      const existing = (() => {
        try {
          const item = localStorage.getItem(key)
          return item ? JSON.parse(item) : []
        } catch {
          return []
        }
      })()

      const existingMap = new Map<string, any>()
      existing.forEach((item: any) => {
        if (item && item.id) existingMap.set(item.id, item)
      })

      newItems.forEach((item: any) => {
        if (item && item.id) {
          if (!existingMap.has(item.id)) {
            totalImported++
          }
          // Merge or overwrite with latest
          existingMap.set(item.id, { ...existingMap.get(item.id), ...item })
        }
      })

      const merged = Array.from(existingMap.values())
      localStorage.setItem(key, JSON.stringify(merged))
      return merged
    } catch (e) {
      console.error(`Failed merging ${key}:`, e)
      return []
    }
  }

  mergeList(`examflow_${userId}_completions`, data.taskCompletions)
  mergeList('examflow_completions', data.taskCompletions)

  mergeList(`examflow_${userId}_topics`, data.topicProgress)
  mergeList('examflow_topics', data.topicProgress)

  mergeList(`examflow_${userId}_recalls`, data.recallTasks)
  mergeList('examflow_recalls', data.recallTasks)

  mergeList(`examflow_${userId}_sessions`, data.studySessions)
  mergeList('examflow_sessions', data.studySessions)

  mergeList(`examflow_${userId}_notes`, data.notes)
  mergeList('examflow_notes', data.notes)

  if (data.settings) {
    localStorage.setItem(`examflow_${userId}_settings`, JSON.stringify(data.settings))
    localStorage.setItem('examflow_settings', JSON.stringify(data.settings))
  }

  return { success: true, count: totalImported }
}
