# Project Context

- **Owner:** Adam Dunkerley
- **Project:** Full-stack recipe management app for creating, editing, sharing, and cooking recipes during the GitHub Copilot & Squad Developer Workflow Hackathon.
- **Stack:** .NET Aspire 13.2, .NET 10 Minimal API, EF Core 10, SQLite, React 19, TypeScript, Vite 6, TanStack Query v5, xUnit, and Vitest
- **Created:** 2026-05-27T11:27:25.883-05:00

## Learnings

- **2026-05-27T11:27:25.883-05:00:** Adam Dunkerley confirmed Bishop owns the .NET 10 Minimal API, EF Core, and SQLite-backed backend behavior in `RecipeHub.Api`.
- **2026-05-27T11:56:19.403-05:00:** Favorites now use the existing `Favorite` EF model/table through `src/RecipeHub.Api/Endpoints/FavoriteEndpoints.cs`, with the single implicit user persisted as `default` and duplicate POSTs returning the existing row instead of creating another favorite.
- **2026-05-27T11:56:19.403-05:00:** Favorites responses are flattened recipe summaries plus `FavoritedAt` in `src/RecipeHub.Api/Dtos/FavoriteDto.cs`, and `POST /api/favorites` binds `{ recipeId }` from `src/RecipeHub.Api/Dtos/AddFavoriteRequest.cs`.
- **2026-05-27T11:56:19.403-05:00:** API integration tests live in `tests/RecipeHub.Api.Tests/Favorites/FavoriteEndpointsTests.cs`, and `tests/RecipeHub.Api.Tests/TestBase.cs` now keeps SQLite test databases under the test output tree instead of OS temp directories.

## Team Updates

- **2026-05-27T11:27:25.883Z:** Roster decision merged into decisions.md. Confirmed active squad: Ripley (Lead), Hicks (Frontend), Bishop (Backend), Newt (Test), Scribe (Logger), Ralph (Monitor). Decision log now canonical.
- **2026-05-27T16:56:19Z:** Favorites feature delivery completed. API contract decision logged, paired work with Hicks (UI) and Newt (tests). Orchestration checkpoint recorded. Ready for merge.
