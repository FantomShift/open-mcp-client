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
    
    // Generate a state parameter for OAuth flow
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store the connection request in database
    const { data: connectionRequest, error } = await supabase
      .from('connection_requests')
      .insert({
        user_id: user.id,
        service_id: serviceId,
        state,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating connection request:', error);
      return NextResponse.json(
        { error: 'Failed to create connection request' },
        { status: 500 }
      );
    }
    
    // Use the predefined MCP server URL or construct a generic one
    // In a real implementation, you would call Composio's API to get this URL
    let mcpServerUrl = MCP_SERVER_URLS[serviceId];
    
    if (!mcpServerUrl) {
      // Mimic how the agent interacts with services
      // This would normally come from Composio's API
      
      // In a real implementation with the Composio client, this would be:
      // const composioClient = new ComposioClient(process.env.COMPOSIO_API_KEY);
      // const { url } = await composioClient.getServerUrl(serviceId);
      // mcpServerUrl = url;
      
      // But since we don't have that, we'll use their standard URL pattern
      mcpServerUrl = `https://mcp.composio.dev/${serviceId}/connect`;
    }
    
    return NextResponse.json({
      redirectUrl: mcpServerUrl,
      state,
      connectionRequestId: connectionRequest.id
    });
    
  } catch (error) {
    console.error('Error in MCP connect API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 