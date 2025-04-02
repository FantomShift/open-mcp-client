import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl
  
  // Create supabase client for auth verification
  const { supabase, response } = createClient(request)
  
  // Get session - if it exists, user is logged in
  const { data: { session } } = await supabase.auth.getSession()
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth/callback']
  
  // Check if the path is public
  const isPublicPath = publicPaths.includes(pathname) || 
                      pathname.startsWith('/_next') || 
                      pathname.startsWith('/api/') ||
                      pathname.includes('.') // For static files like images

  // Get the base URL from the request
  const baseUrl = new URL('/', request.url).origin
  
  // If logged in and trying to access login page, redirect to dashboard
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', baseUrl))
  }
  
  // If not logged in and trying to access a protected page, redirect to login
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', baseUrl))
  }
  
  // For login page, we want to bypass any layout
  if (pathname === '/login') {
    // This ensures login page doesn't inherit the main layout
    // The rest is handled by our custom login/layout.tsx file
    return response
  }
  
  // All other requests pass through
  return response
}

// Match all paths except static assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 