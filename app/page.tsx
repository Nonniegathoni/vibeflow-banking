"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Use client-side navigation instead of server-side redirect
    router.push("/login")
  }, [router])

  // Return a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecting to login...</p>
    </div>
  )
}

