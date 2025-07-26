import { BookIcon } from 'lucide-react'
import type { Book, BookWithDetails } from '../types'

interface BookCardProps {
  book: Book | BookWithDetails
  onClick: () => void
}
export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <div
      className="bg-zinc-900/80 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-zinc-800/50 hover:border-amber-600/30 hover:bg-zinc-900/90 backdrop-blur-sm group"
      onClick={onClick}
    >
      <div className="h-48 bg-zinc-800/50 flex items-center justify-center relative overflow-hidden">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={`${book.title} cover`}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => {
              const target = e.target as HTMLImageElement
              target.onerror = null
              target.src =
                'https://placehold.co/400x600/18181b/71717a?text=No+Image'
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-amber-600">
            <BookIcon size={48} />
            <span className="mt-2 text-sm font-medium">No cover image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-amber-50 truncate mb-1 tracking-wide">
          {book.title}
        </h3>
        <p className="text-amber-200 font-medium mb-3">by {book.author}</p>
        <div className="mt-2">
          <span className="inline-block bg-amber-900/40 text-amber-200 text-xs px-3 py-1.5 rounded-full border border-amber-700/30 font-medium">
            {book.genre || 'Uncategorized'}
          </span>
        </div>
      </div>
    </div>
  )
}
