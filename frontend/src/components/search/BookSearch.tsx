import { SearchIcon } from 'lucide-react'

interface BookSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  resultsCount?: number
  totalCount?: number
}

export function BookSearch({
  searchQuery,
  onSearchChange,
  resultsCount,
  totalCount,
}: BookSearchProps) {
  return (
    <div>
      {/* Search Field */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-amber-400" />
        </div>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-amber-50 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-amber-600/50 transition-colors"
        />
      </div>

      {/* Search Results Info */}
      {searchQuery.trim() &&
        resultsCount !== undefined &&
        totalCount !== undefined &&
        totalCount > 0 && (
          <div className="mt-4 text-amber-300 text-sm">
            Found {resultsCount} book{resultsCount !== 1 ? 's' : ''}
            {resultsCount !== totalCount && ` out of ${totalCount} total`}
          </div>
        )}
    </div>
  )
}
