#!/bin/bash
set -e

echo "=== Running database migrations ==="
echo "Database URL prefix: ${DATABASE_URL:0:50}..."

# Try to deploy migrations
timeout 120 npx prisma migrate deploy 2>&1 || {
  EXIT_CODE=$?

  if [ $EXIT_CODE -eq 124 ]; then
    echo "WARNING: Migration timed out after 120s"
    echo "Continuing anyway..."
  elif [ $EXIT_CODE -eq 1 ]; then
    echo "Migration failed, attempting to baseline existing schema..."

    # Mark old migrations as applied (baseline the database)
    npx prisma migrate resolve --applied 20250117_add_sms_support 2>&1 || echo "Migration 1 already resolved or doesn't exist"
    npx prisma migrate resolve --applied 20251017111408_add_sms_support 2>&1 || echo "Migration 2 already resolved or doesn't exist"

    # Now try to apply the new migration
    echo "Applying new migrations..."
    npx prisma migrate deploy 2>&1 || {
      NEW_EXIT=$?
      if [ $NEW_EXIT -ne 0 ]; then
        echo "ERROR: Migration still failed with exit code $NEW_EXIT"
        exit 1
      fi
    }
  else
    echo "ERROR: Migration failed with exit code $EXIT_CODE"
    exit 1
  fi
}

echo "=== Migration completed ==="
echo "=== Starting Node.js server ==="
exec node server.js
