import React from 'react'
import { Note } from '@/models'
import studyPlan from '@/data/study_plan.json'
import { Pin, Calendar, Tag, ChevronRight, FileText } from 'lucide-react'

interface NoteListProps {
  notes: Note[]
  selectedNoteId?: string
  onSelectNote: (note: Note) => void
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
}) => {
  const subjectsMap: Record<string, any> = {}
  studyPlan.subjects.forEach((s) => {
    subjectsMap[s.id] = s
  })

  if (notes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-800">
        <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">No notes found</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Create your first note or formula summary using the button below.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => {
        const sub = note.subjectId ? subjectsMap[note.subjectId] : null
        const isSelected = note.id === selectedNoteId
        const isFormula = note.tags?.includes('formulasheet')

        return (
          <div
            key={note.id}
            onClick={() => onSelectNote(note)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm group min-touch ${
              isSelected
                ? 'bg-primary-50/20 dark:bg-primary-950/20 border-primary-500'
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                {note.isPinned && (
                  <Pin className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {note.title || 'Untitled Note'}
                    </h4>

                    {sub && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shrink-0"
                        style={{ backgroundColor: sub.color }}
                      >
                        {sub.shortName || sub.name}
                      </span>
                    )}

                    {isFormula && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Formula Sheet
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 font-normal leading-relaxed">
                    {note.content ? note.content.replace(/[#*`_]/g, '') : 'No content'}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {note.tags && note.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {note.tags.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
