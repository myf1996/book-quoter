# Claude Skill: Automated Documentation & Knowledge Base
## Smart Subagent for Code Documentation, Architecture, and Future Maintainability

**Trigger:** When code changes, new features added, or architecture updates  
**Purpose:** Maintain living documentation as a single source of truth  
**Output:** Auto-generated, searchable knowledge base

---

## 🎯 SKILL DEFINITION

### Responsibilities

This skill acts as a **Subagent** that:
1. **Monitors** all code changes automatically
2. **Extracts** relevant information from code and comments
3. **Generates** documentation dynamically
4. **Updates** knowledge base whenever code changes
5. **Validates** documentation completeness
6. **Maintains** architecture diagrams and flow charts
7. **Tracks** all significant decisions (ADR - Architecture Decision Records)

---

## 📚 DOCUMENTATION STRUCTURE

### Base Directory: `/docs`

```
docs/
├── README.md                          # Overview & quick links
├── GETTING_STARTED.md                 # Setup guide
├── ARCHITECTURE.md                    # System design
├── API.md                             # API documentation
├── DATABASE.md                        # Schema & queries
├── FEATURES.md                        # Feature descriptions
├── DECISIONS.md                       # Architecture Decision Records
├── TROUBLESHOOTING.md                 # Common issues & fixes
├── GLOSSARY.md                        # Terms & definitions
│
├── backend/
│   ├── services/                      # Service docs
│   ├── controllers/                   # Controller docs
│   └── middleware/                    # Middleware docs
│
├── frontend/
│   ├── components/                    # Component docs
│   ├── hooks/                         # Hook docs
│   └── pages/                         # Page docs
│
└── diagrams/
    ├── architecture.md
    ├── data-flow.md
    └── component-hierarchy.md
```

---

## 🔄 AUTO-DOCUMENTATION TRIGGERS

### Trigger 1: New File Created
```
File: price-calculator.service.ts

AUTO GENERATES:
✅ docs/backend/services/price-calculator-service.md

Content includes:
- File purpose
- Exported functions/classes
- Usage examples
- Dependencies
- Test coverage
```

### Trigger 2: Code Changes Detected
```
Modified: src/services/quote.service.ts

AUTO UPDATES:
✅ docs/backend/services/quote-service.md
✅ docs/API.md (if routes changed)
✅ docs/ARCHITECTURE.md (if structure changed)

Changes tracked:
- New methods added
- Parameter changes
- Return type changes
- New error conditions
```

### Trigger 3: Endpoint Addition
```
Added: POST /api/price-calculator

AUTO GENERATES:
✅ Section in docs/API.md

Content:
- Endpoint URL
- HTTP method
- Request body schema
- Response schema
- Error responses
- Example usage
```

### Trigger 4: Database Schema Change
```
Modified: CREATE TABLE pricing

AUTO GENERATES:
✅ Updated docs/DATABASE.md

Content:
- Table structure
- Column descriptions
- Relationships
- Indexes
- Usage queries
```

---

## 📄 AUTO-GENERATED DOCUMENTATION TEMPLATES

### 1. Service Documentation

**Filename:** `docs/backend/services/[name]-service.md`

```markdown
# {ServiceName} Service

## Purpose
{Auto-extracted from JSDoc}

## Location
`src/services/{name}.service.ts`

## Exported Methods

### {methodName}()
{From JSDoc comment}

**Signature:**
\`\`\`typescript
async {methodName}({params}): Promise<{ReturnType}> {}
\`\`\`

**Parameters:**
- {param1}: {type} - {description}
- {param2}: {type} - {description}

**Returns:** {ReturnType}

**Throws:** {ErrorType}

**Example:**
\`\`\`typescript
const service = new {ServiceName}();
const result = await service.{methodName}({example});
console.log(result);
\`\`\`

## Dependencies
- Service A
- Service B

## Tests
`src/services/{name}.service.test.ts` - {testCount} tests
```

### 2. Controller Documentation

**Filename:** `docs/backend/controllers/[name]-controller.md`

```markdown
# {ControllerName} Controller

## Purpose
{Auto-extracted from JSDoc}

## Location
`src/controllers/{name}.controller.ts`

## Routes Handled

### POST {endpoint}
**Method:** {methodName}
**Service:** {serviceName}
**Request Body:**
\`\`\`json
{request schema}
\`\`\`

**Response:**
\`\`\`json
{response schema}
\`\`\`

**Status Codes:**
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 500: Server error

### Example cURL
\`\`\`bash
curl -X POST http://localhost:5000{endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{request}'
\`\`\`

## Middleware Applied
- authMiddleware
- errorHandlerMiddleware
```

### 3. Component Documentation

**Filename:** `docs/frontend/components/[name]-component.md`

```markdown
# {ComponentName} Component

## Purpose
{Auto-extracted from JSDoc}

## Location
`src/components/{name}.component.tsx`

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| {prop1} | {type} | Yes | - | {description} |
| {prop2} | {type} | No | {default} | {description} |

## Usage Example
\`\`\`tsx
import { {ComponentName} } from './components/{name}.component';

export function ParentComponent() {
  return (
    <{ComponentName}
      prop1={value1}
      prop2={value2}
    />
  );
}
\`\`\`

## State & Hooks
- {hookName}: {description}
- Context: {contextName}

## Events Fired
- onSave: When user saves
- onCancel: When user cancels

## Styling
- CSS Classes: {className}
- Tailwind: {classes}

## Related Components
- {ComponentA}
- {ComponentB}
```

### 4. Hook Documentation

**Filename:** `docs/frontend/hooks/use-[name]-hook.md`

```markdown
# use{HookName} Hook

## Purpose
{Auto-extracted from JSDoc}

## Location
`src/hooks/use-{name}.hook.ts`

## Usage
\`\`\`typescript
import { use{HookName} } from '../hooks/use-{name}.hook';

export function MyComponent() {
  const { state, action } = use{HookName}();
  
  return <div>{state}</div>;
}
\`\`\`

## Return Type
\`\`\`typescript
{
  state: {type};
  setState: (value: {type}) => void;
  action: () => Promise<{type}>;
}
\`\`\`

## Example
\`\`\`typescript
const { state, setState } = use{HookName}();
setState(newValue);
\`\`\`
```

### 5. API Documentation

**Filename:** `docs/API.md` (auto-updated)

```markdown
# API Reference

## Base URL
Production: https://api.quoter.com
Development: http://localhost:5000

## Authentication
Bearer token in Authorization header
\`\`\`
Authorization: Bearer {token}
\`\`\`

---

## Endpoints

### POST /api/price-calculator
Calculate pricing for a book quote

**Request:**
\`\`\`json
{
  "trimSizeId": 2,
  "paperStockId": 1,
  "quantity": 100
}
\`\`\`

**Response:**
\`\`\`json
{
  "basePrice": 4.85,
  "subtotal": 485.00,
  "shipping": 25.00,
  "tax": 43.25,
  "total": 553.25
}
\`\`\`

**Status Codes:**
- 200: Success
- 400: Invalid parameters
- 500: Server error

---

{Auto-generates entries for all endpoints}
```

### 6. Database Documentation

**Filename:** `docs/DATABASE.md` (auto-updated)

```markdown
# Database Schema

## Connection
\`\`\`
PostgreSQL
Host: {host}
Database: {database}
\`\`\`

---

## Tables

### trim_sizes
Book size options

**Columns:**
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | No | - | Primary key |
| name | VARCHAR(100) | No | - | Size name (e.g., Digest) |
| width | DECIMAL(5,2) | No | - | Width in inches |
| height | DECIMAL(5,2) | No | - | Height in inches |
| minPages | INT | No | 24 | Minimum page count |
| maxPages | INT | No | 840 | Maximum page count |
| createdAt | TIMESTAMP | No | NOW() | Created timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (name)

**Example Queries:**
\`\`\`sql
-- Get all trim sizes
SELECT * FROM trim_sizes WHERE active = true;

-- Get specific trim size
SELECT * FROM trim_sizes WHERE id = 2;

-- Get range of sizes
SELECT * FROM trim_sizes 
WHERE width >= 5.0 AND width <= 8.5;
\`\`\`

---

{Auto-generates entries for all tables}
```

### 7. Architecture Decision Record (ADR)

**Filename:** `docs/DECISIONS.md`

```markdown
# Architecture Decision Records

## ADR-001: Use PostgreSQL for persistence
**Date:** 2026-07-01  
**Status:** Accepted

### Context
Need to store quotes, users, pricing data with complex relationships

### Decision
Use PostgreSQL as the primary database

### Consequences
- ✅ Strong ACID compliance
- ✅ Excellent for relational data
- ✅ Good query performance
- ❌ Overkill for simple caching
- ⚠️ Requires migration management

### Related Files
- backend/src/config/database.config.ts
- docs/DATABASE.md

---

## ADR-002: Use React Context for state management
**Date:** 2026-07-05  
**Status:** Accepted

### Context
Need lightweight state management without Redux overhead for MVP

### Decision
Use React Context API for global state

### Consequences
- ✅ No additional dependencies
- ✅ Built-in to React
- ✅ Good for MVP phase
- ❌ May need Redux for Phase 3+
- ⚠️ Performance issues at scale

---

{Auto-maintains decision log}
```

---

## 🤖 DOCUMENTATION GENERATION RULES

### Rule 1: JSDoc Requirement
```typescript
/**
 * Service description goes here
 * 
 * Handles:
 * - Responsibility 1
 * - Responsibility 2
 * 
 * @example
 * const service = new ServiceName();
 * const result = await service.method();
 */
export class ServiceName {
  /**
   * Method description
   * @param config - Configuration object
   * @returns Promise with result
   * @throws Error if validation fails
   */
  async method(config: Config): Promise<Result> {}
}
```

**Auto-generates:** `docs/backend/services/service-name.md`

### Rule 2: Component Props Documentation
```typescript
interface ComponentProps {
  /** Description of prop1 */
  prop1: string;
  
  /** Optional prop for styling */
  className?: string;
}

export function Component({ prop1, className }: ComponentProps) {}
```

**Auto-generates:** `docs/frontend/components/component.md` with props table

### Rule 3: Endpoint Documentation
```typescript
/**
 * Calculate book quote pricing
 * 
 * POST /api/price-calculator
 * 
 * @throws {ValidationError} Invalid parameters
 * @returns {PricingData} Pricing breakdown
 */
router.post('/price-calculator', (req, res) => {})
```

**Auto-generates:** Entry in `docs/API.md`

---

## 📊 KNOWLEDGE BASE FEATURES

### Feature 1: Full-Text Search
```
User searches: "calculate price"

Returns:
✅ price-calculator.service.md
✅ API.md > POST /api/price-calculator
✅ ARCHITECTURE.md > Pricing Flow
✅ TROUBLESHOOTING.md > Price not updating
```

### Feature 2: Cross-References
```markdown
# Service: price-calculator.service.ts

Related:
- [Controller: price-calculator.controller.ts](../controllers/price-calculator-controller.md)
- [API: POST /api/price-calculator](../API.md#post-apiprice-calculator)
- [Database: pricing table](../DATABASE.md#pricing)
- [Component: quote-summary.component.tsx](../../frontend/components/quote-summary-component.md)
```

### Feature 3: Change Tracking
```
Modified: src/services/price-calculator.service.ts

Changes:
- New method: getMultiplier() - Added line 45
- Parameter change: calculatePrice() - quantity type changed
- Removed: deprecated getPriceOld() method

Updated Documentation:
✅ docs/backend/services/price-calculator-service.md
✅ docs/API.md
✅ CHANGELOG.md
```

### Feature 4: Completeness Validation
```
✅ Documentation Audit Results

Price Calculator Service:
  ├─ JSDoc: ✅ COMPLETE (all methods documented)
  ├─ Examples: ✅ COMPLETE (3 examples)
  ├─ Tests: ✅ COMPLETE (8 tests, 95% coverage)
  ├─ Related: ✅ LINKED (controller, API, component)
  └─ Status: ✅ COMPLETE

Overall: 156/156 docs complete (100%)

Issues found: 0
Status: ✅ ALL DOCUMENTATION UP-TO-DATE
```

---

## 🔍 KNOWLEDGE BASE QUERIES

### Query Examples

**1. "Where is the quote calculation logic?"**
```
Results:
✅ docs/backend/services/price-calculator-service.md (Main logic)
✅ docs/ARCHITECTURE.md > Pricing Flow (Flow diagram)
✅ docs/frontend/components/quote-summary-component.md (Display)
```

**2. "What changed in the pricing system?"**
```
Results:
✅ CHANGELOG.md
✅ DECISIONS.md > ADR-005: Pricing calculation
✅ docs/backend/services/price-calculator-service.md (Latest version)
```

**3. "How do I add a new trim size?"**
```
Results:
✅ GETTING_STARTED.md > Adding Trim Sizes
✅ docs/DATABASE.md > trim_sizes table
✅ docs/backend/services/product.service.md
✅ docs/API.md > POST /api/admin/products/trim-sizes
```

---

## 📋 DOCUMENTATION CHECKLIST

### Auto-Generated During Development

```markdown
## Documentation Status

New Feature: Add shrink-wrap option

- [ ] JSDoc comments added to code
- [ ] Service documentation generated
- [ ] Controller documentation generated
- [ ] API documentation updated
- [ ] Database documentation updated (if schema changed)
- [ ] Component documentation generated (if UI change)
- [ ] Examples added to docs
- [ ] Related documents cross-linked
- [ ] CHANGELOG.md updated
- [ ] ADR created (if architecture change)

Status: Docs Generated Automatically ✅
```

---

## 🚀 DEPLOYMENT

### Generate Documentation Site
```bash
npm run docs:generate     # Generates full documentation
npm run docs:serve        # Serves docs locally on http://localhost:3000/docs
npm run docs:deploy       # Deploys docs to GitHub Pages
```

### Documentation Site Features
- Auto-generated from code
- Searchable
- Live examples (Copy to clipboard)
- Version history
- Change tracking
- Interactive diagrams

---

## 🔄 MAINTENANCE CYCLE

### Weekly
- Auto-generate new docs for new code
- Validate completeness
- Check for orphaned documentation

### Monthly
- Review documentation accuracy
- Update examples
- Fix broken links

### Quarterly
- Audit knowledge base
- Remove outdated information
- Update architecture diagrams

---

## 🎯 FUTURE MAINTAINABILITY

### When Someone Joins the Team
```
New developer has access to:
1. ✅ Complete API documentation
2. ✅ Architecture diagrams
3. ✅ Database schema documentation
4. ✅ Component documentation with examples
5. ✅ Service documentation with examples
6. ✅ Setup guide with troubleshooting
7. ✅ Decision history (why things were built certain way)
8. ✅ CHANGELOG with all modifications
9. ✅ Glossary of terms
10. ✅ Code comments in every file

Onboarding time: 2 days (vs 2 weeks without docs)
```

### Code Modification Guidelines
```
Before modifying {service.ts}:
1. Check docs/backend/services/{service}.md
2. Review related files listed
3. Check DECISIONS.md for context
4. Look at tests in *.test.ts
5. Check CHANGELOG.md for history
6. Make changes
7. Update JSDoc comments
8. Docs auto-update
```

---

**Skill Status:** Active  
**Last Updated:** July 2026  
**Maintenance:** Automatic

