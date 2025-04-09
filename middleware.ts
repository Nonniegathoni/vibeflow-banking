import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register", "/admin/login", "/forgot-password"]
  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith("/api/auth/"),
  )

  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // If no token exists, redirect to login
  if (!token) {
    const url = request.nextUrl.pathname.startsWith("/admin")
      ? new URL("/admin/login", request.url)
      : new URL("/login", request.url)

    return NextResponse.redirect(url)
  }

  try {
    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
    const { payload } = await jwtVerify(token, secret)

    // Check if user is trying to access admin pages
    const isAdminPath = request.nextUrl.pathname.startsWith("/admin")
    const isAdmin = payload.role === "admin"

    // If non-admin user is trying to access admin pages, redirect to dashboard
    if (isAdminPath && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // If admin is trying to access admin pages but hasn't completed 2FA verification
    if (isAdminPath && isAdmin && !payload.twoFactorVerified && !request.nextUrl.pathname.startsWith("/admin/verify")) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // If token is invalid, clear it and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("token")
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
