import { ImageIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { User } from '../../contexts/UserContext'
import { useUpdateUserMutation } from '../../middleware/backend'

interface EditUserModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedUser: User) => void
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const [updateUser, { isLoading }] = useUpdateUserMutation()
  const [formData, setFormData] = useState({
    name: user.name,
    color: user.color,
    avatar_image: user.avatar_image || null,
  })
  const [errors, setErrors] = useState({
    name: '',
    image: '',
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.avatar_image || null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens/user changes
  useEffect(() => {
    setFormData({
      name: user.name,
      color: user.color,
      avatar_image: user.avatar_image || null,
    })
    setPreviewUrl(user.avatar_image || null)
    setErrors({ name: '', image: '' })
  }, [user, isOpen])

  const validateForm = () => {
    const newErrors = { name: '', image: '' }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    setErrors(newErrors)
    return !newErrors.name
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Accept common image types including HEIC
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'image/heif',
    ]
    const isValidType =
      validTypes.includes(file.type.toLowerCase()) ||
      file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|heic|heif)$/i)

    if (!isValidType) {
      setErrors(prev => ({
        ...prev,
        image:
          'Please select a valid image file (JPG, PNG, GIF, WebP, or HEIC)',
      }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        image: 'Image size must be less than 5MB',
      }))
      return
    }

    try {
      // Convert image to JPEG for compatibility
      const base64String = await convertImageToJPEG(file)
      setFormData(prev => ({ ...prev, avatar_image: base64String }))
      setPreviewUrl(base64String)
      setErrors(prev => ({ ...prev, image: '' }))
    } catch (error) {
      console.error('Error processing image:', error)
      setErrors(prev => ({
        ...prev,
        image: 'Failed to process image. Please try a different file.',
      }))
    }
  }

  const convertImageToJPEG = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = event => {
        const img = new Image()
        img.onload = () => {
          // Create canvas to convert image
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          // Resize if too large (max 800x800 to keep file size reasonable)
          let width = img.width
          let height = img.height
          const maxSize = 800

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize
              width = maxSize
            } else {
              width = (width / height) * maxSize
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height

          // Draw and convert to JPEG
          ctx.drawImage(img, 0, 0, width, height)
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.85) // 85% quality
          resolve(jpegDataUrl)
        }

        img.onerror = () => {
          reject(new Error('Failed to load image'))
        }

        img.src = event.target?.result as string
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsDataURL(file)
    })
  }

  const handleDeleteImage = () => {
    setFormData(prev => ({ ...prev, avatar_image: null }))
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
          avatar_image: formData.avatar_image,
        },
      }).unwrap()

      onSuccess(updatedUser)
      onClose()
    } catch (error) {
      console.error('Failed to update user:', error)
      setErrors({ name: 'Failed to update user. Please try again.', image: '' })
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
            <h2 className="text-xl font-semibold text-amber-50">
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className="text-amber-400 hover:text-amber-300 transition-colors"
              disabled={isLoading}
            >
              <XIcon size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-medium text-amber-200 mb-2">
                Profile Picture
              </label>
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="flex-shrink-0">
                  {previewUrl ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-amber-700/30">
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Upload and Delete buttons */}
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="avatar-upload"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 text-amber-200 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImageIcon size={16} />
                    <span>Upload Image</span>
                  </label>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-900/30 text-red-300 rounded-lg border border-red-700/30 hover:bg-red-900/50 transition-colors"
                      disabled={isLoading}
                    >
                      <Trash2Icon size={16} />
                      <span>Remove Image</span>
                    </button>
                  )}
                  <p className="text-xs text-amber-400/70">Max size: 5MB</p>
                </div>
              </div>
              {errors.image && (
                <p className="text-red-400 text-sm mt-2">{errors.image}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-amber-200 mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-amber-50 placeholder-amber-400/50 focus:outline-none focus:ring-2 transition-colors ${
                  errors.name
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
              <label
                htmlFor="color"
                className="block text-sm font-medium text-amber-200 mb-2"
              >
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
