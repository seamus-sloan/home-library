import { BookOpenIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { type User, useUser } from '../contexts/UserContext'
import { useGetUsersQuery, useSelectUserMutation } from '../middleware/backend'

export function LoginPage() {
    const { currentUser, setCurrentUser } = useUser()
    const navigate = useNavigate()

    // Use RTK Query to fetch users
    const { data: users = [], isLoading: loading, error } = useGetUsersQuery()
    const [selectUser] = useSelectUserMutation()

    useEffect(() => {
        // If a user is already selected, skip to the home page
        if (currentUser) {
            navigate('/')
        }
    }, [currentUser, navigate])

    const handleUserSelect = async (user: User) => {
        try {
            const selectedUser = await selectUser(user.id).unwrap()
            setCurrentUser(selectedUser)
            navigate('/')
        } catch (err) {
            console.error('Error selecting user:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4">
                <div className="text-white text-xl">Loading users...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4">
                <div className="text-red-400 text-xl">Error loading users</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4">
            <div className="mb-16 flex items-center">
                <BookOpenIcon size={40} className="text-purple-400 mr-3" />
                <h1 className="text-3xl font-bold text-white">The Sloan Library</h1>
            </div>
            <h2 className="text-4xl font-medium text-white mb-12">Who's reading?</h2>
            <div className="grid grid-cols-2 gap-8 max-w-md">
                {users.map((user) => (
                    <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="flex flex-col items-center cursor-pointer group"
                    >
                        <div
                            className={`w-32 h-32 ${user.avatar_color} rounded-md mb-4 flex items-center justify-center text-white text-4xl font-bold group-hover:ring-4 ring-white transition-all`}
                        >
                            {user.name.charAt(0)}
                        </div>
                        <span className="text-gray-300 text-xl group-hover:text-white transition-colors">
                            {user.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
