import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("vibeflow-token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("vibeflow-token")
          localStorage.removeItem("vibeflow-user")
          window.location.href = "/login"
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api

// Helper functions for common API operations
export const fetchTransactions = async (limit = "50", offset = "0") => {
  try {
    const response = await api.get(`/transactions?limit=${limit}&offset=${offset}`)
    return response.data.transactions
  } catch (error) {
    console.error("Error fetching transactions:", error)
    throw error // Rethrow to allow component to handle the error
  }
}
