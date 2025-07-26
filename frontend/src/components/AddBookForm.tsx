import { ArrowLeftIcon } from 'lucide-react'
import React, { useState } from 'react'
import { useUser } from '../contexts/UserContext'
import type { Tag } from '../types'
import { TagSearch } from './TagSearch'

interface AddBookFormProps {
  onSubmit: (book: {
    title: string
    author: string
    genre: string
    cover_image: string
    tags?: Tag[]
  }) => void
  onCancel: () => void
}
export function AddBookForm({ onSubmit, onCancel }: AddBookFormProps) {
  const { currentUser } = useUser()
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    cover_image: '',
  })
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [errors, setErrors] = useState({
    title: '',
    author: '',
  })
  const [, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate form
    const newErrors = {
      title: formData.title ? '' : 'Title is required',
      author: formData.author ? '' : 'Author is required',
    }
    setErrors(newErrors)

    // Do not submit if there are any errors
    if (newErrors.title || newErrors.author) {
      return
    }

    try {
      setIsSubmitting(true)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (currentUser) {
        headers['currentUserId'] = currentUser.id.toString()
      }

      const response = await fetch('/books', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          genre: formData.genre,
          cover_image: formData.cover_image,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add book')
      }

      const newBook = await response.json()
      onSubmit({ ...newBook, tags: selectedTags })

    } catch (error) {
      console.error('Error adding book:', error)
      setErrors({
        title: '',
        author: error instanceof Error ? error.message : 'Failed to save book',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={onCancel}
          className="mr-4 text-gray-400 hover:text-gray-200"
          aria-label="Go back"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-white">Add New Book</h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto border border-gray-700"
      >
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-gray-200 font-medium mb-2"
          >
            Book Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white ${errors.title ? 'border-red-500' : 'border-gray-600'}`}
            placeholder="Enter book title"
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1">{errors.title}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="author"
            className="block text-gray-200 font-medium mb-2"
          >
            Author <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white ${errors.author ? 'border-red-500' : 'border-gray-600'}`}
            placeholder="Enter author name"
          />
          {errors.author && (
            <p className="text-red-400 text-sm mt-1">{errors.author}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="genre"
            className="block text-gray-200 font-medium mb-2"
          >
            Genre
          </label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          >
            <option value="">Select a genre</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-fiction">Non-fiction</option>
            <option value="Science Fiction">Science Fiction</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Mystery">Mystery</option>
            <option value="Thriller">Thriller</option>
            <option value="Romance">Romance</option>
            <option value="Biography">Biography</option>
            <option value="History">History</option>
            <option value="Self-Help">Self-Help</option>
          </select>
        </div>
        <div className="mb-6">
          <label
            htmlFor="cover_image"
            className="block text-gray-200 font-medium mb-2"
          >
            Cover Image URL
          </label>
          <input
            type="url"
            id="cover_image"
            name="cover_image"
            value={formData.cover_image}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            placeholder="https://example.com/book-cover.jpg"
          />
          <p className="text-gray-400 text-sm mt-1">
            Leave blank to use a default cover
          </p>
        </div>
        <div className="mb-6">
          <label className="block text-gray-200 font-medium mb-2">
            Tags
          </label>
          <TagSearch
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            placeholder="Search and select tags for this book..."
            multiple={true}
          />
          <p className="text-gray-400 text-sm mt-1">
            Add tags to help categorize and find this book later
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors text-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Add Book
          </button>
        </div>
      </form>
    </div>
  )
}
