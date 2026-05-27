# Project Context

- **Owner:** Adam Dunkerley
- **Project:** Full-stack recipe management app for creating, editing, sharing, and cooking recipes during the GitHub Copilot & Squad Developer Workflow Hackathon.
- **Stack:** .NET Aspire 13.2, .NET 10 Minimal API, EF Core 10, SQLite, React 19, TypeScript, Vite 6, TanStack Query v5, xUnit, and Vitest
- **Created:** 2026-05-27T11:46:02.450-05:00

## Learnings

- **2026-05-27T11:46:02.450-05:00:** Adam Dunkerley added Vasquez to own GitHub workflows, Dockerfiles, containers, and CI/CD reliability for RecipeHub.

- **2026-05-27T13:14:56.623-05:00:** Implemented Copilot Hooks preToolUse handler for RecipeHub. Created `.copilot/hooks/preToolUse.sh` (executable shell script) and wired it via `.copilot/copilot-hooks.json`. Hook enforces file-write boundaries (only `src/RecipeHub.Api/`, `src/RecipeHub.Web/`, `.squad/` allowed), blocks project root writes, denies temp/outside-repo paths, and blocks dangerous commands (`rm -rf`, `DROP TABLE`, `TRUNCATE`, etc.). Zero-dependency implementation using bash, grep, and sed. All test scenarios pass. Documentation added to `README.md` and `.copilot/hooks/README.md`.

- **2026-05-27T12:29:47.196-05:00:** Installed Husky at repository root and wired `.husky/pre-commit` to `npm run precommit`. Root hook now delegates to `dotnet format --verify-no-changes` for .NET API, and `eslint . --max-warnings 0` + `prettier --check` for TypeScript/CSS frontend. Polyglot pre-commit integration complete and verified.

## Team Updates

- **2026-05-27T18:14:56Z:** Copilot Hooks implementation (preToolUse + Husky). Initial preToolUse implementation had JSON parsing vulnerability with escaped quotes. Bishop fixed with Python-based json.loads(), all tests now pass. Husky hook verified to correctly reject bad formatting in both .NET and TypeScript boundaries. Two orchestration logs recorded.
