import type { ReactNode } from 'react'
import { isDarkColor } from '../../utils/colorUtils'

export interface CategoryBadgeProps {
    /** The category/tag/genre object with id, name, and color */
    item: {
        id: number
        name: string
        color: string
    }
    /** The type of category - affects styling behavior */
    type?: 'genre' | 'tag'
    /** Size variant of the badge */
    size?: 'sm' | 'md'
    /** Whether the badge is clickable */
    clickable?: boolean
    /** Click handler */
    onClick?: () => void
    /** Additional icon to display */
    icon?: ReactNode
    /** Remove button functionality */
    onRemove?: () => void
    /** Additional CSS classes */
    className?: string
}

/**
 * Get contrasting text color for a given background color
 */
function getContrastColor(hexColor: string): string {
    // Remove # if present
    const color = hexColor.replace('#', '')

    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16)
    const g = parseInt(color.substring(2, 4), 16)
    const b = parseInt(color.substring(4, 6), 16)

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Use a lower threshold so more colors get white text (like lime green)
    return luminance > 0.7 ? '#000000' : '#ffffff'
}

/**
 * A reusable badge component for displaying categories (genres, tags, etc.)
 * with consistent styling that handles both light and dark colors properly.
 */
export function CategoryBadge({
    item,
    type = 'genre',
    size = 'sm',
    clickable = false,
    onClick,
    icon,
    onRemove,
    className = ''
}: CategoryBadgeProps) {
    // Determine the styling based on color and type
    const getDisplayStyle = () => {
        if (type === 'tag') {
            // Tags use solid background with contrasting text
            const textColor = getContrastColor(item.color)
            // Only show white border for very dark backgrounds (like black)
            const isVeryDark = isDarkColor(item.color) && item.color.toLowerCase() === '#000000' || item.color.toLowerCase() === '#000'
            return {
                backgroundColor: item.color,
                color: textColor,
                borderColor: isVeryDark ? '#ffffff' : 'transparent'
            }
        } else {
            // Genres use different logic for dark vs light colors
            return isDarkColor(item.color)
                ? {
                    backgroundColor: item.color,
                    color: '#ffffff',
                    borderColor: '#ffffff'
                }
                : {
                    backgroundColor: `${item.color}20`,
                    borderColor: `${item.color}50`,
                    color: item.color
                }
        }
    }

    // Size-based classes
    const sizeClasses = size === 'md'
        ? 'px-3 py-1.5 text-sm'
        : 'px-2 py-1 text-xs'

    // Base classes
    const baseClasses = `inline-flex items-center rounded-full border font-medium ${sizeClasses}`

    // Clickable classes
    const interactionClasses = clickable
        ? 'cursor-pointer hover:opacity-80 shadow-sm'
        : ''

    // Combine all classes
    const finalClasses = `${baseClasses} ${interactionClasses} ${className}`.trim()

    const displayStyle = getDisplayStyle()

    return (
        <span
            className={finalClasses}
            style={displayStyle}
            onClick={clickable ? onClick : undefined}
        >
            {icon && <span className="mr-1.5">{icon}</span>}
            {item.name}
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove()
                    }}
                    className="ml-1.5 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                    style={{ color: displayStyle.color }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}
        </span>
    )
}
