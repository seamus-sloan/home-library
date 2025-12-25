import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  useAddBookMutation,
  useUpdateBookMutation,
} from '../../middleware/backend'
import type { RootState } from '../../store/store'
import type { Book, BookWithDetails, Genre, Tag } from '../../types'
import { StarRating } from '../common/StarRating'
import { GenreSearch } from '../search/GenreSearch'
import { TagSearch } from '../search/TagSearch'

export interface BookFormData {
  title: string
  author: string
  cover_image: string
  rating: number | null
  series: string
  tags: Tag[]
  genres: Genre[]
}

interface BookFormProps {
  mode: 'create' | 'edit'
  book?: Book | BookWithDetails
  onSubmit: (data: BookFormData) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
  className?: string
}

export function BookForm({
  mode,
  book,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = '',
}: BookFormProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser)
  const [addBook] = useAddBookMutation()
  const [updateBook] = useUpdateBookMutation()

  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    cover_image: book?.cover_image || '',
    rating: book?.rating || null,
    series: book?.series || '',
  })

  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    mode === 'edit' && book && 'tags' in book
      ? book.tags.map(
          tag =>
            ({
              ...tag,
              user_id: book.user_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }) as Tag
        )
      : []
  )

  const [selectedGenres, setSelectedGenres] = useState<Genre[]>(
    mode === 'edit' && book && 'genres' in book
      ? (book.genres || []).map(
          genre =>
            ({
              ...genre,
              user_id: book.user_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }) as Genre
        )
      : []
  )

  const [errors, setErrors] = useState({
    title: '',
    author: '',
  })

  // Reset form when book changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && book) {
      setFormData({
        title: book.title,
        author: book.author,
        cover_image: book.cover_image || '',
        rating: book.rating || null,
        series: book.series || '',
      })

      if ('tags' in book) {
        setSelectedTags(
          book.tags.map(
            tag =>
              ({
                ...tag,
                user_id: book.user_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }) as Tag
          )
        )
      }

      if ('genres' in book) {
        setSelectedGenres(
          (book.genres || []).map(
            genre =>
              ({
                ...genre,
                user_id: book.user_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }) as Genre
          )
        )
      }

      setErrors({ title: '', author: '' })
    }
  }, [book, mode])

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

  const handleRatingChange = (newRating: number | null) => {
    setFormData({ ...formData, rating: newRating })
  }

  const validate = () => {
    const newErrors = {
      title: formData.title.trim() ? '' : 'Title is required',
      author: formData.author.trim() ? '' : 'Author is required',
    }
    setErrors(newErrors)
    return !newErrors.title && !newErrors.author
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const bookFormData: BookFormData = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      cover_image: formData.cover_image.trim(),
      rating: formData.rating,
      series: formData.series.trim(),
      tags: selectedTags,
      genres: selectedGenres,
    }

    if (mode === 'create') {
      try {
        await addBook({
          user_id: currentUser?.id || null,
          title: bookFormData.title,
          author: bookFormData.author,
          cover_image: bookFormData.cover_image || null,
          rating: bookFormData.rating,
          series: bookFormData.series || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: selectedTags.map(tag => tag.id),
          genres: selectedGenres.map(genre => genre.id),
        }).unwrap()
      } catch (error) {
        console.error('Error adding book:', error)
        setErrors({
          title: '',
          author:
            error instanceof Error ? error.message : 'Failed to save book',
        })
        return
      }
    } else if (mode === 'edit' && book) {
      try {
        await updateBook({
          id: book.id,
          book: {
            title: bookFormData.title,
            author: bookFormData.author,
            cover_image: bookFormData.cover_image || null,
            rating: bookFormData.rating,
            series: bookFormData.series || null,
            tags: selectedTags.map(tag => tag.id),
            genres: selectedGenres.map(genre => genre.id),
          },
        }).unwrap()
      } catch (error) {
        console.error('Error updating book:', error)
        setErrors({
          title: '',
          author:
            error instanceof Error ? error.message : 'Failed to update book',
        })
        return
      }
    }

    await onSubmit(bookFormData)
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-amber-200 mb-2"
          >
            Book Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-amber-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all ${
              errors.title ? 'border-red-500' : 'border-zinc-700'
            }`}
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
            Author <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-amber-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all ${
              errors.author ? 'border-red-500' : 'border-zinc-700'
            }`}
            placeholder="Enter author name"
          />
          {errors.author && (
            <p className="mt-1 text-sm text-red-400">{errors.author}</p>
          )}
        </div>
      </div>

      {/* Series */}
      <div>
        <label
          htmlFor="series"
          className="block text-sm font-medium text-amber-200 mb-2"
        >
          Series
        </label>
        <input
          type="text"
          id="series"
          name="series"
          value={formData.series}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-amber-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all"
          placeholder="Enter series name (optional)"
        />
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
        <label className="block text-sm font-medium text-amber-200 mb-2">
          Rating
        </label>
        <StarRating
          rating={formData.rating}
          onRatingChange={handleRatingChange}
          readonly={false}
          size="large"
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
          placeholder="Search and select genres for this book..."
          multiple={true}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-amber-200 mb-2">
          Tags
        </label>
        <TagSearch
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          placeholder="Search and select tags for this book..."
          multiple={true}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-amber-200 font-medium rounded-lg transition-colors border border-zinc-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-amber-900 hover:bg-amber-800 text-amber-50 font-medium rounded-lg transition-colors border border-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Saving...'
            : mode === 'create'
              ? 'Add Book'
              : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
