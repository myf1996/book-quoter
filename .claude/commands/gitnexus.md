# /gitnexus — Re-index Codebase with GitNexus

Run this after adding new modules, entities, or significant code changes so Claude Code has an up-to-date knowledge graph of the project.

## What to do

```bash
# From project root
gitnexus analyze
```

This re-indexes all TypeScript/JavaScript files, rebuilds the knowledge graph (dependency edges, call chains, module clusters), and updates the MCP context so Claude Code gets accurate architectural awareness.

## When to run
- After scaffolding new NestJS modules
- After adding/renaming TypeORM entities
- After refactoring that moves files between directories
- Before starting a complex multi-file task (ensures graph is fresh)

## One-time setup (already done)
```bash
gitnexus setup
```
This was run during project setup and registered GitNexus MCP in Claude Code.

## Verify it's working
After `gitnexus analyze`, Claude Code should be able to answer questions like:
- "What modules depend on ProductsService?"
- "What's the full call chain from ProductsController to the database?"
- "Which entities have no relations yet?"
