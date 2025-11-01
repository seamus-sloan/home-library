/**
 * Format a date string to a user-friendly relative or absolute format
 * @param dateString - ISO date string to format
 * @param lowercase - Whether to lowercase the first character (for use in sentences like "Last updated just now")
 * @returns Formatted date string
 */
export const formatRelativeDate = (dateString: string, lowercase: boolean = false): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    let result: string

    // Less than 1 hour: show minutes
    if (diffMins < 60) {
        if (diffMins < 1) {
            result = lowercase ? 'just now' : 'Just now'
        } else {
            result = `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
        }
    }
    // Less than 24 hours: show hours
    else if (diffHours < 24) {
        result = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    }
    // Less than 7 days: show days
    else if (diffDays < 7) {
        result = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    }
    // Older: show full date without time (keep proper capitalization for month names)
    else {
        result = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return result
}

/**
 * Format a date string to a short format (e.g., "Oct 29, 2025")
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

/**
 * Format a date string to a long format with time (e.g., "October 29, 2025 at 02:43 AM")
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export const formatLongDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}
