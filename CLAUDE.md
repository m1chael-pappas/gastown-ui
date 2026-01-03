# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Gastown UI is a complete dashboard + backend for the Gas Town multi-agent orchestration system. It includes:

- **Frontend**: Next.js 16 dashboard for monitoring agents, beads, convoys, and insights
- **Backend**: Gas Town CLI (`gt`) - the orchestrator (MIT licensed, from steveyegge/gastown)
- **Beads CLI**: (`bd`) - git-backed issue tracker (MIT licensed, from steveyegge/beads)

## Quick Start

```bash
# One command setup
pnpm setup

# Start the dashboard
pnpm dev
```

The setup script will:
1. Check prerequisites (Go 1.23+, Git, pnpm)
2. Build `gt` and `bd` CLI tools to `./bin/`
3. Install Node dependencies
4. Initialize a Gas Town workspace at `~/gt`

## Development Commands

```bash
pnpm setup       # Full setup (Go tools + Node deps + workspace init)
pnpm dev         # Start dashboard at http://localhost:3000
pnpm terminal    # Start terminal WebSocket server (port 3001)
pnpm dev:all     # Start both dashboard and terminal server
pnpm gastown     # Start both with GASTOWN_PATH env set
pnpm build       # Build for production
```

## Environment Variables

```bash
GASTOWN_PATH=~/gt   # Path to your Gas Town workspace (default: ~/gt)
```

Create `.env.local` with your configuration.

## Project Structure

```
gastown-ui/
├── src/                    # Next.js frontend
│   ├── app/                # App Router pages
│   │   ├── page.tsx        # Town Overview (home)
│   │   ├── agents/         # Agent management
│   │   ├── beads/          # Work items list
│   │   ├── convoys/        # Grouped work packages
│   │   ├── graph/          # React Flow dependency graph
│   │   ├── insights/       # Graph analytics (from bv)
│   │   ├── mail/           # Agent communication
│   │   ├── terminal/       # Web terminal (xterm.js)
│   │   └── api/            # API routes (calls gt/bd CLIs)
│   ├── components/         # Shared components
│   ├── lib/                # Utilities (beads.ts, gastown.ts)
│   └── types/              # TypeScript definitions
├── backend/                # Gas Town Go source (cloned)
├── beads-cli/              # Beads Go source (cloned)
├── bin/                    # Built CLI binaries (gt, bd)
├── scripts/
│   └── setup.sh            # Full setup script
└── docs/                   # Documentation
```

## Architecture

### Frontend Tech Stack

- Next.js 16 (App Router) + React 19
- TypeScript 5
- Tailwind CSS 4
- @xyflow/react (React Flow) for dependency graphs
- TanStack Query for data fetching
- Lucide React for icons

### Backend Integration

The API routes execute CLI commands or parse files directly:

| Route | Data Source |
|-------|-------------|
| `/api/beads` | Parse `.beads/beads.jsonl` |
| `/api/agents` | `gt status --json` |
| `/api/convoys` | `gt convoy list --json` |
| `/api/insights` | `bv --robot-insights` |
| `/api/mail` | `gt mail inbox --json` |

### Gas Town Concepts

- **Town**: Workspace root (`~/gt`) containing all projects
- **Rig**: A git project under Gas Town management
- **Bead**: Atomic unit of work (issue) stored in JSONL
- **Convoy**: Grouped beads for tracking related work
- **Hook**: Where work hangs for an agent (persists across restarts)
- **Agent Roles**:
  - Mayor: Cross-rig coordinator
  - Witness: Monitors polecats per rig
  - Refinery: Merge queue per rig
  - Polecat: Ephemeral worker (spawn → work → disappear)

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/beads.ts` | JSONL parser for `.beads/beads.jsonl` |
| `src/lib/gastown.ts` | CLI wrapper for `gt`, `bd`, `bv` |
| `src/types/gastown.ts` | TypeScript types (Bead, Agent, Convoy, etc.) |
| `src/components/terminal.tsx` | xterm.js terminal component |
| `server/terminal-server.ts` | WebSocket server for terminal (node-pty) |
| `scripts/setup.sh` | Full setup script |

## Web Terminal

The dashboard includes a web terminal powered by xterm.js. It connects to a WebSocket server that spawns a pseudo-terminal using node-pty.

```bash
# Start the terminal server (required for /terminal page)
pnpm terminal

# Or start both servers at once
pnpm dev:all
```

Features:
- Full terminal emulation with 256 colors
- Run `gt prime` to start the Mayor session directly in the browser
- Quick command buttons for common Gas Town operations
- Auto-fit to container size

## Using with Gas Town

After setup:

```bash
# Add PATH to use the CLI tools
export PATH="$PATH:$(pwd)/bin"

# Initialize workspace (if not done by setup)
gt install ~/gt

# Add a project
cd ~/gt
gt rig add myproject https://github.com/you/repo.git

# Start the Mayor session (AI coordinator)
gt prime

# Or use the dashboard
pnpm dev
# Open http://localhost:3000
```
