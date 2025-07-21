import React, { useState } from 'react'
import { XIcon } from 'lucide-react'
interface AddJournalFormProps {
  onSubmit: (content: string) => void
  onCancel: () => void
}
export function AddJournalForm({ onSubmit, onCancel }: AddJournalFormProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('Journal entry cannot be empty')
      return
    }
    onSubmit(content)
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
            value={content}
            onChange={e => {
              setContent(e.target.value)
              if (error) setError('')
            }}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white min-h-[150px] ${error ? 'border-red-500' : 'border-gray-600'}`}
            placeholder="Write your thoughts about this book..."
          />
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
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
