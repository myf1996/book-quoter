# 🚀 MASTER CLAUDE CODE PROMPT (Vue 3 + NestJS + TypeORM VERSION)
## Book Printing Quoter - Phase 1 Complete Build with Vue 3 + NestJS

Copy-paste this ENTIRE prompt into Claude Code and run it.

---

## PROMPT FOR CLAUDE CODE

```
You are building the Book Printing Quoter application using Vue 3 + NestJS + TypeORM.
Follow EVERY rule below exactly.

═══════════════════════════════════════════════════════════════════════════════

## 📋 PROJECT OVERVIEW
- Name: Book Printing Quoter
- Type: Full-stack web application (Vue 3 + NestJS + PostgreSQL)
- Current Phase: Phase 1 (Core Quoter - Weeks 1-2)
- Frontend Framework: Vue 3 (Composition API + <script setup>) + Vite
- Backend Framework: NestJS + TypeORM (NOT Express)
- Database ORM: TypeORM (type-safe queries)
- Timeline: 8 weeks (4 phases)
- Deployment: FREE (Vercel + Railway + Supabase)
- Status: Ready for Phase 1 implementation

═══════════════════════════════════════════════════════════════════════════════

## 🎯 PHASE 1 DELIVERABLE (Weeks 1-2)

Build a 6-step quoter wizard with NestJS backend and TypeORM database layer.

### What Phase 1 Does:
1. User selects Trim Size (5 pre-configured options)
2. User selects Cover Style (Softcover, Hardcover, Dust Jacket)
3. User selects Cover Finish (Gloss, Matte, Textured)
4. User selects Print Type (Black & White, Color)
5. User selects Paper Stock (60lb Natural, 70lb White, 80lb White)
6. User selects Binding Type (Perfect Bind, Saddle Stitch, Spiral)

### Frontend Output:
- Responsive wizard on https://quoter.vercel.app
- Displays all selected options in summary panel
- Clean, modern UI with Tailwind CSS

### Backend Output:
- NestJS API with 7 endpoints
- TypeORM entities for all product types
- PostgreSQL database with 7 tables
- Type-safe queries throughout

### What Phase 1 Does NOT Include:
- ❌ Pricing calculation (that's Phase 2)
- ❌ User authentication (that's Phase 3)
- ❌ Admin panel (that's Phase 4)
- ❌ Quote saving (that's Phase 3)

═══════════════════════════════════════════════════════════════════════════════

## 🔤 NAMING CONVENTIONS (STRICT - NO EXCEPTIONS)

### FILE NAMING: kebab-case + .type.extension

BACKEND FILES (NestJS):
✅ CORRECT EXAMPLES:
  - src/modules/quoter/quoter.controller.ts
  - src/modules/quoter/quoter.service.ts
  - src/modules/quoter/quoter.module.ts
  - src/modules/products/products.controller.ts
  - src/modules/products/products.service.ts
  - src/entities/trim-size.entity.ts
  - src/entities/cover-style.entity.ts
  - src/entities/quote.entity.ts
  - src/config/database.config.ts
  - src/config/typeorm.config.ts

❌ WRONG (Don't use these):
  - QuoterController.ts
  - quoterController.ts
  - TrimSizeEntity.ts
  - quote_entity.ts

FRONTEND FILES (Vue 3):
✅ quoter.page.vue
✅ quoter-wizard.component.vue
✅ trim-size.step.vue
✅ quote-summary.component.vue
✅ step-navigation.component.vue
✅ progress-bar.component.vue
✅ use-quote-state.composable.ts
✅ quote.store.ts
✅ config.store.ts

❌ WRONG:
  QuoterPage.vue, QuoterWizard.vue (PascalCase filename)
  useQuoteState.ts (camelCase filename)
  useQuoteState.hook.ts (React naming — use .composable.ts in Vue)

### CODE NAMING: camelCase for variables/functions

✅ CORRECT:
  const quoteState = {};
  const trimSizeId = 2;
  function calculatePrice() {}
  async getTrimSizes(): Promise<TrimSize[]> {}

❌ WRONG:
  const quote_state = {};
  const TrimSizeId = 2;

### CLASSES & SERVICES: PascalCase

✅ CORRECT:
  class QuoterService {}
  class TrimSizeEntity {}
  interface IQuoterService {}

❌ WRONG:
  class quoterService {}
  class trim_size_entity {}

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
  GET /api/getTrimSizes

### DATABASE: snake_case (SQL), camelCase (TypeScript)

✅ CORRECT (SQL):
  CREATE TABLE trim_sizes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP
  );

✅ CORRECT (TypeScript):
  @Entity('trim_sizes')
  export class TrimSize {
    @Column()
    createdAt: Date;  // camelCase in code
  }

═══════════════════════════════════════════════════════════════════════════════

## 📁 FILE STRUCTURE TO CREATE (NestJS)

```
project/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── quoter.page.vue              # Main page
│   │   ├── components/
│   │   │   ├── quoter-wizard.component.vue  # Step container
│   │   │   ├── steps/
│   │   │   │   ├── trim-size.step.vue       # Step 1
│   │   │   │   ├── cover-style.step.vue     # Step 2
│   │   │   │   ├── cover-finish.step.vue    # Step 3
│   │   │   │   ├── print-type.step.vue      # Step 4
│   │   │   │   ├── paper-stock.step.vue     # Step 5
│   │   │   │   └── binding.step.vue         # Step 6
│   │   │   ├── quote-summary.component.vue
│   │   │   ├── step-navigation.component.vue
│   │   │   └── progress-bar.component.vue
│   │   ├── composables/
│   │   │   └── use-quote-state.composable.ts
│   │   ├── stores/                          # Pinia stores
│   │   │   ├── config.store.ts
│   │   │   └── quote.store.ts
│   │   ├── router/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── helpers.utils.ts
│   │   ├── App.vue
│   │   └── main.ts
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── quoter/
│   │   │   │   ├── quoter.controller.ts
│   │   │   │   ├── quoter.service.ts
│   │   │   │   ├── quoter.module.ts
│   │   │   │   └── dto/
│   │   │   │       └── create-quote.dto.ts
│   │   │   │
│   │   │   └── products/
│   │   │       ├── products.controller.ts
│   │   │       ├── products.service.ts
│   │   │       ├── products.module.ts
│   │   │       └── dto/
│   │   │           ├── create-trim-size.dto.ts
│   │   │           └── create-cover-style.dto.ts
│   │   │
│   │   ├── entities/
│   │   │   ├── trim-size.entity.ts
│   │   │   ├── cover-style.entity.ts
│   │   │   ├── cover-finish.entity.ts
│   │   │   ├── print-type.entity.ts
│   │   │   ├── paper-stock.entity.ts
│   │   │   ├── binding-type.entity.ts
│   │   │   └── quote.entity.ts
│   │   │
│   │   ├── database/
│   │   │   ├── typeorm.config.ts
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   │       └── seed.ts
│   │   │
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   └── pipes/
│   │   │
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── test/
│   ├── ormconfig.json
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── docs/
    └── README.md
```

═══════════════════════════════════════════════════════════════════════════════

## 🗄️ DATABASE SCHEMA (PostgreSQL with TypeORM)

Create these TypeORM entities:

### 1. TrimSize Entity
```typescript
@Entity('trim_sizes')
export class TrimSize {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;  // Digest, Trade, 8x10, Hardcover, Square

  @Column('decimal', { precision: 5, scale: 2 })
  width: number;

  @Column('decimal', { precision: 5, scale: 2 })
  height: number;

  @Column({ default: 24 })
  minPages: number;

  @Column({ default: 840 })
  maxPages: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
```

### 2. CoverStyle Entity
```typescript
@Entity('cover_styles')
export class CoverStyle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;  // Softcover, Hardcover, Dust Jacket

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
```

### Similar Entities For:
- CoverFinish (Gloss, Matte, Textured)
- PrintType (Black & White, Color)
- PaperStock (60lb Natural, 70lb White, 80lb White)
- BindingType (Perfect Bind, Saddle Stitch, Spiral)

### Quote Entity
```typescript
@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb')
  config: {
    trimSizeId: number;
    coverStyleId: number;
    coverFinishId: number;
    printTypeId: number;
    paperStockId: number;
    bindingTypeId: number;
  };

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
```

### Seed Data (TypeORM)
```typescript
// Create and insert all products
const trimSizes = [
  { name: 'Digest', width: 5.5, height: 8.5 },
  { name: 'Trade Paperback', width: 6.0, height: 9.0 },
  { name: '8x10', width: 8.0, height: 10.0 },
  { name: 'Hardcover', width: 6.5, height: 9.5 },
  { name: 'Square', width: 8.5, height: 8.5 },
];

const coverStyles = [
  { name: 'Softcover' },
  { name: 'Hardcover' },
  { name: 'Dust Jacket' },
];
// ... similar for other products
```

═══════════════════════════════════════════════════════════════════════════════

## 🔌 API ENDPOINTS (Phase 1, NestJS)

Backend will serve these via NestJS controllers:

GET /api/config
  Returns: { phases: { phase1CoreQuoter: true, phase2PricingEngine: false, ... }, features: {...} }
  Used by: Frontend on app startup

GET /api/products/trim-sizes
  Returns: TrimSize[]
  Used by: Step 1

GET /api/products/cover-styles
  Returns: CoverStyle[]
  Used by: Step 2

GET /api/products/cover-finishes
  Returns: CoverFinish[]
  Used by: Step 3

GET /api/products/print-types
  Returns: PrintType[]
  Used by: Step 4

GET /api/products/paper-stocks
  Returns: PaperStock[]
  Used by: Step 5

GET /api/products/binding-types
  Returns: BindingType[]
  Used by: Step 6

═══════════════════════════════════════════════════════════════════════════════

## 🏗️ NESTJS ARCHITECTURE

### Module Structure

Each feature has a module with:
  - Controller (handles API requests)
  - Service (business logic)
  - Entity (database model)
  - DTO (data validation)

### Example: Products Module

```typescript
// products.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrimSize,
      CoverStyle,
      CoverFinish,
      PrintType,
      PaperStock,
      BindingType,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

// products.service.ts
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(TrimSize)
    private trimSizeRepository: Repository<TrimSize>,
  ) {}

  async getAllTrimSizes(): Promise<TrimSize[]> {
    return this.trimSizeRepository.find();
  }
}

// products.controller.ts
@Controller('api/products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('trim-sizes')
  async getTrimSizes(): Promise<TrimSize[]> {
    return this.productsService.getAllTrimSizes();
  }
}
```

═══════════════════════════════════════════════════════════════════════════════

## ⚙️ TYPEORM CONFIGURATION

### ormconfig.json

```json
{
  "type": "postgres",
  "host": "${DATABASE_HOST:localhost}",
  "port": 5432,
  "username": "${DATABASE_USER:postgres}",
  "password": "${DATABASE_PASSWORD:password}",
  "database": "${DATABASE_NAME:quoter_db}",
  "entities": ["dist/**/*.entity.js"],
  "migrations": ["dist/database/migrations/*.js"],
  "synchronize": false,
  "logging": true,
  "ssl": {
    "rejectUnauthorized": false
  }
}
```

### TypeORM Config Service

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'quoter_db',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
});
```

═══════════════════════════════════════════════════════════════════════════════

## 📝 CODE QUALITY REQUIREMENTS

### TypeScript Requirements:
- ✅ NO 'any' types - use explicit types everywhere
- ✅ All function parameters must have types
- ✅ All function return types must be specified
- ✅ All interfaces/types must be named with PascalCase
- ✅ Use strict mode in tsconfig.json

### NestJS-Specific Requirements:
- ✅ All controllers must use decorators (@Get, @Post, etc)
- ✅ All services must be @Injectable()
- ✅ All modules must export what others need
- ✅ Use dependency injection (constructor injection)
- ✅ No hard-coded values

### TypeORM-Specific Requirements:
- ✅ All entities must be decorated with @Entity
- ✅ All columns must be decorated with @Column
- ✅ Use repositories for queries (no raw SQL)
- ✅ Migrations instead of synchronize in production
- ✅ Proper column types (decimal for prices, jsonb for config)

### JSDoc Requirements:
- ✅ All exported classes must have JSDoc comments
- ✅ All public methods must have JSDoc
- ✅ Include @param, @returns, @throws where applicable

Example:
```typescript
/**
 * Products service handles all product-related operations
 * 
 * Manages:
 * - Trim size queries
 * - Cover style queries
 * - Paper stock queries
 */
@Injectable()
export class ProductsService {
  /**
   * Retrieves all trim sizes from database
   * @returns Promise with array of trim sizes
   */
  async getAllTrimSizes(): Promise<TrimSize[]> {
    return this.trimSizeRepository.find();
  }
}
```

### Error Handling:
- ✅ All service methods should throw proper HTTP exceptions
- ✅ Use @nestjs/common HttpException
- ✅ Return meaningful error messages

### Testing:
- ✅ Create .test.ts files for services
- ✅ Test critical business logic
- ✅ Minimum 70% code coverage

═══════════════════════════════════════════════════════════════════════════════

## 📦 SETUP & DEPENDENCIES

### Frontend (Vue 3 + Vite) — package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/**/*.{ts,vue}",
    "lint:fix": "eslint src/**/*.{ts,vue} --fix",
    "type-check": "vue-tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,vue}\""
  }
}
```

### Frontend Required Dependencies

```bash
npm install vue@3 vue-router@4 pinia
npm install axios vee-validate @vee-validate/rules
npm install @headlessui/vue

# Dev dependencies
npm install -D vite @vitejs/plugin-vue vue-tsc typescript
npm install -D tailwindcss postcss autoprefixer
npm install -D vitest @vue/test-utils @vitest/coverage-v8
npm install -D eslint prettier @vue/eslint-config-typescript
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### Backend (NestJS) — package.json scripts

```json
{
  "scripts": {
    "start": "nest start",
    "dev": "nest start --watch",
    "debug": "nest start --debug --watch",
    "build": "nest build",
    "prod": "node dist/main",
    "typeorm": "typeorm",
    "migration:create": "npm run typeorm migration:create -- -n",
    "migration:generate": "npm run typeorm migration:generate -- -n",
    "migration:run": "npm run typeorm migration:run",
    "migration:revert": "npm run typeorm migration:revert",
    "seed": "node dist/database/seeds/seed",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

### Backend Required Dependencies

```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/config
npm install class-validator class-transformer
npm install @nestjs/jwt passport @nestjs/passport
npm install rxjs

# Dev dependencies
npm install -D @nestjs/cli
npm install -D @types/node typescript
npm install -D @types/express
npm install -D jest @types/jest ts-jest
npm install -D eslint prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

═══════════════════════════════════════════════════════════════════════════════

## ⚙️ CONFIG.JSON (Feature Flags)

Create backend/src/config/config.json:

```json
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
```

═══════════════════════════════════════════════════════════════════════════════

## 🎨 FRONTEND COMPONENT ARCHITECTURE (Vue 3)

quoter.page.vue (main page)
  └── quoter-wizard.component.vue (step container)
      ├── progress-bar.component.vue
      ├── [current step — v-if per step number]:
      │   ├── trim-size.step.vue       (step 1)
      │   ├── cover-style.step.vue     (step 2)
      │   ├── cover-finish.step.vue    (step 3)
      │   ├── print-type.step.vue      (step 4)
      │   ├── paper-stock.step.vue     (step 5)
      │   └── binding.step.vue         (step 6)
      ├── step-navigation.component.vue (Previous/Next)
      └── quote-summary.component.vue  (right panel, always visible)
          ├── Trim Size: {{ quoteStore.selectedTrimSize }}
          ├── Cover Style: {{ quoteStore.selectedCoverStyle }}
          ├── Cover Finish: {{ quoteStore.selectedCoverFinish }}
          ├── Print Type: {{ quoteStore.selectedPrintType }}
          ├── Paper Stock: {{ quoteStore.selectedPaperStock }}
          ├── Binding: {{ quoteStore.selectedBinding }}
          └── (No pricing in Phase 1)

### Pinia Store Structure (quote.store.ts)

```typescript
export const useQuoteStore = defineStore('quote', () => {
  const currentStep = ref(1)
  const quoteState = reactive<QuoteState>({
    trimSizeId: null,
    coverStyleId: null,
    coverFinishId: null,
    printTypeId: null,
    paperStockId: null,
    bindingTypeId: null,
  })

  function updateQuoteState(updates: Partial<QuoteState>): void { ... }
  function goToNextStep(): void { ... }
  function goToPreviousStep(): void { ... }
  function isCurrentStepComplete(): boolean { ... }

  return { currentStep, quoteState, updateQuoteState, goToNextStep, goToPreviousStep, isCurrentStepComplete }
})
```

### Config Store (config.store.ts)

```typescript
export const useConfigStore = defineStore('config', () => {
  const globalConfig = ref<GlobalConfig | null>(null)

  async function fetchConfig(): Promise<void> {
    globalConfig.value = await api.get('/api/config')
  }

  return { globalConfig, fetchConfig }
})
```

### Vue SFC Pattern (all components use this)

```vue
<script setup lang="ts">
// Props, emits, store usage, composables here
</script>

<template>
  <!-- Template here -->
</template>

<style scoped>
/* Scoped styles if not using Tailwind exclusively */
</style>
```

═══════════════════════════════════════════════════════════════════════════════

## ✅ VALIDATION CHECKLIST

Before generating code, validate:

□ File naming: All files use kebab-case + .type extension
□ NestJS structure: Controllers/Services/Modules properly organized
□ TypeORM: All entities decorated with @Entity
□ Code naming: All variables/functions use camelCase
□ Classes: All classes/interfaces use PascalCase
□ Endpoints: All API routes use kebab-case
□ Types: No 'any' types anywhere
□ JSDoc: All exported functions/classes have comments
□ Error handling: All queries wrapped in try-catch
□ No logs: No console.log() in production code
□ Tests: Critical services have tests
□ TypeScript: Compiles without errors
□ ESLint: Passes all linting rules
□ Prettier: Code is formatted

═══════════════════════════════════════════════════════════════════════════════

## 🚀 WHAT TO BUILD (In Order)

1. NestJS Project Setup
   ├─ Create app.module.ts
   ├─ Setup TypeORM
   └─ Configure all modules

2. Database Setup (TypeORM)
   ├─ Create all 7 entity files
   ├─ Setup TypeORM config
   └─ Setup migrations/seeds

3. Products Module
   ├─ Create products.controller.ts
   ├─ Create products.service.ts
   ├─ Create products.module.ts
   └─ Register in app.module.ts

4. Quoter Module
   ├─ Create quoter.controller.ts
   ├─ Create quoter.service.ts
   ├─ Create quoter.module.ts
   └─ Register in app.module.ts

5. Config Service
   ├─ Create config service
   └─ Create config endpoint

6. Frontend Integration
   ├─ Setup Vue components
   ├─ Connect to API
   └─ Test all endpoints

7. Deployment
   ├─ Add deployment scripts
   ├─ Create .env files
   └─ Document deployment

═══════════════════════════════════════════════════════════════════════════════

## 📊 EXPECTED RESULT

After running this prompt, you should have:

✅ Complete NestJS project structure
✅ TypeORM entities for all 7 tables
✅ NestJS controllers with 7 API endpoints
✅ NestJS services with database queries
✅ TypeORM database configuration
✅ Migration/seed setup
✅ All files named with kebab-case + type suffix
✅ All code using camelCase variables
✅ All endpoints using kebab-case
✅ All functions with JSDoc comments
✅ All types explicitly defined (no 'any')
✅ Error handling on all database queries
✅ Tests for critical services
✅ TypeScript compilation without errors
✅ ESLint passing all checks
✅ Prettier formatted code
✅ Vue 3 frontend ready to connect
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

## 💻 TECH STACK CONFIRMED (Vue 3 + NestJS VERSION)

Frontend: Vue 3 (Composition API + <script setup>) + TypeScript + Vite + Tailwind CSS
State: Pinia (stores)
Forms: VeeValidate
Routing: Vue Router 4
Testing (Frontend): Vitest + Vue Test Utils
Backend: NestJS + TypeScript + TypeORM
Database: PostgreSQL 16
Testing (Backend): Jest
Linting: ESLint + Prettier (both)
Deployment: Vercel (Frontend) + Railway (Backend + Database)
Cost: $0/month (free tier)

═══════════════════════════════════════════════════════════════════════════════

## 🎯 FINAL INSTRUCTION

Build Phase 1 of the Book Printing Quoter using Vue 3 + NestJS + TypeORM following
EVERY single specification above.

Use these naming conventions EXACTLY as specified (no exceptions):
- Files: kebab-case + .type.extension
- Code: camelCase for variables/functions
- Classes: PascalCase
- Endpoints: kebab-case
- Database: snake_case (SQL), camelCase (TypeScript)

Generate complete, production-ready code with:
- NestJS architecture (modules/controllers/services)
- TypeORM entities for all tables
- TypeScript everywhere (no 'any')
- JSDoc on all exports
- Error handling on all database queries
- Tests for critical services
- Proper environment configuration
- Ready to deploy to Vercel + Railway

Start building now. Ask me questions only if something is unclear.
```

═══════════════════════════════════════════════════════════════════════════════