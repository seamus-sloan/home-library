/**
 * Converts a hex color to RGB format
 */
export const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return hex
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Converts a hex color to RGBA format with opacity
 */
export const hexToRgba = (hex: string, opacity: number): string => {
  // Remove # if present
  hex = hex.replace('#', '')

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Determines if a color is very dark and needs a white border/text
 */
export const isDarkColor = (hexColor: string): boolean => {
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
    return false
  }

  // Convert to RGB
  const r = parseInt(colorValue.substring(0, 2), 16)
  const g = parseInt(colorValue.substring(2, 4), 16)
  const b = parseInt(colorValue.substring(4, 6), 16)

  // Check if parsing was successful
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return false
  }

  // Calculate relative luminance
  const toLinear = (colorValue: number) => {
    const c = colorValue / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }

  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)

  // Return true for very dark colors (luminance < 0.2)
  return luminance < 0.2
}
