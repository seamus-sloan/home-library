import { BookOpenIcon, PlusCircleIcon } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import type { RootState } from '../store/store'
import { UserMenu } from './UserMenu'
interface HeaderProps {
  onAddClick: () => void
}
export function Header({ onAddClick }: HeaderProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser)
  if (!currentUser) return null
  return (
    <header className="bg-gray-800 shadow-md border-b border-gray-700">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <BookOpenIcon size={24} className="text-purple-400" />
          <h1 className="text-2xl font-bold text-white">The Sloan Library</h1>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={onAddClick}
            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <PlusCircleIcon size={18} />
            <span>Add Book</span>
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
