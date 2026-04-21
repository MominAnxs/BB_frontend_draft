# BB Frontend

Next.js 15 (App Router) frontend for the Brego Business platform — chat-driven onboarding, marketing reports, finance reports, dataroom, and workspace.

## Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3 + shadcn/ui + Radix primitives
- **Charts**: recharts
- **Animations**: motion (Framer Motion v12)
- **DnD**: react-dnd
- **Icons**: lucide-react
- **State**: React context (`app/providers.tsx`)
- **Notifications**: sonner

## Getting started

Requires **Node 18.18+** (Node 20 LTS recommended).

```bash
npm install
npm run dev          # http://localhost:3000
```

Available scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build (runs TypeScript checks) |
| `npm run start` | Start production server (after `build`) |
| `npm run lint` | Run `next lint` |
| `npm run typecheck` | Run `tsc --noEmit` (no build output) |

## Project layout

```
app/                          # Next.js App Router
  page.tsx                    # Auth / landing
  onboarding/                 # Onboarding flow
  dashboard/                  # Authenticated routes (chat, reports, dataroom, workspace, settings, upgrade, pricing, accounts)
  [service]/[model]/...       # Dynamic service/business-model views (meta-ads, google-ads, overview, etc.)
  providers.tsx               # App-wide React context (user, business model, service, etc.)
  layout.tsx / globals.css

components/                   # Presentational + container components
  auth/                       # AuthPage
  chat/                       # ChatInterface, HuddleCall, DashboardDataEngine, PromptSuggestions, ReportComponents
  reports/                    # PerformanceReports + marketing & accounts modules
    marketing/                # Campaigns, Creatives, Overview, Website + drawers
    accounts/                 # Sales, Expenses, etc.
    shopify/                  # Shopify module
  workspace/                  # Workspace + task detail drawers
  dataroom/                   # Dataroom file/folder UI
  onboarding/                 # BusinessDiagnostic, DiagnosticReport
  upgrade/                    # Upgrade flow, post-payment onboarding, pricing
  settings/                   # User management, profile
  ui/                         # shadcn-derived primitives

types.ts                      # Shared TypeScript types (UserInfo, DiagnosticData, MediaPlan, ...)
next.config.ts
tsconfig.json
tailwind.config.ts
```

## Deployment

The repo is designed to deploy on Vercel. On every push:

1. Vercel runs `npm install`
2. Vercel runs `npm run build` → `next build`
3. `next build` runs a TypeScript pass in production (it only skips errors in dev, per `next.config.ts`)

If the build fails, the TypeScript error will be in the Vercel log. Reproduce locally with `npm run typecheck` and `npm run build`.

## Environment variables

There are currently no required env vars at build time (the app uses mocked data). Add them to `.env.local` for local dev and the Vercel dashboard for production. See `.env.example` for the expected keys.

## Conventions

- **TypeScript strict**. No `any` unless unavoidable; when you must use it, add an `eslint-disable-next-line` and a comment explaining why.
- **Client components** go under `components/**`. Most are `'use client'`.
- **Server components** go in `app/**` (layouts and page shells).
- **Dynamic imports** (via `next/dynamic`) are used in `components/reports/PerformanceReports.tsx` to keep the initial bundle small. Follow the same pattern when adding heavy drawers / modals.
- **Styling**: Tailwind utility classes; no inline CSS except for dynamic values. Shared tokens live in `app/globals.css` and `tailwind.config.ts`.
- **Icons**: Import named icons from `lucide-react` (tree-shaken via `optimizePackageImports`).
- **State**: Top-level app state is in `app/providers.tsx` (`useAppState()`). Page-level state stays local.

## Troubleshooting

- **Vercel build fails with TS errors** → run `npm run typecheck` locally and fix. Production builds do not skip type errors.
- **`next dev` is slow** → that's expected for a codebase this size; the dev config intentionally skips TS checking for speed. Use `npm run typecheck` in a separate terminal.
- **SWC lockfile warnings locally** → safe to ignore; Vercel re-resolves native binaries.

## Hand-off

For a more detailed walkthrough of what ships in this repo, recent changes, and known caveats, see [`HANDOFF.md`](./HANDOFF.md).
