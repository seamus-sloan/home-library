import { StarIcon } from 'lucide-react'
import { useState } from 'react'
import type { BookRating } from '../../types'

interface InteractiveRatingProps {
  ratings: BookRating[]
  currentUserId: number
  onRatingChange: (rating: number) => void
}

export function InteractiveRating({
  ratings,
  currentUserId,
  onRatingChange,
}: InteractiveRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  // Find current user's rating
  const currentUserRating = ratings.find(r => r.user_id === currentUserId)
  const displayRating = hoveredRating ?? currentUserRating?.rating ?? 0

  const handleClick = (
    starValue: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    // Determine if left half or right half was clicked
    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const isLeftHalf = clickX < rect.width / 2
    const finalRating = isLeftHalf ? starValue - 0.5 : starValue
    onRatingChange(finalRating)
  }

  const handleHover = (
    starValue: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    // Determine if hovering over left half or right half
    const rect = event.currentTarget.getBoundingClientRect()
    const hoverX = event.clientX - rect.left
    const isLeftHalf = hoverX < rect.width / 2
    const finalRating = isLeftHalf ? starValue - 0.5 : starValue
    setHoveredRating(finalRating)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1
          const isFullStar = displayRating >= starValue
          const isHalfStar =
            displayRating >= starValue - 0.5 && displayRating < starValue

          return (
            <button
              key={index}
              type="button"
              onClick={e => handleClick(starValue, e)}
              onMouseMove={e => handleHover(starValue, e)}
              onMouseLeave={() => setHoveredRating(null)}
              className="cursor-pointer transition-all hover:scale-125 active:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-900 rounded p-0.5"
              aria-label={`Rate ${starValue} stars`}
            >
              {isHalfStar ? (
                <div className="relative">
                  <StarIcon size={24} className="text-amber-600" fill="none" />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: '50%' }}
                  >
                    <StarIcon
                      size={24}
                      className="text-amber-400"
                      fill="currentColor"
                    />
                  </div>
                </div>
              ) : (
                <StarIcon
                  size={24}
                  className={isFullStar ? 'text-amber-400' : 'text-amber-600'}
                  fill={isFullStar ? 'currentColor' : 'none'}
                />
              )}
            </button>
          )
        })}
      </div>
      {displayRating > 0 && (
        <span className="ml-1 text-amber-200 font-medium text-sm">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
