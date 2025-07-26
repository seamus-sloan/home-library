import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AddBookForm } from './components/AddBookForm'
import { BookDetails } from './components/BookDetails'
import { BookList } from './components/BookList'
import { Header } from './components/Header'
import { LoginPage } from './components/LoginPage'
import type { RootState } from './store/store'
import type { Book, JournalEntry } from './types'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser)
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  return currentUser ? <>{children}</> : null
}

function AppContent() {
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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header onAddClick={() => setIsAddingBook(true)} />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              isAddingBook ? (
                <ProtectedRoute>
                  <AddBookForm
                    onSubmit={() => {
                      setIsAddingBook(false)
                    }}
                    onCancel={() => setIsAddingBook(false)}
                  />
                </ProtectedRoute>
              ) : (
                <ProtectedRoute>
                  <BookList />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute>
                <BookDetails updateBook={updateBook} addJournal={addJournal} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>

  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
