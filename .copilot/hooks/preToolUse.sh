#!/bin/bash
# Copilot Hooks preToolUse handler for RecipeHub
# Enforces file-write boundaries and blocks dangerous shell commands

set -e

# Read JSON from stdin
INPUT=$(cat)

# Extract fields using Python for proper JSON parsing (handles escaped quotes)
# This avoids the regex limitations with escaped characters in shell
TOOL_NAME=$(echo "$INPUT" | python3 -c "import json, sys; data = json.loads(sys.stdin.read()); print(data.get('toolName', ''))")

# Default to allow
DECISION="allow"
REASON=""

# ============================================================================
# File write boundary enforcement
# ============================================================================
if [[ "$TOOL_NAME" == "create" ]] || [[ "$TOOL_NAME" == "edit" ]]; then
  # Extract the path from toolArgs using Python for proper JSON parsing
  FILE_PATH=$(echo "$INPUT" | python3 -c "import json, sys; data = json.loads(sys.stdin.read()); print(data.get('toolArgs', {}).get('path', ''))")
  
  if [[ -n "$FILE_PATH" ]]; then
    # Normalize path (remove leading ./)
    NORMALIZED_PATH="${FILE_PATH#./}"
    
    # Check if path is explicitly allowed
    ALLOWED=false
    
    # Allowed directories: src/RecipeHub.Api/, src/RecipeHub.Web/, .squad/
    if [[ "$NORMALIZED_PATH" == src/RecipeHub.Api/* ]] || \
       [[ "$NORMALIZED_PATH" == src/RecipeHub.Web/* ]] || \
       [[ "$NORMALIZED_PATH" == .squad/* ]]; then
      ALLOWED=true
    fi
    
    # Explicitly deny project root writes
    if [[ "$NORMALIZED_PATH" != */* ]] && [[ "$NORMALIZED_PATH" != .* ]]; then
      ALLOWED=false
      REASON="File writes to the project root are not allowed. Use src/RecipeHub.Api/, src/RecipeHub.Web/, or .squad/ instead."
    fi
    
    # Explicitly deny temp directories and outside paths
    if [[ "$NORMALIZED_PATH" == /tmp/* ]] || \
       [[ "$NORMALIZED_PATH" == /var/tmp/* ]] || \
       [[ "$NORMALIZED_PATH" == /home/* ]] || \
       [[ "$NORMALIZED_PATH" == ~/* ]] || \
       [[ "$NORMALIZED_PATH" == ../* ]]; then
      ALLOWED=false
      REASON="File writes outside the repository are not allowed. Attempted path: $NORMALIZED_PATH. Use src/RecipeHub.Api/, src/RecipeHub.Web/, or .squad/ instead."
    fi
    
    # Deny if not explicitly allowed
    if [[ "$ALLOWED" == false ]] && [[ -z "$REASON" ]]; then
      DECISION="deny"
      REASON="File writes are restricted to src/RecipeHub.Api/, src/RecipeHub.Web/, and .squad/ directories. Attempted path: $NORMALIZED_PATH"
    elif [[ "$ALLOWED" == false ]]; then
      DECISION="deny"
    fi
  fi
fi

# ============================================================================
# Dangerous shell command blocking
# ============================================================================
if [[ "$TOOL_NAME" == "bash" ]] || [[ "$TOOL_NAME" == "shell" ]]; then
  # Extract the command from toolArgs using Python for proper JSON parsing
  COMMAND=$(echo "$INPUT" | python3 -c "import json, sys; data = json.loads(sys.stdin.read()); print(data.get('toolArgs', {}).get('command', ''))")
  
  if [[ -n "$COMMAND" ]]; then
    # Destructive filesystem operations
    if echo "$COMMAND" | grep -qE '\brm\s+-[a-zA-Z]*r[a-zA-Z]*f\b|\brm\s+-[a-zA-Z]*f[a-zA-Z]*r\b'; then
      DECISION="deny"
      REASON="Destructive command blocked: 'rm -rf' can cause irreversible data loss. Use targeted file deletion instead."
    fi
    
    # Destructive SQL operations
    if echo "$COMMAND" | grep -qiE '\bDROP\s+TABLE\b|\bTRUNCATE\b|\bDROP\s+DATABASE\b|\bDROP\s+SCHEMA\b'; then
      DECISION="deny"
      REASON="Destructive SQL command blocked: DROP TABLE/TRUNCATE/DROP DATABASE can cause irreversible data loss. Use migrations or targeted DELETE instead."
    fi
    
    # Format operations
    if echo "$COMMAND" | grep -qiE '\bmkfs\b|\bdd\s+if=.*of=/dev/'; then
      DECISION="deny"
      REASON="Destructive disk operation blocked: formatting or raw disk writes can cause irreversible data loss."
    fi
    
    # Recursively remove everything patterns
    if echo "$COMMAND" | grep -qE 'rm\s+-rf\s+/\s*$|rm\s+-rf\s+\*|rm\s+-rf\s+\.\s*$'; then
      DECISION="deny"
      REASON="Catastrophic deletion blocked: removing root, all files, or current directory can destroy the system."
    fi
    
    # File permission escalation that could enable dangerous operations
    if echo "$COMMAND" | grep -qE 'chmod\s+777|chmod\s+-R\s+777'; then
      DECISION="deny"
      REASON="Insecure permission change blocked: chmod 777 compromises security. Use minimal required permissions."
    fi
  fi
fi

# ============================================================================
# Output JSON decision
# ============================================================================
if [[ "$DECISION" == "deny" ]]; then
  echo "{\"permissionDecision\":\"deny\",\"reason\":\"$REASON\"}"
else
  echo "{\"permissionDecision\":\"allow\"}"
fi

exit 0
