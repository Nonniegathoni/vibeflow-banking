// Simple API client for connecting to the backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.message || "API request failed")
    error.status = response.status
    error.data = errorData
    throw error
  }

  return await response.json()
}

// Get auth token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("vibeflow-token")
  }
  return null
}

// API client with authentication
const apiClient = {
  // Auth endpoints
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      return handleResponse(response)
    },

    register: async (userData) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      return handleResponse(response)
    },

    logout: async () => {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      })

      return handleResponse(response)
    },
  },

  // User endpoints
  user: {
    getProfile: async () => {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })

      return handleResponse(response)
    },

    updateProfile: async (userData) => {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(userData),
      })

      return handleResponse(response)
    },
  },

  // Transaction endpoints
  transactions: {
    getAll: async (page = 1, limit = 10) => {
      const response = await fetch(`${API_URL}/transactions?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })

      return handleResponse(response)
    },
  },
}

// For backward compatibility
const fetchTransactions = async (userId) => {
  console.log("Fetching transactions for user:", userId)
  return []
}

module.exports = {
  apiClient,
  fetchTransactions,
}

