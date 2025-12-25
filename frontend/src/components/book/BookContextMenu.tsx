import { EditIcon, EyeIcon, MoreVerticalIcon, TrashIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface BookContextMenuProps {
  onViewBook: () => void
  onEditBook: () => void
  onDeleteBook: () => void
}

export function BookContextMenu({
  onViewBook,
  onEditBook,
  onDeleteBook,
}: BookContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent click events
    setIsOpen(!isOpen)
  }

  const handleViewBook = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    onViewBook()
  }

  const handleEditBook = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    onEditBook()
  }

  const handleDeleteBook = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    onDeleteBook()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleMenuClick}
        className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700/70 text-amber-200 hover:text-amber-100 transition-all duration-200 backdrop-blur-sm border border-zinc-700/50 hover:border-amber-600/30"
        aria-label="Book options"
      >
        <MoreVerticalIcon size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-zinc-900/95 rounded-lg shadow-xl py-1 z-[9999] border border-zinc-800/50 backdrop-blur-sm">
          <button
            onClick={handleViewBook}
            className="w-full text-left px-3 py-2 text-amber-200 hover:bg-zinc-800/50 flex items-center gap-2 transition-colors text-sm"
          >
            <EyeIcon size={14} />
            <span>View Book</span>
          </button>
          <button
            onClick={handleEditBook}
            className="w-full text-left px-3 py-2 text-amber-200 hover:bg-zinc-800/50 flex items-center gap-2 transition-colors text-sm"
          >
            <EditIcon size={14} />
            <span>Edit Book</span>
          </button>
          <div className="h-px bg-zinc-800/50 mx-1 my-1"></div>
          <button
            onClick={handleDeleteBook}
            className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2 transition-colors text-sm"
          >
            <TrashIcon size={14} />
            <span>Delete Book</span>
          </button>
        </div>
      )}
    </div>
  )
}
