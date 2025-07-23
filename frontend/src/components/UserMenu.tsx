import { LogOutIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { UserAvatar } from './UserAvatar'
export function UserMenu() {
  const { currentUser, logout } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  if (!currentUser) return null
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <UserAvatar user={currentUser} size="sm" />
        <span className="text-gray-200 hidden sm:inline">
          {currentUser.name}
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-700">
          <div className="px-4 py-2 border-b border-gray-700">
            <p className="text-sm text-gray-400">Signed in as</p>
            <p className="font-medium text-white">{currentUser.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 flex items-center gap-2"
          >
            <LogOutIcon size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  )
}
