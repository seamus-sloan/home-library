import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  EditIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { UserAvatar } from '../components/common/UserAvatar'
import {
  useGetBooksQuery,
  useGetListQuery,
  useUpdateListMutation,
} from '../middleware/backend'
import type { RootState } from '../store/store'
import type { BookWithDetails } from '../types'

export function ListDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUser = useSelector((state: RootState) => state.user.currentUser)

  const listId = id ? parseInt(id, 10) : undefined
  const {
    data: list,
    isLoading,
    error,
  } = useGetListQuery(listId!, {
    skip: !listId,
  })

  const [updateList, { isLoading: isUpdating }] = useUpdateListMutation()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedTypeId, setEditedTypeId] = useState(1)
  const [isAddingBook, setIsAddingBook] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null)

  // Fetch all books for search
  const { data: allBooks } = useGetBooksQuery(
    { search: searchQuery },
    {
      skip: !isAddingBook || !searchQuery.trim(),
    }
  )

  // Initialize edit form when opening edit mode
  const handleStartEdit = () => {
    if (list) {
      setEditedName(list.name)
      setEditedTypeId(list.type_id)
      setIsEditing(true)
    }
  }

  // Save list edits
  const handleSaveEdit = async () => {
    if (!list || !editedName.trim()) return

    try {
      await updateList({
        id: list.id,
        list: {
          name: editedName,
          type_id: editedTypeId,
        },
      }).unwrap()
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update list:', err)
      alert('Failed to update list')
    }
  }

  // Add book to list
  const handleAddBook = async (book: BookWithDetails) => {
    if (!list) return

    const bookIds = list.books.map(b => b.id)
    if (bookIds.includes(book.id)) {
      alert('This book is already in the list')
      return
    }

    try {
      await updateList({
        id: list.id,
        list: {
          books: [...bookIds, book.id],
        },
      }).unwrap()
      setIsAddingBook(false)
      setSearchQuery('')
    } catch (err) {
      console.error('Failed to add book:', err)
      alert('Failed to add book to list')
    }
  }

  // Remove book from list
  const handleRemoveBook = async (bookId: number) => {
    if (!list) return

    try {
      await updateList({
        id: list.id,
        list: {
          books: list.books.filter(b => b.id !== bookId).map(b => b.id),
        },
      }).unwrap()
    } catch (err) {
      console.error('Failed to remove book:', err)
      alert('Failed to remove book from list')
    }
  }

  // Move book up or down in the list
  const handleMoveBook = async (
    fromIndex: number,
    direction: 'up' | 'down'
  ) => {
    if (!list) return

    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= list.books.length) return

    const newBooks = [...list.books]
    const [movedBook] = newBooks.splice(fromIndex, 1)
    newBooks.splice(toIndex, 0, movedBook)

    try {
      await updateList({
        id: list.id,
        list: {
          books: newBooks.map(b => b.id),
        },
      }).unwrap()
    } catch (err) {
      console.error('Failed to reorder books:', err)
      alert('Failed to reorder books')
    }
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDraggedOverIndex(index)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (!list || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDraggedOverIndex(null)
      return
    }

    // Reorder books
    const newBooks = [...list.books]
    const [movedBook] = newBooks.splice(draggedIndex, 1)
    newBooks.splice(dropIndex, 0, movedBook)

    try {
      await updateList({
        id: list.id,
        list: {
          books: newBooks.map(b => b.id),
        },
      }).unwrap()
    } catch (err) {
      console.error('Failed to reorder books:', err)
      alert('Failed to reorder books')
    }

    setDraggedIndex(null)
    setDraggedOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDraggedOverIndex(null)
  }

  if (isLoading) {
    return <div className="text-amber-100">Loading list...</div>
  }

  if (error || !list) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/list')}
          className="flex items-center gap-2 text-amber-100 hover:text-amber-50 transition-colors"
        >
          <ArrowLeftIcon size={20} />
          <span>Back to Lists</span>
        </button>
        <div className="text-red-400">Error loading list</div>
      </div>
    )
  }

  const canEdit = !!(currentUser && currentUser.id === list.user_id)

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/list')}
        className="flex items-center gap-2 text-amber-100 hover:text-amber-50 transition-colors"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Back to Lists</span>
      </button>

      {/* List Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          {isEditing ? (
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                className="text-3xl font-bold text-amber-50 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-amber-600/50"
                autoFocus
              />
              <select
                value={editedTypeId}
                onChange={e => setEditedTypeId(Number(e.target.value))}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600/50"
              >
                <option value={1}>SEQUENCED</option>
                <option value={2}>UNORDERED</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-amber-900/40 hover:bg-amber-800/50 text-amber-100 rounded-lg border border-amber-700/30 hover:border-amber-600/50 transition-all duration-200 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-100 rounded-lg border border-zinc-700 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <UserAvatar user={list.user} size="md" />
                <h1 className="text-3xl font-bold text-amber-50">
                  {list.name}
                </h1>
              </div>
              {canEdit && (
                <button
                  onClick={handleStartEdit}
                  className="p-2 text-amber-100 hover:text-amber-50 hover:bg-zinc-800 rounded-lg transition-all duration-200"
                  title="Edit list"
                >
                  <EditIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </>
          )}
        </div>
        {!isEditing && (
          <div className="text-amber-100/60 text-sm">
            {list.type_id === 1 ? 'Sequenced' : 'Unordered'} •{' '}
            {list.books.length} {list.books.length === 1 ? 'book' : 'books'}
          </div>
        )}
      </div>

      {/* Books Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-amber-100">Books</h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
          {list.books.map((book, index) => (
            <div
              key={book.id}
              draggable={canEdit}
              onDragStart={() => handleDragStart(index)}
              onDragOver={e => handleDragOver(e, index)}
              onDrop={e => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative ${
                draggedIndex === index ? 'opacity-50' : ''
              } ${draggedOverIndex === index ? 'ring-2 ring-amber-600' : ''}`}
            >
              {/* Book cover container */}
              <div className="w-full aspect-[2/3] relative rounded-lg overflow-hidden bg-zinc-800/50 border border-zinc-700/50 hover:border-amber-600/50 transition-all duration-300">
                {book.cover_image ? (
                  <img
                    src={book.cover_image}
                    alt={`Book ${book.id}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={e => {
                      const target = e.target as HTMLImageElement
                      target.onerror = null
                      target.src =
                        'https://placehold.co/400x600/18181b/71717a?text=No+Image'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-100/40 text-xs">
                    No Cover
                  </div>
                )}

                {/* Remove button - always visible on mobile, hover on desktop */}
                {canEdit && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleRemoveBook(book.id)
                    }}
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 bg-red-900/80 hover:bg-red-800 text-red-100 rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10"
                    title="Remove from list"
                  >
                    <XIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                )}

                {/* Mobile reorder buttons - only visible on mobile */}
                {canEdit && list.type_id === 1 && (
                  <div className="absolute bottom-1 right-1 flex flex-col gap-1 sm:hidden">
                    {index > 0 && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleMoveBook(index, 'up')
                        }}
                        className="p-1 bg-amber-900/80 hover:bg-amber-800 text-amber-100 rounded transition-colors z-10"
                        title="Move up"
                      >
                        <ArrowUpIcon className="w-3 h-3" />
                      </button>
                    )}
                    {index < list.books.length - 1 && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleMoveBook(index, 'down')
                        }}
                        className="p-1 bg-amber-900/80 hover:bg-amber-800 text-amber-100 rounded transition-colors z-10"
                        title="Move down"
                      >
                        <ArrowDownIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Status badge if available */}
                {book.status_name && (
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-amber-100 border border-amber-700/30">
                    {book.status_name}
                  </div>
                )}
              </div>

              {/* List position number for sequenced lists */}
              {list.type_id === 1 && (
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-900 text-amber-50 rounded-full flex items-center justify-center text-xs font-bold border-2 border-zinc-900">
                  {index + 1}
                </div>
              )}
            </div>
          ))}

          {/* Add Book Ghost Box */}
          {canEdit && (
            <button
              onClick={() => setIsAddingBook(true)}
              className="w-full aspect-[2/3] relative rounded-lg border-2 border-dashed border-zinc-700 hover:border-amber-600/50 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all duration-300 flex items-center justify-center group"
            >
              <PlusIcon className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-600 group-hover:text-amber-600/50 transition-colors duration-300" />
            </button>
          )}
        </div>
      </div>

      {/* Add Book Modal */}
      {isAddingBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg border border-zinc-700 w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-amber-100">
                Add Book to List
              </h3>
              <button
                onClick={() => {
                  setIsAddingBook(false)
                  setSearchQuery('')
                }}
                className="p-1 text-amber-100 hover:text-amber-50 hover:bg-zinc-800 rounded transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4 flex-1 overflow-y-auto">
              {/* Search Input */}
              <div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search books by title or author..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-amber-100 placeholder-amber-100/40 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-amber-600/50"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              {searchQuery.trim() && (
                <div className="space-y-2">
                  {!allBooks || allBooks.length === 0 ? (
                    <div className="text-amber-100/60 text-center py-8">
                      No books found
                    </div>
                  ) : (
                    allBooks.map(book => {
                      const alreadyInList = list.books.some(
                        b => b.id === book.id
                      )
                      return (
                        <button
                          key={book.id}
                          onClick={() => handleAddBook(book)}
                          disabled={alreadyInList}
                          className={`w-full flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 text-left ${
                            alreadyInList
                              ? 'bg-zinc-800/50 border-zinc-700/50 opacity-50 cursor-not-allowed'
                              : 'bg-zinc-800 border-zinc-700 hover:border-amber-600/50 hover:bg-zinc-800/80'
                          }`}
                        >
                          {/* Book Cover */}
                          <div className="w-12 h-18 rounded overflow-hidden bg-zinc-700 flex-shrink-0">
                            {book.cover_image ? (
                              <img
                                src={book.cover_image}
                                alt={book.title}
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                onError={e => {
                                  const target = e.target as HTMLImageElement
                                  target.onerror = null
                                  target.src =
                                    'https://placehold.co/400x600/18181b/71717a?text=No+Image'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-amber-100/40 text-xs">
                                No Cover
                              </div>
                            )}
                          </div>

                          {/* Book Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-amber-100 truncate">
                              {book.title}
                            </div>
                            <div className="text-sm text-amber-100/60 truncate">
                              {book.author}
                            </div>
                          </div>

                          {alreadyInList && (
                            <div className="text-xs text-amber-100/60">
                              Already in list
                            </div>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              )}

              {!searchQuery.trim() && (
                <div className="text-amber-100/60 text-center py-8">
                  Start typing to search for books
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
