#!/bin/bash
set -e  # Exit immediately if a command fails

# Use specific SSH key for all git operations in this script
export GIT_SSH_COMMAND="ssh -i ~/.ssh/info/id_rsa -o IdentitiesOnly=yes"

# Add all changes
git add --all

# Commit with timestamp
git commit -m "Auto commit: $(date +"%Y-%m-%d %H:%M:%S")"

# Push current branch
git push origin "$(git rev-parse --abbrev-ref HEAD)"

# Push tags
git push --tags

# Show last commit summary
git log -1 --stat
