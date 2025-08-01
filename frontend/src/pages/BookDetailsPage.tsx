import { ArrowLeftIcon, BookOpenIcon, EditIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CategoryBadge, StarRating } from '../components/common'
import { BookForm, type BookFormData } from '../components/forms'
import { AddJournalForm } from '../components/forms/AddJournalForm'
import { JournalList } from '../components/journal/JournalList'
import { useGetBookQuery, useUpdateBookMutation } from '../middleware/backend'
import type { JournalEntry } from '../types'

interface BookDetailsProps {
  addJournal: (journal: Omit<JournalEntry, 'id'>) => void
}
export function BookDetails({ }: BookDetailsProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Use RTK Query to fetch book data (now includes tags and journals)
  const { data: bookWithDetails, isLoading: loading, error } = useGetBookQuery(id || '', {
    skip: !id, // Skip the query if no ID is provided
  })

  // Use mutation for updating books
  const [updateBook] = useUpdateBookMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [isAddingJournal, setIsAddingJournal] = useState(false)

  // Handle form submission
  const handleBookFormSubmit = async (data: BookFormData) => {
    if (!id) return

    try {
      await updateBook({
        id: parseInt(id),
        book: {
          title: data.title,
          author: data.author,
          cover_image: data.cover_image || null,
          rating: data.rating,
          series: data.series || null,
          tags: data.tags.map(tag => tag.id),
          genres: data.genres.map(genre => genre.id),
        }
      }).unwrap()
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating book:', error)
    }
  }

  // Function to navigate back with scroll position restoration
  const handleBackNavigation = () => {
    if (location.state?.scrollPosition !== undefined) {
      // Navigate back and restore scroll position
      navigate('/', {
        state: { scrollPosition: location.state.scrollPosition }
      })
    } else {
      navigate('/')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-amber-200 mb-4">Loading...</h2>
      </div>
    )
  }

  if (error || !bookWithDetails) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-amber-200 mb-4">
          {error ? 'Error loading book' : 'Book not found'}
        </h2>
        <button
          onClick={handleBackNavigation}
          className="text-amber-400 hover:text-amber-300 flex items-center gap-2 mx-auto"
        >
          <ArrowLeftIcon size={18} />
          Return to library
        </button>
      </div>
    )
  }
  // Handle journal entry addition
  const handleAddJournal = async () => {
    // Close the form
    setIsAddingJournal(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBackNavigation}
          className="mr-4 text-amber-400 hover:text-amber-200"
          aria-label="Go back"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-amber-50 flex-grow">
          Book Details
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300"
          >
            <EditIcon size={18} />
            <span>Edit</span>
          </button>
        )}
      </div>
      {isEditing && bookWithDetails ? (
        <BookForm
          mode="edit"
          book={bookWithDetails}
          onSubmit={handleBookFormSubmit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-1/3">
            <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-lg border border-zinc-800">
              {bookWithDetails.cover_image ? (
                <img
                  src={bookWithDetails.cover_image}
                  alt={`${bookWithDetails.title} cover`}
                  className="w-full object-cover"
                  onError={e => {
                    const target = e.target as HTMLImageElement
                    target.onerror = null
                    target.src =
                      'https://placehold.co/400x600/18181b/71717a?text=No+Image'
                  }}
                />
              ) : (
                <div className="h-64 bg-zinc-800 flex flex-col items-center justify-center text-amber-600">
                  <BookOpenIcon size={64} />
                  <span className="mt-2">No cover image</span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-2/3 bg-zinc-900 p-6 rounded-lg shadow-md border border-zinc-800 flex flex-col">
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-amber-50 mb-2">{bookWithDetails.title}</h1>
              <p className="text-xl text-amber-200 mb-2">by {bookWithDetails.author}</p>
              {bookWithDetails.series && (
                <p className="text-lg text-amber-300 mb-4 italic">{bookWithDetails.series}</p>
              )}

              {/* Display genres */}
              {bookWithDetails.genres && bookWithDetails.genres.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-amber-200 mb-2">Genres:</h4>
                  <div className="flex flex-wrap gap-2">
                    {bookWithDetails.genres.map((genre) => (
                      <CategoryBadge
                        key={genre.id}
                        item={genre}
                        type="genre"
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* Display rating */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-amber-200 mb-2">Rating:</h4>
                <StarRating
                  rating={bookWithDetails.rating}
                  onRatingChange={() => { }} // No-op for display view
                  readonly={true}
                  size="medium"
                />
              </div>
              {/* Display tags */}
              {bookWithDetails.tags && bookWithDetails.tags.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-amber-200 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {bookWithDetails.tags.map((tag) => (
                      <CategoryBadge
                        key={tag.id}
                        item={tag}
                        type="tag"
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <span className="text-amber-400 text-sm italic">
                Added on {new Date(bookWithDetails.created_at || 0).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Find it Online Section */}
      <div className="mt-4 mb-8">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          {/* Search on Goodreads */}
          <a
            href={`https://www.goodreads.com/search?q=${encodeURIComponent(bookWithDetails.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-6 py-5 hover:bg-amber-100 hover:text-black transition-colors duration-200 rounded-lg border border-zinc-800 shadow-lg"
            title="Search on Goodreads"
            style={{ fontFamily: 'Tomorrow, sans-serif', fontWeight: 400 }}
          >
            <span>goodreads</span>
          </a>

          {/* Search on Storygraph */}
          <a
            href={`https://app.thestorygraph.com/browse?search_term=${encodeURIComponent(bookWithDetails.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-6 py-5 hover:bg-amber-100 hover:text-black transition-colors duration-200 rounded-lg border border-zinc-800 shadow-lg"
            title="Search on StoryGraph"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
          >
            <span>The StoryGraph</span>
          </a>
        </div>
      </div>

      {/* Reading Journal Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-amber-50">Reading Journal</h3>
          {!isAddingJournal && (
            <button
              onClick={() => setIsAddingJournal(true)}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300"
            >
              <PlusIcon size={18} />
              <span>Add Entry</span>
            </button>
          )}
        </div>
        {isAddingJournal ? (
          <AddJournalForm
            bookId={bookWithDetails.id}
            onSubmit={handleAddJournal}
            onCancel={() => setIsAddingJournal(false)}
          />
        ) : (
          <JournalList journals={bookWithDetails.journals || []} />
        )}
      </div>
    </div>
  )
}
