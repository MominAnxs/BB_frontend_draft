# Hand-off notes

This doc captures what this repo is, where the bodies are buried, and what to do next. Read `README.md` first for setup basics.

## Shipping state

- **Next.js 15 App Router** — all routes are `'use client'` container pages that mount one big component from `components/`. The app is essentially a thick SPA behind a Next.js router.
- **TypeScript strict** — zero errors on `npm run typecheck` as of this hand-off.
- **Vercel-ready** — `next build` passes with TS checking enabled for production.
- **Data is mocked** — every module uses hard-coded arrays / objects inline for now. There is no API layer yet. When you wire real data, keep the shape identical and swap only the data source to avoid touching the hundreds of JSX call-sites.

## Recent changes in this hand-off pass

The starting point had ~75 TypeScript errors that `next build` (production) surfaced but `next dev` hid. Everything below was fixed or added.

### Build fixes

- **`next.config.ts`** — production builds now type-check (development still skips for speed). Added image optimization formats (`avif`, `webp`), security headers, and an expanded `optimizePackageImports` list (`motion`, `sonner`, `date-fns`). Added `poweredByHeader: false`.
- **`components/ui/form.tsx`** — stubbed to `export {};`. The original file imported `react-hook-form` which isn't in `package.json` and wasn't used anywhere. It broke the build. Delete or re-implement properly if forms ever need it.
- **`components/auth/AuthPage.tsx`**, **`components/chat/PromptSuggestions.tsx`** — motion `Variants` typing was tightened in Framer Motion v12. Cubic béziers are now typed as 4-tuples; named eases must be string literals `as const`. Fixed with explicit tuple types and `Variants` imports.
- **`components/chat/ChatInterface.tsx`** — several small correctness bugs:
  - `Message.role` → `Message.type` (the interface uses `type`)
  - Added `'what-needs-fixing'` to the `component` union
  - Added `companyName?: string` to `Message` and use `message.companyName` in the marketing-report header (the nested `MessageBubble` function doesn't receive `userInfo`)
  - `diagnosticData.businessModel !== ''` narrowed correctly on a `Partial<DiagnosticData>`
- **`components/chat/ReportComponents.tsx`** — replaced `typeof ecommerceChartData` style casts (which don't do what the author expected) with explicit array element types.
- **`components/onboarding/BusinessDiagnostic.tsx`** — added `linkedinAds: false` to the initial `connectedAccounts` state to match the `DiagnosticData` shape.
- **`components/reports/KPIWidget.tsx`** — widened `KPIData.status` to include `'neutral'` and `KPIData.format` to include `'text'`. Added a `neutral` entry to `statusColors`.
- **`components/reports/BregoGPTDrawer.tsx`** — widened `ModuleContext` to include `'meta-ads'` and `'google-ads'` and added matching `moduleLabels` entries.
- **`components/reports/CampaignsModule.tsx`** — added `cpc?: number` to `AdSetData`; added `?? []` guards on `takeaways`; added `|| 1` fallback to avoid divide-by-zero on orders/conversions; removed redundant inner `businessModel === 'leadgen'` checks inside already-narrowed `ecommerce` branches.
- **`components/reports/ExperimentsModule.tsx`** — imported previously-missing `FlaskConical` and `CheckCircle` icons.
- **`components/reports/PerformanceReports.tsx`** — removed obsolete `.filter(item => item.id !== 'channels')` that broke the sidebar.
- **`components/reports/marketing/CampaignsDrawer.tsx`**, **`CampaignDrilldownDrawerFixed.tsx`**, **`CreativesDrawer.tsx`** — the stat grids had a common pattern bug: `cond ? [array1] : [array2].map(...)` — the `.map()` only attached to the second branch. Wrapped the ternary in parentheses so `.map` applies to both.
- **`components/reports/marketing/OverviewDrawers.tsx`** — fixed a duplicate `style` JSX attribute.
- **`components/workspace/Workspace.tsx`**, **`components/dataroom/Dataroom.tsx`** — loosened `notificationCounts` prop type to `Record<string, number>` (from a too-narrow `{ unread; actionRequired }`); `userInfo.name` doesn't exist on `UserInfo`, replaced with a derived `userDisplayName` / `userInitial` from `firstName` / `lastName`. Also extended `MediaPlan` with `offers?: MediaPlanOffer[]` and `receivedDate?: string`.

### Hand-off additions

- `README.md` — project overview, scripts, layout, conventions.
- `HANDOFF.md` (this file).
- `.env.example` — empty template; fill in as backend APIs come online.
- `.eslintrc.json` — `next/core-web-vitals` baseline. `eslint` + `eslint-config-next` added to devDependencies.
- `.gitignore` — expanded with coverage, IDE, OS junk, Vercel, Turbo.
- `vercel.json` — explicit `framework: nextjs`, clean URLs.
- `package.json` — added `typecheck` and `analyze` scripts and `engines.node >= 18.18`.
- **App Router essentials**:
  - `app/layout.tsx` — now uses `next/font` (Manrope), mounts `sonner`'s `<Toaster />`, exports `viewport` and OpenGraph metadata.
  - `app/globals.css` — Google Fonts URL import removed (font is now supplied by `next/font`).
  - `app/not-found.tsx` — branded 404.
  - `app/error.tsx` — route error boundary.
  - `app/global-error.tsx` — root error boundary (last-resort).
  - `app/loading.tsx` — route loading spinner.
  - `app/icon.svg` — favicon (Brego mark).
  - `app/api/health/route.ts` — edge-runtime liveness probe at `/api/health`.
  - `app/robots.ts`, `app/sitemap.ts` — SEO basics at `/robots.txt` and `/sitemap.xml`.

### Performance notes

- **Route-level code-splitting is already good** — each page under `app/dashboard/*` imports exactly one big client component, so Next.js naturally chunks per route.
- **Drawer-level splitting** — `PerformanceReports.tsx` already `next/dynamic`-imports every module. `CampaignsModule.tsx` was updated to dynamically import `CreativesDrawer` as well. Follow this pattern for any drawer that only opens on user action.
- **Bundle optimization** — `optimizePackageImports` covers `lucide-react`, `recharts`, `@radix-ui/react-icons`, `motion`, `sonner`, and `date-fns`, which are the main tree-shaking wins.
- Consider `React.memo` on the row-level components inside the biggest tables (`CampaignsModule`, `ExperimentsModule`) if scroll perf degrades with real data.

## Known caveats

- **No backend.** Every number, every campaign, every report is fake. Search for `// mock`, inline literals, or hard-coded arrays in each module before wiring an API.
- **A few `any` casts** are intentional where discriminated unions are too narrow for the cross-cutting JSX to express cleanly (e.g. `campaigns: any[]` in `CampaignsDrawer`, `topAge/topAgeGroup as any` in `CampaignDrilldownDrawerFixed`). These are the ones flagged with `eslint-disable-next-line` — safe to keep, tighten only if you refactor the data layer.
- **`app/layout.tsx`** and the route `layout.tsx`s are thin. All auth/session guarding happens client-side inside `providers.tsx`. If you move to a real auth provider, consider doing route-guarding in a server-side layout.
- **`form.tsx`** is a stub (see above). If you need react-hook-form, install it explicitly and re-implement.
- **`next dev` hides type errors** — use `npm run typecheck` alongside dev, or CI will catch them on PR.

## Suggested next steps

1. **Wire a real API** — start with `UserInfo` (from auth), then reports (Meta/Google/GA4). Swap mock arrays for `useQuery` / server fetches, keep types identical.
2. **Persist app state** — `app/providers.tsx` resets on refresh. Persist to cookies/localStorage or lift into a server component.
3. **Auth** — integrate a real provider (Clerk, NextAuth, Supabase…) and move gating into layouts.
4. **CI** — run `npm run typecheck`, `npm run lint`, `npm run build` on every PR. Optionally add `@next/bundle-analyzer` (wired via the `analyze` script placeholder).
5. **Testing** — none exists today. Start with Playwright smoke tests for the main routes.
6. **Observability** — add Sentry or similar; `removeConsole` already strips `console.log` in prod but keeps `error`/`warn`.

## Contacts / ownership

Fill this in with the team responsible for each area as you onboard.
