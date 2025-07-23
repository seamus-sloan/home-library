import { BookIcon } from 'lucide-react'
import type { Book } from '../types'
interface BookCardProps {
  book: Book
  onClick: () => void
}
export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <div
      className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-700"
      onClick={onClick}
    >
      <div className="h-48 bg-gray-700 flex items-center justify-center">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={`${book.title} cover`}
            className="h-full w-full object-cover"
            onError={e => {
              const target = e.target as HTMLImageElement
              target.onerror = null
              target.src =
                'https://placehold.co/400x600/2a2a2a/6b6b6b?text=No+Image'
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <BookIcon size={48} />
            <span className="mt-2 text-sm">No cover image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-100 truncate">
          {book.title}
        </h3>
        <p className="text-gray-400">by {book.author}</p>
        <div className="mt-2">
          <span className="inline-block bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded-full">
            {book.genre || 'Uncategorized'}
          </span>
        </div>
      </div>
    </div>
  )
}
