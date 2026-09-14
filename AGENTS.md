# AI Agent Development Workflow Specification

Welcome to the TaskFlow MCP repository. This project is architected for seamless autonomous agent pair-programming, automated testing, and Model Context Protocol (MCP) introspection.

## Quick Reference Commands

- **Development Server:** `npm run dev` (Runs Vite server on http://localhost:5173/)
- **Test Suite:** `npm test` (Runs Vitest unit & integration tests)
- **TypeScript Check & Build:** `npm run build` (`tsc -b && vite build`)
- **Linting:** `npm run lint` (ESLint)
- **Formatting:** `npm run format` (Prettier)
- **Standalone MCP Server:** `npm run mcp:server` (`node server/mcp-server.js`)

## Model Context Protocol (MCP) Integration

External agents (Claude Code, OpenAI Codex, Antigravity, Cursor) can communicate with the application through two channels:

### 1. Browser/Runtime Bridge
Accessible via `window.__TODO_MCP_BRIDGE__`.
Exposes:
- `getManifest()`
- `getTools()` (10 tools including `list_todos`, `create_todo`, `update_todo`, `toggle_todo`, `delete_todo`, `get_todo_stats`)
- `executeTool(name, params)`

### 2. Standalone Stdio JSON-RPC Server
Located at [`server/mcp-server.js`](file:///c:/Users/Mubashar/Desktop/New%20folder/server/mcp-server.js).
Configure in your agent's MCP settings:
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

## Linear Ticket Integration
Linear tickets are synchronized via [`src/services/linear.service.ts`](file:///c:/Users/Mubashar/Desktop/New%20folder/src/services/linear.service.ts) using `LinearWorkflowService.toLinearIssue` and `LinearWorkflowService.fromLinearIssue`.

## CI & Automated Merge Protocol
- GitHub Actions CI workflow in [`.github/workflows/ci.yml`](file:///c:/Users/Mubashar/Desktop/New%20folder/.github/workflows/ci.yml)
- Automated PR quality review in [`.github/workflows/pr-review.yml`](file:///c:/Users/Mubashar/Desktop/New%20folder/.github/workflows/pr-review.yml)
- Auto-merge on label `automerge` in [`.github/workflows/auto-merge.yml`](file:///c:/Users/Mubashar/Desktop/New%20folder/.github/workflows/auto-merge.yml)
