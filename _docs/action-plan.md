# Ninco — Action Plan

Based on [code-quality-report.md](file:///c:/Micael/projects/ninco/_docs/code-quality-report.md).
Ordered by impact and dependency — each phase can be completed in one session.

---

## Phase 1 — Critical Fixes (30 min)

> Quick wins that address security and correctness issues.

| # | Task | Finding | Est. |
|---|------|---------|------|
| 1 | Rename `proxy.ts` → `middleware.ts` | #1 | 2 min |
| 2 | Add `.env` to `.gitignore`, create `.env.example` with placeholders | #3 | 5 min |
| 3 | Create `backend/src/lib/env.ts` — Zod schema for all env vars | #2 | 10 min |
| 4 | Add `app.setErrorHandler()` in `server.ts` | #5 | 10 min |
| 5 | Remove unused imports (`TrendingUp`, `TrendingDown` in dashboard, `UserButton` in landing) | #14, #21 | 3 min |

---

## Phase 2 — Backend Error Handling (30 min)

> Make all mutation routes return proper 404s instead of raw Prisma errors.

| # | Task | Finding | Est. |
|---|------|---------|------|
| 6 | Add 404 check to `update-account.ts` and `delete-account.ts` | #4 | 8 min |
| 7 | Add 404 check to `update-category.ts` and `delete-category.ts` | #4 | 8 min |
| 8 | Add 404 check to `update-tag.ts` and `delete-tag.ts` | #4 | 8 min |
| 9 | Add 404 response schemas to all delete routes that lack them | #15 | 5 min |

---

## Phase 3 — Hardening & Config (20 min)

> Remove hardcoded values and tighten production readiness.

| # | Task | Finding | Est. |
|---|------|---------|------|
| 10 | Make port & CORS origins configurable via env vars | #10 | 8 min |
| 11 | Replace `console.log/error` with Fastify logger on backend | #12 | 5 min |
| 12 | Type the webhook handler (`evt: any` → proper interface) | #11 | 5 min |
| 13 | Move `test-connection.ts` and `test-webhook.ts` to `scripts/` | #18 | 2 min |

---

## Phase 4 — Frontend UX (30 min)

> Error boundaries, loading states, and toast notifications.

| # | Task | Finding | Est. |
|---|------|---------|------|
| 14 | Create `app/home/error.tsx` and `app/transactions/error.tsx` | #8 | 10 min |
| 15 | Create `app/home/loading.tsx` and `app/transactions/loading.tsx` | #9 | 10 min |
| 16 | Install `sonner`, implement toast notifications in mutation hooks | #7 | 10 min |

---

## Phase 5 — Schema & Data (25 min)

> Clean up Prisma and Zod patterns.

| # | Task | Finding | Est. |
|---|------|---------|------|
| 17 | Add `onDelete: SetNull` to category relation in `transaction.prisma` | #19 | 5 min |
| 18 | Add `previewFeatures = ["prismaSchemaFolder"]` to `base.prisma` | #17 | 2 min |
| 19 | Verify Prisma query log guard for production | #22 | 3 min |
| 20 | Extract shared Zod schemas to `backend/src/schemas/` | #16 | 15 min |

---

## Phase 6 — Polish (15 min)

> Final cleanup and config improvements.

| # | Task | Finding | Est. |
|---|------|---------|------|
| 21 | Make `formatCurrency` locale/currency configurable | #13 | 10 min |
| 22 | Create `/transactions/income` and `/transactions/expense` page stubs (or update links) | #23 | 5 min |

---

## Phase 7 — Testing (2-4 hrs, separate session)

> Foundation for automated testing — can be done independently.

| # | Task | Finding | Est. |
|---|------|---------|------|
| 23 | Set up Vitest for backend, write first route handler tests | #6 | 2 hrs |
| 24 | Set up Playwright for frontend E2E, write auth + CRUD flow tests | #6 | 2 hrs |

---

## Time Estimates

| Phase | Description | Time |
|-------|-------------|------|
| **1** | Critical fixes | ~30 min |
| **2** | Backend error handling | ~30 min |
| **3** | Hardening & config | ~20 min |
| **4** | Frontend UX | ~30 min |
| **5** | Schema & data | ~25 min |
| **6** | Polish | ~15 min |
| **7** | Testing | ~4 hrs |
| | **Total** | **~6.5 hrs** |

> [!TIP]
> Phases 1–6 can be completed in a single ~2.5 hour session. Phase 7 (testing) is best done as a separate dedicated session.
