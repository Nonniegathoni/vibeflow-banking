"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Shield } from "lucide-react"
import { isValidEmail } from "@/utils/validation"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, error, clearError, user, loading } = useAdminAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pin, setPin] = useState("")
  const [showPinInput, setShowPinInput] = useState(false)
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
    pin: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/admin/dashboard")
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
    if (pin) {
      setValidationErrors((prev) => ({ ...prev, pin: "" }))
    }
  }, [email, password, pin])

  const validateForm = () => {
    const errors = {
      email: "",
      password: "",
      pin: "",
    }

    if (!email) {
      errors.email = "Email is required"
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email"
    }

    if (!password) {
      errors.password = "Password is required"
    }

    if (showPinInput && !pin) {
      errors.pin = "PIN is required for admin access"
    }

    setValidationErrors(errors)
    return !errors.email && !errors.password && !(showPinInput && !pin)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (!showPinInput) {
      setShowPinInput(true)
      return
    }

    setIsSubmitting(true)
    clearError()

    try {
      await login(email, password, pin)
    } catch (err) {
      // Error is handled in the AdminAuthContext
      console.error("Login submission error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access the admin panel</CardDescription>
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
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || showPinInput}
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
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || showPinInput}
                aria-invalid={!!validationErrors.password}
                aria-errormessage={validationErrors.password ? "password-error" : undefined}
              />
              {validationErrors.password && (
                <p id="password-error" className="text-sm text-red-500">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {showPinInput && (
              <div className="space-y-2">
                <label htmlFor="pin" className="text-sm font-medium">
                  Admin PIN
                </label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your admin PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={!!validationErrors.pin}
                  aria-errormessage={validationErrors.pin ? "pin-error" : undefined}
                  autoFocus
                />
                {validationErrors.pin && (
                  <p id="pin-error" className="text-sm text-red-500">
                    {validationErrors.pin}
                  </p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : showPinInput ? "Verify PIN" : "Continue"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">This area is restricted to authorized personnel only</p>
        </CardFooter>
      </Card>
    </div>
  )
}

