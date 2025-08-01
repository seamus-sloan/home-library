import { ArrowLeftIcon } from 'lucide-react'
import { BookForm, type BookFormData } from './BookForm'

interface BookFormPageProps {
    onSubmit: (book: {
        title: string
        author: string
        cover_image: string
        series?: string
        tags?: any[]
        genres?: any[]
    }) => void
    onCancel: () => void
}

export function BookFormPage({ onSubmit, onCancel }: BookFormPageProps) {
    const handleSubmit = async (data: BookFormData) => {
        onSubmit({
            title: data.title,
            author: data.author,
            cover_image: data.cover_image,
            series: data.series,
            tags: data.tags,
            genres: data.genres,
        })
    }

    return (
        <div>
            <div className="flex items-center mb-6">
                <button
                    onClick={onCancel}
                    className="mr-4 text-amber-400 hover:text-amber-200"
                    aria-label="Go back"
                >
                    <ArrowLeftIcon size={20} />
                </button>
                <h2 className="text-2xl font-semibold text-amber-50">Add New Book</h2>
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg shadow-md max-w-2xl mx-auto border border-zinc-800">
                <BookForm
                    mode="create"
                    onSubmit={handleSubmit}
                    onCancel={onCancel}
                />
            </div>
        </div>
    )
}
