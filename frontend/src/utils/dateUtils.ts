/**
 * Parse a date string from the backend (which is in UTC format "YYYY-MM-DD HH:MM:SS")
 * and convert it to a proper Date object in the user's local timezone
 */
const parseUTCDate = (dateString: string): Date => {
  // Backend sends dates in format "2025-11-01 01:29:58" which is UTC
  // Convert to ISO 8601 format by replacing space with 'T' and adding 'Z' for UTC
  const isoString = dateString.replace(' ', 'T') + 'Z'
  return new Date(isoString)
}

/**
 * Format a date string to a user-friendly relative or absolute format
 * @param dateString - Date string from backend in UTC format ("YYYY-MM-DD HH:MM:SS")
 * @param lowercase - Whether to lowercase "Just now" to "just now" (only affects the immediate timeframe; other formats already start lowercase)
 * @returns Formatted date string, or 'Invalid date' if the input is invalid
 */
export const formatRelativeDate = (
  dateString: string,
  lowercase: boolean = false
): string => {
  const date = parseUTCDate(dateString)

  // Validate date
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  // Handle future dates
  if (diffMs < 0) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

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
 * @param dateString - Date string from backend in UTC format ("YYYY-MM-DD HH:MM:SS")
 * @returns Formatted date string, or 'Invalid date' if the input is invalid
 */
export const formatShortDate = (dateString: string): string => {
  const date = parseUTCDate(dateString)

  // Validate date
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date string to a long format with time (e.g., "October 29, 2025 at 02:43 AM")
 * @param dateString - Date string from backend in UTC format ("YYYY-MM-DD HH:MM:SS")
 * @returns Formatted date string, or 'Invalid date' if the input is invalid
 */
export const formatLongDate = (dateString: string): string => {
  const date = parseUTCDate(dateString)

  // Validate date
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  // Use toLocaleString instead of toLocaleDateString to include time
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
