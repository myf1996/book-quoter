# /dev-log

Spawn the log-agent subagent to surface app errors, database state, and code TODOs.

## Dispatch

Spawn `.claude/agents/log-agent.md` with this context:
- Working directory: `/Users/yassar/Desktop/Ciarus/OnPress`
- Task: check backend (port 5000), frontend (port 5173), PostgreSQL database, and grep TODOs
- Return: structured digest only (no raw log lines or SQL results)

The agent checks app logs, DB connection, table inventory, row counts, active locks, and migration status. Report only the returned digest to the user.
