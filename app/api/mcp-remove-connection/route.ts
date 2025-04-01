import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Helper function to normalize service IDs
const normalizeServiceId = (serviceId: string): string => {
  // Handle null or undefined
  if (!serviceId) return '';
  
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
  
  // Special case for "google drive" -> "googledrive"
  if (normalized === 'googledrive') {
    return 'googledrive';
  }
  
  return normalized;
};

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { serviceId } = body;
    
    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    const normalizedServiceId = normalizeServiceId(serviceId);
    console.log(`Removing service: ${serviceId} (normalized: ${normalizedServiceId})`);
    
    // Fetch current user connections
    const { data: userConnections, error: fetchError } = await supabase
      .from('user_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user connections:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user connections' },
        { status: 500 }
      );
    }
    
    if (!userConnections) {
      // No connections found, nothing to remove
      return NextResponse.json({
        success: true,
        message: 'No connections to remove'
      });
    }
    
    console.log('Current database data:', JSON.stringify(userConnections, null, 2));
    
    // Filter out the service from connected_services array using normalized IDs
    const connectedServices = userConnections.connected_services || [];
    const filteredServices = connectedServices.filter(
      (id: string) => normalizeServiceId(id) !== normalizedServiceId
    );
    
    // Remove the service from config object - we need to check all keys
    const config = { ...(userConnections.config || {}) };
    const configKeysToDelete = Object.keys(config).filter(key => 
      normalizeServiceId(key) === normalizedServiceId
    );
    
    console.log(`Config keys to delete: ${configKeysToDelete.join(', ')}`);
    
    // Delete all matching config entries
    configKeysToDelete.forEach(key => {
      delete config[key];
    });
    
    console.log('Updated config:', Object.keys(config));
    console.log('Updated connected_services:', filteredServices);
    
    // Update the user connections
    const { error: updateError } = await supabase
      .from('user_connections')
      .update({
        config,
        connected_services: filteredServices,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Error updating user connections:', updateError);
      return NextResponse.json(
        { error: 'Failed to remove service connection' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully removed ${serviceId} connection`,
      removedService: normalizedServiceId
    });
    
  } catch (error) {
    console.error('Error removing service connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 