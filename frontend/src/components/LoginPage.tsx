import { BookOpenIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { type User, useUser } from '../contexts/UserContext'
export function LoginPage() {
    const { setCurrentUser } = useUser()
    const navigate = useNavigate()
    const users: User[] = [
        {
            id: 1,
            name: 'Kelsey',
            avatarColor: 'bg-purple-500',
        },
        {
            id: 2,
            name: 'Seamus',
            avatarColor: 'bg-blue-500',
        },
    ]
    const handleUserSelect = (user: User) => {
        setCurrentUser(user)
        navigate('/')
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
                            className={`w-32 h-32 ${user.avatarColor} rounded-md mb-4 flex items-center justify-center text-white text-4xl font-bold group-hover:ring-4 ring-white transition-all`}
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
