# /implement <task description>

Spawn the implementation-agent subagent to build the requested feature or module.

## Dispatch

Spawn `.claude/agents/implementation-agent.md` with this context:
- Working directory: `/Users/yassar/Desktop/Ciarus/OnPress`
- Task: the description passed after `/implement`
- Return: created/modified file list + type-check result only

The agent reads existing code, follows all conventions, runs a type-check, and returns a summary. Report only the returned summary to the user, then suggest running `/lint-test` and `/docs-update`.

## Example usage
- `/implement NestJS products module with trim-size and cover-style endpoints`
- `/implement Vue quoter-wizard component with step navigation`
- `/implement Pinia quote store with currentStep and quoteState`
