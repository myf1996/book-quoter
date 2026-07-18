# /dev-log

Spawn the log-agent subagent to surface errors, warnings, and code TODOs.

## Dispatch

Spawn `.claude/agents/log-agent.md` with this context:
- Working directory: `/Users/yassar/Desktop/Ciarus/OnPress`
- Task: check backend (port 5000) and frontend (port 3000) logs, grep TODOs
- Return: structured digest only (no raw log lines)

The agent handles all log collection and filtering. Report only the returned digest to the user.
