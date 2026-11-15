import React, { useState, useEffect, useRef } from 'react'
import { Note } from '@/models'
import studyPlan from '@/data/study_plan.json'
import { Bold, Italic, Heading, List, Code, Pin, Check, Trash2, ArrowLeft } from 'lucide-react'

interface NoteEditorProps {
  note: Note
  onSave: (updates: Partial<Note>, immediate?: boolean) => void
  onDelete: (id: string) => void
  onBack: () => void
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onDelete,
  onBack,
}) => {
  const [title, setTitle] = useState(note.title)
  const [subjectId, setSubjectId] = useState(note.subjectId || 'fs')
  const [content, setContent] = useState(note.content)
  const [isPinned, setIsPinned] = useState(note.isPinned || false)
  const [isSaved, setIsSaved] = useState(true)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setTitle(note.title)
    setSubjectId(note.subjectId || 'fs')
    setContent(note.content)
    setIsPinned(note.isPinned || false)
  }, [note.id])

  // Trigger auto-save
  const handleChange = (newTitle: string, newSubject: string, newContent: string, newPinned: boolean) => {
    setIsSaved(false)
    onSave({
      title: newTitle,
      subjectId: newSubject,
      content: newContent,
      isPinned: newPinned,
    })
    setTimeout(() => setIsSaved(true), 600)
  }

  // Insert markdown helpers
  const insertMarkdown = (prefix: string, suffix = '') => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = content.substring(start, end)
    const replacement = `${prefix}${selected}${suffix}`
    const updated = content.substring(0, start) + replacement + content.substring(end)
    setContent(updated)
    handleChange(title, subjectId, updated, isPinned)

    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full min-h-[600px]">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 min-touch"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Notes
        </button>

        <div className="flex items-center gap-2">
          {/* Saved indicator */}
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Saved
              </>
            ) : (
              'Saving...'
            )}
          </span>

          {/* Pin button */}
          <button
            onClick={() => {
              const nextPin = !isPinned
              setIsPinned(nextPin)
              handleChange(title, subjectId, content, nextPin)
            }}
            className={`p-2 rounded-xl transition-colors min-touch ${
              isPinned
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className="w-4 h-4 fill-current" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors min-touch"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Subject selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="sm:col-span-2">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              handleChange(e.target.value, subjectId, content, isPinned)
            }}
            placeholder="Note title..."
            className="w-full text-lg font-bold px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value)
              handleChange(title, e.target.value, content, isPinned)
            }}
            className="w-full text-xs font-semibold px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          >
            {studyPlan.subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Markdown Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl mb-3 border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('*', '*')}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('### ')}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
          title="Heading"
        >
          <Heading className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('- ')}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('`', '`')}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
          title="Code snippet"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      {/* Textarea */}
      <div className="flex-1 flex flex-col">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            handleChange(title, subjectId, e.target.value, isPinned)
          }}
          placeholder="Write your study notes, formulas, or summaries here (Markdown supported)..."
          className="w-full flex-1 min-h-[350px] p-4 bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none"
        />
      </div>
    </div>
  )
}
