# UIP Email Client

A modern web application for connecting to email services via the Multi-Cloud Platform (MCP).

## Prerequisites

- Node.js 18+ or 20+
- npm or pnpm
- Poetry (for the agent component)

## Getting Started

### Clone the repository

```bash
git clone <repository-url>
cd open-mcp-client
```

### Install dependencies

```bash
npm install
# or
pnpm install
```

### Environment Setup

Create a `.env.local` file in the root of the project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the Development Server

#### On Linux/macOS:

```bash
npm run dev
# or
pnpm dev
```

#### On Windows:

Option 1: Using the PowerShell script
```powershell
.\start-dev.ps1
```

Option 2: Running directly with npm
```powershell
npm run dev-win
```

### Building for Production

```bash
npm run build
# or
pnpm build
```

### Starting the Production Server

```bash
npm start
# or
pnpm start
```

## Features

- Connect to various email and collaboration services
- Manage service connections
- User authentication via Supabase
- Modern UI with responsive design

## Troubleshooting

### Authentication Issues

If you encounter authentication issues, make sure your Supabase credentials are correctly set in the `.env.local` file and that you have proper user management configured in your Supabase project.

### Development Server Issues on Windows

Windows PowerShell has different command chaining syntax than bash. If you encounter issues with the dev command, use the provided `start-dev.ps1` script or the `npm run dev-win` command.

## License

[MIT](LICENSE)

https://github.com/user-attachments/assets/f72e1f7d-3c84-4429-a465-23dff3d3bd63


# Getting Started

## Set Up Environment Variables:

```sh
touch .env
```

Add the following inside `.env` at the root:

```sh
LANGSMITH_API_KEY=lsv2_...
```

Next, create another `.env` file inside the `agent` folder:

```sh
cd agent
touch .env
```

Add the following inside `agent/.env`:

```sh
OPENAI_API_KEY=sk-...
LANGSMITH_API_KEY=lsv2_...
```

## Development

We recommend running the **frontend and agent separately** in different terminals to debug errors and logs:

```bash
# Terminal 1 - Frontend
pnpm run dev-frontend

# Terminal 2 - Agent
pnpm run dev-agent
```

Alternatively, you can run both services together with:

```bash
pnpm run dev
```

Then, open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

The codebase is split into two main parts:

1. `/agent` **folder** – A LangGraph agent that connects to MCP servers and calls their tools.
2. `/app` **folder** – A frontend application using CopilotKit for UI and state synchronization.
