import { LogOutIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '../store/store'
import { logout } from '../store/userSlice'
import { UserAvatar } from './UserAvatar'
export function UserMenu() {
    const dispatch = useDispatch()
    const currentUser = useSelector((state: RootState) => state.user.currentUser)
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
        dispatch(logout())
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
                <span className="text-amber-200 hidden sm:inline font-medium">
                    {currentUser.name}
                </span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900/95 rounded-lg shadow-xl py-1 z-10 border border-zinc-800/50 backdrop-blur-sm">
                    <div className="px-4 py-2 border-b border-zinc-800/50">
                        <p className="text-sm text-amber-300">Signed in as</p>
                        <p className="font-medium text-amber-50">{currentUser.name}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-amber-200 hover:bg-zinc-800/50 flex items-center gap-2 transition-colors"
                    >
                        <LogOutIcon size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </div>
    )
}
