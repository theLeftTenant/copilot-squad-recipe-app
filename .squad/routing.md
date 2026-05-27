# Work Routing

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Frontend / UI | Hicks | React pages, TypeScript hooks, CSS modules, navigation flows, client-side API integration |
| Backend / API / Data | Bishop | Minimal API endpoints, EF Core models, SQLite persistence, DTOs, share/search/favorites behavior |
| Testing / QA | Newt | xUnit and Vitest coverage, regressions, reproduction steps, acceptance checks, bug verification |
| Code review | Ralph | Review queue checks, handoff monitoring, reviewer routing, merge-readiness follow-up |
| Scope & priorities | Ripley | Backlog cuts, sequencing, architectural trade-offs, cross-team escalation |
| Session logging | Scribe | Decision capture, session summaries, history updates, cross-agent memory propagation |

## Module Ownership

| Module | Primary | Secondary |
|--------|---------|-----------|
| `src/RecipeHub.Web/` | Hicks | Newt |
| `src/RecipeHub.Api/` | Bishop | Newt |
| `tests/` | Newt | Ripley |
| `.squad/` coordination files | Ripley | Scribe |

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage the issue, set the right `squad:{member}` label, and define the handoff | Ripley |
| `squad:ripley` | Own scope, architecture, and unblock cross-cutting work | Ripley |
| `squad:hicks` | Build or fix frontend/UI work in `RecipeHub.Web` | Hicks |
| `squad:bishop` | Build or fix backend/API/data work in `RecipeHub.Api` | Bishop |
| `squad:newt` | Add or update tests, reproduce bugs, and verify fixes | Newt |

### How Issue Assignment Works

1. When a GitHub issue gets the `squad` label, **Ripley** triages it, chooses the primary owner, and leaves concise handoff notes.
2. **Ralph** watches the queue and flags stalled or misrouted work, but **Ripley** owns the final routing call.
3. When a `squad:{member}` label is applied, that named member picks up the issue in their next session.
4. **Newt** joins early on risky changes so regression coverage is designed before implementation is finished.
5. **Scribe** logs the meaningful outcomes after substantial work without blocking delivery.

## Rules

1. **Lead with the primary domain.** Hicks owns UI-first changes; Bishop owns API/data-first changes.
2. **Escalate seams to Ripley.** Anything that changes contracts, priorities, or delivery sequence goes through Ripley.
3. **Bring Newt in before the end.** Testing is part of implementation, not a final afterthought.
4. **Ralph monitors flow, not product scope.** Ralph checks readiness and routing, then hands product decisions back to Ripley.
5. **Scribe stays silent.** Scribe updates logs and decisions in the background and never becomes the delivery owner.
