import { useState } from 'react'
import { useDeleteBookMutation } from '../../middleware/backend'
import type { Book, BookWithDetails } from '../../types'
import { ConfirmDialog } from '../common'
import { BookFormModal } from '../forms'
import { BookContextMenu } from './BookContextMenu'

interface BookCardProps {
  book: Book | BookWithDetails
  onClick: () => void
}
export function BookCard({ book, onClick }: BookCardProps) {
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
        className="cursor-pointer group relative bg-zinc-700/70 rounded-lg ml-1 mr-1 p-3 shadow-[inset_0_4px_12px_rgba(0,0,0,0.7)]"
        onClick={onClick}
      >
        {/* Context Menu - hidden on touch devices */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block pointer-events-none group-hover:pointer-events-auto">
          <BookContextMenu
            onViewBook={onClick}
            onEditBook={handleEditBook}
            onDeleteBook={handleDeleteBook}
          />
        </div>
        {/* Container for shadow and book - using aspect ratio for book covers (2:3) */}
        <div className="w-full aspect-[2/3] relative flex items-center justify-center">
          {book.cover_image ? (
            <div className="relative inline-block max-h-full max-w-full">
              {/* Black shadow behind the book image */}
              <div className="absolute inset-0 bg-black/90 rounded blur-xl transform scale-110 group-hover:scale-[1.155] transition-all duration-300 ease-out"></div>
              {/* Book image */}
              <img
                src={book.cover_image}
                alt={`${book.title} cover`}
                className="relative max-h-full max-w-full h-auto w-auto object-contain group-hover:scale-105 transition-all duration-300 ease-out rounded"
                style={{
                  transition: 'transform 0.2s ease-out'
                }}
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.onerror = null
                  target.src =
                    'https://placehold.co/400x600/18181b/71717a?text=No+Image'
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <h3 className="font-bold text-amber-200 mb-2">{book.title}</h3>
              <p className="italic text-amber-300 text-sm">{book.author}</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <BookFormModal
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
