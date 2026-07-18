# Contributing Guide - Book Printing Quoter

**Quick Start for Developers**

---

## 🎯 Project Overview

Book Printing Quoter is a 4-phase web application for generating dynamic book printing quotes with admin controls. Built with React, Node.js, TypeScript, and PostgreSQL.

**Live URL:** (To be deployed)  
**Git Repository:** (GitHub URL)  
**Documentation:** See `/docs` directory

---

## 📋 Naming Conventions (STRICT)

### Files
```
✅ CORRECT:
  price-calculator.service.ts
  quote.controller.ts
  trim-size.step.tsx
  use-auth.hook.ts
  auth.middleware.ts

❌ WRONG - Don't use:
  PriceCalculator.ts, priceCalculator.js, price_calculator.ts
```

**Pattern:** `kebab-case` + `.type` suffix

### Code (Inside Files)
```typescript
// Variables, functions: camelCase
const quoteState = {};
function calculatePrice() {}

// Classes, Interfaces: PascalCase
class QuoteService {}
interface QuoteData {}

// Constants: UPPER_SNAKE_CASE
const MAX_QUANTITY = 10000;
```

### Endpoints
```
✅ CORRECT:
  POST /api/price-calculator
  GET /api/products/trim-sizes
  PUT /api/admin/pricing/:pricingId

❌ WRONG:
  POST /api/calculatePrice
  GET /api/products/trimSizes
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| UI | Tailwind CSS |
| Testing | Jest + React Testing Library |
| Linting | ESLint + Prettier |
| State | Context API |

---

## 📁 Project Structure

```
project/
├── frontend/                    # React app
│   ├── src/
│   │   ├── pages/              # *.page.tsx
│   │   ├── components/         # *.component.tsx
│   │   ├── hooks/              # use-*.hook.ts
│   │   ├── context/            # *.context.ts
│   │   └── utils/              # *.utils.ts
│   └── package.json
│
├── backend/                     # Node.js API
│   ├── src/
│   │   ├── controllers/        # *.controller.ts
│   │   ├── services/           # *.service.ts
│   │   ├── routes/             # *.routes.ts
│   │   ├── middleware/         # *.middleware.ts
│   │   ├── models/             # *.model.ts
│   │   ├── types/              # *.types.ts
│   │   └── config/             # *.config.ts
│   └── package.json
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DATABASE.md
│
├── CONTRIBUTING.md             # This file
├── CODE_OF_CONDUCT.md
└── config.json                 # Feature flags
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository
```bash
git clone <repo-url>
cd book-quoter
```

### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 3. Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://user:pass@localhost/quoter_db
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=5000
```

**Frontend (.env.local):**
```
REACT_APP_API_URL=http://localhost:5000
```

### 4. Database Setup
```bash
cd backend
npm run migrate
npm run seed
```

### 5. Start Development

**Frontend (Terminal 1):**
```bash
cd frontend
npm start
# Opens on http://localhost:3000
```

**Backend (Terminal 2):**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

---

## 📝 Before You Code

### 1. Check Naming Convention
Run the linter before committing:
```bash
npm run lint
npm run lint:fix  # Auto-fixes issues
```

### 2. Follow Type Safety
Always use TypeScript. No `any` types.
```typescript
// ✅ GOOD
interface QuoteConfig {
  trimSizeId: number;
  quantity: number;
}

function calculatePrice(config: QuoteConfig): Promise<PricingData> {
  // ...
}

// ❌ BAD
function calculatePrice(config: any): any {
  // ...
}
```

### 3. Create Tests
Every feature needs tests:
```typescript
// trim-size.step.test.tsx
describe('TrimSizeStep', () => {
  it('should render trim size options', () => {
    // Test code
  });
});
```

### 4. Document Changes
Add JSDoc comments:
```typescript
/**
 * Calculates final price for a book quote
 * @param quoteConfig - Quote configuration object
 * @param globalConfig - Global app configuration
 * @returns Promise with pricing breakdown
 */
export async function calculatePrice(
  quoteConfig: QuoteConfig,
  globalConfig: GlobalConfig
): Promise<PricingData> {
  // Implementation
}
```

---

## 🚀 Making Changes

### Feature Branch Workflow
```bash
# Always start from main
git checkout main
git pull

# Create feature branch
git checkout -b feature/description-of-change

# Make changes, commit frequently
git add .
git commit -m "feat: description of what changed"

# Push to remote
git push origin feature/description-of-change

# Create Pull Request on GitHub
```

### Commit Message Format
```
feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting changes
refactor: code restructuring (no feature change)
test: add or update tests
chore: dependency updates
```

### Pull Request Checklist
- [ ] Branch name follows convention
- [ ] Naming conventions followed (files, code, endpoints)
- [ ] ESLint passes (`npm run lint`)
- [ ] All tests pass (`npm run test`)
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] New features have tests
- [ ] Documentation updated in `/docs`
- [ ] No console.log() or debug code

---

## 🧪 Testing

### Run Tests
```bash
npm test                    # Run all tests
npm test -- --watch       # Watch mode
npm test -- --coverage    # Coverage report
```

### Write Tests
```typescript
// Example: quote.service.test.ts
import { QuoteService } from './quote.service';

describe('QuoteService', () => {
  let quoteService: QuoteService;

  beforeEach(() => {
    quoteService = new QuoteService();
  });

  it('should create a quote', async () => {
    const result = await quoteService.createQuote({
      userId: 1,
      config: {},
      totalPrice: 100
    });
    
    expect(result).toHaveProperty('id');
  });
});
```

---

## 🔍 Code Review Checklist

**For Reviewers:**
- [ ] Code follows naming conventions
- [ ] No TypeScript `any` types
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No commented-out code
- [ ] No console.log() or debugger statements
- [ ] Follows REST API standards (for endpoints)
- [ ] Error handling implemented
- [ ] Security checked (SQL injection, XSS, etc.)

**For Authors:**
- [ ] Self-reviewed your own code first
- [ ] All tests pass locally
- [ ] Linter passes locally
- [ ] Documentation is clear and accurate

---

## 📚 Documentation Standards

**Every significant feature needs:**
1. **JSDoc Comments** - In the code itself
2. **README** - In the feature folder if needed
3. **API Documentation** - In `/docs/API.md` for endpoints
4. **Type Definitions** - Clear TypeScript interfaces
5. **Architecture Notes** - For complex logic

### Example Structure
```typescript
// price-calculator.service.ts

/**
 * Service for calculating book printing quotes
 * 
 * Handles:
 * - Base price lookup from database
 * - Multiplier application (cover, finish, print type)
 * - Shipping and tax calculation
 * 
 * @example
 * const service = new PriceCalculatorService();
 * const pricing = await service.calculatePrice(quoteConfig);
 */
export class PriceCalculatorService {
  /**
   * Main calculation method
   * @throws Error if pricing data not found
   */
  async calculatePrice(config: QuoteConfig): Promise<PricingData> {
    // Implementation with clear comments
  }
}
```

---

## 🐛 Debugging Tips

### Frontend
```bash
# React DevTools Chrome Extension
# Redux DevTools for state inspection
# Network tab in DevTools to inspect API calls
```

### Backend
```bash
# Enable debug logging
DEBUG=* npm run dev

# Use VS Code debugger
# Add breakpoints in code, press F5
```

### Database
```bash
# Connect with psql
psql -U postgres -d quoter_db

# Common queries
SELECT * FROM quotes;
SELECT * FROM pricing WHERE trimSizeId = 2;
```

---

## 📞 Getting Help

- **Questions about code?** Check `/docs` folder first
- **Found a bug?** Create an issue with reproduction steps
- **Want to suggest change?** Open a discussion

---

## 🚀 Deployment (See DEPLOYMENT.md)

Deployment is automated via GitHub Actions to:
- Frontend: Vercel (free tier)
- Backend: Railway/Render (free tier)
- Database: Supabase PostgreSQL (free tier)

---

## ⚖️ License

(Your License Here)

---

**Last Updated:** July 2026  
**Maintained By:** Development Team

