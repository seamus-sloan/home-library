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
    console.log('useScrollRestoration: Effect running for route:', routeKey)
    console.log('useScrollRestoration: location.state =', location.state)
    
    // Try to restore from location state first
    if (location.state?.scrollPosition !== undefined) {
      console.log('Restoring from location.state, scroll position:', location.state.scrollPosition)
      
      // Wait for content to load, then restore scroll position
      const restoreScroll = () => {
        const maxAttempts = 10
        let attempts = 0
        
        const tryRestore = () => {
          attempts++
          // Check if page has content (document height > window height typically means content loaded)
          if (document.body.scrollHeight > window.innerHeight || attempts >= maxAttempts) {
            window.scrollTo(0, location.state.scrollPosition)
            console.log('Scrolled to:', location.state.scrollPosition, 'Current scroll:', window.scrollY)
          } else {
            // Try again in 50ms
            setTimeout(tryRestore, 50)
          }
        }
        
        tryRestore()
      }
      
      // Start trying to restore after a small delay
      setTimeout(restoreScroll, 100)
    } else {
      // Try to restore from sessionStorage as fallback
      const savedScrollPosition = sessionStorage.getItem(`scroll-${routeKey}`)
      if (savedScrollPosition) {
        const scrollPos = parseInt(savedScrollPosition, 10)
        console.log('Restoring from sessionStorage, scroll position:', scrollPos)
        
        setTimeout(() => {
          window.scrollTo(0, scrollPos)
          console.log('Scrolled to:', scrollPos, 'Current scroll:', window.scrollY)
        }, 100)
      }
    }
  }, [routeKey, location.state?.scrollPosition])

  // Function to navigate while storing current scroll position
  const navigateWithScrollState = (to: string, options?: { replace?: boolean }) => {
    const currentScrollPosition = window.scrollY
    console.log('Storing scroll position:', currentScrollPosition, 'before navigating to:', to)
    
    // Store in sessionStorage as backup
    sessionStorage.setItem(`scroll-${routeKey}`, currentScrollPosition.toString())
    
    navigate(to, {
      ...options,
      state: { scrollPosition: currentScrollPosition }
    })
  }

  return { navigateWithScrollState }
}
