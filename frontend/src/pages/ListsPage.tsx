import { useGetListsQuery } from '../middleware/backend'

export function ListsPage() {
    const { data: lists, isLoading, error } = useGetListsQuery()

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
