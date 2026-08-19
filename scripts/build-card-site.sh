#!/usr/bin/env bash
# Build a clean, public, static "card site" for deployment to Vercel / any static host.
#
# This project also contains non-public routes (admin console, auth, RFQ wizard with
# Server Actions, and API routes). Those break `next build --output export` at prerender
# time (cookies() is called during prerender, and Server Actions are unsupported under a
# static export). For the expo business-card site we only need the marketing pages, so we
# move those routes out of the app tree before building, then restore the working tree.
#
# We MOVE (rename) rather than `rm -rf`, because some sandboxed shells block bulk deletes
# of directories with many files. The moved dirs land in a temp dir outside src/app, so
# the Next.js router never sees them.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 1. Move non-public routes out of the app tree (rename, not delete).
#    (admin)/(auth): call cookies() at prerender → break static export
#    (site)/rfq: uses a Server Action → unsupported under output:'export'
#    src/app/api: server routes → not exportable
STRIP_TMP="$(mktemp -d /tmp/wiz-strip.XXXXXX)"
mv -f "src/app/[locale]/(admin)"     "$STRIP_TMP/(admin)"     2>/dev/null || true
mv -f "src/app/[locale]/(auth)"     "$STRIP_TMP/(auth)"     2>/dev/null || true
mv -f "src/app/[locale]/(site)/rfq" "$STRIP_TMP/(site)-rfq" 2>/dev/null || true
mv -f "src/app/api"                 "$STRIP_TMP/api"        2>/dev/null || true

# 2. Always restore the working tree, whether the build succeeds or fails.
#    (On Vercel the build container is discarded anyway; locally this keeps the tree clean.)
cleanup() {
  git checkout -- \
    "src/app/[locale]/(admin)" \
    "src/app/[locale]/(auth)" \
    "src/app/[locale]/(site)/rfq" \
    "src/app/api" \
    tsconfig.json 2>/dev/null || true
}
trap cleanup EXIT

# 3. Build a fully static export from fixtures (no backend / no cookies()).
CATALOG_SOURCE=fixture NODE_ENV=production npx next build --webpack
