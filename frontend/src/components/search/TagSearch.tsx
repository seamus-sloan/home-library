import { useState } from 'react'
import { useAddTagMutation, useGetTagsQuery, useUpdateTagMutation } from '../middleware/backend'
import type { Tag } from '../types'
import { CategorySearch } from './CategorySearch'

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
    const [searchTerm, setSearchTerm] = useState('')

    // Use RTK Query to fetch tags
    const {
        data: availableTags = [],
        isLoading
    } = useGetTagsQuery(searchTerm.trim() ? { name: searchTerm.trim() } : undefined)

    // Use RTK Query mutation for creating tags
    const [addTag, { isLoading: isCreatingTag }] = useAddTagMutation()

    // Use RTK Query mutation for updating tags
    const [updateTag] = useUpdateTagMutation()

    const handleCreateTag = async (name: string, color: string): Promise<Tag> => {
        const result = await addTag({ name, color }).unwrap()
        return result
    }

    const handleEditTag = async (id: number, name: string, color: string): Promise<void> => {
        await updateTag({ id, tag: { name, color } }).unwrap()
    }

    return (
        <CategorySearch<Tag>
            selectedItems={selectedTags}
            onItemsChange={onTagsChange}
            availableItems={availableTags}
            isLoading={isLoading}
            onCreateItem={handleCreateTag}
            isCreating={isCreatingTag}
            placeholder={placeholder}
            className={className}
            multiple={multiple}
            categoryType="tag"
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onEditItem={handleEditTag}
        />
    )
}
