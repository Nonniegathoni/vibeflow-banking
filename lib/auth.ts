import { jwtVerify } from "jose"
import { redirect } from "next/navigation"

// Create a type for the session
interface SessionUser {
  id: string
  email: string
  role: string
}

interface Session {
  user: SessionUser
}

// Server-side function to get session (to be used in Server Components only)
export async function getServerSession() {
  // This function should only be called from server components
  // We'll use the cookies() function dynamically
  const { cookies } = await import("next/headers")
  const token = cookies().get("token")?.value

  if (!token) {
    return null
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
    const { payload } = await jwtVerify(token, secret)

    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
        role: payload.role as string,
      },
    }
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}

// Client-side function to get session from localStorage
export function getClientSession(): Session | null {
  if (typeof window === "undefined") {
    return null
  }

  const user = localStorage.getItem("vibeflow-user")
  if (!user) {
    return null
  }

  try {
    return { user: JSON.parse(user) }
  } catch {
    return null
  }
}

// Use this in middleware or server components
export async function requireAuth() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

// Use this in middleware or server components
export async function requireAdmin() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return session
}

// Client-side function to sign out
export function signOut() {
  if (typeof window !== "undefined") {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    localStorage.removeItem("vibeflow-user")
    localStorage.removeItem("vibeflow-token")
    window.location.href = "/"
  }
}

// Helper function to get session (works in both client and server components)
export function getSession() {
  if (typeof window === "undefined") {
    // We're on the server
    return getServerSession()
  } else {
    // We're on the client
    return getClientSession()
  }
}
