import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AddBookForm } from './components/AddBookForm'
import { BookDetails } from './components/BookDetails'
import { BookList } from './components/BookList'
import { Header } from './components/Header'
import type { Book, JournalEntry } from './types'

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
