import { XIcon } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useAddJournalEntryMutation } from '../../middleware/backend'
import type { RootState } from '../../store/store'
import { UserAvatar } from '../common/UserAvatar'
interface AddJournalFormProps {
  bookId: number,
  onSubmit: () => void
  onCancel: () => void
}
export function AddJournalForm({ bookId, onSubmit, onCancel }: AddJournalFormProps) {
  const [formData, setFormData] = useState({
    content: '',
  })
  const [errors, setErrors] = useState({
    content: '',
  })
  const currentUser = useSelector((state: RootState) => state.user.currentUser)
  const [addJournalEntry] = useAddJournalEntryMutation()


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
      // title: formData.title ? '' : 'Journal title is required',
      content: formData.content ? '' : 'Journal entry cannot be empty',
    }
    setErrors(newErrors)

    // Do not submit if there are any errors
    if (newErrors.content) {
      return
    }

    try {
      await addJournalEntry({
        bookId,
        entry: {
          user_id: currentUser?.id || null,
          title: "", // Removing title for now
          content: formData.content,
        },
      }).unwrap()

      setFormData({
        content: '',
      })
      onSubmit()
    } catch (error) {
      console.error('Error adding journal entry:', error)
      setErrors({
        content: error instanceof Error ? error.message : 'Failed to save journal entry',
      })
    }
  }

  if (!currentUser) return null
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={{
            id: currentUser.id,
            name: currentUser.name,
            color: currentUser.color
          }} size="sm" />
          <h4 className="text-lg font-medium text-amber-50">New Journal Entry</h4>
        </div>
        <button
          onClick={onCancel}
          className="text-amber-400 hover:text-amber-200"
          aria-label="Close"
        >
          <XIcon size={18} />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        {/* Having a journal title seems superfluous at the moment... */}
        {/* <div className="mb-4">
          <textarea
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-zinc-800 border rounded-md text-amber-50 min-h-[150px] ${errors.title ? 'border-red-500' : 'border-zinc-700'}`}
            placeholder="Name your journal entry..."
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
        </div> */}
        <div className="mb-4">
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-zinc-800 border rounded-md text-amber-50 min-h-[150px] ${errors.content ? 'border-red-500' : 'border-zinc-700'}`}
            placeholder="Write your thoughts about this book..."
          />
          {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content}</p>}
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors text-amber-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-900/40 text-amber-100 rounded-md hover:bg-amber-800/50 transition-colors border border-amber-700/30"
          >
            Save Entry
          </button>
        </div>
      </form>
    </div>
  )

  // return (
  //   <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md">
  //     <div className="flex justify-between items-center mb-4">
  //       <h4 className="text-lg font-medium text-white">New Journal Entry</h4>
  //       <button
  //         onClick={onCancel}
  //         className="text-gray-400 hover:text-gray-200"
  //         aria-label="Close"
  //       >
  //         <XIcon size={18} />
  //       </button>
  //     </div>
  //     <form onSubmit={handleSubmit}>
  //       <div className="mb-4">
  //         <textarea
  //           name="title"
  //           value={formData.title}
  //           onChange={handleChange}
  //           className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white min-h-[150px] ${errors.title? 'border-red-500' : 'border-gray-600'}`}
  //           placeholder="Name your journal entry..."
  //         />
  //         {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
  //       </div>
  //       <div className="mb-4">
  //         <textarea
  //           name="content"
  //           value={formData.content}
  //           onChange={handleChange}
  //           className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white min-h-[150px] ${errors.content ? 'border-red-500' : 'border-gray-600'}`}
  //           placeholder="Write your thoughts about this book..."
  //         />
  //         {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content}</p>}
  //       </div>
  //       <div className="flex justify-end gap-3">
  //         <button
  //           type="button"
  //           onClick={onCancel}
  //           className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors text-gray-300"
  //         >
  //           Cancel
  //         </button>
  //         <button
  //           type="submit"
  //           className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
  //         >
  //           Save Entry
  //         </button>
  //       </div>
  //     </form>
  //   </div>
  // )
}
