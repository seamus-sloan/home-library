import { ArrowLeftIcon, BookOpenIcon, EditIcon, PlusIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetBookQuery, useUpdateBookMutation } from '../middleware/backend'
import type { Book, JournalEntry, Tag } from '../types'
import { AddJournalForm } from './AddJournalForm'
import { JournalList } from './JournalList'
import { TagSearch } from './TagSearch'

interface BookDetailsProps {
  addJournal: (journal: Omit<JournalEntry, 'id'>) => void
}
export function BookDetails({}: BookDetailsProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Use RTK Query to fetch book data (now includes tags and journals)
  const { data: bookWithDetails, isLoading: loading, error } = useGetBookQuery(id || '', {
    skip: !id, // Skip the query if no ID is provided
  })

  // Use mutation for updating books
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [isAddingJournal, setIsAddingJournal] = useState(false)
  const [editFormData, setEditFormData] = useState<Book | null>(null)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [errors, setErrors] = useState({
    title: '',
    author: '',
  })

  // Set edit form data when book data is loaded
  useEffect(() => {
    if (bookWithDetails) {
      // Convert BookWithDetails to Book for editing
      const bookForEditing: Book = {
        id: bookWithDetails.id,
        user_id: bookWithDetails.user_id,
        cover_image: bookWithDetails.cover_image,
        title: bookWithDetails.title,
        author: bookWithDetails.author,
        genre: bookWithDetails.genre,
        rating: bookWithDetails.rating || 0,
        created_at: bookWithDetails.created_at,
        updated_at: bookWithDetails.updated_at,
      }
      setEditFormData(bookForEditing)
      // Convert BookTag to Tag format for the tag selector
      const tagsForEditing: Tag[] = (bookWithDetails.tags || []).map(bookTag => ({
        id: bookTag.id,
        user_id: bookWithDetails.user_id,
        name: bookTag.name,
        color: bookTag.color,
        created_at: new Date().toISOString(), // We don't have this from BookTag
        updated_at: new Date().toISOString(), // We don't have this from BookTag
      }))
      setSelectedTags(tagsForEditing)
    }
  }, [bookWithDetails])

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
          onClick={() => navigate('/')}
          className="text-amber-400 hover:text-amber-300 flex items-center gap-2 mx-auto"
        >
          <ArrowLeftIcon size={18} />
          Return to library
        </button>
      </div>
    )
  }
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!editFormData) return
    const { name, value } = e.target
    setEditFormData({
      ...editFormData,
      [name]: value,
    })
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
  }
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editFormData || !id) return

    // Validate form
    const newErrors = {
      title: editFormData.title ? '' : 'Title is required',
      author: editFormData.author ? '' : 'Author is required',
    }
    setErrors(newErrors)

    // Do not submit if there are any errors
    if (newErrors.title || newErrors.author) {
      return
    }

    try {
      await updateBook({
        id: editFormData.id,
        book: {
          title: editFormData.title,
          author: editFormData.author,
          genre: editFormData.genre,
          cover_image: editFormData.cover_image,
          rating: editFormData.rating,
          tags: selectedTags.map(tag => tag.id), // Include selected tag IDs
        }
      }).unwrap()
      setIsEditing(false)
      // Clear any errors on successful save
      setErrors({ title: '', author: '' })
      // RTK Query will automatically refetch the book data due to cache invalidation
    } catch (error) {
      console.error('Error updating book:', error)
      setErrors({
        title: '',
        author: error instanceof Error ? error.message : 'Failed to update book',
      })
    }
  }

  const handleAddJournal = async () => {
    // Close the form
    setIsAddingJournal(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
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
      {isEditing && editFormData ? (
        <form
          onSubmit={handleEditSubmit}
          className="bg-zinc-900 p-6 rounded-lg shadow-md mb-8 border border-zinc-800"
        >
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-amber-200 font-medium mb-2"
            >
              Book Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={editFormData.title}
              onChange={handleEditChange}
              className={`w-full px-3 py-2 bg-zinc-800 border rounded-md text-amber-50 ${errors.title ? 'border-red-500' : 'border-zinc-700'}`}
              placeholder="Enter book title"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="author"
              className="block text-amber-200 font-medium mb-2"
            >
              Author <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={editFormData.author}
              onChange={handleEditChange}
              className={`w-full px-3 py-2 bg-zinc-800 border rounded-md text-amber-50 ${errors.author ? 'border-red-500' : 'border-zinc-700'}`}
              placeholder="Enter author name"
            />
            {errors.author && (
              <p className="text-red-400 text-sm mt-1">{errors.author}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="genre"
              className="block text-amber-200 font-medium mb-2"
            >
              Genre
            </label>
            <select
              id="genre"
              name="genre"
              value={editFormData.genre}
              onChange={handleEditChange}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-amber-50"
            >
              <option value="">Select a genre</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-fiction">Non-fiction</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Mystery">Mystery</option>
              <option value="Thriller">Thriller</option>
              <option value="Romance">Romance</option>
              <option value="Biography">Biography</option>
              <option value="History">History</option>
              <option value="Self-Help">Self-Help</option>
            </select>
          </div>
          <div className="mb-6">
            <label
              htmlFor="cover_image"
              className="block text-amber-200 font-medium mb-2"
            >
              Cover Image URL
            </label>
            <input
              type="url"
              id="cover_image"
              name="cover_image"
              value={editFormData.cover_image ? editFormData.cover_image : ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-amber-50"
              placeholder="https://example.com/book-cover.jpg"
            />
            <p className="text-amber-400 text-sm mt-1">
              Leave blank to use a default cover
            </p>
          </div>
          <div className="mb-6">
            <label className="block text-amber-200 font-medium mb-2">
              Tags
            </label>
            <TagSearch
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              placeholder="Search and select tags for this book..."
              multiple={true}
            />
            <p className="text-amber-400 text-sm mt-1">
              Add tags to help categorize and find this book later
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                setErrors({ title: '', author: '' })
                // Reset tags to original values
                if (bookWithDetails) {
                  const tagsForEditing: Tag[] = (bookWithDetails.tags || []).map(bookTag => ({
                    id: bookTag.id,
                    user_id: bookWithDetails.user_id,
                    name: bookTag.name,
                    color: bookTag.color,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }))
                  setSelectedTags(tagsForEditing)
                }
              }}
              className="px-4 py-2 border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors text-amber-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-amber-900/40 text-amber-100 rounded-md hover:bg-amber-800/50 transition-colors border border-amber-700/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
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
              <p className="text-xl text-amber-200 mb-4">by {bookWithDetails.author}</p>
              {bookWithDetails.genre && (
                <div className="mb-4">
                  <span className="inline-block bg-amber-900/40 text-amber-200 px-3 py-1 rounded-full border border-amber-700/30">
                    {bookWithDetails.genre}
                  </span>
                </div>
              )}
              {/* Display tags */}
              {bookWithDetails.tags && bookWithDetails.tags.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-amber-200 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {bookWithDetails.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
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
