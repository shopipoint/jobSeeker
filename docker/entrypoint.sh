#!/bin/sh
set -e

if [ -z "${DATABASE_URL}" ] || [ -z "${DIRECT_URL}" ]; then
  echo "DATABASE_URL and DIRECT_URL are required" >&2
  exit 1
fi

npx prisma migrate deploy
if [ "${SEED_ON_START:-true}" = "true" ]; then
  npx tsx prisma/seed.ts || true
fi

exec npm run start
