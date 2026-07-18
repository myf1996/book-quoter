# /dev-log — Development Log Skill

Maintain a structured changelog of what was built, changed, or fixed in this session.

## What to do

1. **Read** `docs/DEV-LOG.md` (create it if it doesn't exist).

2. **Append** a new entry for the current session using this format:

```markdown
## [YYYY-MM-DD] — Phase X: Short title

### Added
- `path/to/file.ts` — what it does (one line)

### Changed
- `path/to/file.ts` — what changed and why

### Fixed
- Description of bug fixed

### Known Issues
- Any open issues discovered (not yet fixed)

### Next Steps
- What needs to happen in the next session
```

3. **Rules for entries:**
   - Use exact file paths from the repo root
   - One line per file — no multi-paragraph descriptions
   - Only log files that were actually created or meaningfully changed
   - "Known Issues" is required if any bugs were found but not fixed
   - "Next Steps" is always required

4. **Never** overwrite existing entries — only prepend new ones at the top (newest first).

5. **After appending**, print the new entry to the user for confirmation.

## When to invoke automatically
- After completing any implementation task (new files created)
- After fixing a bug
- Before ending a work session

## Log location
`docs/DEV-LOG.md` in the project root
