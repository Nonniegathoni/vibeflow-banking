"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export interface User {
  hasAlerts: any;
  id: number | string;
  email: string;
  balance?: number;
  phone?: string;
  role?: 'user' | 'admin';
  first_name?: string;
  last_name?: string;
  name?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const storedUser = localStorage.getItem("vibeflow-user");
    const token = localStorage.getItem("vibeflow-token");

    if (storedUser && token) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("vibeflow-user");
        localStorage.removeItem("vibeflow-token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
           method: "POST",
           headers: { "Content-Type": "application/json", },
           body: JSON.stringify({ email, password }),
         });
         if (!response.ok) {
           const errorData = await response.json().catch(() => ({}));
           throw new Error(errorData.message || `Login failed (${response.status})`);
         }
         const data = await response.json();
         const { user: loggedInUser, token } = data;

        if (!loggedInUser || !token) {
            throw new Error("Login response missing user data or token.");
        }

        localStorage.setItem("vibeflow-token", token);
        localStorage.setItem("vibeflow-user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);

        toast({ title: "Login successful", description: "Welcome back!" });

      } catch (e: any) {
        console.error("Login error:", e);
        setError(e.message || "An unexpected error occurred during login");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  const register = useCallback(
    async (userData: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Registration failed (${response.status})`);
        }
        const data = await response.json();
        toast({ title: "Registration successful", description: "Please log in." });
        return data;
      } catch (e: any) {
        console.error("Registration error:", e);
        setError(e.message || "An unexpected error occurred during registration");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("vibeflow-token");
    localStorage.removeItem("vibeflow-user");
    setUser(null);
    toast({ title: "Logged out", description: "You have been successfully logged out." });
  }, [toast]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...userData };
      localStorage.setItem("vibeflow-user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        clearError,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}