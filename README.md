# 📖 Book Printing Quoter

A full-stack web application for generating dynamic book printing quotes with admin controls. Built with React, Node.js, TypeScript, and PostgreSQL.

**Live Demo:** https://quoter.vercel.app  
**API:** https://api.quoter.railway.app  
**Status:** Phase 1 Complete ✅

---

## 🎯 Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/your-username/book-quoter.git
cd book-quoter

# 2. Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 3. Setup environment
# Copy .env.example to .env in both frontend/ and backend/
# Update with your database URL

# 4. Run locally
# Terminal 1: Frontend
cd frontend && npm start

# Terminal 2: Backend
cd backend && npm run dev

# 5. Open browser
# Frontend: http://localhost:3000
# API: http://localhost:5000/api/config
```

---

## 📋 What's Included

### Phase 1: Core Quoter ✅
- 6-step interactive quoter wizard
- Responsive design (mobile-friendly)
- Real-time state management
- Clean, modern UI with Tailwind CSS

### Phase 2: Pricing Engine 🔜
- Real-time price calculation
- Quantity breaks
- Shipping & tax calculation

### Phase 3: Authentication 🔜
- User registration & login
- Save/manage quotes
- Quote history

### Phase 4: Admin Panel 🔜
- Admin dashboard
- Manage products & pricing
- View analytics

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Forms | React Hook Form |
| State | Context API + Custom Hooks |
| Routing | React Router v6 |
| HTTP | Axios |
| Testing | Jest + React Testing Library |
| Linting | ESLint + Prettier |

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | NestJS (Node.js) + TypeScript |
| ORM | TypeORM (type-safe queries) |
| Database | PostgreSQL 16 |
| Validation | class-validator + class-transformer |
| Testing | Jest |
| Linting | ESLint + Prettier |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Frontend Deploy | Vercel |
| Backend Deploy | Railway |
| Database | Railway PostgreSQL |
| Code Intelligence | GitNexus (knowledge graph MCP) |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
book-quoter/
├── frontend/                    # React application
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── hooks/              # Custom hooks
│   │   ├── context/            # Context API
│   │   └── utils/              # Utilities
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                     # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── products/       # Products module (trim sizes, cover styles, etc.)
│   │   │   └── quoter/         # Quoter module (quote creation)
│   │   ├── entities/           # TypeORM entities (DB models)
│   │   ├── database/
│   │   │   ├── migrations/     # TypeORM migrations
│   │   │   └── seeds/          # Seed data
│   │   ├── common/             # Shared filters, pipes, decorators
│   │   ├── config/             # App + TypeORM config
│   │   ├── app.module.ts       # Root module
│   │   └── main.ts             # Entry point
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DATABASE.md
│
├── PROJECT-BRIEF.md             # Project overview
├── CONTRIBUTING.md              # Developer guide
├── DEPLOYMENT.md                # Deployment instructions
├── ENVIRONMENT-SETUP.md         # Environment configuration
└── README.md                    # This file
```

---

## 🚀 Features

### Quoter Wizard
- **Step 1:** Select book trim size (Digest, Trade, 8x10, Hardcover, Square)
- **Step 2:** Select cover style (Softcover, Hardcover, Dust Jacket)
- **Step 3:** Select cover finish (Gloss, Matte, Textured)
- **Step 4:** Select print type (Black & White, Color)
- **Step 5:** Select paper stock (60lb Natural, 70lb White, 80lb White)
- **Step 6:** Select binding type (Perfect Bind, Saddle Stitch, Spiral)

### Quote Summary
- Real-time display of selected options
- Progress indicator
- Previous/Next navigation
- (Phase 2+) Pricing breakdown

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [PROJECT-BRIEF.md](./PROJECT-BRIEF.md) | Project overview & reference |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Developer guide & standards |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment instructions |
| [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) | Environment configuration |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture |
| [docs/API.md](./docs/API.md) | API reference |
| [docs/DATABASE.md](./docs/DATABASE.md) | Database schema |

**New to the project?** Start with [PROJECT-BRIEF.md](./PROJECT-BRIEF.md)

---

## 🔧 Development

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Setup Development Environment

```bash
# 1. Clone repository
git clone <repository-url>
cd book-quoter

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Install backend dependencies
cd ../backend
npm install

# 4. Setup database
createdb quoter_db

# 5. Configure environment
# See ENVIRONMENT-SETUP.md for detailed instructions

# 6. Run migrations
npm run migrate

# 7. Seed initial data
npm run seed
```

### Run Frontend
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

### Run Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Run Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# Coverage report
npm test -- --coverage
```

### Linting
```bash
# Check code quality
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

---

## 📋 Naming Conventions

### Files: kebab-case + type
```
✅ quoter.page.tsx
✅ quote-summary.component.tsx
✅ use-auth.hook.ts
✅ price-calculator.service.ts
✅ quote.controller.ts
```

### Code: camelCase
```
✅ const quoteState = {};
✅ function calculatePrice() {}
✅ const isAuthenticated = false;
```

### Endpoints: kebab-case
```
✅ GET /api/products/trim-sizes
✅ POST /api/price-calculator
✅ PUT /api/admin/pricing/:pricingId
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for complete guidelines.

---

## 🌐 Deployment

### Frontend Deployment (Vercel)
```bash
vercel --prod
```

### Backend Deployment (Railway)
```bash
railway up
```

### Database Setup
- PostgreSQL on Railway (included with free tier)
- Auto-backups enabled
- 5GB free storage

**Cost: $0/month (free tier)**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 🐛 Troubleshooting

### Frontend not connecting to backend?
```bash
# Check .env.local
REACT_APP_API_URL=http://localhost:5000

# Restart frontend
npm start
```

### Database connection error?
```bash
# Verify DATABASE_URL in .env
postgresql://user:password@localhost:5432/quoter_db

# Test connection
psql $DATABASE_URL

# Run migrations
npm run migrate
```

### Linting errors?
```bash
npm run lint:fix
```

See [CONTRIBUTING.md](./CONTRIBUTING.md#troubleshooting-tips) for more troubleshooting.

---

## 🤝 Contributing

1. **Read** [CONTRIBUTING.md](./CONTRIBUTING.md)
2. **Follow** naming conventions (kebab-case for files)
3. **Write** tests for new features
4. **Update** documentation
5. **Submit** pull request

**Code Quality Checklist:**
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm run test`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Named with kebab-case + type suffix
- [ ] JSDoc comments on exports
- [ ] Error handling on API calls

---

## 📊 Project Phases

### Phase 1: Core Quoter (Weeks 1-2) ✅
- 6-step wizard
- Product selection
- Quote summary

### Phase 2: Pricing Engine (Weeks 3-4) 🔜
- Real-time price calculation
- Quantity breaks
- Shipping & tax

### Phase 3: Authentication (Weeks 5-6) 🔜
- User registration
- Login system
- Save quotes

### Phase 4: Admin Panel (Weeks 7-8) 🔜
- Admin dashboard
- Product management
- Pricing controls
- Analytics

---

## 📈 Roadmap

**Q3 2026:**
- ✅ Phase 1: Core Quoter
- 🔜 Phase 2: Pricing Engine
- 🔜 Phase 3: Authentication

**Q4 2026:**
- 🔜 Phase 4: Admin Panel
- 🔜 Advanced pricing rules
- 🔜 Order management

**Q1 2027:**
- 🔜 Mobile app (React Native)
- 🔜 Multi-language support
- 🔜 Fulfillment integration

---

## 🆘 Getting Help

- **Questions about setup?** → See [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md)
- **Coding questions?** → See [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Deployment help?** → See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture questions?** → See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **API reference?** → See [docs/API.md](./docs/API.md)

---

## 📞 Support

- **Email:** team@bookquoter.com
- **GitHub Issues:** [Report a bug](https://github.com/your-username/book-quoter/issues)
- **Discussions:** [Ask a question](https://github.com/your-username/book-quoter/discussions)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Authors

- **Frontend:** [Your Name]
- **Backend:** [Your Name]
- **DevOps:** [Your Name]

---

## 🙏 Acknowledgments

Built with:
- React 18 + TypeScript
- NestJS + TypeORM
- PostgreSQL 16
- Vercel + Railway
- GitNexus (code intelligence)

---

## 🔗 Links

- **Website:** https://bookquoter.com (coming soon)
- **Frontend:** https://quoter.vercel.app
- **API Docs:** https://api.quoter.railway.app/docs
- **GitHub:** https://github.com/your-username/book-quoter
- **Issues:** https://github.com/your-username/book-quoter/issues

---

**Last Updated:** July 2026  
**Maintainers:** Development Team  
**Status:** Phase 1 Complete ✅

Happy building! 🚀