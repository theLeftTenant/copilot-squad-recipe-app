# Project Context

- **Owner:** Adam Dunkerley
- **Project:** Full-stack recipe management app for creating, editing, sharing, and cooking recipes during the GitHub Copilot & Squad Developer Workflow Hackathon.
- **Stack:** .NET Aspire 13.2, .NET 10 Minimal API, EF Core 10, SQLite, React 19, TypeScript, Vite 6, TanStack Query v5, xUnit, and Vitest
- **Created:** 2026-05-27T11:27:25.883-05:00

## Learnings

- **2026-05-27T13:14:56.623-05:00:** Copilot Hooks (preToolUse) are runtime governance that block tool calls before they execute. Hook location: `.copilot/hooks/preToolUse.sh`. Config: `.copilot/copilot-setup-steps.yml`. Input/output contract: JSON stdin/stdout. Key decisions: block writes outside `src/RecipeHub.Api/`, `src/RecipeHub.Web/`, `.squad/`; block dangerous commands (`rm -rf`, `DROP TABLE`, `pkill`, etc.); parse JSON safely; log denials to stderr. Vasquez owns implementation and testing.
- **2026-05-27T11:56:19.403-05:00:** Favorites should ship as a thin vertical slice: keep the implicit user server-side, use `/api/favorites` as the source of truth for favorite state, and avoid widening existing recipe/search DTOs unless the implementation proves a real gap. Key files for the slice are `src/RecipeHub.Api/Endpoints/FavoriteEndpoints.cs`, `src/RecipeHub.Api/Models/Favorite.cs`, `src/RecipeHub.Web/src/api/client.ts`, `src/RecipeHub.Web/src/hooks/queryKeys.ts`, `src/RecipeHub.Web/src/pages/RecipeListPage.tsx`, and `src/RecipeHub.Web/src/pages/FavoritesPage.tsx`.
- **2026-05-27T11:27:25.883-05:00:** Adam Dunkerley confirmed the Alien roster and expects Ripley to lead scope, routing, and cross-stack delivery decisions for RecipeHub.

## Team Updates

- **2026-05-27T11:27:25.883Z:** Roster decision merged into decisions.md. Confirmed active squad: Ripley (Lead), Hicks (Frontend), Bishop (Backend), Newt (Test), Scribe (Logger), Ralph (Monitor). Decision log now canonical.
- **2026-05-27T16:56:19Z:** Favorites feature delivery completed. All four decisions archived: Ripley (scope), Bishop (API), Hicks (UI), Newt (tests). Orchestration logs and session logs recorded. Ready for merge.
- **2026-05-27T18:14:56Z:** Copilot Hooks preToolUse guardrails complete and approved. Ripley defined acceptance criteria, Vasquez implemented, Bishop fixed JSON parsing vulnerability, Newt approved. Hook blocks dangerous operations and enforces file boundaries. Production-ready. Orchestration and session logs recorded in .squad/.
