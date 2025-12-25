import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Custom hook for scroll position restoration
 * Stores scroll position when navigating away and restores it when returning
 */
export function useScrollRestoration() {
  const location = useLocation()
  const navigate = useNavigate()

  // Create a unique key for this route
  const routeKey = location.pathname + location.search

  // Restore scroll position when component mounts
  useEffect(() => {
    // Only restore scroll position if we have state (coming from navigation, not refresh)
    if (location.state?.scrollPosition !== undefined) {
      // Wait for content to load, then restore scroll position
      const restoreScroll = () => {
        const maxAttempts = 10
        let attempts = 0

        const tryRestore = () => {
          attempts++
          // Check if page has content (document height > window height typically means content loaded)
          if (
            document.body.scrollHeight > window.innerHeight ||
            attempts >= maxAttempts
          ) {
            window.scrollTo(0, location.state.scrollPosition)
          } else {
            // Try again in 50ms
            setTimeout(tryRestore, 50)
          }
        }

        tryRestore()
      }

      // Start trying to restore after a small delay
      setTimeout(restoreScroll, 100)
    }
  }, [routeKey, location.state?.scrollPosition])

  // Function to navigate while storing current scroll position
  const navigateWithScrollState = (
    to: string,
    options?: { replace?: boolean }
  ) => {
    const currentScrollPosition = window.scrollY

    navigate(to, {
      ...options,
      state: { scrollPosition: currentScrollPosition },
    })
  }

  return { navigateWithScrollState }
}
