# Project Context

- **Owner:** Adam Dunkerley
- **Project:** Full-stack recipe management app for creating, editing, sharing, and cooking recipes during the GitHub Copilot & Squad Developer Workflow Hackathon.
- **Stack:** .NET Aspire 13.2, .NET 10 Minimal API, EF Core 10, SQLite, React 19, TypeScript, Vite 6, TanStack Query v5, xUnit, and Vitest
- **Created:** 2026-05-27T11:27:25.883-05:00

## Learnings

- **2026-05-27T11:27:25.883-05:00:** Adam Dunkerley confirmed Newt owns QA for RecipeHub, with regression coverage split across xUnit backend tests and Vitest frontend tests.
- **2026-05-27T11:56:19.403-05:00:** Favorites verification is now anchored in `tests/RecipeHub.Api.Tests/Favorites/FavoriteEndpointsTests.cs` for API add/list/remove coverage and `src/RecipeHub.Web/src/App.favorites.test.tsx` for app-level toggle, favorites-page, empty-state, and error flows.

## Team Updates

- **2026-05-27T11:27:25.883Z:** Roster decision merged into decisions.md. Confirmed active squad: Ripley (Lead), Hicks (Frontend), Bishop (Backend), Newt (Test), Scribe (Logger), Ralph (Monitor). Decision log now canonical.
- **2026-05-27T16:56:19Z:** Favorites feature delivery completed. Test coverage decision logged, integrated with Bishop (API) and Hicks (UI) work. Orchestration checkpoint recorded. Ready for merge.
