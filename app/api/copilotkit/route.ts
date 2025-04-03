import {
    CopilotRuntime,
    ExperimentalEmptyAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
    langGraphPlatformEndpoint
} from "@copilotkit/runtime";;
import { NextRequest } from "next/server";
import { createClient } from '@/utils/supabase/server';

// You can use any service adapter here for multi-agent support.
const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
    remoteEndpoints: [
        langGraphPlatformEndpoint({
            deploymentUrl: `${process.env.AGENT_DEPLOYMENT_URL || 'http://localhost:8123'}`,
            langsmithApiKey: process.env.LANGSMITH_API_KEY,
            agents: [
                {
                    name: 'Adam', 
                    description: 'A helpful LLM agent.',
                }
            ]
        }),
    ],
});

export const POST = async (req: NextRequest) => {
    try {
        // Create a copy of the request for reading
        const clonedReq = req.clone();
        // Get request body
        const requestData = await clonedReq.json();
        
        // Initialize Supabase client
        const supabase = createClient();
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Only proceed with authenticated users
        if (user) {
            // Fetch user's MCP connections from Supabase
            const { data: userConnections } = await supabase
                .from('user_connections')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            // If user has connections and there's a config, add it to the state
            if (userConnections?.config && Object.keys(userConnections.config).length > 0) {
                // Check if there's an existing state in the request
                if (!requestData.state) {
                    requestData.state = {};
                }
                
                // Add the MCP configuration to the state
                requestData.state.mcp_config = userConnections.config;
                
                console.log('Adding MCP config to agent state:', 
                    Object.keys(userConnections.config).length, 
                    'connections found');
            } else {
                console.log('No MCP connections found for user');
            }
            
            // Create a new request with the modified body
            const modifiedReq = new Request(req.url, {
                method: req.method,
                headers: req.headers,
                body: JSON.stringify(requestData)
            });
            
            // Use the modified request with the handler
            const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
                runtime,
                serviceAdapter,
                endpoint: "/api/copilotkit",
            });
            
            return handleRequest(modifiedReq);
        }
    } catch (error) {
        console.error('Error in copilotkit API:', error);
        // If there's an error in our code, fall back to the original behavior
    }
    
    // Default handler if we couldn't modify the request or encountered an error
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
        runtime,
        serviceAdapter,
        endpoint: "/api/copilotkit",
    });
    
    return handleRequest(req);
};