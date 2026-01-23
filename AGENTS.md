# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` holds app-level providers/layout.
- `src/pages/` contains route pages (e.g., `DashboardPage`, `PracticePage`, `SettingsPage`).
- `src/features/` owns feature modules (dashboard/practice/review/records/settings) with `components/`, `hooks/`, and `utils/`.
- `src/components/ui/` contains shadcn-style UI primitives; `src/components/shared/` includes shared skeletons.
- `src/store/` uses Zustand slice pattern (`sessionSlice`, `templateSlice`, `statsSlice`, `uiSlice`).
- `src/db/` holds IndexedDB repositories (`templateRepo`, `sessionRepo`, etc.).
- `src/router/` defines routes with lazy loading.
- `public/` and `src/styles/` for static assets and styling.

## Build, Test, and Development Commands
Use the package scripts (via `pnpm` or `npm`):
- `pnpm dev` — start Vite dev server.
- `pnpm build` — TypeScript build + Vite production build.
- `pnpm preview` — preview production build locally.
- `pnpm lint` — run ESLint.
- `pnpm format` — run Prettier (currently targets `app/**/*.{js,ts,jsx,tsx}`).

## Coding Style & Naming Conventions
- TypeScript + React 19; prefer function components and hooks.
- TailwindCSS + shadcn/ui; use the `cn` helper from `src/lib/utils` for class merges.
- File naming: `PascalCase.tsx` for components, `useX.ts` for hooks, `camelCase` for utilities.
- Prefer feature-local code in `src/features/<feature>/...` and keep `src/pages/` for layout-only composition.
- Use `@/` import alias (e.g., `@/features/practice/...`).

## Testing Guidelines
No automated test runner is configured yet. If adding tests, follow common conventions:
- Place tests alongside modules as `*.test.ts(x)` or in `src/__tests__/`.
- Add a test script to `package.json` and document how to run it.

## Commit & Pull Request Guidelines
Git history isn’t available in this workspace, so no repo-specific convention can be inferred. Recommended:
- Use clear, imperative commit messages (e.g., `feat: add template editor`, `fix: persist session`).
- PRs should include: brief summary, screenshots for UI changes, and any linked issues.
- Ensure `pnpm lint` passes before opening a PR.

## Notes & Configuration
State is persisted locally with Zustand + IndexedDB repositories; avoid committing secrets. Update `components.json` and `tailwind` config only when adding new shadcn components or design tokens.
