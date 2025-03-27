import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(request.url);
    
    // Get state and code from query parameters
    const state = searchParams.get('state');
    const code = searchParams.get('code');
    const service = searchParams.get('service');
    
    if (!state || !code) {
      return new Response('Missing state or code parameter', { status: 400 });
    }
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Find the connection request by state
    const { data: connectionRequest, error: fetchError } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('state', state)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();
    
    if (fetchError || !connectionRequest) {
      console.error('Error finding connection request:', fetchError);
      return NextResponse.redirect(
        new URL(`/?error=invalid_state`, request.url)
      );
    }
    
    // In a production implementation, we would:
    // 1. Exchange the code for tokens with Composio's API
    // 2. Store the tokens securely
    
    // Update connection request status
    const { error: updateError } = await supabase
      .from('connection_requests')
      .update({
        status: 'connected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionRequest.id);
    
    if (updateError) {
      console.error('Error updating connection request:', updateError);
      return NextResponse.redirect(
        new URL(`/?error=connection_failed`, request.url)
      );
    }
    
    // Add to connected services
    const { data: userConnections, error: connectionsError } = await supabase
      .from('user_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (connectionsError && connectionsError.code !== 'PGRST116') {
      console.error('Error fetching user connections:', connectionsError);
    }
    
    // Use the service from the query params if available, otherwise use from the connection request
    const serviceId = service || connectionRequest.service_id;
    
    // Determine what structure to use based on what exists
    if (userConnections) {
      // If the user has existing connections
      let updatedConnections;
      
      if (userConnections.connected_services) {
        // If the user has the new connected_services array
        const connectedServices = userConnections.connected_services || [];
        
        if (!connectedServices.includes(serviceId)) {
          // Update the connected_services array
          updatedConnections = {
            user_id: user.id,
            connected_services: [...connectedServices, serviceId],
            updated_at: new Date().toISOString()
          };
        }
      } else {
        // If the user has the old config object structure
        const config = userConnections.config || {};
        
        // Add the new service to the config object
        if (!config[serviceId]) {
          const updatedConfig = { 
            ...config,
            [serviceId]: { 
              url: `https://mcp.composio.dev/${serviceId}/${serviceId === 'googledocs' ? 'crooked-shy-guitar-OQDWNt' : 'crooked-shy-guitar-OQDWNt'}`,
              transport: "sse"
            }
          };
          
          updatedConnections = {
            user_id: user.id,
            config: updatedConfig,
            connected_services: Object.keys(updatedConfig),
            updated_at: new Date().toISOString()
          };
        }
      }
      
      // Only update if there are changes
      if (updatedConnections) {
        const { error: upsertError } = await supabase
          .from('user_connections')
          .upsert(updatedConnections, {
            onConflict: 'user_id'
          });
        
        if (upsertError) {
          console.error('Error updating user connections:', upsertError);
        }
      }
    } else {
      // If the user has no connections at all, create a new record with both structures
      // This ensures compatibility with both old and new code
      const newConnections = {
        user_id: user.id,
        config: {
          [serviceId]: { 
            url: `https://mcp.composio.dev/${serviceId}/${serviceId === 'googledocs' ? 'crooked-shy-guitar-OQDWNt' : 'crooked-shy-guitar-OQDWNt'}`,
            transport: "sse"
          }
        },
        connected_services: [serviceId],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('user_connections')
        .insert(newConnections);
      
      if (insertError) {
        console.error('Error creating user connections:', insertError);
      }
    }
    
    // Redirect back with success message
    return NextResponse.redirect(
      new URL(`/?success=connected_${serviceId}`, request.url)
    );
    
  } catch (error) {
    console.error('Error in MCP callback:', error);
    return NextResponse.redirect(
      new URL('/?error=server_error', request.url)
    );
  }
} 