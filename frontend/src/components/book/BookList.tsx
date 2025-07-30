import { BookOpenIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useScrollRestoration } from '../hooks/useScrollRestoration'
import { useGetBooksQuery } from '../middleware/backend'
import { BookCard } from './BookCard'
import { BookFilter } from './BookFilter'
import { BookSearch } from './BookSearch'

export function BookList() {
  const { navigateWithScrollState } = useScrollRestoration()
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [selectedTag, setSelectedTag] = useState<string>('')

  // Use RTK Query to fetch books with search parameter
  const { data: books = [], isLoading: loading, error } = useGetBooksQuery(
    searchQuery.trim() ? { search: searchQuery.trim() } : undefined
  )

  // Restore scroll position after books are loaded
  useEffect(() => {
    if (!loading && books.length > 0) {
      // This will be handled by the useScrollRestoration hook, but we wait for content
    }
  }, [loading, books.length])

  // Get unique genres from books
  const genres = useMemo(() => {
    const genreSet = new Set(books.flatMap(book =>
      book.genres?.map(genre => genre.name) || []
    ))
    return Array.from(genreSet).sort()
  }, [books])

  // Get unique ratings from books
  const ratings = useMemo(() => {
    const ratingSet = new Set(books.map(book => book.rating).filter(rating => rating !== null))
    return Array.from(ratingSet).sort((a, b) => a - b)
  }, [books])

  const tags = useMemo(() => {
    const tagSet = new Set(books.flatMap(book =>
      book.tags.map(tag => tag.name)
    ))
    return Array.from(tagSet).sort()
  }, [books])

  // Filter books based on search and filter criteria
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      // Genre filter
      if (selectedGenre) {
        const bookGenreNames = book.genres?.map(genre => genre.name) || []
        if (!bookGenreNames.includes(selectedGenre)) {
          return false
        }
      }

      // Rating filter
      if (selectedRating !== null && book.rating !== selectedRating) {
        return false
      }

      // Tag filter
      if (selectedTag) {
        const bookTagNames = book.tags?.map(tag => tag.name) || []
        if (!bookTagNames.includes(selectedTag)) {
          return false
        }
      }

      return true
    })
  }, [books, selectedGenre, selectedRating, selectedTag])

  const handleBookClick = (bookId: number) => {
    navigateWithScrollState(`/book/${bookId}`)
  }

  const clearFilters = () => {
    setSelectedGenre('')
    setSelectedRating(null)
    setSelectedTag('')
  }

  const hasActiveFilters = Boolean(selectedGenre || selectedRating !== null || selectedTag)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
        <p className="text-amber-200 font-medium">Loading your books...</p>
      </div>
    )
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

  // Show empty library message only when not searching and no filters are active
  if (books.length === 0 && !searchQuery.trim() && !hasActiveFilters) {
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
      <div className="pb-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <BookSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultsCount={filteredBooks.length}
            totalCount={books.length}
          />
        </div>

        <div className="flex-shrink-0">
          <BookFilter
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            selectedGenre={selectedGenre}
            onGenreChange={setSelectedGenre}
            selectedRating={selectedRating}
            onRatingChange={setSelectedRating}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
            genres={genres}
            ratings={ratings}
            tags={tags}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </div>

      {/* Show books grid only if there are books */}
      {filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => handleBookClick(book.id)}
            />
          ))}
        </div>
      )}

      {/* No Results Message */}
      {(searchQuery.trim() || hasActiveFilters) && filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-amber-400 mb-2">🔍</div>
          <h3 className="text-lg font-medium text-amber-200 mb-2">No books found</h3>
          <p className="text-amber-300">
            {searchQuery.trim()
              ? `No books or authors found for "${searchQuery}"`
              : 'No books match your current filters'
            }. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  )
}
