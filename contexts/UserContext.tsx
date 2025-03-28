"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
    id: string
    name: string
    email: string
    accountNumber: string
    hasAlerts: boolean
    balance: number
    isNewUser?: boolean
}

interface UserContextType {
    user: User | null
    setUser: (user: User | null) => void
    loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const handleSetUser = (newUser: User | null) => {
        setUser(newUser)
        if (newUser) {
            localStorage.setItem("user", JSON.stringify(newUser))
        } else {
            localStorage.removeItem("user")
            localStorage.removeItem("token")
            router.push("/")
        }
    }

    return <UserContext.Provider value={{ user, setUser: handleSetUser, loading }}>{children}</UserContext.Provider>
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider")
    }
    return context
}

