# Project Context

- **Owner:** Adam Dunkerley
- **Project:** Full-stack recipe management app for creating, editing, sharing, and cooking recipes during the GitHub Copilot & Squad Developer Workflow Hackathon.
- **Stack:** .NET Aspire 13.2, .NET 10 Minimal API, EF Core 10, SQLite, React 19, TypeScript, Vite 6, TanStack Query v5, xUnit, and Vitest
- **Created:** 2026-05-27T11:27:25.883-05:00

## Learnings

- **2026-05-27T11:27:25.883-05:00:** Adam Dunkerley confirmed Hicks owns the React 19 + TypeScript frontend, including pages, hooks, and UI polish in `RecipeHub.Web`.
- **2026-05-27T11:56:19.403-05:00:** Favorites in `RecipeHub.Web` now flow through `src/api/client.ts` + `src/hooks/useFavorites.ts`, which maps backend favorite DTOs into reusable card data for `src/components/recipe/RecipeCard.tsx`.
- **2026-05-27T11:56:19.403-05:00:** The main recipe summary surfaces are `src/pages/HomePage.tsx`, `src/pages/RecipeListPage.tsx`, and `src/pages/FavoritesPage.tsx`; keeping them on one shared `RecipeCard` prevents affordance drift and keeps favorite loading/error handling consistent.
- **2026-05-27T11:56:19.403-05:00:** Frontend regression coverage for favorites lives in `src/pages/__tests__/favorites.flow.test.tsx`, which drives the app through router navigation and mocked `/api/favorites` traffic instead of testing page fragments in isolation.

## Team Updates

- **2026-05-27T11:27:25.883Z:** Roster decision merged into decisions.md. Confirmed active squad: Ripley (Lead), Hicks (Frontend), Bishop (Backend), Newt (Test), Scribe (Logger), Ralph (Monitor). Decision log now canonical.
- **2026-05-27T16:56:19Z:** Favorites feature delivery completed. UI standardization decision logged, paired work with Bishop (API) and Newt (tests). Orchestration checkpoint recorded. Ready for merge.
