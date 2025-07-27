export interface Book {
  user_id: number | null
  id: number
  cover_image: string | null
  title: string
  author: string
  genre: string
  rating: number | null
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

export interface User {
  id: number,
  name: string,
  avatar_color: string,
  created_at: string,
  updated_at: string,
}

// New types for the enhanced API response
export interface BookTag {
  id: number
  name: string
  color: string
}

export interface JournalUser {
  id: number
  name: string
  avatar_color: string
}

export interface BookJournal {
  id: number
  title: string
  content: string
  user: JournalUser
  created_at: string
}

export interface BookWithDetails {
  id: number
  user_id: number
  cover_image: string | null
  title: string
  author: string
  genre: string
  rating: number | null
  created_at: string
  updated_at: string
  tags: BookTag[]
  journals: BookJournal[]
}

export interface UpdateBookRequest {
  cover_image?: string | null
  title?: string
  author?: string
  genre?: string
  rating?: number | null
  tags?: number[]
}