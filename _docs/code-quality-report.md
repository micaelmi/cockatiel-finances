# Ninco — Code Quality Report

**Date:** 2026-02-17
**Scope:** Full codebase analysis (backend + frontend)

---

## Overall Score: 8.5/10

The project has a strong foundation with modern tooling, proper JWT auth, clean API layer patterns, and good component extraction. Areas for improvement are concentrated around error handling consistency, missing test infrastructure, and some hardcoded values.

---

## ✅ What's Already Done Well

| Area | Details |
|------|---------|
| **JWT Auth** | Clerk JWT verification via `authPlugin` — secure, scoped to protected routes |
| **CORS** | Restricted to `localhost:3000` with explicit allowed methods |
| **API Client** | Bearer token via `AuthProvider` + `setTokenGetter()` pattern — no window globals |
| **Route Scoping** | Auth middleware only applies to protected routes; webhooks/health excluded |
| **Zod Validation** | All API inputs validated with Zod schemas |
| **Type Safety** | Full TypeScript across both stacks; Zod → TypeProvider pattern on backend |
| **React Query** | Query key factories, proper cache invalidation, optimistic deletes |
| **Component Extraction** | `SummaryCard`, `useDateRange`, `formatCurrency`, column/dialog components |
| **Prisma Schema** | Multi-file schema, proper relations, cascade deletes |
| **Code Organization** | Modular backend routes, hooks/api/types separation on frontend |

---

## 🔧 Remaining Improvements

### 🔴 Priority: High

#### 1. Clerk Middleware Filename
**File:** [proxy.ts](file:///c:/Micael/projects/ninco/frontend/proxy.ts)
**Issue:** Next.js Clerk middleware must be in a file named `middleware.ts` at the project root. Currently it's in `proxy.ts`, which means **Clerk's route protection may not be active** — Next.js only auto-runs middleware from `middleware.ts`.
```diff
- frontend/proxy.ts
+ frontend/middleware.ts
```

---

#### 2. Backend Environment Variable Validation
**File:** [server.ts](file:///c:/Micael/projects/ninco/backend/src/server.ts)
**Issue:** Environment variables are validated ad-hoc (`if (!clerkSecretKey) throw`) in individual files instead of at startup. A single Zod-based `env.ts` would catch all missing vars immediately on boot.
```typescript
// backend/src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
});

export const env = envSchema.parse(process.env);
```

---

#### 3. Secrets Exposed in `.env` — No `.gitignore` Protection
**File:** [backend/.env](file:///c:/Micael/projects/ninco/backend/.env)
**Issue:** `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` are committed with actual values. These should be in `.env.example` with placeholder values, and `.env` should be gitignored.

> [!CAUTION]
> If this repo is public, **rotate both keys immediately** from the Clerk dashboard.

---

#### 4. Missing Error Handling: `delete-account.ts`, `update-account.ts`
**Files:** [delete-account.ts](file:///c:/Micael/projects/ninco/backend/src/modules/accounts/delete-account.ts), [update-account.ts](file:///c:/Micael/projects/ninco/backend/src/modules/accounts/update-account.ts)
**Issue:** If Prisma can't find the account (wrong ID or wrong user), it throws a raw `PrismaClientKnownRequestError` that reaches the client as a 500. Should check existence first and return 404 — same pattern used in `delete-transaction.ts` and `update-transaction.ts`.

Same applies to: `delete-category.ts`, `update-category.ts`, `delete-tag.ts`, `update-tag.ts`.

---

#### 5. Missing Global Error Handler
**File:** [server.ts](file:///c:/Micael/projects/ninco/backend/src/server.ts)
**Issue:** No `setErrorHandler` is configured. Unhandled Prisma errors, Zod validation failures, or unexpected exceptions leak raw error objects/stack traces to the client.
```typescript
app.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    return reply.status(400).send({ message: 'Validation error', errors: error.validation });
  }
  request.log.error(error);
  reply.status(500).send({ message: 'Internal server error' });
});
```

---

### 🟡 Priority: Medium

#### 6. No Test Infrastructure
**Issue:** Neither backend nor frontend have any tests. No test runner is configured, no test scripts are defined in `package.json`.
**Suggestion:** Add Vitest for backend unit/integration tests and Playwright for frontend E2E tests. Start with:
- Backend: route handler tests with Prisma mocking
- Frontend: E2E tests for the auth flow, transaction CRUD

---

#### 7. Commented-Out Toast Notifications
**File:** [use-transactions.ts](file:///c:/Micael/projects/ninco/frontend/lib/hooks/use-transactions.ts) (lines 101, 104)
**Issue:** `toast.success('Transaction deleted')` and `toast.error(...)` are commented out. Either implement toasts (recommended for UX) or remove the dead comments.

---

#### 8. Frontend Error Boundaries
**Issue:** No React Error Boundaries exist. If a component throws during render, the entire app crashes to a white screen.
**Suggestion:** Add `error.tsx` files in `app/home/` and `app/transactions/` — Next.js App Router automatically uses these as error boundaries.

---

#### 9. No Loading States for Route Transitions  
**Issue:** No `loading.tsx` files in the `app/` directory. Page transitions show nothing while data loads.
**Suggestion:** Add `loading.tsx` skeleton UI to `app/home/` and `app/transactions/`.

---

#### 10. Hardcoded Port & CORS Origins
**Files:** [server.ts](file:///c:/Micael/projects/ninco/backend/src/server.ts)
**Issue:** Port `3333` and CORS origin `http://localhost:3000` are hardcoded. Should use environment variables for deployment flexibility.
```typescript
const PORT = env.PORT;
const CORS_ORIGINS = env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
```

---

#### 11. Webhook Handler Type Safety
**File:** [clerk-sync.ts](file:///c:/Micael/projects/ninco/backend/src/modules/webhooks/clerk-sync.ts)
**Issue:** `evt` is typed as `any` (line 27). The `svix` library provides types that can be used, or at minimum a `WebhookEvent` interface should be defined.
```diff
- let evt: any;
+ interface WebhookEvent {
+   type: string;
+   data: { id: string; email_addresses: any[]; ... };
+ }
+ let evt: WebhookEvent;
```

---

#### 12. `console.log` in Production Code
**Files:** [clerk-sync.ts](file:///c:/Micael/projects/ninco/backend/src/modules/webhooks/clerk-sync.ts) (line 43), [client.ts](file:///c:/Micael/projects/ninco/frontend/lib/api/client.ts) (lines 40, 43, 46)
**Issue:** Multiple `console.log` / `console.error` calls. Should use a proper logger (e.g., Fastify's built-in `request.log`) on backend, and consider removing or gating console calls on frontend.

---

#### 13. `formatCurrency` Hardcoded to USD
**File:** [utils.ts](file:///c:/Micael/projects/ninco/frontend/lib/utils.ts)
**Issue:** Currency formatter is hardcoded to `'en-US'` and `'USD'`. For a personal finance app, this should be configurable per user or at least via an env variable.

---

#### 14. Unused Imports in Landing Page
**File:** [page.tsx](file:///c:/Micael/projects/ninco/frontend/app/page.tsx)
**Issue:** `UserButton` is imported from `@clerk/nextjs` but never used (wrapped in `<SignedOut>`, `UserButton` would never show). Also `Header` is used but there's no `<Footer>` unlike other pages.

---

### 🟢 Priority: Low

#### 15. Response Schema Gaps on Mutation Routes
**Issue:** `delete-account.ts`, `delete-category.ts`, and `delete-tag.ts` only define `204: z.null()` but no error response schemas (e.g., 404). This means Swagger docs don't document error cases.

---

#### 16. Duplicate Schema Definitions
**Issue:** Zod response schemas for transactions, accounts, etc. are defined inline in each route handler. These could be extracted into a shared `schemas/` directory and reused across create/update/list routes.

---

#### 17. `previewFeatures` Not Enabled in Prisma
**File:** [base.prisma](file:///c:/Micael/projects/ninco/backend/prisma/schema/base.prisma)
**Issue:** The multi-file schema feature requires `previewFeatures = ["prismaSchemaFolder"]` in the generator block. This may already work if using Prisma 6+, but should be explicit.

---

#### 18. `test-connection.ts` and `test-webhook.ts` in Source
**Files:** `backend/src/test-connection.ts`, `backend/src/test-webhook.ts`
**Issue:** Debug/test scripts live alongside production source code. Should move to a `scripts/` directory or remove.

---

#### 19. Missing `onDelete` Cascade for Categories
**File:** [transaction.prisma](file:///c:/Micael/projects/ninco/backend/prisma/schema/transaction.prisma)
**Issue:** The category relation uses default behavior (`onDelete: SetNull` is not set), so deleting a category that has associated transactions will throw a foreign key error. Should be `onDelete: SetNull` to gracefully handle this.

---

#### 20. Backend `Decimal` → `string` Conversion Pattern
**Issue:** Every route that returns monetary values does `.toString()` or `.toNumber()` manually. A Prisma middleware or serializer plugin could automate this.

---

#### 21. `dashboard-client.tsx` Unused Imports
**File:** [dashboard-client.tsx](file:///c:/Micael/projects/ninco/frontend/components/dashboard/dashboard-client.tsx)
**Issue:** `TrendingUp`, `TrendingDown` icons are imported but never used.

---

#### 22. Prisma `log` Setting Leaks Queries
**File:** [prisma.ts](file:///c:/Micael/projects/ninco/backend/src/lib/prisma.ts)
**Issue:** Development mode logs all queries (`["query", "error", "warn"]`). This is fine for dev but should be verified not to leak into production. The `NODE_ENV` check exists but isn't backed by env validation.

---

#### 23. `transactions/income` and `transactions/expense` Routes Missing
**Issue:** The transactions page has links to `/transactions/income` and `/transactions/expense` but these routes don't have dedicated page files. They likely rely on a catch-all or don't exist yet.

---

## Summary Matrix

| # | Finding | Severity | Effort | Status |
|---|---------|----------|--------|--------|
| 1 | Middleware filename (`proxy.ts` → `middleware.ts`) | 🔴 High | 5 min | Open |
| 2 | Backend env validation with Zod | 🔴 High | 15 min | Open |
| 3 | Secrets in `.env` — rotate & gitignore | 🔴 High | 10 min | Open |
| 4 | Missing 404 handling on account/category/tag routes | 🔴 High | 30 min | Open |
| 5 | Global error handler (`setErrorHandler`) | 🔴 High | 15 min | Open |
| 6 | No test infrastructure | 🟡 Medium | 2-4 hrs | Open |
| 7 | Commented-out toast notifications | 🟡 Medium | 15 min | Open |
| 8 | Frontend error boundaries (`error.tsx`) | 🟡 Medium | 20 min | Open |
| 9 | Route loading states (`loading.tsx`) | 🟡 Medium | 20 min | Open |
| 10 | Hardcoded port & CORS origins | 🟡 Medium | 10 min | Open |
| 11 | Webhook handler type safety (`any`) | 🟡 Medium | 15 min | Open |
| 12 | `console.log` in prod code | 🟡 Medium | 10 min | Open |
| 13 | `formatCurrency` hardcoded to USD | 🟡 Medium | 10 min | Open |
| 14 | Unused imports in landing page | 🟡 Medium | 5 min | Open |
| 15 | Response schema gaps on mutation routes | 🟢 Low | 15 min | Open |
| 16 | Duplicate inline Zod schemas | 🟢 Low | 1 hr | Open |
| 17 | Prisma `previewFeatures` explicit | 🟢 Low | 2 min | Open |
| 18 | Test scripts in `src/` | 🟢 Low | 5 min | Open |
| 19 | Missing `onDelete: SetNull` for categories | 🟢 Low | 10 min | Open |
| 20 | Decimal → string boilerplate | 🟢 Low | 30 min | Open |
| 21 | Unused imports in `dashboard-client.tsx` | 🟢 Low | 2 min | Open |
| 22 | Prisma query logging guard | 🟢 Low | 5 min | Open |
| 23 | Missing `/transactions/income` & `/expense` pages | 🟢 Low | 15 min | Open |
