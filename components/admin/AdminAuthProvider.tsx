"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string, pin?: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if admin user is stored in localStorage
    const storedUser = localStorage.getItem("vibeflow-admin")
    const token = localStorage.getItem("vibeflow-admin-token")

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser)

        // Verify if user has admin role
        if (parsedUser.role !== "admin" && parsedUser.role !== "agent") {
          localStorage.removeItem("vibeflow-admin")
          localStorage.removeItem("vibeflow-admin-token")
          setUser(null)
          router.push("/admin/login")
        } else {
          setUser(parsedUser)

          // Verify token by fetching user profile
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/profile`, {
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
              localStorage.setItem("vibeflow-admin", JSON.stringify(data.user))
            })
            .catch(() => {
              // Token might be invalid or expired
              localStorage.removeItem("vibeflow-admin-token")
              localStorage.removeItem("vibeflow-admin")
              setUser(null)
              router.push("/admin/login")
            })
        }
      } catch (e) {
        console.error("Failed to parse stored admin user:", e)
      }
    } else {
      // No stored user, redirect to login if on admin page
      if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        router.push("/admin/login")
      }
    }

    setLoading(false)
  }, [router])

  const clearError = () => {
    setError(null)
  }

  const login = async (email: string, password: string, pin?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, pin }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const data = await response.json()

      // Verify user has admin role
      if (data.user.role !== "admin" && data.user.role !== "agent") {
        throw new Error("You do not have permission to access the admin panel")
      }

      // Save token and user data
      localStorage.setItem("vibeflow-admin-token", data.token)
      localStorage.setItem("vibeflow-admin", JSON.stringify(data.user))

      setUser(data.user)

      toast({
        title: "Login successful",
        description: "Welcome to Vibeflow Banking Admin Panel",
        duration: 3000,
      })

      router.push("/admin/dashboard")
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError("An unexpected error occurred during login")
      }
      console.error("Admin login error:", e)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("vibeflow-admin-token")
    localStorage.removeItem("vibeflow-admin")
    setUser(null)
    router.push("/admin/login")

    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
      duration: 3000,
    })
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

