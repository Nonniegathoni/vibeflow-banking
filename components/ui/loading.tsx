import { Loader2 } from "lucide-react"

export function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClass = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className="flex justify-center items-center">
      <Loader2 className={`${sizeClass[size]} animate-spin text-indigo-600`} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
