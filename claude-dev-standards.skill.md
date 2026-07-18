# Claude Skill: Code Standards Enforcement
## Automated Code Quality & Linting Validation

**Trigger:** When user says "review code", "build", "lint", "check standards", or "validate"  
**Purpose:** Enforce naming conventions, TypeScript safety, and code quality  
**Output:** Pass/Fail report with actionable fixes

---

## 🎯 SKILL DEFINITION

### When to Activate

Automatically activate this skill when Claude Code:
1. Generates any `.ts` or `.tsx` files
2. User asks to "review code"
3. User asks to "lint" or "check standards"
4. User asks to "validate" file naming
5. User asks to "build" the project

---

## ✅ VALIDATION RULES

### Rule 1: File Naming Convention
```
Pattern: [kebab-case].[type-suffix].ts or .tsx

✅ VALID:
  - price-calculator.service.ts
  - quote.controller.ts
  - trim-size.step.tsx
  - use-auth.hook.ts
  - auth.middleware.ts
  - quote.context.ts
  - pricing.types.ts

❌ INVALID - FAIL:
  - PriceCalculator.ts
  - priceCalculator.ts
  - price_calculator.ts
  - QuoteStep.jsx
  - AuthHook.js

FIX: Rename file to match pattern
```

### Rule 2: Code Naming (camelCase)
```
✅ VALID:
  const quoteState = {};
  let trimSizeId = 2;
  function calculatePrice() {}
  const isAuthenticated = true;

❌ INVALID - FAIL:
  const quote_state = {};
  let trim_size_id = 2;
  function calculate_price() {}
  const is_authenticated = true;

FIX: Rename variables/functions to camelCase
```

### Rule 3: Class/Interface Naming (PascalCase)
```
✅ VALID:
  class PriceCalculatorService {}
  interface QuoteData {}
  type PricingResult = {}

❌ INVALID - FAIL:
  class priceCalculatorService {}
  interface quoteData {}
  type pricing_result = {}

FIX: Rename to PascalCase
```

### Rule 4: Endpoints (kebab-case)
```
✅ VALID:
  POST /api/price-calculator
  GET /api/products/trim-sizes
  PUT /api/admin/pricing/:pricingId
  DELETE /api/quotes/:quoteId

❌ INVALID - FAIL:
  POST /api/calculatePrice
  GET /api/products/trimSizes
  PUT /api/admin/pricings

FIX: Use kebab-case in endpoint paths
```

### Rule 5: TypeScript Types (No 'any')
```
✅ VALID:
  function handleData(data: QuoteConfig): void {}
  async fetchQuote(id: number): Promise<Quote> {}

❌ INVALID - FAIL:
  function handleData(data: any): any {}
  async fetchQuote(id): void {}

FIX: Add explicit types to all parameters and return values
```

### Rule 6: Imports/Exports
```
✅ VALID:
  import { QuoteService } from './quote.service';
  export class QuoteController {}
  export function useQuoteState() {}

❌ INVALID - FAIL:
  import QuoteService from './quoteService';
  module.exports = { QuoteController };
  export default useQuoteState;

FIX: Use named imports/exports
```

### Rule 7: JSDoc Comments
```
✅ VALID:
  /**
   * Calculates pricing for a book quote
   * @param config - Quote configuration
   * @returns Promise with pricing data
   */
  async function calculatePrice(config: QuoteConfig): Promise<PricingData> {}

❌ INVALID - FAIL (No comment):
  async function calculatePrice(config: QuoteConfig): Promise<PricingData> {}

FIX: Add JSDoc comment for all exported functions/classes
```

### Rule 8: No Console Logs
```
✅ VALID:
  // No console.log, console.error, etc. in production code
  
❌ INVALID - FAIL:
  console.log('debug info');
  console.error(error);

FIX: Remove console logs or use proper logging service
```

### Rule 9: Database Columns (snake_case)
```
✅ VALID (SQL):
  CREATE TABLE trim_sizes (
    id SERIAL PRIMARY KEY,
    min_pages INT,
    max_pages INT,
    created_at TIMESTAMP
  );

✅ VALID (JavaScript mapping):
  const { minPages, maxPages, createdAt } = result.rows[0];

❌ INVALID:
  CREATE TABLE trimSizes (minPages INT);

FIX: Use snake_case in SQL, convert to camelCase in JavaScript
```

### Rule 10: Error Handling
```
✅ VALID:
  try {
    const data = await fetchQuote(id);
    return data;
  } catch (error) {
    console.error('Failed to fetch quote:', error);
    throw new Error('Quote fetch failed');
  }

❌ INVALID - FAIL:
  const data = await fetchQuote(id);  // No error handling
  return data;

FIX: Add try-catch or proper error handling
```

---

## 🛠️ LINTING CONFIGURATION

### ESLint Config (.eslintrc.json)
```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "rules": {
    "camelcase": ["error", { "properties": "always" }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-types": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-var": "error",
    "prefer-const": "error"
  }
}
```

### Prettier Config (.prettierrc)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "lint": "eslint src/**/*.{ts,tsx}",
    "lint:fix": "eslint src/**/*.{ts,tsx} --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "type-check": "tsc --noEmit",
    "build": "npm run lint && npm run type-check && tsc",
    "test": "jest",
    "pre-commit": "npm run lint && npm run type-check"
  }
}
```

---

## 🔄 VALIDATION WORKFLOW

### When Code is Generated

```
1. FILE NAMING CHECK
   ├─ Check filename pattern: kebab-case.[type].ts(x)
   ├─ Status: PASS/FAIL
   └─ Output: Rename recommendation if failed

2. CODE NAMING CHECK
   ├─ Check variables: camelCase
   ├─ Check classes: PascalCase
   ├─ Check functions: camelCase
   └─ Status: PASS/FAIL

3. TYPESCRIPT CHECK
   ├─ Check for 'any' types
   ├─ Check return type annotations
   ├─ Check parameter types
   └─ Status: PASS/FAIL

4. ENDPOINT CHECK (if API file)
   ├─ Check route paths: kebab-case
   ├─ Check HTTP methods: GET/POST/PUT/DELETE
   └─ Status: PASS/FAIL

5. JSDOC CHECK
   ├─ Check exported functions have comments
   ├─ Check classes have comments
   └─ Status: PASS/FAIL

6. ERROR HANDLING CHECK
   ├─ Check for try-catch blocks
   ├─ Check for error messages
   └─ Status: PASS/FAIL

7. LINTING CHECK
   ├─ Run ESLint
   ├─ Run TypeScript compiler
   └─ Status: PASS/FAIL
```

---

## 📊 OUTPUT FORMAT

### Success Report
```
✅ CODE VALIDATION PASSED

File: price-calculator.service.ts
├─ File naming: ✅ PASS
├─ Code naming: ✅ PASS (camelCase variables)
├─ Types: ✅ PASS (no 'any' types)
├─ JSDoc: ✅ PASS (all functions documented)
├─ Error handling: ✅ PASS (try-catch present)
└─ Linting: ✅ PASS (0 errors)

Status: READY TO COMMIT
```

### Failure Report
```
❌ CODE VALIDATION FAILED

File: PriceCalculator.ts
├─ File naming: ❌ FAIL
│  └─ Expected: price-calculator.service.ts
│  └─ Actual: PriceCalculator.ts
│  └─ Fix: Rename file
│
├─ Code naming: ❌ FAIL (1 issue)
│  └─ Line 5: const quote_state = {} (should be quoteState)
│
├─ Types: ⚠️  WARNING (2 issues)
│  └─ Line 12: parameter 'data: any' (should have explicit type)
│  └─ Line 15: return type missing on calculatePrice()
│
└─ Linting: ❌ FAIL (3 errors)
   └─ No console.log allowed
   └─ Missing JSDoc comment

FIXES REQUIRED:
1. Rename file to price-calculator.service.ts
2. Update variable names to camelCase
3. Add explicit TypeScript types
4. Add JSDoc comments
5. Remove console.log statements

Run: npm run lint:fix
```

---

## 🎬 ACTIVATION EXAMPLES

### Example 1: User asks to review code

**User:** "Review this code for standards"

**Skill Output:**
```
Running Code Standards Validation...

✅ price-calculator.service.ts - PASS
✅ quote.controller.ts - PASS
❌ auth-service.ts - FAIL
   └─ Should be: auth.service.ts
   └─ Fix: Rename file

Summary: 2/3 files PASS
Issues found: 1 naming issue

Would you like me to fix these issues?
```

### Example 2: Building the project

**User:** "Build the project"

**Skill Output:**
```
Building project...

1. Running Linter... 
   ✅ No lint errors

2. Running TypeScript Compiler...
   ✅ No type errors

3. Running Tests...
   ✅ All tests pass (28/28)

4. Building application...
   ✅ Build successful

Output: ./dist/
```

### Example 3: User generates a file

**Claude generates:** `QuoteCalculator.ts`

**Skill Auto-Triggers:**
```
⚠️  NAMING CONVENTION WARNING

Generated file: QuoteCalculator.ts
Expected file: quote-calculator.service.ts

Should I rename this file? (yes/no)
```

---

## 🔧 INTEGRATION WITH CLAUDE CODE

### When to Call This Skill

```typescript
// In Claude's internal logic, activate this skill:

if (fileGenerated && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
  validateCodeStandards(generatedCode);
}

if (userAsks('lint') || userAsks('check') || userAsks('review')) {
  validateCodeStandards(codebase);
}

if (userAsks('build') || userAsks('deploy')) {
  validateCodeStandards(codebase);
  buildProject();
}
```

---

## 📋 CHECKLIST FORMAT

**For developers to use before committing:**

```markdown
## Pre-Commit Checklist

- [ ] File names follow kebab-case.[type].ts pattern
- [ ] All variables use camelCase
- [ ] All classes/interfaces use PascalCase
- [ ] All API endpoints use kebab-case
- [ ] No TypeScript 'any' types used
- [ ] All functions have JSDoc comments
- [ ] No console.log() statements in production code
- [ ] Error handling implemented (try-catch)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes (npm run lint)
- [ ] All tests pass (npm run test)
- [ ] Documentation updated in /docs

Status: Ready to commit ✅
```

---

## 🚀 AUTOMATION

### GitHub Actions (CI/CD)

```yaml
name: Code Standards Check

on: [push, pull_request]

jobs:
  standards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint code
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
```

---

**Skill Status:** Active  
**Last Updated:** July 2026  
**Maintenance:** Quarterly review

