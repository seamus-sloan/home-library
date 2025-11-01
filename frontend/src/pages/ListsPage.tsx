import { useSelector } from 'react-redux'
import { useGetListsQuery } from '../middleware/backend'
import type { RootState } from '../store/store'

export function ListsPage() {
    const currentUser = useSelector((state: RootState) => state.user.currentUser)
    const { data: lists, isLoading, error } = useGetListsQuery(undefined, {
        skip: !currentUser, // Don't fetch if no user is selected
    })

    if (!currentUser) {
        return <div>Please select a user first</div>
    }

    if (isLoading) {
        return <div>Loading lists...</div>
    }

    if (error) {
        return <div>Error loading lists: {JSON.stringify(error)}</div>
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Lists</h1>
            <pre className="bg-gray-800 p-4 rounded overflow-auto">
                {JSON.stringify(lists, null, 2)}
            </pre>
        </div>
    )
}
