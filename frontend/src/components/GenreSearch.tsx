import { useState } from 'react'
import { useAddGenreMutation, useGetGenresQuery, useUpdateGenreMutation } from '../middleware/backend'
import type { Genre } from '../types'
import { CategorySearch } from './CategorySearch'

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

    // Use RTK Query to fetch genres
    const {
        data: availableGenres = [],
        isLoading
    } = useGetGenresQuery(searchTerm.trim() ? { name: searchTerm.trim() } : undefined)

    // Use RTK Query mutation for creating genres
    const [addGenre, { isLoading: isCreatingGenre }] = useAddGenreMutation()

    // Use RTK Query mutation for updating genres
    const [updateGenre] = useUpdateGenreMutation()

    const handleCreateGenre = async (name: string, color: string): Promise<Genre> => {
        const result = await addGenre({
            name,
            color
        }).unwrap()
        return result
    }

    const handleEditGenre = async (id: number, name: string, color: string): Promise<void> => {
        await updateGenre({ id, genre: { name, color } }).unwrap()
    }

    return (
        <CategorySearch<Genre>
            selectedItems={selectedGenres}
            onItemsChange={onGenresChange}
            availableItems={availableGenres}
            isLoading={isLoading}
            onCreateItem={handleCreateGenre}
            isCreating={isCreatingGenre}
            placeholder={placeholder}
            className={className}
            multiple={multiple}
            categoryType="genre"
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onEditItem={handleEditGenre}
        />
    )
}
