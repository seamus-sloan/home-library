import { ChevronDownIcon, PlusIcon, TagIcon, XIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useAddGenreMutation, useGetGenresQuery } from '../middleware/backend'
import type { Genre } from '../types'

interface GenreSearchProps {
    selectedGenres: Genre[]
    onGenresChange: (genres: Genre[]) => void
    placeholder?: string
    className?: string
    multiple?: boolean
}

export function GenreSearch({
    selectedGenres,
    onGenresChange,
    placeholder = "Search for genres...",
    className = "",
    multiple = true
}: GenreSearchProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newGenreColor, setNewGenreColor] = useState('#3b82f6')
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Use RTK Query to fetch genres
    const {
        data: availableGenres = [],
        isLoading
    } = useGetGenresQuery(searchTerm.trim() ? { name: searchTerm.trim() } : undefined)

    // Use RTK Query mutation for creating genres
    const [addGenre, { isLoading: isCreatingGenre }] = useAddGenreMutation()

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
                setShowCreateForm(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        if (!isDropdownOpen) {
            setIsDropdownOpen(true)
        }
    }

    const handleInputFocus = () => {
        setIsDropdownOpen(true)
    }

    const handleGenreSelect = (genre: Genre) => {
        if (multiple) {
            // Check if genre is already selected
            const isSelected = selectedGenres.some(selected => selected.id === genre.id)

            if (isSelected) {
                // Remove genre if already selected
                onGenresChange(selectedGenres.filter(selected => selected.id !== genre.id))
            } else {
                // Add genre if not selected
                onGenresChange([...selectedGenres, genre])
            }
        } else {
            // Single selection mode
            onGenresChange([genre])
            setIsDropdownOpen(false)
        }
    }

    const handleGenreRemove = (genreId: number) => {
        onGenresChange(selectedGenres.filter(genre => genre.id !== genreId))
    }

    const handleCreateGenre = async () => {
        if (searchTerm.trim()) {
            try {
                const newGenre = await addGenre({
                    name: searchTerm.trim(),
                    color: newGenreColor,
                    user_id: null // Will be set by backend
                }).unwrap()

                // Add the new genre to selected genres
                if (multiple) {
                    onGenresChange([...selectedGenres, newGenre])
                } else {
                    onGenresChange([newGenre])
                }

                // Reset form
                setSearchTerm('')
                setShowCreateForm(false)
                setNewGenreColor('#3b82f6')

                if (!multiple) {
                    setIsDropdownOpen(false)
                }
            } catch (error) {
                console.error('Failed to create genre:', error)
            }
        }
    }

    // Filter out already selected genres for multiple mode
    const filteredGenres = multiple
        ? availableGenres.filter((genre: Genre) => !selectedGenres.some(selected => selected.id === genre.id))
        : availableGenres

    // Check if we should show the "Create new genre" option
    const exactMatch = availableGenres.some((genre: Genre) =>
        genre.name.toLowerCase() === searchTerm.toLowerCase()
    )
    const shouldShowCreateOption = searchTerm.trim() && !exactMatch

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Selected Genres Display */}
            {multiple && selectedGenres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedGenres.map((genre) => (
                        <span
                            key={genre.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
                            style={{
                                backgroundColor: `${genre.color}20`,
                                borderColor: `${genre.color}50`,
                                color: genre.color
                            }}
                        >
                            <TagIcon size={14} className="mr-1" />
                            {genre.name}
                            <button
                                type="button"
                                onClick={() => handleGenreRemove(genre.id)}
                                className="ml-2 hover:opacity-70"
                                aria-label={`Remove ${genre.name} genre`}
                            >
                                <XIcon size={14} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Single Selection Display */}
            {!multiple && selectedGenres.length === 1 && (
                <div className="mb-2">
                    <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
                        style={{
                            backgroundColor: `${selectedGenres[0].color}20`,
                            borderColor: `${selectedGenres[0].color}50`,
                            color: selectedGenres[0].color
                        }}
                    >
                        <TagIcon size={14} className="mr-1" />
                        {selectedGenres[0].name}
                        <button
                            type="button"
                            onClick={() => onGenresChange([])}
                            className="ml-2 hover:opacity-70"
                            aria-label={`Remove ${selectedGenres[0].name} genre`}
                        >
                            <XIcon size={14} />
                        </button>
                    </span>
                </div>
            )}

            {/* Search Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 pr-8 bg-zinc-800 border border-zinc-700 rounded-md text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                />
                <ChevronDownIcon
                    size={20}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-amber-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                        }`}
                />
            </div>

            {/* Dropdown */}
            {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoading && (
                        <div className="p-3 text-amber-300 text-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400 mx-auto"></div>
                        </div>
                    )}

                    {!isLoading && (
                        <>
                            {/* Create New Genre Form */}
                            {showCreateForm && (
                                <div className="p-3 border-b border-zinc-700 bg-zinc-900">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-amber-200 mb-1">
                                                Genre Name
                                            </label>
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full px-2 py-1 text-sm bg-zinc-800 border border-zinc-600 rounded text-amber-50"
                                                placeholder="Enter genre name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-amber-200 mb-1">
                                                Color
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={newGenreColor}
                                                    onChange={(e) => setNewGenreColor(e.target.value)}
                                                    className="w-8 h-8 rounded border border-zinc-600"
                                                />
                                                <input
                                                    type="text"
                                                    value={newGenreColor}
                                                    onChange={(e) => setNewGenreColor(e.target.value)}
                                                    className="flex-1 px-2 py-1 text-sm bg-zinc-800 border border-zinc-600 rounded text-amber-50"
                                                    placeholder="#3b82f6"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateForm(false)}
                                                className="px-3 py-1 text-xs text-amber-300 hover:text-amber-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCreateGenre}
                                                disabled={isCreatingGenre || !searchTerm.trim()}
                                                className="px-3 py-1 text-xs bg-amber-900/40 text-amber-100 rounded border border-amber-700/30 hover:bg-amber-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isCreatingGenre ? 'Creating...' : 'Create'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Create New Genre Option */}
                            {shouldShowCreateOption && !showCreateForm && (
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(true)}
                                    className="w-full px-3 py-2 text-left hover:bg-zinc-700 flex items-center text-amber-300 border-b border-zinc-700"
                                >
                                    <PlusIcon size={16} className="mr-2" />
                                    Create "{searchTerm}"
                                </button>
                            )}

                            {/* Existing Genres */}
                            {filteredGenres.length > 0 ? (
                                filteredGenres.map((genre: Genre) => (
                                    <button
                                        key={genre.id}
                                        type="button"
                                        onClick={() => handleGenreSelect(genre)}
                                        className="w-full px-3 py-2 text-left hover:bg-zinc-700 flex items-center"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full mr-3"
                                            style={{ backgroundColor: genre.color }}
                                        />
                                        <span className="text-amber-50">{genre.name}</span>
                                    </button>
                                ))
                            ) : !shouldShowCreateOption && !isLoading && (
                                <div className="p-3 text-amber-400 text-center text-sm">
                                    No genres found
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
