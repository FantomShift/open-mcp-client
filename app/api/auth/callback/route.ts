import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Ensure this is always dynamically rendered
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to the dashboard on successful login
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    }
  }
  
  // Return to login page if there's an error or no code
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
} 