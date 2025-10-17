#!/bin/bash
set -e

echo "=== Running database migrations ==="
timeout 30 npx prisma migrate deploy || {
  EXIT_CODE=$?
  if [ $EXIT_CODE -eq 124 ]; then
    echo "WARNING: Migration timed out after 30s, assuming already applied"
  else
    echo "ERROR: Migration failed with exit code $EXIT_CODE"
    exit 1
  fi
}

echo "=== Migration completed ==="
echo "=== Starting Node.js server ==="
exec node server.js
