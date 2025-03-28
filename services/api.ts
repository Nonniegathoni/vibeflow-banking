import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token")
            window.location.href = "/"
        }
        return Promise.reject(error)
    },
)

export const login = async (email: string, password: string) => {
    try {
        const response = await api.post("/auth/login", { email, password })
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Login failed")
    }
}

export const register = async (name: string, email: string, password: string, phone: string) => {
    try {
        const response = await api.post("/auth/register", { name, email, password, phone })
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Registration failed")
    }
}

export const getTransactions = async () => {
    try {
        const response = await api.get("/transactions")
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch transactions")
    }
}

export const createTransaction = async (amount: number, type: "deposit" | "withdrawal", description: string) => {
    try {
        const response = await api.post("/transactions", { amount, type, description })
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to create transaction")
    }
}

export const getUserProfile = async () => {
    try {
        const response = await api.get("/users/profile")
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch user profile")
    }
}

export const updateUserProfile = async (data: any) => {
    try {
        const response = await api.put("/users/profile", data)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to update profile")
    }
}

export const reportFraud = async () => {
    try {
        const response = await api.post("/users/report-fraud")
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to report fraud")
    }
}

export const adminLogin = async (username: string, password: string) => {
    try {
        const response = await api.post("/admin/auth/login", { username, password })
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Admin login failed")
    }
}

export const getAdminUsers = async () => {
    try {
        const response = await api.get("/admin/users")
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch users")
    }
}

export const getAdminTransactions = async () => {
    try {
        const response = await api.get("/admin/transactions")
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch transactions")
    }
}

export const resolveAlert = async (userId: string) => {
    try {
        const response = await api.put(`/admin/resolve-alert/${userId}`)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to resolve alert")
    }
}

export default api

