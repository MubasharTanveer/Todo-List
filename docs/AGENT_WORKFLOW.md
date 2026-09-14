# AI Agent Development & Discovery Workflow

This document guides autonomous agents (such as Claude Code, OpenAI Codex, and Antigravity) through the development, discovery, and automated execution workflow of TaskFlow MCP.

## 1. Discovery & Exploration
Upon entering the repository, an agent should inspect:
1. `AGENTS.md` and `CLAUDE.md` for project instructions.
2. `src/types/todo.ts` for strict schema definitions.
3. `server/mcp-server.js` for available MCP tools.
4. Run `npm test` to verify current health.

## 2. Model Context Protocol (MCP) Server Architecture
The repository features two MCP entry points:
- **Runtime Web Bridge:** `window.__TODO_MCP_BRIDGE__` for web subagents.
- **Stdio Server:** `node server/mcp-server.js` using standard JSON-RPC 2.0.

## 3. Pull Request Review & Automatic Merge
- When creating PRs, the CI workflow (`.github/workflows/ci.yml`) runs verification.
- The PR review bot (`.github/workflows/pr-review.yml`) posts automated status comments.
- Adding the `automerge` label triggers automatic merging (`.github/workflows/auto-merge.yml`) upon passing CI checks.
