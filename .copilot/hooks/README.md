# Copilot Hooks

This directory contains Copilot Hooks that enforce safe agent behavior in RecipeHub.

## preToolUse Hook

**Location:** `preToolUse.sh`  
**Purpose:** Intercepts tool calls before execution and blocks unsafe operations.

### File Write Boundaries

Agents can only write to these directories:
- `src/RecipeHub.Api/` — backend API code
- `src/RecipeHub.Web/` — frontend React code
- `.squad/` — team coordination files

**Blocked:**
- Project root writes (e.g., `README.md`, `package.json`)
- Temp directories (`/tmp`, `/var/tmp`)
- Outside-repo paths (`/home/*`, `~/*`, `../*`)

### Dangerous Command Blocking

The hook blocks irreversible shell commands:

| Command Pattern | Reason |
|----------------|---------|
| `rm -rf` | Recursive force delete causes data loss |
| `DROP TABLE` | SQL destruction without rollback |
| `TRUNCATE` | Empties tables irreversibly |
| `DROP DATABASE` | Destroys entire database |
| `mkfs`, `dd if=...of=/dev/` | Disk formatting operations |
| `chmod 777` | Insecure permission escalation |

### Hook Protocol

The hook reads JSON from stdin:
```json
{
  "toolName": "create",
  "toolArgs": {
    "path": "src/RecipeHub.Api/Test.cs"
  }
}
```

And returns a decision:
```json
{
  "permissionDecision": "allow"
}
```

Or:
```json
{
  "permissionDecision": "deny",
  "reason": "File writes are restricted to src/RecipeHub.Api/, src/RecipeHub.Web/, and .squad/ directories. Attempted path: package.json"
}
```

### Testing

Test the hook directly:
```bash
echo '{"toolName":"create","toolArgs":{"path":"README.md"}}' | .copilot/hooks/preToolUse.sh
# Expected: {"permissionDecision":"deny",...}

echo '{"toolName":"create","toolArgs":{"path":"src/RecipeHub.Api/Test.cs"}}' | .copilot/hooks/preToolUse.sh
# Expected: {"permissionDecision":"allow"}

echo '{"toolName":"bash","toolArgs":{"command":"rm -rf /tmp/old"}}' | .copilot/hooks/preToolUse.sh
# Expected: {"permissionDecision":"deny",...}
```

### Implementation Notes

- **Python for JSON parsing:** Uses `python3` (universally available on Linux) for correct handling of escaped quotes in JSON strings
- **Fast:** JSON parsing with no complex regex or external dependencies beyond Python stdlib
- **Safe by default:** Denies anything not explicitly allowed
- **Clear feedback:** Denial reasons explain what was blocked and why

### Modifying Boundaries

To adjust allowed directories, edit `preToolUse.sh`:

```bash
# Line ~35: Add new allowed paths
if [[ "$NORMALIZED_PATH" == src/RecipeHub.Api/* ]] || \
   [[ "$NORMALIZED_PATH" == src/RecipeHub.Web/* ]] || \
   [[ "$NORMALIZED_PATH" == .squad/* ]] || \
   [[ "$NORMALIZED_PATH" == your-new-path/* ]]; then
  ALLOWED=true
fi
```

To block additional commands, add patterns around line ~75:

```bash
# Block additional dangerous command
if echo "$COMMAND" | grep -qE '\byour-command-pattern\b'; then
  DECISION="deny"
  REASON="Your explanation here."
fi
```

### Maintenance

- Hook version: 2.0 (2026-05-27)
- Last updated: 2026-05-27T13:14:56.623-05:00
- Owner: Bishop (Backend Dev)
- Revision: Fixed JSON parsing to handle escaped quotes correctly
