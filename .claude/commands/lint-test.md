# /lint-test [fix]

Spawn the lint-agent subagent to run the full quality pipeline.

## Dispatch

Spawn `.claude/agents/lint-agent.md` with this context:
- Working directory: `/Users/yassar/Desktop/Ciarus/OnPress`
- Mode: "fix" if argument is "fix", otherwise "check"
- Return: pass/fail table + actionable failure list only

The agent handles ESLint, TypeScript, Jest, and build. Report only the returned summary table to the user.
