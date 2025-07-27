import { Clear, Star, StarBorder } from '@mui/icons-material'
import { Rating } from '@mui/material'
import { styled } from '@mui/material/styles'

interface StarRatingProps {
    rating: number | null
    onRatingChange: (rating: number | null) => void
    readonly?: boolean
    size?: 'small' | 'medium' | 'large'
}

// Styled Rating component to match our theme
const StyledRating = styled(Rating)({
    '& .MuiRating-iconFilled': {
        color: '#fbbf24', // amber-400
    },
    '& .MuiRating-iconHover': {
        color: '#f59e0b', // amber-500
    },
    '& .MuiRating-iconEmpty': {
        color: '#52525b', // zinc-600
    },
})

export function StarRating({
    rating,
    onRatingChange,
    readonly = false,
    size = 'medium'
}: StarRatingProps) {
    const handleChange = (_event: React.SyntheticEvent, newValue: number | null) => {
        onRatingChange(newValue)
    }

    const handleClearRating = () => {
        if (readonly) return
        onRatingChange(null)
    }

    return (
        <div className="flex items-center gap-2">
            {readonly && rating === null && (
                <span className="ml-2 text-sm text-zinc-500">
                    No rating
                </span>
            )}

            {/* Clear rating button */}
            {!readonly && rating !== null && rating > 0 && (
                <button
                    type="button"
                    onClick={handleClearRating}
                    className="ml-1 p-1 text-zinc-500 hover:text-red-400 transition-colors duration-200 rounded"
                    title="Clear rating"
                >
                    <Clear fontSize="small" />
                </button>
            )}

            {/* Star rating component */}
            <StyledRating
                value={rating}
                onChange={handleChange}
                precision={0.5}
                size={size}
                readOnly={readonly}
                icon={<Star fontSize="inherit" />}
                emptyIcon={<StarBorder fontSize="inherit" />}
            />

            {!readonly && (
                <span className="ml-2 text-sm text-amber-300">
                    {rating && rating > 0 ? `${rating.toFixed(1)} / 5` : 'No rating'}
                </span>
            )}

            {readonly && rating && rating > 0 && (
                <span className="ml-2 text-sm text-amber-300">
                    {rating.toFixed(1)} / 5
                </span>
            )}
        </div>
    )
}
