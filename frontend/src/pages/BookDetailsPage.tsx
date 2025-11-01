import { ArrowLeftIcon, BookOpenIcon, EditIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CategoryBadge } from '../components/common'
import { BookForm, type BookFormData } from '../components/forms'
import { AddJournalForm } from '../components/forms/AddJournalForm'
import { JournalList } from '../components/journal/JournalList'
import { InteractiveRating, RatingsList } from '../components/rating'
import StatusDropdown from '../components/status/StatusDropdown'
import StatusList from '../components/status/StatusList'
import { useDeleteRatingMutation, useDeleteStatusMutation, useGetBookQuery, useUpdateBookMutation, useUpsertRatingMutation, useUpsertStatusMutation } from '../middleware/backend'
import type { RootState } from '../store/store'
import type { ReadingStatusValue } from '../types'
import { formatRelativeDate } from '../utils/dateUtils'

export function BookDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useSelector((state: RootState) => state.user.currentUser)

  // Use RTK Query to fetch book data (now includes tags and journals)
  const { data: bookWithDetails, isLoading: loading, error } = useGetBookQuery(id || '', {
    skip: !id, // Skip the query if no ID is provided
  })

  // Use mutation for updating books
  const [updateBook] = useUpdateBookMutation()
  const [upsertRating] = useUpsertRatingMutation()
  const [deleteRating] = useDeleteRatingMutation()
  const [upsertStatus] = useUpsertStatusMutation()
  const [deleteStatus] = useDeleteStatusMutation()

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

  // Handle rating change
  const handleRatingChange = async (rating: number) => {
    if (!id || !currentUser) return

    try {
      await upsertRating({
        bookId: parseInt(id),
        rating: rating,
      }).unwrap()
    } catch (error) {
      console.error('Error updating rating:', error)
    }
  }

  // Handle rating deletion
  const handleRatingDelete = async () => {
    if (!id || !currentUser) return

    try {
      await deleteRating(parseInt(id)).unwrap()
    } catch (error) {
      console.error('Error deleting rating:', error)
    }
  }

  // Handle status change
  const handleStatusChange = async (statusId: ReadingStatusValue) => {
    if (!id || !currentUser) return

    try {
      await upsertStatus({
        bookId: parseInt(id),
        statusId: statusId,
      }).unwrap()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Handle status deletion
  const handleStatusDelete = async () => {
    if (!id || !currentUser) return

    try {
      await deleteStatus(parseInt(id)).unwrap()
    } catch (error) {
      console.error('Error deleting status:', error)
    }
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

              {/* Ratings Section */}
              <div className="mb-6 md:mb-4">
                <h4 className="text-sm font-medium text-amber-200 mb-3">Ratings:</h4>

                {/* If user is logged in but hasn't rated yet, show the rating prompt */}
                {currentUser && !bookWithDetails.ratings?.some(r => r.user_id === currentUser.id) && (
                  <div className="mb-3 p-3 md:p-4 bg-stone-800/50 rounded-lg border border-amber-900/30">
                    <p className="text-xs text-amber-600 mb-3">Click the stars below to rate this book</p>
                    <InteractiveRating
                      ratings={bookWithDetails.ratings || []}
                      currentUserId={currentUser.id}
                      onRatingChange={handleRatingChange}
                    />
                  </div>
                )}

                {/* Show all ratings (your own will be clickable) */}
                {bookWithDetails.ratings && bookWithDetails.ratings.length > 0 ? (
                  <RatingsList
                    ratings={bookWithDetails.ratings}
                    currentUserId={currentUser?.id}
                    onRatingChange={currentUser ? handleRatingChange : undefined}
                    onRatingDelete={currentUser ? handleRatingDelete : undefined}
                  />
                ) : (
                  <div className="text-amber-400 text-center py-4">
                    {currentUser ? 'No ratings yet. Be the first to rate!' : 'No ratings yet'}
                  </div>
                )}
              </div>

              {/* Reading Status Section */}
              <div className="mb-6 md:mb-4">
                <h4 className="text-sm font-medium text-amber-200 mb-3">Reading Status:</h4>

                {/* If user is logged in but hasn't set status yet, show the status prompt */}
                {currentUser && !bookWithDetails.statuses?.some(s => s.user_id === currentUser.id) && (
                  <div className="mb-3 p-3 md:p-4 bg-stone-800/50 rounded-lg border border-amber-900/30">
                    <p className="text-xs text-amber-600 mb-3">Set your reading status for this book</p>
                    <StatusDropdown
                      value={null}
                      onChange={handleStatusChange}
                    />
                  </div>
                )}

                {/* Show all statuses (your own will be editable) */}
                {bookWithDetails.statuses && bookWithDetails.statuses.length > 0 ? (
                  <StatusList
                    statuses={bookWithDetails.statuses}
                    currentUserId={currentUser?.id ?? null}
                    onStatusChange={currentUser ? handleStatusChange : undefined}
                    onStatusDelete={currentUser ? handleStatusDelete : undefined}
                  />
                ) : (
                  <div className="text-amber-400 text-center py-4">
                    {currentUser ? 'No status set yet. Select one above!' : 'No statuses yet'}
                  </div>
                )}
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
                Added {formatRelativeDate(bookWithDetails.created_at || new Date().toISOString(), true)}
              </span>
            </div>
            <div className="flex justify-end">
              <span className="text-amber-400 text-sm italic">
                Last updated {formatRelativeDate(bookWithDetails.updated_at || new Date().toISOString(), true)}
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
