import { BookIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useUser, type User } from '../contexts/UserContext'
import { type JournalEntry } from '../types'
import { UserAvatar } from './UserAvatar'

interface JournalListProps {
  bookId: number
}

export function JournalList({ bookId }: JournalListProps) {
  const { currentUser } = useUser()
  const [, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  const [journals, setJournals] = useState<JournalEntry[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const headers: HeadersInit = {}
        if (currentUser) {
          headers['currentUserId'] = currentUser.id.toString()
        }

        // Fetch journals and users in parallel
        const [journalsResponse, usersResponse] = await Promise.all([
          fetch(`/books/${bookId}/journals`, { headers }),
          fetch('/users', { headers })
        ])

        if (!journalsResponse.ok) {
          throw new Error('Failed to fetch journals')
        }
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users')
        }

        const [journalsData, usersData] = await Promise.all([
          journalsResponse.json(),
          usersResponse.json()
        ])

        // Map the users API response to match your User type
        const mappedUsers: User[] = usersData.map((user: User) => ({
          id: user.id,
          name: user.name,
          avatar_color: user.avatar_color
        }))

        setJournals(journalsData)
        setUsers(mappedUsers)

      } catch (error) {
        console.error('Failed to fetch data:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [bookId, currentUser]);

  // Helper function to find user by ID
  const getUserById = (userId: number): User | null => {
    return users.find(user => user.id === userId) || null
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
