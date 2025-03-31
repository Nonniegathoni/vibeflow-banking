"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

// Create a wrapper component to access hooks
function ErrorBoundaryWrapper(props: ErrorBoundaryProps) {
  const router = useRouter()

  return <ErrorBoundaryInner {...props} router={router} />
}

// The actual error boundary implementation
class ErrorBoundaryInner extends Component<ErrorBoundaryProps & { router: any }, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps & { router: any }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Check if this is a redirect error
    if (error.toString().includes("Redirect")) {
      // For redirect errors, we don't want to show an error UI
      return { hasError: false }
    }

    // For other errors, show the error UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Only log non-redirect errors
    if (!error.toString().includes("Redirect")) {
      console.error("Error caught by ErrorBoundary:", error, errorInfo)
      this.setState({ errorInfo })
    }
  }

  handleReset = () => {
    this.props.onReset?.()
    this.setState({ hasError: false })
  }

  handleNavigateHome = () => {
    this.setState({ hasError: false })
    this.props.router.push("/dashboard")
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{this.state.error?.message || "An unexpected error occurred"}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()} variant="default">
              Reload Page
            </Button>
            <Button onClick={this.handleReset} variant="outline">
              Try Again
            </Button>
            <Button onClick={this.handleNavigateHome} variant="outline">
              Go to Dashboard
            </Button>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md text-left overflow-auto max-w-full">
              <p className="font-mono text-sm text-red-600 whitespace-pre-wrap">{this.state.error.stack}</p>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Export the wrapper as the ErrorBoundary
export const ErrorBoundary = ErrorBoundaryWrapper

