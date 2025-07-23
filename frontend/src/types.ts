export interface Book {
  user_id: number | null
  id: number
  cover_image: string | null
  title: string
  author: string
  genre: string
  rating: number
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