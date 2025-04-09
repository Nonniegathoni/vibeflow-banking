// Create a type-safe session store for admin verification
interface SessionData {
    userId: string
    email: string
    expires: number
    verificationCode?: string
  }
  
  // Create a global session store (in production, use Redis or a database)
  const sessionStore: Record<string, SessionData> = {}
  
  export default sessionStore
  