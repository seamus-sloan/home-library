import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { XIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAddJournalEntryMutation, useUpdateJournalEntryMutation } from '../../middleware/backend'
import type { RootState } from '../../store/store'
import type { JournalEntry } from '../../types'
import { UserAvatar } from '../common/UserAvatar'
import './editor-styles.css'

interface JournalFormProps {
  bookId: number
  journal?: JournalEntry // If provided, we're editing; otherwise, creating
  onSubmit: () => void
  onCancel: () => void
}

export function JournalForm({ bookId, journal, onSubmit, onCancel }: JournalFormProps) {
  const isEditing = !!journal

  const [errors, setErrors] = useState({
    content: '',
  })
  const currentUser = useSelector((state: RootState) => state.user.currentUser)
  const [addJournalEntry] = useAddJournalEntryMutation()
  const [updateJournalEntry] = useUpdateJournalEntryMutation()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your thoughts about this book...',
      }),
    ],
    content: journal?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-amber prose-invert max-w-none min-h-[150px] px-3 py-2 focus:outline-none',
      },
    },
  })

  // Update editor content when journal prop changes
  useEffect(() => {
    if (journal && editor && !editor.isDestroyed) {
      editor.commands.setContent(journal.content)
    }
  }, [journal, editor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editor) return

    const html = editor.getHTML()
    const isEmpty = editor.isEmpty

    // Validate form
    const newErrors = {
      content: isEmpty ? 'Journal entry cannot be empty' : '',
    }
    setErrors(newErrors)

    // Do not submit if there are any errors
    if (newErrors.content) {
      return
    }

    try {
      if (isEditing && journal) {
        // Update existing journal entry
        await updateJournalEntry({
          bookId,
          id: journal.id,
          entry: {
            content: html,
          },
        }).unwrap()
      } else {
        // Create new journal entry
        await addJournalEntry({
          bookId,
          entry: {
            user_id: currentUser?.id || null,
            title: "", // Title field is not currently used
            content: html,
          },
        }).unwrap()
      }

      editor.commands.clearContent()
      onSubmit()
    } catch (error) {
      console.error('Error saving journal entry:', error)
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
            color: currentUser.color,
            avatar_image: currentUser.avatar_image
          }} size="sm" />
          <h4 className="text-lg font-medium text-amber-50">
            {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
          </h4>
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
        <div className="mb-4">
          <div className={`bg-zinc-900 border rounded-md ${errors.content ? 'border-red-500' : 'border-zinc-700'}`}>
            <EditorContent editor={editor} />
          </div>
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
}
