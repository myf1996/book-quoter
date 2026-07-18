# 🚀 MASTER CLAUDE CODE PROMPT
## Book Printing Quoter - Phase 1 Complete Build

Copy-paste this ENTIRE prompt into Claude Code and run it.

---

## PROMPT FOR CLAUDE CODE

```
You are building the Book Printing Quoter application. Follow EVERY rule below exactly.

═══════════════════════════════════════════════════════════════════════════════

## 📋 PROJECT OVERVIEW
- Name: Book Printing Quoter
- Type: Full-stack web application (React + Node.js + PostgreSQL)
- Current Phase: Phase 1 (Core Quoter - Weeks 1-2)
- Timeline: 8 weeks (4 phases)
- Deployment: FREE (Vercel + Railway + Supabase)
- Status: Ready for Phase 1 implementation

═══════════════════════════════════════════════════════════════════════════════

## 🎯 PHASE 1 DELIVERABLE (Weeks 1-2)

Build a 6-step quoter wizard that displays book printing options WITHOUT pricing.

### What Phase 1 Does:
1. User selects Trim Size (5 pre-configured options)
2. User selects Cover Style (Softcover, Hardcover, Dust Jacket)
3. User selects Cover Finish (Gloss, Matte, Textured)
4. User selects Print Type (Black & White, Color)
5. User selects Paper Stock (60lb Natural, 70lb White, 80lb White)
6. User selects Binding Type (Perfect Bind, Saddle Stitch, Spiral)

### What Phase 1 Does NOT Include:
- ❌ Pricing calculation (that's Phase 2)
- ❌ User authentication (that's Phase 3)
- ❌ Admin panel (that's Phase 4)
- ❌ Quote saving (that's Phase 3)

### Final Output:
A responsive wizard on https://quoter.vercel.app showing all selected options in a summary panel.

═══════════════════════════════════════════════════════════════════════════════

## 🔤 NAMING CONVENTIONS (STRICT - NO EXCEPTIONS)

### FILE NAMING: kebab-case + .type.extension

FRONTEND FILES:
✅ CORRECT EXAMPLES:
  - src/pages/quoter.page.tsx
  - src/components/quoter-wizard.component.tsx
  - src/components/steps/trim-size.step.tsx
  - src/components/steps/cover-style.step.tsx
  - src/components/steps/cover-finish.step.tsx
  - src/components/steps/print-type.step.tsx
  - src/components/steps/paper-stock.step.tsx
  - src/components/steps/binding.step.tsx
  - src/components/quote-summary.component.tsx
  - src/components/step-navigation.component.tsx
  - src/components/progress-bar.component.tsx
  - src/hooks/use-quote-state.hook.ts
  - src/context/config.context.ts
  - src/context/quote.context.ts
  - src/utils/helpers.utils.ts
  - src/constants.ts

❌ WRONG (Don't use these):
  - QuoterPage.jsx
  - QuoterWizard.jsx
  - TrimSizeStep.jsx
  - useQuoteState.js
  - ConfigContext.js
  - priceCalculator.js
  - quote_state.ts

BACKEND FILES:
✅ CORRECT EXAMPLES:
  - src/controllers/quoter.controller.ts
  - src/services/quoter.service.ts
  - src/routes/products.routes.ts
  - src/middleware/error-handler.middleware.ts
  - src/models/quote.model.ts
  - src/types/quote.types.ts
  - src/config/database.config.ts
  - src/utils/validators.utils.ts

❌ WRONG:
  - QuoterController.ts
  - quoterController.ts
  - QuoterService.js
  - error_handler.ts

### CODE NAMING: camelCase for variables/functions

✅ CORRECT:
  const quoteState = {};
  const trimSizeId = 2;
  let coverStyleId = 1;
  function calculatePrice() {}
  const isAuthenticated = false;
  const handleSelectTrimSize = () => {};

❌ WRONG:
  const quote_state = {};
  const trim_size_id = 2;
  const TrimSizeId = 2;
  function calculate_price() {}
  const is_authenticated = false;

### CLASSES & INTERFACES: PascalCase

✅ CORRECT:
  class QuoteService {}
  interface QuoteConfig {}
  interface QuoteData {}
  type PricingResult = {}

❌ WRONG:
  class quoteService {}
  interface quoteConfig {}
  type pricing_result = {}

### API ENDPOINTS: kebab-case

✅ CORRECT:
  GET /api/config
  GET /api/products/trim-sizes
  GET /api/products/cover-styles
  GET /api/products/cover-finishes
  GET /api/products/print-types
  GET /api/products/paper-stocks
  GET /api/products/binding-types

❌ WRONG:
  GET /api/products/trimSizes
  GET /api/products/coverStyles
  GET /api/products/trim_sizes

### DATABASE: snake_case (SQL), convert to camelCase (JavaScript)

✅ CORRECT:
  -- SQL
  CREATE TABLE trim_sizes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP
  );

  // JavaScript
  const { name, createdAt } = result.rows[0];  // Convert to camelCase

❌ WRONG:
  CREATE TABLE trimSizes (
    minPages INT
  );

═══════════════════════════════════════════════════════════════════════════════

## 📁 FILE STRUCTURE TO CREATE

```
project/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── quoter.page.tsx              # Main page
│   │   │
│   │   ├── components/
│   │   │   ├── quoter-wizard.component.tsx  # Step container
│   │   │   ├── steps/
│   │   │   │   ├── trim-size.step.tsx       # Step 1
│   │   │   │   ├── cover-style.step.tsx     # Step 2
│   │   │   │   ├── cover-finish.step.tsx    # Step 3
│   │   │   │   ├── print-type.step.tsx      # Step 4
│   │   │   │   ├── paper-stock.step.tsx     # Step 5
│   │   │   │   └── binding.step.tsx         # Step 6
│   │   │   ├── quote-summary.component.tsx  # Display only
│   │   │   ├── step-navigation.component.tsx # Next/Back
│   │   │   └── progress-bar.component.tsx    # Progress
│   │   │
│   │   ├── hooks/
│   │   │   └── use-quote-state.hook.ts      # State management
│   │   │
│   │   ├── context/
│   │   │   ├── config.context.ts            # Global config
│   │   │   └── quote.context.ts             # Quote state
│   │   │
│   │   ├── utils/
│   │   │   ├── helpers.utils.ts             # Utilities
│   │   │   └── constants.ts
│   │   │
│   │   ├── App.tsx
│   │   └── index.tsx
│   │
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── quoter.controller.ts
│   │   │
│   │   ├── services/
│   │   │   └── quoter.service.ts
│   │   │
│   │   ├── routes/
│   │   │   └── products.routes.ts
│   │   │
│   │   ├── middleware/
│   │   │   └── error-handler.middleware.ts
│   │   │
│   │   ├── models/
│   │   │   └── quote.model.ts
│   │   │
│   │   ├── types/
│   │   │   └── quote.types.ts
│   │   │
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   └── config.json
│   │   │
│   │   └── app.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/
│   └── README.md
│
├── CONTRIBUTING.md
├── DEPLOYMENT.md
├── PROJECT-BRIEF.md
└── package.json (root)
```

═══════════════════════════════════════════════════════════════════════════════

## 🗄️ DATABASE SCHEMA (PostgreSQL)

Create these tables:

```sql
CREATE TABLE trim_sizes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  width DECIMAL(5, 2) NOT NULL,
  height DECIMAL(5, 2) NOT NULL,
  min_pages INT DEFAULT 24,
  max_pages INT DEFAULT 840,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cover_styles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cover_finishes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE print_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE paper_stocks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  weight VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE binding_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed initial data
INSERT INTO trim_sizes (name, width, height) VALUES
('Digest', 5.5, 8.5),
('Trade Paperback', 6.0, 9.0),
('8x10', 8.0, 10.0),
('Hardcover', 6.5, 9.5),
('Square', 8.5, 8.5);

INSERT INTO cover_styles (name) VALUES
('Softcover'),
('Hardcover'),
('Dust Jacket');

INSERT INTO cover_finishes (name) VALUES
('Gloss'),
('Matte'),
('Textured');

INSERT INTO print_types (name) VALUES
('Black & White'),
('Color');

INSERT INTO paper_stocks (name, weight) VALUES
('60lb Natural', '60'),
('70lb White', '70'),
('80lb White', '80');

INSERT INTO binding_types (name) VALUES
('Perfect Bind'),
('Saddle Stitch'),
('Spiral');
```

═══════════════════════════════════════════════════════════════════════════════

## 🔌 API ENDPOINTS (Phase 1)

Backend will serve these:

GET /api/config
  Returns: { phases: { phase1CoreQuoter: true, phase2PricingEngine: false, ... }, features: {...} }
  Used by: Frontend on app startup

GET /api/products/trim-sizes
  Returns: [{ id, name, width, height, minPages, maxPages }, ...]
  Used by: Step 1 (TrimSizeStep)

GET /api/products/cover-styles
  Returns: [{ id, name }, ...]
  Used by: Step 2

GET /api/products/cover-finishes
  Returns: [{ id, name }, ...]
  Used by: Step 3

GET /api/products/print-types
  Returns: [{ id, name }, ...]
  Used by: Step 4

GET /api/products/paper-stocks
  Returns: [{ id, name, weight }, ...]
  Used by: Step 5

GET /api/products/binding-types
  Returns: [{ id, name }, ...]
  Used by: Step 6

═══════════════════════════════════════════════════════════════════════════════

## ⚙️ CONFIG.JSON (Feature Flags)

Create backend/src/config/config.json:

{
  "phases": {
    "phase1CoreQuoter": true,
    "phase2PricingEngine": false,
    "phase3Authentication": false,
    "phase4AdminPanel": false
  },
  "features": {
    "quoter": {
      "enabled": true,
      "trimSizes": { "enabled": true },
      "coverStyles": { "enabled": true },
      "coverFinishes": { "enabled": true },
      "printTypes": { "enabled": true },
      "paperStocks": { "enabled": true },
      "bindingTypes": { "enabled": true }
    },
    "pricing": {
      "enabled": false
    },
    "auth": {
      "enabled": false
    },
    "adminPanel": {
      "enabled": false
    }
  }
}

═══════════════════════════════════════════════════════════════════════════════

## 🎨 FRONTEND COMPONENT ARCHITECTURE

QuoterPage (main page)
  ├── QuoterWizard (step container)
  │   ├── ProgressBar
  │   ├── Step 1: TrimSizeStep
  │   ├── Step 2: CoverStyleStep
  │   ├── Step 3: CoverFinishStep
  │   ├── Step 4: PrintTypeStep
  │   ├── Step 5: PaperStockStep
  │   ├── Step 6: BindingStep
  │   ├── StepNavigation (Previous/Next buttons)
  │   │
  │   └── QuoteSummary (right panel, always visible)
  │       ├── Trim Size: {selected}
  │       ├── Cover Style: {selected}
  │       ├── Cover Finish: {selected}
  │       ├── Print Type: {selected}
  │       ├── Paper Stock: {selected}
  │       ├── Binding: {selected}
  │       └── (No pricing in Phase 1)

### State Structure (use-quote-state.hook.ts):

{
  currentStep: 1,
  quoteState: {
    trimSizeId: null,
    coverStyleId: null,
    coverFinishId: null,
    printTypeId: null,
    paperStockId: null,
    bindingTypeId: null
  },
  
  // Functions
  updateQuoteState: (updates) => void,
  goToNextStep: () => void,
  goToPreviousStep: () => void,
  isStepComplete: () => boolean
}

### Context Architecture:

ConfigContext:
  - Provides: globalConfig (from /api/config)
  - Used by: All components to check if features enabled

QuoteContext:
  - Provides: quoteState, updateQuoteState
  - Used by: All step components

═══════════════════════════════════════════════════════════════════════════════

## 📝 CODE QUALITY REQUIREMENTS

### TypeScript Requirements:
- ✅ NO 'any' types - use explicit types everywhere
- ✅ All function parameters must have types
- ✅ All function return types must be specified
- ✅ All interfaces/types must be named with PascalCase
- ✅ Use strict mode in tsconfig.json

Example:
```typescript
// ✅ CORRECT
interface QuoteConfig {
  trimSizeId: number;
  coverStyleId: number;
}

function updateQuote(config: QuoteConfig): void {
  // ...
}

// ❌ WRONG
function updateQuote(config: any): any {
  // ...
}
```

### JSDoc Requirements:
- ✅ All exported functions must have JSDoc comments
- ✅ All React components must have JSDoc
- ✅ All services/controllers must have JSDoc
- ✅ Include @param, @returns, @throws where applicable

Example:
```typescript
/**
 * Updates the quote state with new configuration
 * @param config - The quote configuration object
 * @returns void
 */
export function updateQuoteState(config: QuoteConfig): void {
  // ...
}
```

### Error Handling:
- ✅ All API calls must have try-catch
- ✅ All promises must handle errors
- ✅ All database queries must have error handling
- ✅ User-facing errors must be displayed

### No Console Logs:
- ✅ Remove all console.log() from production code
- ✅ Use proper logging service if needed
- ✅ Allow console.error() and console.warn() only

### Testing:
- ✅ Create .test.ts or .test.tsx files for all services
- ✅ Create .test.tsx files for components
- ✅ Minimum 70% code coverage
- ✅ Test critical paths only (Phase 1)

Example test file location:
  src/services/quoter.service.test.ts
  src/components/quoter-wizard.component.test.tsx

═══════════════════════════════════════════════════════════════════════════════

## 🔧 NPM SCRIPTS (Both Frontend & Backend)

Frontend (package.json):
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "jest",
    "lint": "eslint src/**/*.{ts,tsx}",
    "lint:fix": "eslint src/**/*.{ts,tsx} --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  }
}

Backend (package.json):
{
  "scripts": {
    "dev": "ts-node-dev src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest",
    "lint": "eslint src/**/*.{ts,tsx}",
    "lint:fix": "eslint src/**/*.{ts,tsx} --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js"
  }
}

═══════════════════════════════════════════════════════════════════════════════

## ✅ VALIDATION CHECKLIST

Before generating code, validate:

□ File naming: All files use kebab-case + .type extension
□ Code naming: All variables/functions use camelCase
□ Classes: All classes/interfaces use PascalCase
□ Endpoints: All API routes use kebab-case
□ Types: No 'any' types anywhere
□ JSDoc: All exported functions have comments
□ Error handling: All API calls wrapped in try-catch
□ No logs: No console.log() in production code
□ Tests: Critical paths have tests
□ TypeScript: Compiles without errors
□ ESLint: Passes all linting rules
□ Prettier: Code is formatted

═══════════════════════════════════════════════════════════════════════════════

## 🚀 WHAT TO BUILD (In Order)

1. Database Setup
   ├─ Create all 7 tables
   └─ Seed initial data

2. Backend Setup
   ├─ Create Express app
   ├─ Setup middleware
   ├─ Create routes
   ├─ Create services
   └─ Create controllers

3. Frontend Setup
   ├─ Create React app structure
   ├─ Create contexts (ConfigContext, QuoteContext)
   ├─ Create hooks (use-quote-state.hook.ts)
   └─ Setup Tailwind CSS

4. Components
   ├─ Create ProgressBar
   ├─ Create 6 Step components
   ├─ Create QuoteSummary
   ├─ Create StepNavigation
   └─ Create QuoterWizard

5. Integration
   ├─ Connect frontend to backend API
   ├─ Test all steps
   ├─ Test navigation
   └─ Test responsive design

6. Deployment
   ├─ Add deployment scripts
   ├─ Create .env files
   └─ Document deployment

═══════════════════════════════════════════════════════════════════════════════

## 📊 EXPECTED RESULT

After running this prompt, you should have:

✅ Complete PostgreSQL database with 7 tables
✅ Express.js backend with API endpoints
✅ React frontend with 6-step quoter
✅ All files named with kebab-case + type suffix
✅ All code using camelCase variables
✅ All endpoints using kebab-case
✅ All functions with JSDoc comments
✅ All types explicitly defined (no 'any')
✅ Error handling on all API calls
✅ Tests for critical paths
✅ TypeScript compilation without errors
✅ ESLint passing all checks
✅ Prettier formatted code
✅ Ready for deployment to Vercel + Railway

═══════════════════════════════════════════════════════════════════════════════

## 🎓 CLAUDE SKILLS TO USE

Activate these two skills while building:

SKILL 1: Code Standards Enforcement
- Auto-validates file naming (kebab-case + type)
- Auto-validates code naming (camelCase)
- Auto-validates TypeScript (no 'any')
- Auto-validates endpoints (kebab-case)
- Auto-checks JSDoc comments
- Auto-checks error handling
- Generates pass/fail reports

SKILL 2: Documentation Generation
- Auto-generates service documentation
- Auto-generates controller documentation
- Auto-generates API documentation
- Maintains knowledge base
- Creates Architecture Decision Records
- Cross-references all components
- Validates documentation completeness

═══════════════════════════════════════════════════════════════════════════════

## 💻 TECH STACK CONFIRMED

Frontend: React 18 + TypeScript + Tailwind CSS
Backend: Node.js + Express + TypeScript
Database: PostgreSQL
State: Context API + Custom Hooks
Testing: Jest + React Testing Library
Linting: ESLint + Prettier
Deployment: Vercel (Frontend) + Railway (Backend + Database)
Cost: $0/month (free tier)

═══════════════════════════════════════════════════════════════════════════════

## 🎯 FINAL INSTRUCTION

Build Phase 1 of the Book Printing Quoter following EVERY single specification above.

Use these naming conventions EXACTLY as specified (no exceptions):
- Files: kebab-case + .type.extension
- Code: camelCase for variables/functions
- Classes: PascalCase
- Endpoints: kebab-case
- Database: snake_case

Generate complete, production-ready code with:
- TypeScript everywhere (no 'any')
- JSDoc on all exports
- Error handling on all API calls
- Tests for critical paths
- Proper environment configuration
- Ready to deploy to Vercel + Railway

Start building now. Ask me questions only if something is unclear.
```

═══════════════════════════════════════════════════════════════════════════════

---

