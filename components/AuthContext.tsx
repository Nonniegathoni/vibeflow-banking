// src/contexts/AuthContext.tsx (or components/AuthContext.tsx, choose your location)
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define types for better safety
interface User {
  id: number | string; // Adjust based on your user ID type
  email: string;
  first_name?: string; // Optional fields based on your user model
  last_name?: string;
  phone?: string;
  role?: string; // Add role if it's part of your user object
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>; // Consider defining a specific return type
  register: (userData: any) => Promise<any>; // Consider defining userData and return types
  logout: () => void;
}

// Use the defined type for createContext, provide a default matching the type structure
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => {},
    register: async () => {},
    logout: () => {},
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage on initial load
    try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token'); // Check for token too for validity logic if needed

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        // Optionally clear localStorage if parsing fails
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    } finally {
        setLoading(false); // Ensure loading is set to false even if there's an error
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true); // Optional: set loading during login
    try {
      // Ensure API endpoint is correct (e.g., /api/auth/login)
      const response = await fetch('/api/auth/login', { // Adjust if your API route is different
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // Assumes backend returns user object
      setUser(data.user); // Update state
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      setUser(null); // Clear user state on login failure
      localStorage.removeItem('token'); // Clear storage on failure
      localStorage.removeItem('user');
      setLoading(false);
      throw error; // Re-throw error so the calling component can handle it
    }
  };

  const register = async (userData: any) => {
    // NOTE: This function registers the user but DOES NOT automatically log them in.
    // If auto-login is desired, add localStorage.setItem and setUser calls similar to the login function,
    // assuming your register endpoint returns the user and token.
    setLoading(true); // Optional: set loading during registration
    try {
      // ****** IMPORTANT: Verify this matches your backend registration route ******
      // The backend code you provided earlier used '/api/auth/register'
      const response = await fetch('/api/auth/sign-up', { // Adjust if your API route is different
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }
      setLoading(false);
      // Successfully registered, but not logged in by default here.
      return data; // Return data (e.g., success message or registered user info without token)
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      throw error; // Re-throw error
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Optionally redirect the user to the login page here using navigate (if using react-router)
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};