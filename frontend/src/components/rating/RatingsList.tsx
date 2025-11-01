import { StarIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import type { BookRating } from '../../types'
import { formatRelativeDate } from '../../utils/dateUtils'

interface RatingsListProps {
    ratings: BookRating[]
    currentUserId?: number
    onRatingChange?: (rating: number) => void
    onRatingDelete?: () => void
}

export function RatingsList({ ratings, currentUserId, onRatingChange, onRatingDelete }: RatingsListProps) {
    const [hoveredRatingId, setHoveredRatingId] = useState<number | null>(null)
    const [hoveredStarValue, setHoveredStarValue] = useState<number | null>(null)

    if (ratings.length === 0) {
        return (
            <div className="text-amber-400 text-center py-4">
                No ratings yet
            </div>
        )
    }

    // Sort ratings by user_id ascending (alphabetically by user)
    const sortedRatings = [...ratings].sort((a, b) => a.user_id - b.user_id)

    const handleStarClick = (ratingId: number, starValue: number, event: React.MouseEvent<HTMLButtonElement>) => {
        if (onRatingChange && currentUserId) {
            const rating = sortedRatings.find(r => r.id === ratingId)
            if (rating && rating.user_id === currentUserId) {
                // Determine if left half or right half was clicked
                const rect = event.currentTarget.getBoundingClientRect()
                const clickX = event.clientX - rect.left
                const isLeftHalf = clickX < rect.width / 2
                const finalRating = isLeftHalf ? starValue - 0.5 : starValue
                onRatingChange(finalRating)
            }
        }
    }

    const handleStarHover = (ratingId: number, starValue: number, event: React.MouseEvent<HTMLButtonElement>) => {
        // Determine if hovering over left half or right half
        const rect = event.currentTarget.getBoundingClientRect()
        const hoverX = event.clientX - rect.left
        const isLeftHalf = hoverX < rect.width / 2
        const finalRating = isLeftHalf ? starValue - 0.5 : starValue

        setHoveredRatingId(ratingId)
        setHoveredStarValue(finalRating)
    }

    return (
        <div className="space-y-3">
            {sortedRatings.map((rating) => {
                const isCurrentUser = currentUserId === rating.user_id
                const isHovered = hoveredRatingId === rating.id
                const displayRating = isHovered && hoveredStarValue !== null ? hoveredStarValue : rating.rating

                return (
                    <div
                        key={rating.id}
                        className={`bg-zinc-900 p-3 md:p-4 rounded-lg border shadow-sm ${isCurrentUser ? 'border-amber-700/50 bg-amber-950/20' : 'border-zinc-800'
                            }`}
                    >
                        <div className="flex items-start md:items-center gap-3">
                            {/* User Avatar Circle */}
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0"
                                style={{ backgroundColor: rating.user.color }}
                                title={rating.user.name}
                            >
                                {rating.user.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Rating Content */}
                            <div className="flex-grow min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                    <span className="text-amber-200 font-medium truncate">
                                        {rating.user.name}
                                        {isCurrentUser && <span className="text-amber-600 text-xs ml-1">(You)</span>}
                                    </span>
                                    <span className="text-amber-600 hidden md:inline">·</span>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {Array.from({ length: 5 }).map((_, index) => {
                                            const starValue = index + 1
                                            const isFullStar = displayRating >= starValue
                                            const isHalfStar = displayRating >= starValue - 0.5 && displayRating < starValue

                                            const starContent = (
                                                <div key={index} className="relative">
                                                    {isHalfStar ? (
                                                        <>
                                                            {/* Half star implementation */}
                                                            <StarIcon
                                                                size={18}
                                                                className="text-amber-600"
                                                                fill="none"
                                                            />
                                                            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                                                                <StarIcon
                                                                    size={18}
                                                                    className="text-amber-400"
                                                                    fill="currentColor"
                                                                />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <StarIcon
                                                            size={18}
                                                            className={isFullStar ? 'text-amber-400' : 'text-amber-600'}
                                                            fill={isFullStar ? 'currentColor' : 'none'}
                                                        />
                                                    )}
                                                </div>
                                            )

                                            // Make stars clickable only for current user
                                            if (isCurrentUser && onRatingChange) {
                                                return (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={(e) => handleStarClick(rating.id, starValue, e)}
                                                        onMouseMove={(e) => handleStarHover(rating.id, starValue, e)}
                                                        onMouseLeave={() => {
                                                            setHoveredRatingId(null)
                                                            setHoveredStarValue(null)
                                                        }}
                                                        className="cursor-pointer transition-all hover:scale-125 active:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-900 rounded p-0.5"
                                                        aria-label={`Rate ${starValue} stars`}
                                                    >
                                                        {starContent}
                                                    </button>
                                                )
                                            }

                                            return starContent
                                        })}
                                        <span className="ml-1 text-amber-200 font-medium">{displayRating.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-amber-600 mt-1">
                                    {formatRelativeDate(rating.created_at)}
                                </div>
                            </div>

                            {/* Delete Button - Only for current user */}
                            {isCurrentUser && onRatingDelete && (
                                <button
                                    type="button"
                                    onClick={onRatingDelete}
                                    className="text-amber-600 hover:text-amber-400 transition-colors p-2 rounded hover:bg-amber-950/30 focus:outline-none focus:ring-2 focus:ring-amber-400 flex-shrink-0"
                                    aria-label="Delete rating"
                                    title="Delete your rating"
                                >
                                    <XIcon size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
