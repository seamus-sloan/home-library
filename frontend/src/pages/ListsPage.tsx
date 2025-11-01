import { PlusCircleIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useDeleteListMutation, useGetListsQuery } from '../middleware/backend'
import type { RootState } from '../store/store'

export function ListsPage() {
    const { data: lists, isLoading, error } = useGetListsQuery()
    const [isAddingList, setIsAddingList] = useState(false)
    const [deleteList] = useDeleteListMutation()
    const currentUser = useSelector((state: RootState) => state.user.currentUser)

    const handleDeleteList = async (listId: number, listName: string) => {
        if (window.confirm(`Are you sure you want to delete "${listName}"? This action cannot be undone.`)) {
            try {
                await deleteList(listId).unwrap()
            } catch (err) {
                console.error('Failed to delete list:', err)
                alert('Failed to delete list')
            }
        }
    }

    if (isLoading) {
        return <div className="text-amber-100">Loading lists...</div>
    }

    if (error) {
        return <div className="text-red-400">Error loading lists: {JSON.stringify(error)}</div>
    }

    return (
        <div className="space-y-8">
            {/* Header with Add List button */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-amber-50">Book Lists</h1>
                <button
                    onClick={() => setIsAddingList(true)}
                    className="flex items-center gap-2 bg-amber-900/40 hover:bg-amber-800/50 text-amber-100 px-4 py-2 rounded-lg border border-amber-700/30 hover:border-amber-600/50 transition-all duration-200 font-medium"
                >
                    <PlusCircleIcon size={18} />
                    <span>Add List</span>
                </button>
            </div>

            {/* Lists */}
            {!lists || lists.length === 0 ? (
                <div className="text-center py-12 text-amber-100/60">
                    No lists yet. Create your first list to get started!
                </div>
            ) : (
                <div className="space-y-6">
                    {lists.map((list) => (
                        <div
                            key={list.id}
                            className="border border-zinc-700/50 rounded-lg p-6 bg-zinc-900/30 backdrop-blur-sm"
                        >
                            {/* List name with delete button */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-amber-100">
                                    {list.name}
                                    <span className="ml-3 text-sm font-normal text-amber-100/60">
                                        ({list.books.length} {list.books.length === 1 ? 'book' : 'books'})
                                    </span>
                                </h2>
                                {currentUser && currentUser.id === list.user_id && (
                                    <button
                                        onClick={() => handleDeleteList(list.id, list.name)}
                                        className="flex items-center gap-2 bg-red-900/40 hover:bg-red-800/50 text-red-100 px-3 py-1.5 rounded-lg border border-red-700/30 hover:border-red-600/50 transition-all duration-200 text-sm font-medium"
                                        title="Delete list"
                                    >
                                        <Trash2Icon size={14} />
                                        <span className="hidden sm:inline">Delete</span>
                                    </button>
                                )}
                            </div>

                            {/* Book covers - horizontal scrolling */}
                            {list.books.length === 0 ? (
                                <div className="text-amber-100/50 italic">No books in this list</div>
                            ) : (
                                <div className="overflow-x-auto -mx-2 px-2">
                                    <div className="flex gap-3 pb-2">
                                        {list.books.map((book) => (
                                            <div
                                                key={book.id}
                                                className="group relative cursor-pointer flex-shrink-0 w-20 sm:w-24 md:w-28"
                                            >
                                                {/* Book cover container */}
                                                <div className="w-full aspect-[2/3] relative rounded-lg overflow-hidden bg-zinc-800/50 border border-zinc-700/50 hover:border-amber-600/50 transition-all duration-300">
                                                    {book.cover_image ? (
                                                        <img
                                                            src={book.cover_image}
                                                            alt={`Book ${book.id}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            crossOrigin="anonymous"
                                                            referrerPolicy="no-referrer"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement
                                                                target.onerror = null
                                                                target.src = 'https://placehold.co/400x600/18181b/71717a?text=No+Image'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-amber-100/40 text-xs">
                                                            No Cover
                                                        </div>
                                                    )}

                                                    {/* Status badge if available */}
                                                    {book.status_name && (
                                                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-amber-100 border border-amber-700/30">
                                                            {book.status_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* TODO: Add List Modal */}
            {isAddingList && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
                        <p className="text-amber-100">Add List Modal - Coming Soon</p>
                        <button
                            onClick={() => setIsAddingList(false)}
                            className="mt-4 px-4 py-2 bg-zinc-800 text-amber-100 rounded hover:bg-zinc-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
