#!/usr/bin/env bash
set -euo pipefail

# Use specific SSH key for all git operations in this script
export GIT_SSH_COMMAND="ssh -i ~/.ssh/info/id_rsa -o IdentitiesOnly=yes"

# Usage: ./sync.sh [-m "commit message"] [--tags] [--gitlab]
msg=""
push_tags=false
push_gitlab=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message) msg="$2"; shift 2 ;;
    --tags)       push_tags=true; shift ;;
    --gitlab)  push_gitlab=true; shift ;;
    -h|--help)
      echo "Usage: $0 [-m \"commit message\"] [--tags] [--gitlab]"
      exit 0
      ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# Ensure we're inside a git repo
git rev-parse --is-inside-work-tree >/dev/null

# Determine current branch (avoid pushing from detached HEAD)
branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$branch" == "HEAD" ]]; then
  echo "You're on a detached HEAD. Checkout a branch first." >&2
  exit 1
fi

# Stage changes
git add --all

# Commit only if there are changes
if ! git diff --cached --quiet || ! git diff --quiet; then
  if [[ -z "$msg" ]]; then
    msg="Auto commit: $(date +"%Y-%m-%d %H:%M:%S")"
  fi
  git commit -m "$msg"
else
  echo "No changes to commit."
fi

# Helper: push if remote exists
push_if_remote () {
  local remote="$1"
  if git remote get-url "$remote" >/dev/null 2>&1; then
    echo "→ Pushing to $remote ($branch)…"
    git push "$remote" "$branch"
    if $push_tags; then
      echo "→ Pushing tags to $remote…"
      git push "$remote" --tags
    fi
  else
    echo "Remote '$remote' not found. Skipping."
  fi
}

# Always push to origin
push_if_remote origin

# Push to gitlab only if enabled
if $push_gitlab; then
  push_if_remote gitlab
fi

echo
echo "Last commit summary:"
git log -1 --stat
