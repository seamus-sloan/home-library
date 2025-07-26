import { BookOpenIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGetBooksQuery } from '../middleware/backend'
import { BookCard } from './BookCard'

export function BookList() {
  const navigate = useNavigate()

  // Use RTK Query to fetch books
  const { data: books = [], isLoading: loading, error } = useGetBooksQuery()

  const handleBookClick = (bookId: number) => {
    navigate(`/book/${bookId}`)
  }

  if (loading) {
    ; <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
      <p className="text-amber-200 font-medium">Loading your books...</p>
    </div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-red-400 mb-4">⚠️</div>
        <h2 className="text-2xl font-medium text-amber-200 mb-2">
          Error loading books
        </h2>
        <p className="text-amber-300 text-center max-w-md">Failed to load books</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-amber-900/40 text-amber-100 rounded-lg border border-amber-700/30 hover:border-amber-600/50 transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800/50 mb-4">
          <BookOpenIcon size={64} className="text-amber-600" />
        </div>
        <h2 className="text-2xl font-medium text-amber-200">
          Your library is empty
        </h2>
        <p className="text-amber-300 mt-2 text-center max-w-md">
          Click the "Add Book" button to start building your collection
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-amber-50 mb-8 tracking-wide border-b border-zinc-800 pb-4">Your Books</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map(book => (
          <BookCard
            key={book.id}
            book={book}
            onClick={() => handleBookClick(book.id)}
          />
        ))}
      </div>
    </div>
  )
}
