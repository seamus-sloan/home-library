import { XIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useUpdateBookMutation } from '../../middleware/backend'
import type { Book, BookWithDetails, Genre, Tag } from '../../types'
import { GenreSearch } from '../search/GenreSearch'
import { TagSearch } from '../search/TagSearch'

interface EditBookModalProps {
    book: Book | BookWithDetails
    isOpen: boolean
    onClose: () => void
    onSave: () => void
}

export function EditBookModal({ book, isOpen, onClose, onSave }: EditBookModalProps) {
    const [updateBook, { isLoading: isSubmitting }] = useUpdateBookMutation()

    const [formData, setFormData] = useState({
        title: book.title,
        author: book.author,
        cover_image: book.cover_image || '',
        rating: book.rating || null,
    })

    const [selectedTags, setSelectedTags] = useState<Tag[]>(
        'tags' in book ? book.tags.map(tag => ({
            ...tag,
            user_id: null,
            created_at: '',
            updated_at: ''
        } as Tag)) : []
    )
    const [selectedGenres, setSelectedGenres] = useState<Genre[]>(
        'genres' in book ? (book.genres || []).map(genre => ({
            ...genre,
            user_id: null,
            created_at: '',
            updated_at: ''
        } as Genre)) : []
    )

    const [errors, setErrors] = useState({
        title: '',
        author: '',
    })

    // Reset form when book changes
    useEffect(() => {
        setFormData({
            title: book.title,
            author: book.author,
            cover_image: book.cover_image || '',
            rating: book.rating || null,
        })
        setSelectedTags('tags' in book ? book.tags.map(tag => ({
            ...tag,
            user_id: null,
            created_at: '',
            updated_at: ''
        } as Tag)) : [])
        setSelectedGenres('genres' in book ? (book.genres || []).map(genre => ({
            ...genre,
            user_id: null,
            created_at: '',
            updated_at: ''
        } as Genre)) : [])
        setErrors({ title: '', author: '' })
    }, [book])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: name === 'rating' ? (value ? parseInt(value) : null) : value,
        })
        // Clear error when user types
        if (errors[name as keyof typeof errors]) {
            setErrors({
                ...errors,
                [name]: '',
            })
        }
    }

    const validate = () => {
        const newErrors = {
            title: '',
            author: '',
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }

        if (!formData.author.trim()) {
            newErrors.author = 'Author is required'
        }

        setErrors(newErrors)
        return !newErrors.title && !newErrors.author
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) {
            return
        }

        try {
            await updateBook({
                id: book.id,
                book: {
                    ...formData,
                    tags: selectedTags.map(tag => tag.id),
                    genres: selectedGenres.map(genre => genre.id),
                }
            }).unwrap()

            onSave()
            onClose()
        } catch (error) {
            console.error('Failed to update book:', error)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm">
            <div className="bg-zinc-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-800 m-4">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-amber-50">Edit Book</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-amber-200 hover:text-amber-100"
                    >
                        <XIcon size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-amber-200 mb-2"
                            >
                                Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-amber-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all"
                                placeholder="Enter book title"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
                            )}
                        </div>

                        {/* Author */}
                        <div>
                            <label
                                htmlFor="author"
                                className="block text-sm font-medium text-amber-200 mb-2"
                            >
                                Author *
                            </label>
                            <input
                                type="text"
                                id="author"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-amber-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all"
                                placeholder="Enter author name"
                            />
                            {errors.author && (
                                <p className="mt-1 text-sm text-red-400">{errors.author}</p>
                            )}
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label
                            htmlFor="cover_image"
                            className="block text-sm font-medium text-amber-200 mb-2"
                        >
                            Cover Image URL
                        </label>
                        <input
                            type="url"
                            id="cover_image"
                            name="cover_image"
                            value={formData.cover_image}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-amber-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all"
                            placeholder="https://example.com/book-cover.jpg"
                        />
                    </div>

                    {/* Rating */}
                    <div>
                        <label
                            htmlFor="rating"
                            className="block text-sm font-medium text-amber-200 mb-2"
                        >
                            Rating (1-5 stars)
                        </label>
                        <select
                            id="rating"
                            name="rating"
                            value={formData.rating || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all"
                        >
                            <option value="">No rating</option>
                            <option value="1">1 star</option>
                            <option value="2">2 stars</option>
                            <option value="3">3 stars</option>
                            <option value="4">4 stars</option>
                            <option value="5">5 stars</option>
                        </select>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-amber-200 mb-2">
                            Tags
                        </label>
                        <TagSearch
                            selectedTags={selectedTags}
                            onTagsChange={setSelectedTags}
                        />
                    </div>

                    {/* Genres */}
                    <div>
                        <label className="block text-sm font-medium text-amber-200 mb-2">
                            Genres
                        </label>
                        <GenreSearch
                            selectedGenres={selectedGenres}
                            onGenresChange={setSelectedGenres}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4 border-t border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-amber-200 font-medium rounded-lg transition-colors border border-zinc-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-amber-900 hover:bg-amber-800 text-amber-50 font-medium rounded-lg transition-colors border border-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
