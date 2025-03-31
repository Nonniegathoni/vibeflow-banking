"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { User } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("vibeflow-user")
    const token = localStorage.getItem("vibeflow-token")

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))

        // Verify token by fetching user profile
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Invalid token")
            }
            return response.json()
          })
          .then((data) => {
            setUser(data.user)
            localStorage.setItem("vibeflow-user", JSON.stringify(data.user))
          })
          .catch((err) => {
            // Token might be invalid or expired
            localStorage.removeItem("vibeflow-token")
            localStorage.removeItem("vibeflow-user")
            setUser(null)
          })
          .finally(() => {
            setLoading(false)
          })
      } catch (e) {
        console.error("Failed to parse stored user:", e)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Login failed")
        }

        const data = await response.json()

        // Save token and user data
        localStorage.setItem("vibeflow-token", data.token)
        localStorage.setItem("vibeflow-user", JSON.stringify(data.user))

        setUser(data.user)

        toast({
          title: "Login successful",
          description: "Welcome back to Vibeflow Banking!",
          duration: 3000,
        })
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError("An unexpected error occurred during login")
        }
        console.error("Login error:", e)
        throw e // Re-throw to allow the login page to handle it
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const register = useCallback(
    async (userData: any) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Registration failed")
        }

        const data = await response.json()

        // Save token and user data
        localStorage.setItem("vibeflow-token", data.token)
        localStorage.setItem("vibeflow-user", JSON.stringify(data.user))

        setUser(data.user)

        toast({
          title: "Registration successful",
          description: "Welcome to Vibeflow Banking!",
          duration: 3000,
        })
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError("An unexpected error occurred during registration")
        }
        console.error("Registration error:", e)
        throw e // Re-throw to allow the registration page to handle it
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const logout = useCallback(async () => {
    try {
      // Call logout API
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("vibeflow-token")}`,
        },
      })

      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
        duration: 3000,
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear local storage and state regardless of API success
      localStorage.removeItem("vibeflow-token")
      localStorage.removeItem("vibeflow-user")
      setUser(null)
    }
  }, [toast])

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null

      const updatedUser = { ...prevUser, ...userData }
      localStorage.setItem("vibeflow-user", JSON.stringify(updatedUser))
      return updatedUser
    })
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

// Custom hook to use the context
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

