import { useState, useEffect, useCallback, useRef } from 'react'
import { Note } from '@/models'

const STORAGE_KEY = 'examflow_notes'

export function useNotes(userId = 'default_user', filterSubjectId?: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const debounceTimerRef = useRef<Record<string, NodeJS.Timeout>>({})

  // Load notes from localStorage
  const loadNotes = useCallback(() => {
    try {
      const stored = localStorage.getItem(`examflow_${userId}_notes`) || localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setNotes(Array.isArray(parsed) ? parsed : [])
      } else {
        // Default initial formula sheets / welcome notes if empty
        const initialNotes: Note[] = [
          {
            id: 'note_fs_formula',
            userId,
            subjectId: 'fs',
            title: 'Full Stack Formula Sheet',
            content: '# Full Stack Core Concepts\n\n- **HTML5 Semantic Elements**: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`\n- **CSS Box Model**: Content -> Padding -> Border -> Margin\n- **REST Verbs**: GET, POST, PUT, DELETE, PATCH\n- **React Hooks**: `useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`\n- **MERN Stack**: MongoDB, Express, React, Node.js',
            tags: ['formulasheet', 'exam-morning', 'pinned'],
            isPinned: true,
            syncStatus: 'local',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'note_ads_formula',
            userId,
            subjectId: 'ads',
            title: 'ADS Formula & Time Complexities',
            content: '# Advanced Data Structures\n\n- **AVL Tree**: Balance Factor = Height(Left) - Height(Right) in {-1, 0, 1}\n- **Rotations**: Single Left, Single Right, Double LR, Double RL\n- **B-Trees**: Order M; root has 2 to M children; leaves at same depth\n- **Heap Operations**: Insert O(log N), Delete-Min O(log N)\n- **Dijkstra Algorithm**: O((V + E) log V) with Priority Queue',
            tags: ['formulasheet', 'exam-morning', 'pinned'],
            isPinned: true,
            syncStatus: 'local',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
        setNotes(initialNotes)
        localStorage.setItem(`examflow_${userId}_notes`, JSON.stringify(initialNotes))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNotes))
      }
    } catch (e) {
      console.error('Failed loading notes:', e)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  // Save notes to localStorage
  const persistNotes = useCallback(
    (newNotes: Note[]) => {
      try {
        localStorage.setItem(`examflow_${userId}_notes`, JSON.stringify(newNotes))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes))
      } catch (e) {
        console.error('Failed to save notes:', e)
      }
    },
    [userId]
  )

  // Create Note
  const createNote = useCallback(
    (data: Partial<Note>): Note => {
      const now = new Date().toISOString()
      const newNote: Note = {
        id: data.id || `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        subjectId: data.subjectId || 'fs',
        topicId: data.topicId,
        topicName: data.topicName,
        title: data.title || 'Untitled Note',
        content: data.content || '',
        tags: data.tags || [],
        isPinned: !!data.isPinned,
        syncStatus: 'local',
        createdAt: now,
        updatedAt: now,
      }

      setNotes((prev) => {
        const updated = [newNote, ...prev]
        persistNotes(updated)
        return updated
      })

      return newNote
    },
    [userId, persistNotes]
  )

  // Update Note (Immediate state update + Debounced 500ms persist)
  const updateNote = useCallback(
    (noteId: string, updates: Partial<Note>, immediate = false) => {
      setNotes((prev) => {
        const updated = prev.map((n) => {
          if (n.id === noteId) {
            return {
              ...n,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          }
          return n
        })

        if (immediate) {
          persistNotes(updated)
        } else {
          // Debounce persist 500ms
          if (debounceTimerRef.current[noteId]) {
            clearTimeout(debounceTimerRef.current[noteId])
          }
          debounceTimerRef.current[noteId] = setTimeout(() => {
            persistNotes(updated)
            delete debounceTimerRef.current[noteId]
          }, 500)
        }

        return updated
      })
    },
    [persistNotes]
  )

  // Delete Note
  const deleteNote = useCallback(
    (noteId: string) => {
      if (debounceTimerRef.current[noteId]) {
        clearTimeout(debounceTimerRef.current[noteId])
        delete debounceTimerRef.current[noteId]
      }

      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== noteId)
        persistNotes(updated)
        return updated
      })
    },
    [persistNotes]
  )

  // Toggle Pin
  const togglePin = useCallback(
    (noteId: string) => {
      setNotes((prev) => {
        const updated = prev.map((n) => {
          if (n.id === noteId) {
            return { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() }
          }
          return n
        })
        persistNotes(updated)
        return updated
      })
    },
    [persistNotes]
  )

  // Filter and sort: pinned first, then newest
  const filteredNotes = notes
    .filter((n) => (filterSubjectId ? n.subjectId === filterSubjectId : true))
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  return {
    notes: filteredNotes,
    allNotes: notes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    loading,
    refresh: loadNotes,
  }
}
