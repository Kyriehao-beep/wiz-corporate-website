import type { CatalogRepository } from '@/features/catalog/types'
import { fixtureCatalogRepository } from '@/features/catalog/fixture-catalog-repository'
import { SupabaseCatalogRepository } from '@/features/catalog/supabase-catalog-repository'

/**
 * Single factory for the catalog repository (Plan Task 3). Fixture mode is for
 * isolated unit tests and local visual recovery only; preview and production use
 * the Supabase-backed repository. The Supabase client is created lazily inside
 * `SupabaseCatalogRepository`, so the fixture path never touches env vars.
 */
export function getCatalogRepository(): CatalogRepository {
  return process.env.CATALOG_SOURCE === 'fixture'
    ? fixtureCatalogRepository
    : new SupabaseCatalogRepository()
}
