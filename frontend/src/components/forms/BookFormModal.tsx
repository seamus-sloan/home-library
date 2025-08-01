import { XIcon } from 'lucide-react'
import type { Book, BookWithDetails } from '../../types'
import { BookForm, type BookFormData } from './BookForm'

interface BookFormModalProps {
    book: Book | BookWithDetails
    isOpen: boolean
    onClose: () => void
    onSave: () => void
}

export function BookFormModal({ book, isOpen, onClose, onSave }: BookFormModalProps) {
    const handleSubmit = async (_data: BookFormData) => {
        onSave()
        onClose()
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

                <div className="p-6">
                    <BookForm
                        mode="edit"
                        book={book}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    )
}
