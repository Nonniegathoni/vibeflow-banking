"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Shield, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"credentials" | "verification">("credentials")
  const [verificationCode, setVerificationCode] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [sessionToken, setSessionToken] = useState("")
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // If successful, move to verification step
      setSessionToken(data.sessionToken)
      setStep("verification")
      setCountdown(300) // 5 minute countdown for code expiration
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Failed to login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionToken,
          verificationCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Verification failed")
      }

      // Store the actual auth token
      if (typeof window !== "undefined") {
        localStorage.setItem("vibeflow-token", data.token)
        localStorage.setItem("vibeflow-user", JSON.stringify(data.user))
      }

      console.log("Admin login successful, redirecting...")
      router.push("/admin/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Verification error:", error)
      setError(error instanceof Error ? error.message : "Failed to verify code")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-2">
            <Shield className="h-10 w-10 text-gray-700" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Admin Login</CardTitle>
          <p className="text-gray-500 mt-2">Sign in to access the admin panel</p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "credentials" ? (
            <form onSubmit={handleSubmitCredentials} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your admin email"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-900" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitVerification} className="space-y-4">
              <div className="flex justify-center mb-4">
                <Lock className="h-12 w-12 text-indigo-600" />
              </div>
              <p className="text-center text-sm mb-4">
                A verification code has been sent to your email. Please enter it below to complete the login process.
              </p>
              {countdown > 0 && (
                <p className="text-center text-sm text-amber-600">Code expires in: {formatTime(countdown)}</p>
              )}
              <div className="space-y-2">
                <label htmlFor="verificationCode" className="text-sm font-medium">
                  Verification Code
                </label>
                <Input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  placeholder="Enter 6-digit code"
                  className="w-full text-center text-xl tracking-widest"
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setStep("credentials")}
                disabled={isLoading}
              >
                Back to Login
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            <Link href="/forgot-password" className="text-gray-600 hover:text-gray-800">
              Forgot password?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
