import { ChevronDownIcon, FilterIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface BookFilterProps {
  isOpen: boolean
  onToggle: () => void
  selectedGenre: string
  onGenreChange: (genre: string) => void
  selectedRating: number | null
  onRatingChange: (rating: number | null) => void
  selectedTag: string
  onTagChange: (tag: string) => void
  genres: string[]
  ratings: number[]
  tags: string[]
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function BookFilter({
  isOpen,
  onToggle,
  selectedGenre,
  onGenreChange,
  selectedRating,
  onRatingChange,
  selectedTag,
  onTagChange,
  genres,
  ratings,
  tags,
  onClearFilters,
  hasActiveFilters,
}: BookFilterProps) {
  const filterRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Click outside handler to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onToggle()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onToggle])

  return (
    <div className="flex flex-col items-end gap-3">
      {/* Filter Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={onToggle}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-amber-200 hover:border-amber-600/50 transition-colors"
        >
          <FilterIcon size={18} />
          <span>Filter</span>
          <ChevronDownIcon
            size={16}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Filter Dropdown */}
        {isOpen && (
          <div
            className="absolute top-full right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-10 p-4"
            ref={filterRef}
          >
            <div className="space-y-4">
              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">
                  Genre
                </label>
                <select
                  value={selectedGenre}
                  onChange={e => onGenreChange(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-amber-600/50"
                >
                  <option value="">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">
                  Rating
                </label>
                <select
                  value={selectedRating || ''}
                  onChange={e =>
                    onRatingChange(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-amber-600/50"
                >
                  <option value="">All Ratings</option>
                  {ratings.map(rating => (
                    <option key={rating} value={rating}>
                      {rating} Stars
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">
                  Tags
                </label>
                <select
                  value={selectedTag || ''}
                  onChange={e => onTagChange(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-amber-600/50"
                >
                  <option value="">All Tags</option>
                  {tags.map(tag => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters and Clear Button Row */}
      {hasActiveFilters && (
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Active Filters Display */}
          <div className="flex items-center gap-2 text-sm text-amber-300">
            <span className="hidden sm:inline">Active:</span>
            {selectedGenre && (
              <span className="px-2 py-1 bg-amber-900/40 text-amber-200 rounded border border-amber-700/30">
                {selectedGenre}
              </span>
            )}
            {selectedRating !== null && (
              <span className="px-2 py-1 bg-amber-900/40 text-amber-200 rounded border border-amber-700/30">
                {selectedRating} Stars
              </span>
            )}
            {selectedTag && (
              <span className="px-2 py-1 bg-amber-900/40 text-amber-200 rounded border border-amber-700/30">
                {selectedTag}
              </span>
            )}
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={onClearFilters}
            className="px-3 py-2 bg-amber-900/40 text-amber-100 rounded-md hover:bg-amber-800/50 transition-colors border border-amber-700/30 text-sm whitespace-nowrap"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
