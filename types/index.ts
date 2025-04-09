export interface Transaction {
  id: string
  amount: string
  type: string
  description: string
  status: string
  created_at: string
  // Make timestamp optional to avoid type errors
  timestamp?: string | null
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
export interface AuthContextType {}
export interface AuthProviderProps {
  children: React.ReactNode
}