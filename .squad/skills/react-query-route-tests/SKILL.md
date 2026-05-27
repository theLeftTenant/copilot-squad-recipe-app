---
name: "react-query-route-tests"
description: "Testing route-level React Query flows with MemoryRouter and apiClient spies"
domain: "testing"
confidence: "high"
source: "earned"
---

## Context
Use this pattern when a RecipeHub page depends on routing plus TanStack Query state, especially for app-level flows like favorites where navigation and optimistic mutations both matter.

## Patterns
- Render the real app or page with both `QueryClientProvider` and `MemoryRouter`.
- Spy on `apiClient` methods instead of mocking `fetch` when the behavior under test is page wiring, query invalidation, or navigation.
- Mock all adjacent queries the page depends on (for example `listTags` on the recipe list page) so failures stay focused on the feature under test.
- Assert both the mutation call and the post-navigation UI state; this catches toggles that mutate data but fail to update the right page.

## Examples
- `src/RecipeHub.Web/src/App.favorites.test.tsx` covers save/remove behavior from recipe cards plus favorites-page empty and error states.

## Anti-Patterns
- Mocking only the primary query and leaving adjacent queries to hit real network paths.
- Testing a toggle mutation without checking the destination page or empty state.
- Recreating component internals in tests instead of rendering through the router.
