import { PlusCircleIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAddListMutation, useDeleteListMutation, useGetListsQuery } from '../middleware/backend'
import type { RootState } from '../store/store'

export function ListsPage() {
    const navigate = useNavigate()
    const { data: lists, isLoading, error } = useGetListsQuery()
    const [isAddingList, setIsAddingList] = useState(false)
    const [listName, setListName] = useState('')
    const [listType, setListType] = useState(1)
    const [deleteList] = useDeleteListMutation()
    const [addList, { isLoading: isCreating }] = useAddListMutation()
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

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!listName.trim()) {
            alert('Please enter a list name')
            return
        }

        try {
            await addList({
                name: listName,
                type_id: listType,
                books: []
            }).unwrap()
            setIsAddingList(false)
            setListName('')
            setListType(1)
        } catch (err) {
            console.error('Failed to create list:', err)
            alert('Failed to create list')
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
                            onClick={() => navigate(`/lists/${list.id}`)}
                            className="border border-zinc-700/50 rounded-lg p-6 bg-zinc-900/30 backdrop-blur-sm hover:border-amber-600/50 cursor-pointer transition-all duration-200"
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
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteList(list.id, list.name)
                                        }}
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
                                <div className="text-amber-100/50 italic">
                                    Open the list to add books to the list!
                                </div>
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

            {/* Add List Modal */}
            {isAddingList && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-lg border border-zinc-700 w-full max-w-md">
                        <form onSubmit={handleCreateList}>
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-zinc-700">
                                <h3 className="text-xl font-semibold text-amber-100">Create New List</h3>
                            </div>

                            {/* Modal Body */}
                            <div className="px-6 py-4 space-y-4">
                                {/* List Name Input */}
                                <div>
                                    <label htmlFor="listName" className="block text-sm font-medium text-amber-100 mb-2">
                                        List Name
                                    </label>
                                    <input
                                        type="text"
                                        id="listName"
                                        value={listName}
                                        onChange={(e) => setListName(e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-amber-100 placeholder-amber-100/40 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-amber-600/50"
                                        placeholder="Enter list name..."
                                        autoFocus
                                    />
                                </div>

                                {/* List Type Dropdown */}
                                <div>
                                    <label htmlFor="listType" className="block text-sm font-medium text-amber-100 mb-2">
                                        List Type
                                    </label>
                                    <select
                                        id="listType"
                                        value={listType}
                                        onChange={(e) => setListType(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-amber-600/50"
                                    >
                                        <option value={1}>SEQUENCED</option>
                                        <option value={2}>UNORDERED</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-zinc-700 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingList(false)
                                        setListName('')
                                        setListType(1)
                                    }}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-100 rounded-lg border border-zinc-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || !listName.trim()}
                                    className="px-4 py-2 bg-amber-900/40 hover:bg-amber-800/50 text-amber-100 rounded-lg border border-amber-700/30 hover:border-amber-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? 'Creating...' : 'Create List'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
