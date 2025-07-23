import { ArrowLeftIcon, BookOpenIcon, EditIcon, PlusIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Book, JournalEntry } from '../types'
import { AddJournalForm } from './AddJournalForm'
import { JournalList } from './JournalList'

interface BookDetailsProps {
  updateBook: (book: Book) => void
  addJournal: (journal: Omit<JournalEntry, 'id'>) => void
}
export function BookDetails({ updateBook, addJournal }: BookDetailsProps) {
  const { id } = useParams<{
    id: string
  }>()
  const navigate = useNavigate()

  const [book, setBook] = useState<Book | null>(null)
  const [bookJournals, setBookJournals] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingJournal, setIsAddingJournal] = useState(false)
  const [editFormData, setEditFormData] = useState<Book | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchBookData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch book details
        const bookResponse = await fetch(`/books/${id}`)
        if (!bookResponse.ok) {
          throw new Error('Failed to fetch book')
        }
        const bookData = await bookResponse.json()
        setBook(bookData)
        setEditFormData(bookData)

        // Fetch book journals
        const journalsResponse = await fetch(`/books/${id}/journals`)
        if (!journalsResponse.ok) {
          throw new Error('Failed to fetch journals')
        }
        const journalsData = await journalsResponse.json()
        setBookJournals(journalsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchBookData()
  }, [id])

  if (loading) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">Loading...</h2>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">
          {error || 'Book not found'}
        </h2>
        <button
          onClick={() => navigate('/')}
          className="text-purple-400 hover:text-purple-300 flex items-center gap-2 mx-auto"
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
  }
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editFormData && id) {
      await updateBook(editFormData)
      setIsEditing(false)

      // Refresh book data after editing
      try {
        const bookResponse = await fetch(`/books/${id}`)
        if (bookResponse.ok) {
          const bookData = await bookResponse.json()
          setBook(bookData)
          setEditFormData(bookData)
        }
      } catch (err) {
        console.error('Failed to refresh book data:', err)
      }
    }
  }

  const handleAddJournal = async () => {
    // Close the form
    setIsAddingJournal(false)

    // Refresh journals after adding
    if (id) {
      try {
        const journalsResponse = await fetch(`/books/${id}/journals`)
        if (journalsResponse.ok) {
          const journalsData = await journalsResponse.json()
          setBookJournals(journalsData)
        }
      } catch (err) {
        console.error('Failed to refresh journals:', err)
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="mr-4 text-gray-400 hover:text-gray-200"
          aria-label="Go back"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-white flex-grow">
          Book Details
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
          >
            <EditIcon size={18} />
            <span>Edit</span>
          </button>
        )}
      </div>
      {isEditing && editFormData ? (
        <form
          onSubmit={handleEditSubmit}
          className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-700"
        >
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-200 font-medium mb-2"
            >
              Book Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={editFormData.title}
              onChange={handleEditChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="author"
              className="block text-gray-200 font-medium mb-2"
            >
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={editFormData.author}
              onChange={handleEditChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="genre"
              className="block text-gray-200 font-medium mb-2"
            >
              Genre
            </label>
            <select
              id="genre"
              name="genre"
              value={editFormData.genre}
              onChange={handleEditChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
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
              className="block text-gray-200 font-medium mb-2"
            >
              Cover Image URL
            </label>
            <input
              type="url"
              id="cover_image"
              name="cover_image"
              value={editFormData.cover_image ? editFormData.cover_image : ''}
              onChange={handleEditChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-1/3">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
              {book.cover_image ? (
                <img
                  src={book.cover_image}
                  alt={`${book.title} cover`}
                  className="w-full object-cover"
                  onError={e => {
                    const target = e.target as HTMLImageElement
                    target.onerror = null
                    target.src =
                      'https://placehold.co/400x600/2a2a2a/6b6b6b?text=No+Image'
                  }}
                />
              ) : (
                <div className="h-64 bg-gray-700 flex flex-col items-center justify-center text-gray-500">
                  <BookOpenIcon size={64} />
                  <span className="mt-2">No cover image</span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-2/3 bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-2">{book.title}</h1>
            <p className="text-xl text-gray-300 mb-4">by {book.author}</p>
            {book.genre && (
              <div className="mb-4">
                <span className="inline-block bg-purple-900 text-purple-200 px-3 py-1 rounded-full">
                  {book.genre}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Reading Journal</h3>
          {!isAddingJournal && (
            <button
              onClick={() => setIsAddingJournal(true)}
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
            >
              <PlusIcon size={18} />
              <span>Add Entry</span>
            </button>
          )}
        </div>
        {isAddingJournal ? (
          <AddJournalForm
            bookId={book.id}
            onSubmit={handleAddJournal}
            onCancel={() => setIsAddingJournal(false)}
          />
        ) : (
          <JournalList journals={bookJournals} />
        )}
      </div>
    </div>
  )
}
