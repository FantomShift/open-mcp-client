import {
    CopilotRuntime,
    ExperimentalEmptyAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
    langGraphPlatformEndpoint
} from "@copilotkit/runtime";;
import { NextRequest, NextResponse } from "next/server";
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

// Set up the handler once, as recommended in the documentation
const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
});

export const POST = async (req: NextRequest) => {
    try {
        // Create a copy of the request body
        const body = await req.json();

        // Initialize Supabase client
        const supabase = createClient();
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.log('No authenticated user found');
            return handleRequest(req);
        }
        
        // Fetch user's MCP connections from Supabase
        const { data: userConnections, error } = await supabase
            .from('user_connections')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (error) {
            console.error('Error fetching user connections:', error.message);
            return handleRequest(req);
        }
            
        // Check if user has MCP connections and config
        if (!userConnections?.config || Object.keys(userConnections.config).length === 0) {
            console.log('No MCP connections found for user');
            return handleRequest(req);
        }
            
        console.log('Adding MCP config to agent state:', 
            Object.keys(userConnections.config).length, 
            'connections found');
            
        // Create a modified copy of the body
        const modifiedBody = { ...body };
            
        // Ensure state exists
        if (!modifiedBody.state) {
            modifiedBody.state = {};
        }
            
        // Add MCP config to state
        modifiedBody.state.mcp_config = userConnections.config;
            
        // Create a new request with the modified body
        const modifiedReq = new Request(req.url, {
            method: req.method,
            headers: new Headers(req.headers),
            body: JSON.stringify(modifiedBody)
        });
            
        return handleRequest(modifiedReq);
    } catch (error) {
        console.error('Error in copilotkit API:', error);
        // If anything goes wrong, use the original request
        return handleRequest(req);
    }
};