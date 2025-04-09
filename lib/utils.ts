import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in Kenyan Shillings (KES)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format date in a consistent way
export function formatDate(date: string | Date): string {
  if (!date) return "N/A"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Invalid date"
  }
}
