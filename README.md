# TaskFlow MCP — Autonomous Todo Application & Verification Engine

[![CI Pipeline](https://github.com/MubasharTanveer/Todo-List/actions/workflows/ci.yml/badge.svg)](https://github.com/MubasharTanveer/Todo-List/actions/workflows/ci.yml)
[![Tests Passing](https://img.shields.io/badge/tests-37%2F37%20passing-success.svg)](https://github.com/MubasharTanveer/Todo-List)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Protocol%202024--11--05-purple)](https://modelcontextprotocol.io/)

**TaskFlow MCP** is a modern, high-performance Todo web application and verification engine architected for autonomous AI agent pair-programming, client-side persistence, and direct **Model Context Protocol (MCP)** introspection.

---

## 1. Links & Project Artifacts

- **GitHub Repository:** [https://github.com/MubasharTanveer/Todo-List](https://github.com/MubasharTanveer/Todo-List)
- **Direct Documentation / README:** [https://github.com/MubasharTanveer/Todo-List#readme](https://github.com/MubasharTanveer/Todo-List#readme)
- **Linear Project & Roadmap:** [docs/LINEAR_PROJECT.md](docs/LINEAR_PROJECT.md) (See [Linear Ticket Progress Tracker](#linear-project--ticket-progress-tracker))
- **Linear Issue Sync Spec:** [docs/LINEAR_WORKFLOW.md](docs/LINEAR_WORKFLOW.md)
- **AI Agent Development Guide:** [AGENTS.md](AGENTS.md) & [docs/AGENT_WORKFLOW.md](docs/AGENT_WORKFLOW.md)

---

## 2. Setup & Installation Instructions

### Prerequisites
- **Node.js:** v20.x or higher (Node.js LTS recommended)
- **npm:** v10.x or higher

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/MubasharTanveer/Todo-List.git
cd Todo-List

# 2. Install dependencies
npm install

# 3. Launch the Vite development server
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on port `5173` |
| `npm test` | Runs the full Vitest suite (37 unit & integration tests) |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run build` | Validates TypeScript (`tsc -b`) and bundles production assets with Vite |
| `npm run lint` | Analyzes codebase using ESLint (0 errors, 0 warnings) |
| `npm run format` | Auto-formats all code via Prettier |
| `npm run mcp:server` | Starts the standalone Model Context Protocol (MCP) JSON-RPC stdio server |

---

## 3. Architecture & Data Model

### Strict Typed Entity Schema
Every todo item conforms strictly to the following contract in [`src/types/todo.ts`](src/types/todo.ts):

```typescript
export type Priority = 'low' | 'medium' | 'high';

export interface TodoItem {
  id: string;          // Cryptographically secure UUID or timestamp ID
  title: string;       // Non-empty string
  description?: string;// Optional notes / Markdown specifications
  completed: boolean;  // Status flag
  priority: Priority;  // 'low' | 'medium' | 'high'
  category: string;    // Category / tag (default: "General")
  createdAt: string;   // ISO 8601 timestamp
  updatedAt: string;   // ISO 8601 timestamp
}
```

### Decoupled Storage Layer
Persistence is cleanly decoupled from the UI via the `StorageAdapter<T>` interface:
1. **`LocalStorageAdapter<T>`** ([`src/storage/local-storage.adapter.ts`](src/storage/local-storage.adapter.ts)): Includes prefix isolation, corrupt JSON error boundaries, and auto-fallback to memory storage if `localStorage` throws or is blocked.
2. **`MemoryStorageAdapter<T>`** ([`src/storage/memory-storage.adapter.ts`](src/storage/memory-storage.adapter.ts)): In-memory mock store used for headless agent sessions and automated testing.

---

## 4. Model Context Protocol (MCP) Details

External AI agents (Claude Code, OpenAI Codex, Antigravity, Cursor) can introspect, query, and manipulate tasks across two primary channels:

### A. Standalone Stdio JSON-RPC Server
Located at [`server/mcp-server.js`](server/mcp-server.js). Run directly via `npm run mcp:server`.

Configure in your agent's MCP settings (e.g. `claude_desktop_config.json` or `.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "taskflow": {
      "command": "node",
      "args": ["server/mcp-server.js"]
    }
  }
}
```

### B. Runtime Web Bridge & In-App Inspector
- Accessible in the browser via `window.__TODO_MCP_BRIDGE__`.
- The live UI features an expandable **MCP Introspection Drawer** at the bottom of the dashboard allowing users and agents to inspect all tool schemas, copy JSON manifests, and execute tools live with real-time console feedback.

### Registered MCP Tools

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `list_todos` | `status`, `priority`, `category`, `searchQuery`, `sortBy` | Filter, search, and sort tasks |
| `get_todo` | `id` | Retrieve single task by unique ID |
| `create_todo` | `title`, `description`, `priority`, `category` | Create a new task |
| `update_todo` | `id`, `title`, `description`, `completed`, `priority`, `category` | Update existing task |
| `toggle_todo` | `id` | Toggle completion status |
| `delete_todo` | `id` | Remove task by ID |
| `clear_completed` | _none_ | Batch purge all completed items |
| `get_todo_stats` | _none_ | Retrieve summary counts, completion rate, and priority breakdown |
| `export_todos` | _none_ | Export entire store as formatted JSON |
| `import_todos` | `jsonString` | Batch load / restore tasks from JSON array |

---

## 5. Linear Project & Ticket Progress Tracker

The project includes bi-directional translation and ticket reconciliation between **TaskFlow MCP** and **Linear** via [`src/services/linear.service.ts`](src/services/linear.service.ts).

### Linear Project Roadmap & Ticket Status

| Ticket ID | Title | Priority | Status | Linear Milestone |
| :--- | :--- | :---: | :---: | :--- |
| **TASK-101** | Strict Data Schema & Type Definitions | Urgent (1) | **Done** | Core Architecture |
| **TASK-102** | Decoupled Storage Layer & LocalStorage Fallback | High (2) | **Done** | Core Architecture |
| **TASK-103** | Model Context Protocol Runtime Web Bridge | Urgent (1) | **Done** | MCP Integration |
| **TASK-104** | Standalone JSON-RPC 2.0 MCP Stdio Server | High (2) | **Done** | MCP Integration |
| **TASK-105** | Glassmorphic Dashboard UI & Fluid Theme System | Medium (3) | **Done** | Frontend & UX |
| **TASK-106** | Task Filtering, Sorting & Search Engine | Medium (3) | **Done** | Frontend & UX |
| **TASK-107** | Comprehensive Automated Test Suite (Vitest + RTL) | Urgent (1) | **Done** | Quality & Verification |
| **TASK-108** | GitHub Actions CI, PR Review & Auto-Merge | High (2) | **Done** | DevOps & CI/CD |
| **TASK-109** | Linear Ticket Synchronization Service | Medium (3) | **Done** | Linear Integration |
| **TASK-110** | Claude Code & OpenAI Codex Agent Templates | Low (4) | **Done** | Agentic Workflows |

> **Linear Project URL:** For full ticket history, milestone tracking, and webhook specifications, see [`docs/LINEAR_PROJECT.md`](docs/LINEAR_PROJECT.md) and [`docs/LINEAR_WORKFLOW.md`](docs/LINEAR_WORKFLOW.md).

---

## 6. What Works and What Remains Incomplete

###  What Works (100% Complete & Verified)

1. **Strict Data Model:**
   - Full compliance with `TodoItem` schema (crypto UUIDs, ISO 8601 timestamps, `'low' | 'medium' | 'high'` priority, categories).
2. **Decoupled Storage Persistence:**
   - Resilient `LocalStorageAdapter` with namespaced keys (`todo_app_`), corrupted data handling, and automatic fallback to `MemoryStorageAdapter`.
3. **Dual-Mode Model Context Protocol (MCP) Server:**
   - Browser bridge on `window.__TODO_MCP_BRIDGE__`.
   - Standalone JSON-RPC 2.0 server over stdio for external CLI tools (`npm run mcp:server`).
   - Interactive developer panel with live execution and schema copying.
4. **Rich Visual Aesthetics:**
   - Glassmorphic card design, dark slate and light modes, glowing priority badges, responsive layout, fluid transitions, and accessible focus rings.
5. **Interactive Controls & Undo System:**
   - Inline quick-add, collapsible metadata drawer, search bar, category chips, status tabs, and undoable toast notifications for deletions.
6. **Automated Verification:**
   - **37 / 37 automated tests passing** across 6 test suites (`npm test`).
   - **0 ESLint errors or warnings** (`npm run lint`).
   - Clean production bundle (`npm run build`).
7. **CI/CD Automation:**
   - GitHub Actions CI matrix (`.github/workflows/ci.yml`).
   - Automated PR review gate (`.github/workflows/pr-review.yml`).
   - Auto-merge workflow (`.github/workflows/auto-merge.yml`).

###  What Remains Incomplete / Future Roadmap

While all core and checklist requirements are 100% functional, the following production extensions are catalogued for future milestones:

1. **Multi-User Cloud Sync (WebSockets):**
   - The current persistence layer operates locally via `localStorage` and `data/todos.json`. Adding a hosted database (PostgreSQL / Supabase) with WebSocket broadcast would enable live multi-device synchronization.
2. **Direct Linear OAuth Webhook Ingestion:**
   - The bidirectional translation service (`LinearWorkflowService`) is implemented and tested. Integrating live incoming webhook endpoints would allow real-time background sync when issues are updated inside Linear's web UI.
3. **Encrypted Export:**
   - Adding client-side AES-GCM encryption to exported JSON backup files for sensitive enterprise task lists.

---

## 7. AI Agent Development Workflows

- **Antigravity / Cursor:** Read [`AGENTS.md`](AGENTS.md) for workflow rules and commands.
- **Claude Code:** Read [`CLAUDE.md`](CLAUDE.md) and review [`integrations/claude-code/config.json`](integrations/claude-code/config.json).
- **OpenAI Codex:** Review [`integrations/codex/prompt-template.json`](integrations/codex/prompt-template.json).
