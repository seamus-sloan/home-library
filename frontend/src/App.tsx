import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { BookList } from './components/book/BookList'
import { AddBookForm } from './components/forms/AddBookForm'
import { Header } from './components/layout/Header'
import { BookDetails } from './pages/BookDetailsPage'
import { LoginPage } from './pages/LoginPage'
import type { RootState } from './store/store'
import type { JournalEntry } from './types'

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

  return (
    <div className="min-h-screen bg-black text-amber-50">
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
                <BookDetails addJournal={addJournal} />
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
  // Disable browser's automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
