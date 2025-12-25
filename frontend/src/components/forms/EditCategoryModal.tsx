import { BookmarkIcon, TagIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Genre, Tag } from '../../types'
import { isDarkColor } from '../../utils/colorUtils'

type CategoryItem = Tag | Genre

interface EditCategoryModalProps<T extends CategoryItem> {
  item: T
  isOpen: boolean
  onClose: () => void
  onSave: (id: number, name: string, color: string) => Promise<void>
  categoryType: 'tag' | 'genre'
  isLoading?: boolean
}

export function EditCategoryModal<T extends CategoryItem>({
  item,
  isOpen,
  onClose,
  onSave,
  categoryType,
  isLoading = false,
}: EditCategoryModalProps<T>) {
  const [name, setName] = useState(item.name)
  const [color, setColor] = useState(item.color)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    try {
      await onSave(item.id, name.trim(), color)
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to update ${categoryType}`
      )
    }
  }

  const handleClose = () => {
    setName(item.name)
    setColor(item.color)
    setError('')
    onClose()
  }

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Function to determine if we should use black or white text based on background color
  const getContrastColor = (hexColor: string): string => {
    // Remove # if present and ensure we have a valid hex color
    let colorValue = hexColor.replace('#', '')

    // Handle 3-digit hex colors by expanding them
    if (colorValue.length === 3) {
      colorValue = colorValue
        .split('')
        .map(char => char + char)
        .join('')
    }

    // Ensure we have exactly 6 characters
    if (colorValue.length !== 6) {
      return '#000000'
    }

    // Convert to RGB
    const r = parseInt(colorValue.substring(0, 2), 16)
    const g = parseInt(colorValue.substring(2, 4), 16)
    const b = parseInt(colorValue.substring(4, 6), 16)

    // Check if parsing was successful
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return '#000000'
    }

    // Calculate relative luminance
    const toLinear = (colorValue: number) => {
      const c = colorValue / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }

    const luminance =
      0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)

    // Return black for light colors (luminance > 0.5), white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff'
  }

  // Predefined color options
  const colorOptions = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#ec4899', // pink
    '#6b7280', // gray
    '#ffffff', // white
    '#000000', // black
  ]

  const CategoryIcon = categoryType === 'tag' ? TagIcon : BookmarkIcon
  const categoryName = categoryType === 'tag' ? 'tag' : 'genre'

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
      <div
        className="bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 border border-zinc-700"
        onClick={handleModalClick}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-amber-50">
            Edit {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
          </h3>
          <button
            onClick={handleClose}
            className="text-amber-400 hover:text-amber-200"
          >
            <XIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-amber-200 text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value)
                setError('')
              }}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
              placeholder={`Enter ${categoryName} name`}
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-amber-200 text-sm font-medium mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {colorOptions.map(colorOption => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-3 transition-all hover:scale-110 ${
                    color === colorOption
                      ? 'border-amber-400 shadow-lg ring-2 ring-amber-400'
                      : 'border-gray-400 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  title={`Select ${colorOption}`}
                />
              ))}
            </div>
            <p className="text-xs text-amber-400 mb-3">Selected: {color}</p>

            <div className="mb-3">
              <label className="block text-amber-200 text-xs mb-2">
                Preview:
              </label>
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border"
                style={
                  categoryType === 'tag'
                    ? {
                        backgroundColor: color,
                        color: getContrastColor(color),
                        borderColor: isDarkColor(color) ? '#ffffff' : color,
                      }
                    : isDarkColor(color)
                      ? {
                          backgroundColor: color,
                          color: '#ffffff',
                          borderColor: '#ffffff',
                        }
                      : {
                          backgroundColor: `${color}20`,
                          borderColor: `${color}50`,
                          color: color,
                        }
                }
              >
                <CategoryIcon size={12} className="mr-1.5" />
                {name || `Sample ${categoryName}`}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-amber-300 hover:text-amber-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-amber-900/40 text-amber-100 rounded-md hover:bg-amber-800/50 transition-colors border border-amber-700/30 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
