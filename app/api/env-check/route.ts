import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return NextResponse.json({
    success: true,
    supabaseConfigured: !!(supabaseUrl && supabaseKey),
    // Don't expose full keys in response
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : null,
    supabaseKeyPresent: !!supabaseKey,
  });
} 