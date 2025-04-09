"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Send } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function NewTransactionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultType = searchParams.get("type") || "transfer"

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    type: defaultType,
    amount: "",
    description: "",
    recipientEmail: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validate amount
      const amount = Number.parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount")
      }

      // For transfers, validate recipient
      if (formData.type === "transfer" && !formData.recipientEmail) {
        throw new Error("Please enter a recipient email")
      }

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: formData.type,
          amount: amount,
          description: formData.description || `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`,
          recipientEmail: formData.recipientEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Transaction failed")
      }

      setSuccess("Transaction processed successfully!")

      // Reset form
      setFormData({
        ...formData,
        amount: "",
        description: "",
        recipientEmail: "",
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/transactions")
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Transaction error:", error)
      setError(error instanceof Error ? error.message : "Failed to process transaction")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/transactions"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Transactions
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{error}</div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Transaction Type
              </label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">
                    <div className="flex items-center">
                      <ArrowDownLeft className="h-4 w-4 mr-2 text-green-500" />
                      Deposit
                    </div>
                  </SelectItem>
                  <SelectItem value="withdraw">
                    <div className="flex items-center">
                      <ArrowUpRight className="h-4 w-4 mr-2 text-red-500" />
                      Withdraw
                    </div>
                  </SelectItem>
                  <SelectItem value="transfer">
                    <div className="flex items-center">
                      <Send className="h-4 w-4 mr-2 text-indigo-500" />
                      Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>

            {formData.type === "transfer" && (
              <div className="space-y-2">
                <label htmlFor="recipientEmail" className="text-sm font-medium">
                  Recipient Email
                </label>
                <Input
                  id="recipientEmail"
                  name="recipientEmail"
                  type="email"
                  value={formData.recipientEmail}
                  onChange={handleChange}
                  required={formData.type === "transfer"}
                  placeholder="Enter recipient's email"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add a note about this transaction"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? "Processing..." : "Submit Transaction"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
