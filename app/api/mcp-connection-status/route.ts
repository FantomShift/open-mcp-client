import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

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
    
    // Step 1: Check if the connection exists in our database
    const { data: userConnections, error: connectionsError } = await supabase
      .from('user_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (connectionsError && connectionsError.code !== 'PGRST116') {
      console.error('Error fetching user connections:', connectionsError);
      return NextResponse.json(
        { error: 'Failed to fetch user connections' },
        { status: 500 }
      );
    }
    
    // Check if this service is in the connected services
    let isConnected = false;
    
    if (userConnections) {
      if (userConnections.connected_services && Array.isArray(userConnections.connected_services)) {
        isConnected = userConnections.connected_services.includes(serviceId);
      } else if (userConnections.config && typeof userConnections.config === 'object') {
        isConnected = !!userConnections.config[serviceId];
      }
    }
    
    if (!isConnected) {
      // Not connected at all
      return NextResponse.json({
        status: 'not_connected',
        isConnected: false,
        isAuthorized: false,
        message: 'No connection found for this service'
      });
    }
    
    // Step 2: In a full implementation, you'd check if the connection is authorized
    // This would require making a test call to Composio's API to check the connection status
    // For now, we'll assume that if it's connected, it's authorized
    
    // In a real implementation with Composio's SDK, you would do something like:
    /*
    try {
      // Make a test call to Composio's API to check if the connection is working
      const composioClient = new ComposioClient(process.env.COMPOSIO_API_KEY);
      const connectionStatus = await composioClient.connections.check({
        userId: user.id,
        serviceId: serviceId
      });
      
      return NextResponse.json({
        status: connectionStatus.status,
        isConnected: true,
        isAuthorized: connectionStatus.isAuthorized,
        message: connectionStatus.message
      });
    } catch (error) {
      // If there's an authentication error, the connection exists but is not authorized
      return NextResponse.json({
        status: 'unauthorized',
        isConnected: true,
        isAuthorized: false,
        message: 'Connection exists but is not authorized'
      });
    }
    */
    
    // For now, we'll just return that it's connected and authorized
    return NextResponse.json({
      status: 'connected',
      isConnected: true, 
      isAuthorized: true,
      message: 'Connection exists and is authorized'
    });
    
  } catch (error) {
    console.error('Error checking connection status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 