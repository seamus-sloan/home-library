import { XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { User } from '../contexts/UserContext'
import { useUpdateUserMutation } from '../middleware/backend'

interface EditUserModalProps {
    user: User
    isOpen: boolean
    onClose: () => void
    onSuccess: (updatedUser: User) => void
}

export function EditUserModal({ user, isOpen, onClose, onSuccess }: EditUserModalProps) {
    const [updateUser, { isLoading }] = useUpdateUserMutation()
    const [formData, setFormData] = useState({
        name: user.name,
        color: user.color,
    })
    const [errors, setErrors] = useState({
        name: '',
    })

    // Reset form when modal opens/user changes
    useEffect(() => {
        setFormData({
            name: user.name,
            color: user.color,
        })
        setErrors({ name: '' })
    }, [user, isOpen])

    const validateForm = () => {
        const newErrors = { name: '' }

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }

        setErrors(newErrors)
        return !newErrors.name
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            const updatedUser = await updateUser({
                id: user.id,
                user: {
                    name: formData.name.trim(),
                    color: formData.color,
                },
            }).unwrap()

            onSuccess(updatedUser)
            onClose()
        } catch (error) {
            console.error('Failed to update user:', error)
            setErrors({ name: 'Failed to update user. Please try again.' })
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    if (!isOpen) return null

    const modalContent = (
        <div className="fixed inset-0 bg-black/50 z-[9999] overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4">
                <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-zinc-800 my-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-amber-50">Edit Profile</h2>
                        <button
                            onClick={onClose}
                            className="text-amber-400 hover:text-amber-300 transition-colors"
                            disabled={isLoading}
                        >
                            <XIcon size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-amber-200 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-amber-50 placeholder-amber-400/50 focus:outline-none focus:ring-2 transition-colors ${errors.name
                                    ? 'border-red-500 focus:ring-red-500/20'
                                    : 'border-zinc-700 focus:border-amber-500 focus:ring-amber-500/20'
                                    }`}
                                placeholder="Enter your name"
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-amber-200 mb-2">
                                Avatar Color
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    id="color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    className="w-12 h-10 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer"
                                    disabled={isLoading}
                                />
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={handleChange}
                                    name="color"
                                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-amber-50 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:border-amber-500 focus:ring-amber-500/20 transition-colors"
                                    placeholder="#000000"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-zinc-800 text-amber-200 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-amber-900/40 text-amber-100 rounded-lg border border-amber-700/30 hover:bg-amber-800/50 hover:border-amber-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}
