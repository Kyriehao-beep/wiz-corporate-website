import type { CatalogRepository } from '@/features/catalog/types'
import { fixtureCatalogRepository } from '@/features/catalog/fixture-catalog-repository'
import { SupabaseCatalogRepository } from '@/features/catalog/supabase-catalog-repository'

/**
 * Single factory for the catalog repository (Plan Task 3). Fixture mode is for
 * isolated unit tests and local visual recovery; production uses the
 * Supabase-backed repository once Supabase env vars are configured.
 *
 * Safety fallback: if Supabase is not configured (no URL/anon key), we serve
 * the fixtures instead of constructing `SupabaseCatalogRepository`, which would
 * otherwise throw at request time. This keeps the public site rendering for
 * static/preview deployments that have no backend wired up yet.
 */
export function getCatalogRepository(): CatalogRepository {
  if (process.env.CATALOG_SOURCE === 'fixture') return fixtureCatalogRepository
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
  return hasSupabase ? new SupabaseCatalogRepository() : fixtureCatalogRepository
}
