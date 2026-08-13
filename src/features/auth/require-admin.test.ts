import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/navigation's redirect so we can assert on the thrown target.
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

import { requireAdmin } from './require-admin'

function mockProfileQuery(result: { data: unknown; error: unknown }) {
  mockFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve(result),
      }),
    }),
  })
}

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects an anonymous request to the localized login route', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    await expect(requireAdmin('zh-CN')).rejects.toThrow('/zh-CN/login')
  })

  it('returns a named admin profile for an authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockProfileQuery({
      data: { id: 'user-1', display_name: '测试业务员', role: 'admin' },
      error: null,
    })
    await expect(requireAdmin('zh-CN')).resolves.toMatchObject({
      id: 'user-1',
      displayName: '测试业务员',
    })
  })

  it('redirects to login with a profile reason when the profile is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-2' } }, error: null })
    mockProfileQuery({ data: null, error: { message: 'not found' } })
    await expect(requireAdmin('en')).rejects.toThrow('/en/login?reason=profile')
  })
})
