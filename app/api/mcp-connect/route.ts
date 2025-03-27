import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Define Composio MCP server URLs - these match the ones in the screenshot
const MCP_SERVER_URLS: Record<string, string> = {
  // These are the actual MCP connection URLs from your connections
  'gmail': 'https://mcp.composio.dev/gmail/crooked-shy-guitar-OQDWNt',
  'googlesheets': 'https://mcp.composio.dev/googledocs/crooked-shy-guitar-OQDWNt',
  
  // For any other services, we'll use the standard path to MCP servers
  // Usually these would be dynamically retrieved from Composio's API
};

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
    
    // Normalize the service ID
    const normalizedServiceId = normalizeServiceId(serviceId);
    
    // Generate the service URL that will be shown to the user
    let serviceUrl = MCP_SERVER_URLS[normalizedServiceId];
    
    if (!serviceUrl) {
      // For services not in our predefined list, use a default format
      // This should match the format the agent uses for direct connections
      serviceUrl = `https://mcp.composio.dev/${normalizedServiceId === 'googlesheets' ? 'googledocs' : normalizedServiceId}/crooked-shy-guitar-OQDWNt`;
    }
    
    console.log(`Generated service URL: ${serviceUrl}`);
    
    // First, fetch current user connections
    const { data: userConnections } = await supabase
      .from('user_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    let updatedConnections;
    
    if (userConnections) {
      // User has existing connections
      const connectedServices = userConnections.connected_services || [];
      const config = userConnections.config || {};
      
      // Normalize connected services for comparison
      const normalizedConnectedServices = connectedServices.map(svc => normalizeServiceId(svc));
      
      // Prepare the updated connection data
      // Make sure to update both connected_services array AND config object
      updatedConnections = {
        user_id: user.id,
        config: {
          ...config,
          [normalizedServiceId]: {
            url: serviceUrl,
            transport: "sse" 
          }
        },
        connected_services: [...new Set([...normalizedConnectedServices, normalizedServiceId])], // Use Set to avoid duplicates
        updated_at: new Date().toISOString()
      };
    } else {
      // User has no connections, create a new record
      updatedConnections = {
        user_id: user.id,
        config: {
          [normalizedServiceId]: {
            url: serviceUrl,
            transport: "sse"
          }
        },
        connected_services: [normalizedServiceId],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    console.log("Updating user connections with:", JSON.stringify(updatedConnections));
    
    // Update the user connections
    const { error: upsertError } = await supabase
      .from('user_connections')
      .upsert(updatedConnections, {
        onConflict: 'user_id'
      });
    
    if (upsertError) {
      console.error('Error updating user connections:', upsertError);
      return NextResponse.json(
        { error: 'Failed to add service connection' },
        { status: 500 }
      );
    }
    
    // Simply return the direct service URL
    return NextResponse.json({
      redirectUrl: serviceUrl,
      serviceId: normalizedServiceId,
      isConnected: true
    });
    
  } catch (error) {
    console.error('Error in MCP connect API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 