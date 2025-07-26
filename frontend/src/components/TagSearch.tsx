import { ChevronDownIcon, PlusIcon, TagIcon, XIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useUser } from '../contexts/UserContext'
import type { Tag } from '../types'

interface TagSearchProps {
    selectedTags: Tag[]
    onTagsChange: (tags: Tag[]) => void
    placeholder?: string
    className?: string
    multiple?: boolean
}

export function TagSearch({
    selectedTags,
    onTagsChange,
    placeholder = "Search for tags...",
    className = "",
    multiple = true
}: TagSearchProps) {
    const { currentUser } = useUser()
    const [searchTerm, setSearchTerm] = useState('')
    const [availableTags, setAvailableTags] = useState<Tag[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newTagColor, setNewTagColor] = useState('#3b82f6')
    const [isCreatingTag, setIsCreatingTag] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Fetch tags based on search term
    useEffect(() => {
        const fetchTags = async () => {
            setIsLoading(true)
            try {
                const headers: HeadersInit = {}
                if (currentUser) {
                    headers['currentUserId'] = currentUser.id.toString()
                    headers['Content-Type'] = 'application/json'
                }

                const url = searchTerm.trim()
                    ? `/tags?name=${encodeURIComponent(searchTerm.trim())}`
                    : '/tags'

                const response = await fetch(url, { headers })

                if (!response.ok) {
                    throw new Error('Failed to fetch tags')
                }

                const tags: Tag[] = await response.json()
                setAvailableTags(tags)
            } catch (error) {
                console.error('Error fetching tags:', error)
                setAvailableTags([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchTags()
    }, [searchTerm, currentUser])

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
        setIsDropdownOpen(true)
        setShowCreateForm(false)
    }

    const handleInputFocus = () => {
        setIsDropdownOpen(true)
    }

    const handleTagSelect = (tag: Tag) => {
        if (!multiple) {
            onTagsChange([tag])
            setSearchTerm('')
            setIsDropdownOpen(false)
            return
        }

        // For multiple selection
        const isAlreadySelected = selectedTags.some(selected => selected.id === tag.id)

        if (!isAlreadySelected) {
            onTagsChange([...selectedTags, tag])
        }

        setSearchTerm('')
        inputRef.current?.focus()
    }

    const handleTagRemove = (tagToRemove: Tag) => {
        onTagsChange(selectedTags.filter(tag => tag.id !== tagToRemove.id))
    }

    const handleCreateTag = async () => {
        if (!searchTerm.trim()) return

        setIsCreatingTag(true)
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            }
            if (currentUser) {
                headers['currentUserId'] = currentUser.id.toString()
            }

            const response = await fetch('/tags', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: searchTerm.trim(),
                    color: newTagColor,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create tag')
            }

            const newTag: Tag = await response.json()

            // Add the new tag to the selected tags
            if (multiple) {
                onTagsChange([...selectedTags, newTag])
            } else {
                onTagsChange([newTag])
            }

            // Reset form
            setSearchTerm('')
            setShowCreateForm(false)
            setIsDropdownOpen(false)
            setNewTagColor('#3b82f6')

            // Refresh the available tags
            setAvailableTags(prev => [...prev, newTag])

        } catch (error) {
            console.error('Error creating tag:', error)
        } finally {
            setIsCreatingTag(false)
        }
    }

    const handleShowCreateForm = () => {
        setShowCreateForm(true)
    }

    const handleCancelCreate = () => {
        setShowCreateForm(false)
        setNewTagColor('#3b82f6')
    }

    // Function to determine if we should use black or white text based on background color
    const getContrastColor = (hexColor: string): string => {
        // Remove # if present and ensure we have a valid hex color
        let color = hexColor.replace('#', '')

        // Handle 3-digit hex colors by expanding them
        if (color.length === 3) {
            color = color.split('').map(char => char + char).join('')
        }

        // Ensure we have exactly 6 characters
        if (color.length !== 6) {
            console.warn(`Invalid color format: ${hexColor}, defaulting to black text`)
            return '#000000'
        }

        // Convert to RGB
        const r = parseInt(color.substring(0, 2), 16)
        const g = parseInt(color.substring(2, 4), 16)
        const b = parseInt(color.substring(4, 6), 16)

        // Check if parsing was successful
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            console.warn(`Failed to parse color: ${hexColor}, defaulting to black text`)
            return '#000000'
        }

        // Calculate relative luminance using the W3C formula
        // https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
        const toLinear = (colorValue: number) => {
            const c = colorValue / 255
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        }

        const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)

        // Return black for light colors (luminance > 0.5), white for dark colors
        return luminance > 0.5 ? '#000000' : '#ffffff'
    }

    const filteredTags = availableTags.filter(tag =>
        !selectedTags.some(selected => selected.id === tag.id)
    )

    const showCreateOption = searchTerm.trim() && filteredTags.length === 0 && !isLoading

    // Predefined color options for tag creation
    const colorOptions = [
        '#3b82f6', // blue
        '#ef4444', // red
        '#10b981', // emerald
        '#f59e0b', // amber
        '#8b5cf6', // violet
        '#06b6d4', // cyan
        '#f97316', // orange
        '#84cc16', // lime
        '#ec4899', // pink
        '#6b7280', // gray
        '#ffffff', // white
        '#000000', // black
    ]

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div className="w-full">
                {/* Selected tags display (for multiple mode) */}
                {multiple && selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {selectedTags.map(tag => {
                            const textColor = getContrastColor(tag.color)
                            return (
                                <span
                                    key={tag.id}
                                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border shadow-sm"
                                    style={{
                                        backgroundColor: tag.color,
                                        color: textColor,
                                        borderColor: tag.color
                                    }}
                                >
                                    <TagIcon size={12} className="mr-1.5" />
                                    {tag.name}
                                    <button
                                        type="button"
                                        onClick={() => handleTagRemove(tag)}
                                        className="ml-1.5 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                                        style={{ color: textColor }}
                                    >
                                        <XIcon size={12} />
                                    </button>
                                </span>
                            )
                        })}
                    </div>
                )}

                {/* Input field */}
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <ChevronDownIcon
                        size={16}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                            }`}
                    />
                </div>
            </div>

            {/* Dropdown */}
            {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-64 overflow-y-auto">
                    {isLoading ? (
                        <div className="px-3 py-2 text-gray-400 text-sm">Loading tags...</div>
                    ) : showCreateForm ? (
                        <div className="p-4 border-b border-gray-600">
                            <div className="mb-3">
                                <label className="block text-gray-200 text-sm font-medium mb-2">
                                    Create tag: "{searchTerm}"
                                </label>
                                <div className="mb-3">
                                    <label className="block text-gray-200 text-xs mb-2">Choose color:</label>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => {
                                                    console.log('Setting color to:', color)
                                                    setNewTagColor(color)
                                                }}
                                                className={`w-8 h-8 rounded-full border-3 transition-all hover:scale-110 ${newTagColor === color
                                                        ? 'border-purple-400 shadow-lg ring-2 ring-purple-400'
                                                        : 'border-gray-400 hover:border-gray-300'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                title={`Select ${color}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Selected: {newTagColor}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="block text-gray-200 text-xs mb-2">Preview:</label>
                                    <span
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                        style={{
                                            backgroundColor: newTagColor,
                                            color: getContrastColor(newTagColor)
                                        }}
                                    >
                                        <TagIcon size={10} className="mr-1" />
                                        {searchTerm}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-1">Color: {newTagColor}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleCreateTag}
                                    disabled={isCreatingTag}
                                    className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {isCreatingTag ? 'Creating...' : 'Create Tag'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelCreate}
                                    className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {filteredTags.map(tag => {
                                const textColor = getContrastColor(tag.color)
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => handleTagSelect(tag)}
                                        className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center"
                                    >
                                        <div className="flex items-center">
                                            <span
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3"
                                                style={{
                                                    backgroundColor: tag.color,
                                                    color: textColor
                                                }}
                                            >
                                                <TagIcon size={10} className="mr-1" />
                                                {tag.name}
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                            {showCreateOption && (
                                <button
                                    type="button"
                                    onClick={handleShowCreateForm}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center text-purple-400"
                                >
                                    <PlusIcon size={16} className="mr-2" />
                                    Create "{searchTerm}" tag
                                </button>
                            )}
                            {!showCreateOption && filteredTags.length === 0 && !isLoading && (
                                <div className="px-3 py-2 text-gray-400 text-sm">
                                    {searchTerm.trim() ? 'No tags found' : 'No tags available'}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
