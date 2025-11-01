import { EditIcon, LogOutIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { User } from '../../contexts/UserContext'
import type { RootState } from '../../store/store'
import { logout, setCurrentUser } from '../../store/userSlice'
import { UserAvatar } from '../common/UserAvatar'
import { EditUserModal } from '../forms/EditUserModal'
export function UserMenu() {
    const dispatch = useDispatch()
    const currentUser = useSelector((state: RootState) => state.user.currentUser)
    const [isOpen, setIsOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
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

    const handleEditUser = () => {
        setIsEditModalOpen(true)
        setIsOpen(false) // Close the menu
    }

    const handleUserUpdateSuccess = (updatedUser: User) => {
        // Update the current user in the store
        dispatch(setCurrentUser(updatedUser))
    }
    if (!currentUser) return null
    return (
        <div className="relative z-50" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
                <UserAvatar user={{
                    id: currentUser.id,
                    name: currentUser.name,
                    color: currentUser.color,
                    avatar_image: currentUser.avatar_image
                }} size="sm" />
                <span className="text-amber-200 hidden sm:inline font-medium">
                    {currentUser.name}
                </span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900/95 rounded-lg shadow-xl py-1 z-[9999] border border-zinc-800/50 backdrop-blur-sm">
                    <div className="px-4 py-2 border-b border-zinc-800/50">
                        <p className="text-sm text-amber-300">Signed in as</p>
                        <p className="font-medium text-amber-50">{currentUser.name}</p>
                    </div>
                    <button
                        onClick={handleEditUser}
                        className="w-full text-left px-4 py-2 text-amber-200 hover:bg-zinc-800/50 flex items-center gap-2 transition-colors"
                    >
                        <EditIcon size={16} />
                        <span>Edit Profile</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-amber-200 hover:bg-zinc-800/50 flex items-center gap-2 transition-colors"
                    >
                        <LogOutIcon size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}

            <EditUserModal
                user={currentUser}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleUserUpdateSuccess}
            />
        </div>
    )
}
