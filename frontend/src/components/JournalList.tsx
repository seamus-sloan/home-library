import { BookIcon } from 'lucide-react'
import type { BookJournal } from '../types'
import { UserAvatar } from './UserAvatar'

interface JournalListProps {
  journals: BookJournal[]
}

export function JournalList({ journals }: JournalListProps) {
  if (journals.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <BookIcon size={32} className="mx-auto mb-3 text-gray-600" />
        <p className="text-gray-400">
          No journal entries yet. Add your first reading journal.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {journals.map((journal) => {
        return (
          <div
            key={journal.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md"
          >
            <div className="flex items-center gap-3 mb-3">
              <UserAvatar
                user={{
                  id: journal.user.id,
                  name: journal.user.name,
                  avatar_color: journal.user.avatar_color,
                }}
                size="sm"
              />
              <div>
                <div className="text-sm font-medium text-gray-200">
                  {journal.user.name}
                </div>
                <div className="text-xs text-gray-400">{journal.created_at}</div>
              </div>
            </div>
            {/* {journal.title && (
              <h4 className="text-lg font-semibold text-white mb-2 pl-11">{journal.title}</h4>
            )} */}
            <p className="text-gray-200 whitespace-pre-wrap pl-11">
              {journal.content}
            </p>
          </div>
        )
      })}
    </div>
  )
}
