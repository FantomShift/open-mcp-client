# PowerShell script for starting the development server on Windows
# This script uses Windows-compatible commands for running both frontend and agent

# Change to the project directory
Set-Location $PSScriptRoot

# Start the agent server first
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot/agent; poetry install; poetry run langgraph dev --host localhost --port 8123 --no-browser"

# Wait a moment for the agent to start
Start-Sleep -Seconds 3

# Then start the frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot; pnpm i; next dev --turbopack" 