import React, { useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
interface AddBookFormProps {
  onSubmit: (book: {
    title: string
    author: string
    genre: string
    cover_image: string
  }) => void
  onCancel: () => void
}
export function AddBookForm({ onSubmit, onCancel }: AddBookFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    cover_image: '',
  })
  const [errors, setErrors] = useState({
    title: '',
    author: '',
  })
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validate form
    const newErrors = {
      title: formData.title ? '' : 'Title is required',
      author: formData.author ? '' : 'Author is required',
    }
    setErrors(newErrors)
    // If no errors, submit the form
    if (!newErrors.title && !newErrors.author) {
      onSubmit(formData)
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
