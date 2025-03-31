"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { isValidEmail } from "@/backend/utils/validation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export default function LoginPage() {
  const router = useRouter()
  const { login, error, clearError, user } = useUser()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  })

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  // Clear validation errors when inputs change
  useEffect(() => {
    if (email) {
      setValidationErrors((prev) => ({ ...prev, email: "" }))
    }
    if (password) {
      setValidationErrors((prev) => ({ ...prev, password: "" }))
    }
  }, [email, password])

  const validateForm = () => {
    const errors = {
      email: "",
      password: "",
    }

    if (!email) {
      errors.email = "Email is required"
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email"
    }

    if (!password) {
      errors.password = "Password is required"
    }

    setValidationErrors(errors)
    return !errors.email && !errors.password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    clearError()

    try {
      await login(email, password)

      toast({
        title: "Login successful",
        description: "You are now logged in.",
        duration: 3000,
      })

      router.push("/dashboard")
    } catch (err) {
      // Error is handled in the UserContext
      console.error("Login submission error:", err)
      // Don't clear the form fields on error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Vibeflow Banking</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  aria-invalid={!!validationErrors.email}
                  aria-errormessage={validationErrors.email ? "email-error" : undefined}
                />
                {validationErrors.email && (
                  <p id="email-error" className="text-sm text-red-500">
                    {validationErrors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  aria-invalid={!!validationErrors.password}
                  aria-errormessage={validationErrors.password ? "password-error" : undefined}
                />
                {validationErrors.password && (
                  <p id="password-error" className="text-sm text-red-500">
                    {validationErrors.password}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col">
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </ErrorBoundary>
  )
}

