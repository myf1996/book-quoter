# /docs-update

Spawn the docs-agent subagent to sync all documentation after code changes.

## Dispatch

Spawn `.claude/agents/docs-agent.md` with this context:
- Working directory: `/Users/yassar/Desktop/Ciarus/OnPress`
- Task: scan git-changed files and update all relevant docs
- Return: summary only (no file contents)

The agent handles everything. Report only the returned summary to the user.
