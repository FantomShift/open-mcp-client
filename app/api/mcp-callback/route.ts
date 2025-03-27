import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Helper function to normalize service ID
function normalizeServiceId(serviceId: string): string {
  // Convert to lowercase
  let normalized = serviceId.toLowerCase();
  
  // Remove spaces
  normalized = normalized.replace(/\s+/g, '');
  
  // Special case for "google sheets" -> "googlesheets"
  if (normalized === 'googlesheets' || normalized === 'googlesheet') {
    return 'googlesheets';
  }
  
  // Special case for "googledocs" -> "googlesheets" (if needed)
  if (normalized === 'googledocs') {
    return 'googlesheets';
  }
  
  return normalized;
}

export async function GET(request: Request) {
  // Add logging to debug callback issues
  console.log("Callback received:", request.url);
  
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(request.url);
    
    // Log all search params for debugging
    console.log("Callback params:", Object.fromEntries(searchParams.entries()));
    
    // Get service from query parameters
    const service = searchParams.get('service');
    
    if (!service) {
      console.error("Missing service parameter in callback");
      return new Response('Missing service parameter', { status: 400 });
    }
    
    // Normalize the service ID
    const normalizedServiceId = normalizeServiceId(service);
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("User not authenticated in callback");
      // Redirect to login page
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    console.log(`Processing callback for service: ${normalizedServiceId}`);
    
    // The service is already added to user_connections when they clicked connect
    // We don't need to update the database here
    // Instead, we just redirect back with a success message
    
    // Redirect back with success message
    return NextResponse.redirect(
      new URL(`/?success=authorized_${normalizedServiceId}`, request.url)
    );
    
  } catch (error) {
    console.error('Error in MCP callback:', error);
    return NextResponse.redirect(
      new URL('/?error=server_error', request.url)
    );
  }
} 