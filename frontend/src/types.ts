export interface Book {
  user_id: number | null
  id: number
  cover_image: string | null
  title: string
  author: string
  rating: number | null
  series: string | null
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  user_id: number | null
  id: number 
  book_id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  user_id: number | null
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface Genre {
  id: number
  user_id: number | null
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface User {
  id: number,
  name: string,
  color: string,
  created_at: string,
  updated_at: string,
}

// Simplified user for avatars and display
export interface UserProfile {
  id: number
  name: string
  color: string
}

// New types for the enhanced API response
export interface BookTag {
  id: number
  name: string
  color: string
}

export interface BookGenre {
  id: number
  name: string
  color: string
}

export interface JournalUser {
  id: number
  name: string
  color: string
}

export interface BookJournal {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  user: JournalUser
}

export interface RatingUser {
  id: number
  name: string
  color: string
}

export interface BookRating {
  id: number
  user_id: number
  book_id: number
  rating: number
  created_at: string
  updated_at: string
  user: RatingUser
}

export const ReadingStatus = {
  UNREAD: 0,
  READ: 1,
  READING: 2,
  TBR: 3,
  DNF: 99,
} as const

export type ReadingStatusValue = typeof ReadingStatus[keyof typeof ReadingStatus]

export const ReadingStatusLabels: Record<ReadingStatusValue, string> = {
  [ReadingStatus.UNREAD]: 'Unread',
  [ReadingStatus.READ]: 'Read',
  [ReadingStatus.READING]: 'Reading',
  [ReadingStatus.TBR]: 'To Be Read',
  [ReadingStatus.DNF]: 'Did Not Finish',
}

export interface StatusUser {
  id: number
  name: string
  color: string
}

export interface BookStatus {
  id: number
  user_id: number
  book_id: number
  status_id: number
  status_name: string
  created_at: string
  updated_at: string
  user: StatusUser
}

export interface BookWithDetails extends Book {
  tags: BookTag[]
  genres: BookGenre[]
  journals: BookJournal[]
  ratings: BookRating[]
  statuses: BookStatus[]
  current_user_status: number | null
}

export interface CreateBookRequest {
  user_id: number | null
  cover_image: string | null
  title: string
  author: string
  rating: number | null
  series?: string | null
  created_at: string
  updated_at: string
  tags?: number[]
  genres?: number[]
}

export interface UpdateBookRequest {
  cover_image?: string | null
  title?: string
  author?: string
  rating?: number | null
  series?: string | null
  tags?: number[]
  genres?: number[]
}