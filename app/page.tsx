"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)

    // Redirect based on role - always to login pages, never directly to dashboard
    if (role === "admin") {
      router.push("/admin/login")
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-indigo-700">Welcome to Vibeflow</CardTitle>
          <p className="text-gray-500 mt-2">Please select your role:</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center border-2 hover:border-indigo-600 hover:bg-indigo-50"
              onClick={() => handleRoleSelect("admin")}
            >
              <span className="font-medium">Access as Admin</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center border-2 hover:border-indigo-600 hover:bg-indigo-50"
              onClick={() => handleRoleSelect("user")}
            >
              <span className="font-medium">Access as User</span>
            </Button>
          </div>

          <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
            <p>© 2024 Vibeflow Banking System. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
