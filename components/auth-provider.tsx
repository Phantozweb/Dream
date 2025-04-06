"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, getCurrentUser, setCurrentUser, hasAIAccess } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  hasAIFeatures: boolean
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  hasAIFeatures: false,
  login: () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load user from localStorage on component mount
    const storedUser = getCurrentUser()
    if (storedUser) {
      setUser(storedUser)
    }
    setIsLoaded(true)
  }, [])

  const login = (user: User) => {
    setUser(user)
    setCurrentUser(user)
  }

  const logout = () => {
    setUser(null)
    setCurrentUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    hasAIFeatures: hasAIAccess(user),
    login,
    logout,
  }

  // Only render children after we've checked localStorage
  if (!isLoaded) {
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

