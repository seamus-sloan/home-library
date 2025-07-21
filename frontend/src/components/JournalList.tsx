import { type JournalEntry } from '../App'

interface JournalListProps {
  journals: JournalEntry[]
}

export function JournalList({ journals }: JournalListProps) {
  return (
    <ul>
      {journals.map(journal => (
        <li key={journal.id}>{journal.content}</li>
      ))}
    </ul>
  )
}
