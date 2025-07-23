export interface Book {
  id: number
  cover_image: string | null
  title: string
  author: string
  genre: string
  rating: number
}

export interface JournalEntry {
  userId: any
  id: number 
  book_id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}