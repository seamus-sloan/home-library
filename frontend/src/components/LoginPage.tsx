import { BookOpenIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { User } from '../contexts/UserContext'
import { useGetUsersQuery, useSelectUserMutation } from '../middleware/backend'
import type { RootState } from '../store/store'
import { setCurrentUser } from '../store/userSlice'

export function LoginPage() {
    const dispatch = useDispatch()
    const currentUser = useSelector((state: RootState) => state.user.currentUser)
    const navigate = useNavigate()
    const hasNavigated = useRef(false)

    // Use RTK Query to fetch users
    const { data: users = [], isLoading: loading, error } = useGetUsersQuery()
    const [selectUser] = useSelectUserMutation()

    useEffect(() => {
        // If a user is already selected and we haven't navigated yet, skip to the home page
        if (currentUser && !hasNavigated.current) {
            hasNavigated.current = true
            navigate('/', { replace: true }) // Use replace to avoid back button issues
        }
    }, [currentUser, navigate])

    const handleUserSelect = async (user: User) => {
        try {
            const selectedUser = await selectUser(user.id).unwrap()
            dispatch(setCurrentUser(selectedUser))
            hasNavigated.current = true
            navigate('/', { replace: true })
        } catch (err) {
            console.error('Error selecting user:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
                <div className="text-amber-200 text-xl">Loading users...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
                <div className="text-red-400 text-xl">Error loading users</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
            <div className="mb-16 flex items-center">
                <BookOpenIcon size={40} className="text-amber-400 mr-3" />
                <h1 className="text-3xl font-bold text-amber-50">The Sloan Library</h1>
            </div>
            <h2 className="text-4xl font-medium text-amber-50 mb-12">Who's reading?</h2>
            <div className="grid grid-cols-2 gap-8 max-w-md">
                {users.map((user) => (
                    <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="flex flex-col items-center cursor-pointer group"
                    >
                        <div
                            className={`w-32 h-32 ${user.color} rounded-md mb-4 flex items-center justify-center text-white text-4xl font-bold group-hover:ring-4 ring-amber-400 transition-all`}
                        >
                            {user.name.charAt(0)}
                        </div>
                        <span className="text-amber-300 text-xl group-hover:text-amber-50 transition-colors">
                            {user.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
