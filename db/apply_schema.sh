#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Set DATABASE_URL first"
  echo "Example: export DATABASE_URL='postgresql://dbadmin:password@10.0.0.6:5432/bd_dotascope'"
  exit 1
fi

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/dotascope_schema_v1.sql

echo "Schema applied successfully."
