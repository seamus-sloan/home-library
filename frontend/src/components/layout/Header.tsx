import { BookOpenIcon, PlusCircleIcon } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import type { RootState } from '../../store/store'
import { UserMenu } from '../user/UserMenu'

interface HeaderProps {
  onAddClick: () => void
}

export function Header({ onAddClick }: HeaderProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser)
  const navigate = useNavigate()

  if (!currentUser) return null

  const handleAddClick = () => {
    onAddClick()
    navigate('/')
  }

  return (
    <header className="bg-zinc-900 shadow-lg border-b border-zinc-800 backdrop-blur-sm relative z-40">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
        >
          <div className="p-2 bg-amber-900/30 rounded-lg border border-amber-700/30 group-hover:border-amber-600/50 transition-colors">
            <BookOpenIcon size={24} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-amber-50 tracking-wide">The Sloan Library</h1>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-amber-900/40 hover:bg-amber-800/50 text-amber-100 px-4 py-2 rounded-lg border border-amber-700/30 hover:border-amber-600/50 transition-all duration-200 font-medium"
          >
            <PlusCircleIcon size={18} />
            <span className="hidden sm:inline">Add Book</span>
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
