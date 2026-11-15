import React, { useState } from 'react'
import studyPlan from '@/data/study_plan.json'
import { NoteList } from '@/components/notes/NoteList'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { useNotes } from '@/hooks/useNotes'
import { Note } from '@/models'
import { FileText, Plus, Search, Filter, Bookmark, Sparkles } from 'lucide-react'

export default function NotesPage() {
  const { notes, createNote, updateNote, deleteNote } = useNotes()
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [onlyFormulaSheets, setOnlyFormulaSheets] = useState(false)

  // Filter notes based on search, subject, and formula filter
  const displayedNotes = notes.filter((n) => {
    if (onlyFormulaSheets && !n.tags?.includes('formulasheet')) return false
    if (subjectFilter !== 'all' && n.subjectId !== subjectFilter) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      const matchTitle = n.title.toLowerCase().includes(q)
      const matchContent = n.content.toLowerCase().includes(q)
      if (!matchTitle && !matchContent) return false
    }
    return true
  })

  const handleCreateNew = () => {
    const newNote = createNote({
      title: 'New Study Note',
      subjectId: subjectFilter !== 'all' ? subjectFilter : 'fs',
      content: '',
      tags: onlyFormulaSheets ? ['formulasheet'] : [],
      isPinned: false,
    })
    setSelectedNote(newNote)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* If an editor is active, show the NoteEditor full screen/container */}
      {selectedNote ? (
        <NoteEditor
          note={selectedNote}
          onSave={(updates, immediate) => updateNote(selectedNote.id, updates, immediate)}
          onDelete={(id) => {
            deleteNote(id)
            setSelectedNote(null)
          }}
          onBack={() => setSelectedNote(null)}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary-500" />
                Notes & Formula Sheets
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Auto-saved markdown notes, formula summaries & key algorithm traces
              </p>
            </div>

            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all self-start sm:self-center min-touch"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>

          {/* Search & Formula Sheet Tab Toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes or formula contents..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              />
            </div>

            <button
              onClick={() => setOnlyFormulaSheets((prev) => !prev)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-colors min-touch ${
                onlyFormulaSheets
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Formula Sheets View
            </button>
          </div>

          {/* Subject Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSubjectFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 min-touch ${
                subjectFilter === 'all'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              All Subjects
            </button>

            {studyPlan.subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSubjectFilter(sub.id === subjectFilter ? 'all' : sub.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 min-touch ${
                  subjectFilter === sub.id
                    ? 'ring-2 ring-offset-2 ring-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
                style={{
                  backgroundColor: subjectFilter === sub.id ? sub.color : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sub.color }}
                />
                {sub.shortName || sub.name}
              </button>
            ))}
          </div>

          {/* Note List or Empty State */}
          {displayedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                {notes.length === 0
                  ? 'Create formula sheets, algorithm traces, and study notes — all auto-saved.'
                  : 'Try a different search term or select a different subject.'}
              </p>
              {notes.length === 0 && (
                <button
                  onClick={handleCreateNew}
                  className="mt-5 flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create First Note
                </button>
              )}
            </div>
          ) : (
            <NoteList
              notes={displayedNotes}
              selectedNoteId={selectedNote?.id}
              onSelectNote={(note) => setSelectedNote(note)}
            />
          )}

          {/* Floating Action Button (FAB) on Mobile */}
          <button
            onClick={handleCreateNew}
            className="sm:hidden fixed bottom-20 right-5 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all z-30 min-h-[56px] min-w-[56px]"
            title="Create Note"
          >
            <Plus className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  )
}
