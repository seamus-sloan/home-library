import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { BookList } from './components/book/BookList'
import { BookFormPage } from './components/forms'
import { Header } from './components/layout/Header'
import { BookDetails } from './pages/BookDetailsPage'
import { ListDetailPage } from './pages/ListDetailPage'
import { ListsPage } from './pages/ListsPage'
import { LoginPage } from './pages/LoginPage'
import type { RootState } from './store/store'

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
  const [isAddingBook, setIsAddingBook] = useState(false)

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
                  <BookFormPage
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
                <BookDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lists"
            element={
              <ProtectedRoute>
                <ListsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lists/:id"
            element={
              <ProtectedRoute>
                <ListDetailPage />
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
