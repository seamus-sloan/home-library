import { ArrowLeftIcon, BookOpenIcon, EditIcon, PlusIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { type Book, type JournalEntry } from '../App'
import { AddJournalForm } from './AddJournalForm'
import { JournalList } from './JournalList'

interface BookDetailsProps {
  journals: JournalEntry[]
  addJournal: (journal: Omit<JournalEntry, 'id'>) => void
}

export function BookDetails({ journals, addJournal }: BookDetailsProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingJournal, setIsAddingJournal] = useState(false)
  const [editFormData, setEditFormData] = useState<Book | null>(null)

  // Fetch book data when component mounts or id changes
  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/books/${id}`)
        if (!response.ok) {
          throw new Error('Book not found')
        }

        const bookData = await response.json()
        setBook(bookData)
        setEditFormData(bookData)
      } catch (err) {
        console.error('Failed to fetch book:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch book')
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [id])

  const bookJournals = journals.filter(
    journal => journal.book_id === Number(id)
  )

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
    if (!editFormData) return

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      })

      if (!response.ok) {
        throw new Error('Failed to update book')
      }

      const updatedBook = await response.json()
      setBook(updatedBook)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update book:', err)
      // Handle error appropriately
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
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

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="text-purple-400 hover:text-purple-300 flex items-center gap-2 mb-6"
      >
        <ArrowLeftIcon size={18} />
        Back to library
      </button>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {book.cover_image ? (
              <img
                src={book.cover_image}
                alt={book.title}
                className="w-48 h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-48 h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                <BookOpenIcon size={48} className="text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <input
                  type="text"
                  name="title"
                  value={editFormData?.title || ''}
                  onChange={handleEditChange}
                  className="w-full text-2xl font-bold bg-gray-700 text-white px-3 py-2 rounded border-gray-600 border"
                  required
                />
                <input
                  type="text"
                  name="author"
                  value={editFormData?.author || ''}
                  onChange={handleEditChange}
                  className="w-full text-lg bg-gray-700 text-gray-300 px-3 py-2 rounded border-gray-600 border"
                  required
                />
                <input
                  type="text"
                  name="genre"
                  value={editFormData?.genre || ''}
                  onChange={handleEditChange}
                  className="w-full bg-gray-700 text-gray-400 px-3 py-2 rounded border-gray-600 border"
                  required
                />
                <input
                  type="url"
                  name="cover_image"
                  value={editFormData?.cover_image || ''}
                  onChange={handleEditChange}
                  placeholder="Cover image URL"
                  className="w-full bg-gray-700 text-gray-400 px-3 py-2 rounded border-gray-600 border"
                />
                <input
                  type="number"
                  name="rating"
                  value={editFormData?.rating || ''}
                  onChange={handleEditChange}
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="Rating (0-5)"
                  className="w-full bg-gray-700 text-gray-400 px-3 py-2 rounded border-gray-600 border"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setEditFormData(book)
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {book.title}
                    </h1>
                    <p className="text-xl text-gray-300 mb-1">
                      by {book.author}
                    </p>
                    <p className="text-gray-400">{book.genre}</p>
                    {book.rating && (
                      <p className="text-yellow-400 mt-2">⭐ {book.rating}/5</p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-purple-400 hover:text-purple-300 p-2"
                  >
                    <EditIcon size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Journal Entries</h2>
          <button
            onClick={() => setIsAddingJournal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <PlusIcon size={18} />
            Add Entry
          </button>
        </div>

        {isAddingJournal && (
          <div className="mb-6">
            <AddJournalForm
              onSubmit={content => {
                const journal = {
                  book_id: Number(id),
                  title: `Entry for ${book.title}`,
                  content,
                  date: new Date().toISOString(),
                }
                addJournal(journal)
                setIsAddingJournal(false)
              }}
              onCancel={() => setIsAddingJournal(false)}
            />
          </div>
        )}

        <JournalList journals={bookJournals} />
      </div>
    </div>
  )
}
