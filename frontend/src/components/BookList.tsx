import { BookOpenIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type Book } from '../App'
import { BookCard } from './BookCard'
export function BookList() {
  const navigate = useNavigate()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/books')

        if (!response.ok) {
          throw new Error('Failed to fetch books')
        }

        const booksData = await response.json()
        setBooks(booksData)
      } catch (err) {
        console.error('Failed to fetch books:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  const handleBookClick = (bookId: number) => {
    navigate(`/book/${bookId}`)
  }

  if (loading) {
    ;<div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
      <p className="text-gray-400">Loading your books...</p>
    </div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-red-400 mb-4">⚠️</div>
        <h2 className="text-2xl font-medium text-gray-300 mb-2">
          Error loading books
        </h2>
        <p className="text-gray-400 text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookOpenIcon size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-medium text-gray-300">
          Your library is empty
        </h2>
        <p className="text-gray-400 mt-2">
          Click the "Add Book" button to start building your collection
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-6">Your Books</h2>
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
