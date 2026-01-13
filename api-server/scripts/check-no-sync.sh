#!/bin/bash
# Static enforcement: prevent sequelize.sync() calls in source code
# Usage: ./scripts/check-no-sync.sh
# Exit code: 0 if no sync() calls found, 1 if found
# 
# Note: This allows defensive code (poisoning sync in database.js, checking in index.js)
# but blocks actual sync() calls elsewhere.

set -e

echo "🔍 Checking for forbidden sequelize.sync() calls..."

# Find all files with sequelize.sync references
FILES_WITH_SYNC=$(grep -r "sequelize\.sync" src --exclude-dir=node_modules -l 2>/dev/null || true)

if [ -z "$FILES_WITH_SYNC" ]; then
  echo "✅ No sequelize.sync() references found"
  exit 0
fi

# Check each file - allow defensive code, block actual calls
VIOLATIONS=0
for file in $FILES_WITH_SYNC; do
  # Skip database.js (where we poison sync) and index.js (where we check it)
  if [[ "$file" == *"database.js" ]] || [[ "$file" == *"index.js" ]]; then
    continue
  fi
  
  # Check for actual sync() calls (not just references)
  if grep -n "sequelize\.sync\s*(" "$file" 2>/dev/null; then
    echo "❌ Forbidden sequelize.sync() call found in: $file"
    VIOLATIONS=1
  fi
done

if [ $VIOLATIONS -eq 1 ]; then
  echo ""
  echo "❌ Forbidden: sequelize.sync() calls found in source code"
  echo "   Schema changes must use migrations via sequelize-cli"
  exit 1
fi

echo "✅ No forbidden sequelize.sync() calls found"
exit 0
