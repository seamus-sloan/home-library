import { XIcon } from 'lucide-react'
import React, { useState } from 'react'
interface AddJournalFormProps {
  bookId: number,
  onSubmit: () => void
  onCancel: () => void
}
export function AddJournalForm({ bookId, onSubmit, onCancel }: AddJournalFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })
  const [errors, setErrors] = useState({
    title: '',
    content: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
      title: formData.title ? '' : 'Journal title is required',
      content: formData.content ? '' : 'Journal entry cannot be empty',
    }
    setErrors(newErrors)

    // Do not submit if there are any errors
    if (newErrors.title || newErrors.content) {
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(`/books/${bookId}/journals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to add journal entry: ${response.status}`)
      }

      setFormData({
        title: '',
        content: '',
      })
      onSubmit()
    } 
    catch (error) {
      console.error('Error adding journal entry:', error)
      setErrors({
        title: '',
        content: error instanceof Error ? error.message : 'Failed to save journal entry',
      })
    }
    finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-white">New Journal Entry</h4>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-200"
          aria-label="Close"
        >
          <XIcon size={18} />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white min-h-[150px] ${errors.title? 'border-red-500' : 'border-gray-600'}`}
            placeholder="Name your journal entry..."
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
        </div>
        <div className="mb-4">
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white min-h-[150px] ${errors.content ? 'border-red-500' : 'border-gray-600'}`}
            placeholder="Write your thoughts about this book..."
          />
          {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content}</p>}
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
            Save Entry
          </button>
        </div>
      </form>
    </div>
  )
}
