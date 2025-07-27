import { BookIcon } from 'lucide-react'
import { useState } from 'react'
import { useParallaxScroll } from '../hooks/useParallaxScroll'
import { useDeleteBookMutation } from '../middleware/backend'
import type { Book, BookWithDetails } from '../types'
import { BookContextMenu } from './BookContextMenu'
import { ConfirmDialog } from './ConfirmDialog'
import { EditBookModal } from './EditBookModal'

interface BookCardProps {
  book: Book | BookWithDetails
  onClick: () => void
}
export function BookCard({ book, onClick }: BookCardProps) {
  const { offset, elementRef } = useParallaxScroll(1) // Increased for more noticeable effect
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation()

  const handleEditBook = () => {
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
  }

  const handleSaveBook = () => {
    // The modal will handle the save and close itself
    // This callback can be used for any additional actions like refreshing data
  }

  const handleDeleteBook = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteBook(book.id).unwrap()
      setIsDeleteDialogOpen(false)
      // The book will be removed from the list automatically due to cache invalidation
    } catch (error) {
      console.error('Failed to delete book:', error)
      // Could add toast notification here
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <div
        className="bg-zinc-900/80 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-zinc-800/50 hover:border-amber-600/30 hover:bg-zinc-900/90 backdrop-blur-sm group relative"
        onClick={onClick}
        ref={elementRef}
      >
        {/* Context Menu */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <BookContextMenu
            onViewBook={onClick}
            onEditBook={handleEditBook}
            onDeleteBook={handleDeleteBook}
          />
        </div>
        <div className="h-48 bg-zinc-800/50 relative overflow-hidden">
          {book.cover_image ? (
            <img
              src={book.cover_image}
              alt={`${book.title} cover`}
              className="absolute inset-0 w-full object-cover group-hover:scale-105 transition-all duration-300 ease-out"
              style={{
                height: 'calc(100% + 60px)', // Extra height for parallax movement
                transform: `translateY(${offset - 30}px)`, // Center the extra space
                transition: 'transform 0.1s ease-out'
              }}
              onError={e => {
                const target = e.target as HTMLImageElement
                target.onerror = null
                target.src =
                  'https://placehold.co/400x600/18181b/71717a?text=No+Image'
              }}
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-amber-600 transition-all duration-300 ease-out"
              style={{
                height: 'calc(100% + 60px)', // Extra height for parallax movement
                transform: `translateY(${offset - 30}px)`, // Center the extra space
                transition: 'transform 0.1s ease-out'
              }}
            >
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
          <div className="mt-2 space-y-2">
            {/* Genres */}
            {'genres' in book && book.genres && book.genres.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {book.genres.map(genre => (
                  <span
                    key={genre.id}
                    className="inline-block text-xs px-2 py-1 rounded-full border font-medium"
                    style={{
                      backgroundColor: `${genre.color}20`,
                      borderColor: `${genre.color}50`,
                      color: genre.color
                    }}
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="inline-block bg-amber-900/40 text-amber-200 text-xs px-3 py-1.5 rounded-full border border-amber-700/30 font-medium">
                Uncategorized
              </span>
            )}

            {/* Tags */}
            {'tags' in book && book.tags && book.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {book.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-block text-xs px-2 py-1 rounded-full border font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      borderColor: `${tag.color}50`,
                      color: tag.color
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditBookModal
        book={book}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveBook}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Book"
        message={`Are you sure you want to delete "${book.title}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />
    </>
  )
}
