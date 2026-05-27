# Squad Decisions

## Active Decisions

### 2026-05-27T11:27:25.883-05:00: Confirmed Alien roster without Platform Dev
**By:** Ripley
**What:** Set the active squad to Ripley, Hicks, Bishop, Newt, Scribe, and Ralph; excluded Apone / Platform Dev from the working roster; and initialized Alien casting for the four assignable delivery roles.
**Why:** The current RecipeHub project needs clear ownership for lead, frontend, backend, testing, logging, and monitoring without adding a separate platform lane.

### 2026-05-27T11:46:02.450-05:00: Added DevOps ownership as Vasquez
**By:** Squad
**What:** Added Vasquez as the dedicated DevOps owner for GitHub Actions workflows, Dockerfiles, containers, and CI/CD automation while keeping the existing Alien casting intact.
**Why:** RecipeHub now needs an explicit owner for delivery infrastructure so frontend, backend, and testing work are not forced to absorb deployment and pipeline changes.

### 2026-05-27T11:56:19.403-05:00: Favorites ships as a thin vertical slice
**By:** Ripley
**What:** Keep the single implicit user owned by the API for this feature (no auth surface, no user id from the client). Bishop should finish `/api/favorites` with add, remove, and list behavior backed by the existing `Favorites` table; Hicks should consume that list as the source of truth for toggle state and the `/favorites` page, with visible favorite toggles anywhere recipes are rendered as cards in primary app navigation; Newt should cover the happy-path API lifecycle plus the UI flow where toggling a recipe updates the favorites view after navigation or reload. Definition of done: a favorite added in the UI persists in SQLite, survives refresh, appears on `/favorites`, and can be removed cleanly.
**Why:** The repository already has the persistence model, migration, nav route, and placeholder page, so the fastest safe delivery path is to close the backend/frontend seam instead of reshaping every recipe contract. Keeping favorite state behind `/api/favorites` cuts scope, avoids unnecessary churn to existing recipe/search endpoints, and gives QA one clear end-to-end contract to verify.

### 2026-05-27T11:56:19.403-05:00: Favorites API contract for the implicit user
**By:** Bishop
**What:** Implemented `GET /api/favorites`, `POST /api/favorites`, and `DELETE /api/favorites/{recipeId}` against the existing SQLite favorites table for the single implicit `default` user. `POST` accepts `{ recipeId }`, returns `201 Created` for a new favorite or `200 OK` for an existing one, `GET` returns flattened recipe summaries with `favoritedAt` ordered newest-first, and `DELETE` returns `404` when the recipe is not currently favorited.
**Why:** The no-auth scope still needs an explicit contract the frontend and tests can trust. Reusing the existing favorite persistence model keeps the data layer aligned with recipes while making duplicate handling and list ordering deterministic.

### 2026-05-27T11:56:19.403-05:00: Standardized favorites UI on shared recipe cards
**By:** Hicks
**What:** Reused a shared `RecipeCard` with an inline heart-style save toggle across Home, Recipes, and Favorites pages, and treated `/api/favorites` responses as favorite DTOs that are mapped back into recipe-card view data on the client.
**Why:** The same save/remove affordance needs to behave consistently anywhere a recipe summary appears, and the mapping layer keeps the UI aligned with the current backend favorites contract without leaking DTO quirks through page components.

### 2026-05-27T11:56:19.403-05:00: Canonical favorites verification lives in existing API and app test suites
**By:** Newt
**What:** Kept favorites regression coverage in `tests/RecipeHub.Api.Tests/Favorites/FavoriteEndpointsTests.cs` and `src/RecipeHub.Web/src/App.favorites.test.tsx`, adding round-trip API coverage plus app-level empty-state and remove-from-card assertions against the shipped copy "You haven't saved any favorites yet."
**Why:** This keeps favorites QA in the repo's existing test lanes instead of scattering duplicate specs, and it locks the real user-facing empty state so future UI tweaks do not silently regress the favorites page flow.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
