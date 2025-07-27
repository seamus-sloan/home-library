import React, { createContext, useContext, useEffect, useState } from 'react'

export interface User {
  id: number
  name: string
  color: string
}

interface UserContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  logout: () => void
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => { },
  logout: () => { },
})

export const useUser = () => useContext(UserContext)

export const UserProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Initialize from localStorage on app start
    const stored = localStorage.getItem('currentUser')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  const logout = () => {
    setCurrentUser(null)
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
