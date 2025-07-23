import { BookIcon } from 'lucide-react'
import { type JournalEntry } from '../types'
interface JournalListProps {
  journals: JournalEntry[]
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
        console.log('Date: ', journal.created_at)
        const date = new Date(journal.created_at)
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        return (
          <div
            key={journal.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md"
          >
            <div className="text-gray-400 text-sm mb-2">{formattedDate}</div>
            <p className="text-gray-200 whitespace-pre-wrap">
              {journal.content}
            </p>
          </div>
        )
      })}
    </div>
  )
}
