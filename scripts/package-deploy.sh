#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$ROOT/work/deploy"
OUTPUT="$ROOT/outputs/sushi-care-deploy.zip"

rm -rf "$STAGE"
mkdir -p "$STAGE" "$ROOT/outputs"
cp -R "$ROOT/frontend/dist/." "$STAGE/"
cp -R "$ROOT/backend/api" "$STAGE/api"
cp -R "$ROOT/backend/config" "$STAGE/config"
cp -R "$ROOT/backend/lib" "$STAGE/lib"
cp -R "$ROOT/backend/vendor" "$STAGE/vendor"
cp -R "$ROOT/backend/cron" "$STAGE/cron"
cp "$ROOT/backend/composer.json" "$STAGE/composer.json"
cp "$ROOT/backend/composer.lock" "$STAGE/composer.lock"
cp -R "$ROOT/backend/uploads" "$STAGE/uploads"
cp -R "$ROOT/database" "$STAGE/database"
cp "$ROOT/backend/install.php" "$STAGE/install.php"
cp "$ROOT/deploy/.htaccess" "$STAGE/.htaccess"
cp "$ROOT/deploy/config.htaccess" "$STAGE/config/.htaccess"
cp "$ROOT/deploy/lib.htaccess" "$STAGE/lib/.htaccess"
cp "$ROOT/deploy/vendor.htaccess" "$STAGE/vendor/.htaccess"
cp "$ROOT/deploy/database.htaccess" "$STAGE/database/.htaccess"
rm -f "$STAGE/config/local.php"

(cd "$STAGE" && zip -qr "$OUTPUT" .)
echo "$OUTPUT"
