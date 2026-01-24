# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React 19 practice/exam timer app using TypeScript and Vite. shadcn/ui-style components with Radix UI primitives and Tailwind CSS v4.

## Commands

```bash
# Start dev server
npm run dev

# Build for production (type check + vite build)
npm run build

# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Architecture

### State Management (Zustand + Immer + Slice Pattern)

Store is split into slices in `src/store/`. Each slice exports a `create*Slice` function:

- `sessionSlice.ts` - Practice session state and timer logic (mode, status, timers, question tracking)
- `templateSlice.ts` - Templates and question types state
- `statsSlice.ts` - Statistics state (daily aggregated stats)
- `uiSlice.ts` - UI state (theme, color scheme)

Combine slices in `src/store/index.ts` with `zustand/middleware/immer` and `zustand/middleware/persist`. **Use slice-level selectors** from `src/store/selectors.ts` (`useSessionActions()`, `useSessionTimers()`, etc.) to avoid unnecessary re-renders.

**RootState**: All slices merged in `src/store/rootTypes.ts` (`SessionSlice & TemplateSlice & StatsSlice & UISlice`).

**Timer Implementation**: `sessionSlice` manages three timer tracks (`totalMs`, `sectionMs`, `questionMs`) using delta-based updates. The `useSessionTimer` hook uses `performance.now()` with 200ms intervals for high-precision timing.

**Session Persistence**: Zustand persist middleware auto-pauses running sessions on page reload. Use `sessionRepo.restoreRunningSession()` to resume - the timer delta compensates for elapsed time while the page was closed.

### Routing

React Router v7 with code splitting in `src/router/index.tsx`. All pages are lazy-loaded with `Suspense` and skeleton fallbacks:

- `/` -> redirects to `/dashboard`
- `/dashboard` -> DashboardPage
- `/practice` -> PracticePage
- `/records` -> RecordsPage
- `/records/:id` -> RecordDetailPage
- `/review` -> ReviewPage
- `/settings` -> SettingsPage

### Component Layering

```
src/
├── app/              # App entry point (AppLayout)
├── components/
│   ├── ui/           # shadcn/ui-style primitives (cva variants)
│   ├── shared/       # Shared components (skeletons)
│   └── theme/        # Theme provider
├── features/         # Feature-scoped components with dedicated hooks
├── pages/            # Route pages
├── hooks/            # Global hooks (useMobile, useSessionTimer)
├── store/            # Zustand slices and selectors
├── lib/              # Utilities (cn, utils.ts)
├── db/               # IndexedDB utilities and repositories
├── router/           # React Router configuration
├── types/            # TypeScript type definitions
└── utils/            # Helper functions (time formatting)
```

### Data Layer

IndexedDB via `src/db/` with repository pattern. DB helpers in `src/db/index.ts`:
- `withStore(storeName, mode, action)` - Single store transaction
- `withStores(storeNames[], mode, action)` - Multi-store transaction
- `wrapRequest(request)` - Promise wrapper for IDBRequest

**Repositories** (`src/db/repositories/`):
- `templateRepo` - CRUD for templates and template_items
- `questionTypeRepo` - CRUD for question types
- `sessionRepo` - Session management with auto-pause on reload
- `statsRepo` - Daily statistics aggregation
- `settingsRepo` - App settings
- `backupRepo` - Export/import functionality

**DB Schema** (`exam-timer-db` v1):
- `question_types`, `templates`, `template_items`, `sessions`, `session_items`, `question_records`, `stats_daily`, `settings`

### Theming

`next-themes` with Tailwind v4 CSS-based theming. Color schemes defined in `src/index.css`: `azure` (default), `citrus`, `slate`, `rose`. Use `data-color` attribute on `:root`.

### Forms

React Hook Form with Zod validation (schema in page directory's `schema.ts`).

### Path Alias

`@/` maps to `src/`. Use `@/components/...`, `@/store/...`, `@/db/...` imports.

### Drag and Drop

`@dnd-kit` for sortable interfaces (utilities, sortable, core).
