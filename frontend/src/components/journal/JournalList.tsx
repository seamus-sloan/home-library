import DOMPurify from 'dompurify'
import { BookIcon, Edit2Icon } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import type { BookJournal } from '../../types'
import { formatRelativeDate } from '../../utils/dateUtils'
import { UserAvatar } from '../common/UserAvatar'
import { JournalForm } from './JournalForm'
import './editor-styles.css'

interface JournalListProps {
  journals: BookJournal[]
  bookId: number
}

export function JournalList({ journals, bookId }: JournalListProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser)
  const [editingJournalId, setEditingJournalId] = useState<number | null>(null)

  if (journals.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
        <BookIcon size={32} className="mx-auto mb-3 text-amber-600" />
        <p className="text-amber-300">
          No journal entries yet. Add your first reading journal.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {journals.map((journal) => {
        const isEditing = editingJournalId === journal.id
        const canEdit = currentUser?.id === journal.user.id
        const wasEdited = journal.created_at !== journal.updated_at

        if (isEditing) {
          return (
            <JournalForm
              key={journal.id}
              bookId={bookId}
              journal={{
                id: journal.id,
                user_id: journal.user.id,
                book_id: bookId,
                title: journal.title,
                content: journal.content,
                created_at: journal.created_at,
                updated_at: journal.updated_at,
              }}
              onSubmit={() => setEditingJournalId(null)}
              onCancel={() => setEditingJournalId(null)}
            />
          )
        }

        return (
          <div
            key={journal.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  user={{
                    id: journal.user.id,
                    name: journal.user.name,
                    color: journal.user.color,
                    avatar_image: journal.user.avatar_image,
                  }}
                  size="sm"
                />
                <div>
                  <div className="text-sm font-medium text-amber-200">
                    {journal.user.name}
                  </div>
                  <div className="text-xs text-amber-400">
                    Created {formatRelativeDate(journal.created_at, true)}
                    {wasEdited && (
                      <> | Edited {formatRelativeDate(journal.updated_at, true)}</>
                    )}
                  </div>
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => setEditingJournalId(journal.id)}
                  className="p-2 text-amber-400 hover:text-amber-200 hover:bg-zinc-800 rounded transition-colors"
                  aria-label="Edit journal"
                >
                  <Edit2Icon size={16} />
                </button>
              )}
            </div>
            <div
              className="text-amber-200 pl-11 prose journal-content prose-amber prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(journal.content) }}
            />
          </div>
        )
      })}
    </div>
  )
}
