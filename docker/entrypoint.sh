#!/bin/sh
set -e

export DATABASE_URL="${DATABASE_URL:-file:/app/data/prod.db}"

npx prisma migrate deploy
if [ "${SEED_ON_START:-true}" = "true" ]; then
  npx tsx prisma/seed.ts || true
fi

exec npm run start
