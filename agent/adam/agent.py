"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

import platform
from typing_extensions import Literal, TypedDict, Dict, List, Any, Union, Optional
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command
from copilotkit import CopilotKitState
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
import os

# Define the connection type structures
class StdioConnection(TypedDict):
    command: str
    args: List[str]
    transport: Literal["stdio"]

class SSEConnection(TypedDict):
    url: str
    transport: Literal["sse"]

# Type for MCP configuration
MCPConfig = Dict[str, Union[StdioConnection, SSEConnection]]

class AgentState(CopilotKitState):
    """
    Here we define the state of the agent

    In this instance, we're inheriting from CopilotKitState, which will bring in
    the CopilotKitState fields. We're also adding a custom field, `mcp_config`,
    which will be used to configure MCP services for the agent.
    """
    # Define mcp_config as an optional field without skipping validation
    mcp_config: Optional[MCPConfig]

# Default MCP configuration to use when no configuration is provided in the state
# Empty default config for production - configurations should come from the frontend
DEFAULT_MCP_CONFIG: MCPConfig = {}

async def chat_node(state: AgentState, config: RunnableConfig) -> Command[Literal["__end__"]]:
    """
    This is a simplified agent that uses the ReAct agent as a subgraph.
    It handles both chat responses and tool execution in one node.
    """
    # Get MCP configuration from state, or use the default config if not provided
    mcp_config = state.get("mcp_config", DEFAULT_MCP_CONFIG)
    
    # Remove the Windows check that was disabling MCP tools
    # Print the mcp_config for debugging
    print(f"mcp_config: {mcp_config}")
    
    # Set up the MCP client and tools using the configuration from state
    async with MultiServerMCPClient(mcp_config) as mcp_client:
        # Get the tools
        mcp_tools = mcp_client.get_tools()
        
        # Create the react agent
        model = ChatOpenAI(model="gpt-4o")
        react_agent = create_react_agent(model, mcp_tools)
        
        # Prepare messages for the react agent
        agent_input = {
            "messages": state["messages"]
        }
        
        # Run the react agent subgraph with our input
        agent_response = await react_agent.ainvoke(agent_input)
        
        # Update the state with the new messages
        updated_messages = state["messages"] + agent_response.get("messages", [])
        
        # End the graph with the updated messages
        return Command(
            goto=END,
            update={"messages": updated_messages},
        )

# Define the workflow graph with only a chat node
workflow = StateGraph(AgentState)
workflow.add_node("chat_node", chat_node)
workflow.set_entry_point("chat_node")

# Compile the workflow graph
graph = workflow.compile(MemorySaver())