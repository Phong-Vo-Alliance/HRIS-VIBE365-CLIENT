# Implemented Portal Pages & Navigation

- **Routing** moved under `/app/*` with protected routes:
  - `/app` (index) → Dashboard
  - `/app/dashboard`
  - `/app/report`
- **Header** updated with animated nav links (`Dashboard`, `Reports`) using the `.nav-link` utility.
- **Dashboard** now shows 3 KPI cards and a **Hired Staff** data table with filters, search, pagination-ready markup, and expandable per-row details for **today's** status entries (with overtime badge).
- **Report** page with date/department/projects filters, per-staff aggregation table, and client-side **Export PDF (print stub)** and **Export Excel (CSV)** buttons.
- **Domain types** added in `src/domain/types.ts` and an **in-memory mock API** in `src/lib/api/mock.ts`.

> This is a front-end stub that you can later swap to a real backend by replacing calls in `mock.ts`.

## Files touched

- `src/app/router.tsx` (routes)
- `src/pages/_layout/Header.tsx` (new nav and logout)
- `src/styles/globals.css` (added `.nav-link` utility)
- `src/features/dashboard/DashboardPage.tsx` (full implementation)
- `src/features/report/ReportPage.tsx` (new)
- `src/domain/types.ts` (new)
- `src/lib/api/mock.ts` (new)

## Quick start

```bash
npm i
npm run dev
# login via the existing demo login; it will redirect to /app/dashboard
```
