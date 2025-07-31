import { BookmarkIcon, ChevronDownIcon, PlusIcon, TagIcon, XIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import type { Genre, Tag } from '../../types'
import { EditCategoryModal } from '../forms/EditCategoryModal'

type CategoryItem = Tag | Genre

interface CategorySearchProps<T extends CategoryItem> {
    selectedItems: T[]
    onItemsChange: (items: T[]) => void
    availableItems: T[]
    isLoading: boolean
    onCreateItem: (name: string, color: string) => Promise<T>
    onEditItem?: (id: number, name: string, color: string) => Promise<void>
    isCreating: boolean
    placeholder?: string
    className?: string
    multiple?: boolean
    categoryType: 'tag' | 'genre'
    searchTerm: string
    onSearchTermChange: (term: string) => void
}

export function CategorySearch<T extends CategoryItem>({
    selectedItems,
    onItemsChange,
    availableItems,
    isLoading,
    onCreateItem,
    onEditItem,
    isCreating,
    placeholder = "Search for items...",
    className = "",
    multiple = true,
    categoryType,
    searchTerm,
    onSearchTermChange
}: CategorySearchProps<T>) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newItemColor, setNewItemColor] = useState('#3b82f6')
    const [editingItem, setEditingItem] = useState<T | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

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
        onSearchTermChange(e.target.value)
        setIsDropdownOpen(true)
        setShowCreateForm(false)
    }

    const handleInputFocus = () => {
        setIsDropdownOpen(true)
    }

    const handleItemSelect = (item: T) => {
        if (!multiple) {
            onItemsChange([item])
            onSearchTermChange('')
            setIsDropdownOpen(false)
            return
        }

        // For multiple selection
        const isAlreadySelected = selectedItems.some(selected => selected.id === item.id)

        if (!isAlreadySelected) {
            onItemsChange([...selectedItems, item])
        }

        onSearchTermChange('')
        inputRef.current?.focus()
    }

    const handleItemRemove = (itemToRemove: T) => {
        onItemsChange(selectedItems.filter(item => item.id !== itemToRemove.id))
    }

    const handleCreateItem = async () => {
        if (!searchTerm.trim()) return

        try {
            const result = await onCreateItem(searchTerm.trim(), newItemColor)

            // Add the new item to the selected items
            if (multiple) {
                onItemsChange([...selectedItems, result])
            } else {
                onItemsChange([result])
            }

            // Reset form
            onSearchTermChange('')
            setShowCreateForm(false)
            setIsDropdownOpen(false)
            setNewItemColor('#3b82f6')

        } catch (error) {
            console.error(`Error creating ${categoryType}:`, error)
        }
    }

    const handleShowCreateForm = () => {
        setShowCreateForm(true)
    }

    const handleCancelCreate = () => {
        setShowCreateForm(false)
        setNewItemColor('#3b82f6')
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

    const filteredItems = availableItems.filter(item =>
        !selectedItems.some(selected => selected.id === item.id)
    )

    const exactMatch = availableItems.some(item =>
        item.name.toLowerCase() === searchTerm.toLowerCase()
    )
    const shouldShowCreateOption = searchTerm.trim() && !exactMatch && !isLoading

    // Predefined color options
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

    // Choose icon based on category type
    const CategoryIcon = categoryType === 'tag' ? TagIcon : BookmarkIcon
    const categoryName = categoryType === 'tag' ? 'tag' : 'genre'
    const categoryPlural = categoryType === 'tag' ? 'tags' : 'genres'

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div className="w-full">
                {/* Selected items display (for multiple mode) */}
                {multiple && selectedItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {selectedItems.map(item => {
                            const textColor = getContrastColor(item.color)
                            const displayStyle = categoryType === 'tag'
                                ? {
                                    backgroundColor: item.color,
                                    color: textColor,
                                    borderColor: item.color
                                }
                                : {
                                    backgroundColor: `${item.color}20`,
                                    borderColor: `${item.color}50`,
                                    color: item.color
                                }

                            return (
                                <span
                                    key={item.id}
                                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border shadow-sm cursor-pointer hover:opacity-80"
                                    style={displayStyle}
                                    onClick={() => setEditingItem(item)}
                                >
                                    <CategoryIcon size={12} className="mr-1.5" />
                                    {item.name}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleItemRemove(item)
                                        }}
                                        className="ml-1.5 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                                        style={{ color: categoryType === 'tag' ? textColor : item.color }}
                                    >
                                        <XIcon size={12} />
                                    </button>
                                </span>
                            )
                        })}
                    </div>
                )}

                {/* Single selection display */}
                {!multiple && selectedItems.length === 1 && (
                    <div className="mb-2">
                        {(() => {
                            const item = selectedItems[0]
                            const textColor = getContrastColor(item.color)
                            const displayStyle = categoryType === 'tag'
                                ? {
                                    backgroundColor: item.color,
                                    color: textColor,
                                    borderColor: item.color
                                }
                                : {
                                    backgroundColor: `${item.color}20`,
                                    borderColor: `${item.color}50`,
                                    color: item.color
                                }

                            return (
                                <span
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border cursor-pointer hover:opacity-80"
                                    style={displayStyle}
                                    onClick={() => setEditingItem(item)}
                                >
                                    <CategoryIcon size={14} className="mr-1" />
                                    {item.name}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onItemsChange([])
                                        }}
                                        className="ml-2 hover:opacity-70"
                                        aria-label={`Remove ${item.name} ${categoryName}`}
                                    >
                                        <XIcon size={14} />
                                    </button>
                                </span>
                            )
                        })()}
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
                        className="w-full px-3 py-2 pr-8 bg-zinc-800 border border-zinc-700 rounded-md text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                    />
                    <ChevronDownIcon
                        size={16}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-amber-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                            }`}
                    />
                </div>
            </div>

            {/* Dropdown */}
            {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-64 overflow-y-auto">
                    {isLoading ? (
                        <div className="px-3 py-2 text-amber-400 text-sm">Loading {categoryPlural}...</div>
                    ) : showCreateForm ? (
                        <div className="p-4 border-b border-zinc-700">
                            <div className="mb-3">
                                <label className="block text-amber-200 text-sm font-medium mb-2">
                                    Create {categoryName}: "{searchTerm}"
                                </label>
                                <div className="mb-3">
                                    <label className="block text-amber-200 text-xs mb-2">Choose color:</label>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => {
                                                    console.log('Setting color to:', color)
                                                    setNewItemColor(color)
                                                }}
                                                className={`w-8 h-8 rounded-full border-3 transition-all hover:scale-110 ${newItemColor === color
                                                    ? 'border-amber-400 shadow-lg ring-2 ring-amber-400'
                                                    : 'border-gray-400 hover:border-gray-300'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                title={`Select ${color}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-amber-400 mt-1">Selected: {newItemColor}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="block text-amber-200 text-xs mb-2">Preview:</label>
                                    <span
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                        style={{
                                            backgroundColor: newItemColor,
                                            color: getContrastColor(newItemColor)
                                        }}
                                    >
                                        <CategoryIcon size={10} className="mr-1" />
                                        {searchTerm}
                                    </span>
                                    <p className="text-xs text-amber-400 mt-1">Color: {newItemColor}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleCreateItem}
                                    disabled={isCreating}
                                    className="flex-1 px-3 py-2 bg-amber-900/40 text-amber-100 text-sm rounded-md hover:bg-amber-800/50 transition-colors border border-amber-700/30 disabled:opacity-50"
                                >
                                    {isCreating ? 'Creating...' : `Create ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}`}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelCreate}
                                    className="px-3 py-2 bg-zinc-600 text-amber-100 text-sm rounded-md hover:bg-zinc-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {filteredItems.map(item => {
                                const textColor = getContrastColor(item.color)
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleItemSelect(item)}
                                        className="w-full px-3 py-2 text-left hover:bg-zinc-700 transition-colors flex items-center"
                                    >
                                        <div className="flex items-center">
                                            {categoryType === 'tag' ? (
                                                <span
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3"
                                                    style={{
                                                        backgroundColor: item.color,
                                                        color: textColor
                                                    }}
                                                >
                                                    <CategoryIcon size={10} className="mr-1" />
                                                    {item.name}
                                                </span>
                                            ) : (
                                                <>
                                                    <div
                                                        className="w-3 h-3 rounded-full mr-3"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="text-amber-50">{item.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                            {shouldShowCreateOption && (
                                <button
                                    type="button"
                                    onClick={handleShowCreateForm}
                                    className="w-full px-3 py-2 text-left hover:bg-zinc-700 transition-colors flex items-center text-amber-300 border-b border-zinc-700"
                                >
                                    <PlusIcon size={16} className="mr-2" />
                                    Create "{searchTerm}" {categoryName}
                                </button>
                            )}
                            {!shouldShowCreateOption && filteredItems.length === 0 && !isLoading && (
                                <div className="px-3 py-2 text-amber-400 text-sm">
                                    {searchTerm.trim() ? `No ${categoryPlural} found` : `No ${categoryPlural} available`}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {editingItem && onEditItem && (
                <EditCategoryModal
                    item={editingItem}
                    categoryType={categoryType}
                    isOpen={true}
                    onClose={() => setEditingItem(null)}
                    onSave={onEditItem}
                />
            )}
        </div>
    )
}
