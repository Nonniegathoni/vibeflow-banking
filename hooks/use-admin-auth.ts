"use client"

import { useContext } from "react"
import { AdminAuthContext } from "@/components/admin/AdminAuthProvider"

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}

