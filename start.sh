#!/bin/bash
set -e

echo "=== Running database migrations ==="
npx prisma migrate deploy 2>&1 || {
  echo "ERROR: Migration failed with exit code $?"
  exit 1
}

echo "=== Migration completed successfully ==="
echo "=== Starting Node.js server ==="
exec node server.js
