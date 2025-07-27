import { useEffect, useRef, useState } from 'react'

export function useParallaxScroll(speed: number = 0.5) {
  const [offset, setOffset] = useState(0)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return

      const rect = elementRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Only apply the effect when the element is in view
      if (rect.bottom >= 0 && rect.top <= windowHeight) {
        // Simple calculation: when element is at top of screen, offset is negative
        // when element is at bottom of screen, offset is positive
        const elementTop = rect.top
        const scrollProgress = (windowHeight - elementTop) / windowHeight
        
        // Create a range from -30 to +30 pixels based on element position
        const parallaxOffset = (scrollProgress - 0.5) * 60 * speed
        setOffset(Math.max(-30, Math.min(30, parallaxOffset)))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [speed])

  return { offset, elementRef }
}
