import { BookIcon } from 'lucide-react'
import { type User } from '../contexts/UserContext'
import { useGetBookJournalsQuery, useGetUsersQuery } from '../middleware/backend'
import { UserAvatar } from './UserAvatar'

interface JournalListProps {
  bookId: number
}

export function JournalList({ bookId }: JournalListProps) {
  // Use RTK Query to fetch journals and users
  const { data: journals = [], isLoading: journalsLoading, error: journalsError } = useGetBookJournalsQuery(bookId)
  const { data: users = [], isLoading: usersLoading, error: usersError } = useGetUsersQuery()

  const loading = journalsLoading || usersLoading
  const error = journalsError || usersError

  // Helper function to find user by ID
  const getUserById = (userId: number): User | null => {
    return users.find((user: User) => user.id === userId) || null
  }

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
        console.log('Date: ', journal.created_at)
        const date = new Date(journal.created_at)
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })

        const journalAuthor = journal.user_id ? getUserById(journal.user_id) : null

        return (
          <div
            key={journal.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md"
          >
            <div className="flex items-center gap-3 mb-3">
              {journalAuthor && (
                <UserAvatar
                  user={journalAuthor}
                  size="sm"
                />
              )}
              <div>
                <div className="text-sm font-medium text-gray-200">
                  {journalAuthor ? journalAuthor.name : 'Anonymous'}
                </div>
                <div className="text-xs text-gray-400">{formattedDate}</div>
              </div>
            </div>
            <p className="text-gray-200 whitespace-pre-wrap pl-11">
              {journal.content}
            </p>
          </div>
        )
      })}
    </div>
  )
}
