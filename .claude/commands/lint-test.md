# /lint-test — Lint, Type-Check & Test Skill

Run the full quality pipeline and report pass/fail with fix instructions.

## Execution order

Run these in sequence. Stop and report if any step fails with errors (not warnings).

### Step 1 — ESLint (both workspaces)
```bash
cd frontend && npm run lint 2>&1
cd ../backend && npm run lint 2>&1
```
Report: list of files with errors, rule name, line number.

### Step 2 — TypeScript type check (both workspaces)
```bash
cd frontend && npm run type-check 2>&1
cd ../backend && npm run type-check 2>&1
```
Report: TS error code, file, line, message.

### Step 3 — Tests
```bash
cd frontend && npm test -- --watchAll=false --coverage 2>&1
cd ../backend && npm test -- --coverage 2>&1
```
Report: pass/fail count, coverage % per file.

### Step 4 — Build check
```bash
cd frontend && npm run build 2>&1
cd ../backend && npm run build 2>&1
```
Report: any compile/bundle errors.

## Output format

Print a summary table after all steps:

```
┌─────────────────┬──────────┬──────────┐
│ Check           │ Frontend │ Backend  │
├─────────────────┼──────────┼──────────┤
│ ESLint          │ ✅ PASS  │ ✅ PASS  │
│ TypeScript      │ ✅ PASS  │ ❌ FAIL  │
│ Tests           │ ✅ PASS  │ ✅ PASS  │
│ Coverage        │ 82%      │ 74%      │
│ Build           │ ✅ PASS  │ ✅ PASS  │
└─────────────────┴──────────┴──────────┘
```

Then list all failures with the exact fix needed.

## Auto-fix mode

If invoked as `/lint-test fix`:
1. Run `npm run lint:fix` in both workspaces first
2. Then re-run the full pipeline above
3. Only report issues that couldn't be auto-fixed

## Rules
- Never modify test files to make tests pass — fix the source code
- Coverage below 70% is a FAIL, not a warning
- `any` types found by tsc are FAIL (enforce `noImplicitAny`)
- `console.log` in non-test source files → ESLint error, must fix
