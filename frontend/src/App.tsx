import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AddBookForm } from './components/AddBookForm'
import { BookDetails } from './components/BookDetails'
import { BookList } from './components/BookList'
import { Header } from './components/Header'
export interface Book {
  id: number // Changed from string to number to match backend
  title: string
  author: string
  genre: string
  cover_image: string | null // Changed to allow null and match backend
  rating: number | null // Added rating field to match backend
}
export interface JournalEntry {
  id: number // Changed from string to number
  book_id: number // Changed from bookId to book_id and number type to match backend
  title: string
  content: string
  date: string
}
export function App() {
  const [journals, setJournals] = useState<JournalEntry[]>([])
  const [isAddingBook, setIsAddingBook] = useState(false)

  // Only keep journals in localStorage for now (until we implement journal backend)
  useEffect(() => {
    const savedJournals = localStorage.getItem('journals')
    if (savedJournals) {
      setJournals(JSON.parse(savedJournals))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('journals', JSON.stringify(journals))
  }, [journals])

  const addJournal = (journal: Omit<JournalEntry, 'id'>) => {
    const newJournal = {
      ...journal,
      id: Date.now(),
    }
    setJournals([...journals, newJournal])
  }

  const updateBook = async (book: Book) => {
    // TODO: Implement API call to update book in backend
    console.log('Update book:', book)
  }
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header onAddClick={() => setIsAddingBook(true)} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                isAddingBook ? (
                  <AddBookForm
                    onSubmit={() => {
                      setIsAddingBook(false)
                      // BookList will refetch data automatically
                    }}
                    onCancel={() => setIsAddingBook(false)}
                  />
                ) : (
                  <BookList />
                )
              }
            />
            <Route
              path="/book/:id"
              element={
                <BookDetails updateBook={updateBook} addJournal={addJournal} />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
