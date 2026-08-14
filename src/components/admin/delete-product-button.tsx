'use client'

import { deleteProductAction } from '@/features/catalog/admin-actions'
import type { WizLocale } from '@/features/auth/require-admin'

interface DeleteProductButtonProps {
  locale: WizLocale
  slug: string
  label: string
  confirmText: string
}

export function DeleteProductButton({ locale, slug, label, confirmText }: DeleteProductButtonProps) {
  return (
    <form action={deleteProductAction}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="admin-linkbtn admin-linkbtn--danger"
        onClick={(e) => {
          if (!confirm(confirmText)) e.preventDefault()
        }}
      >
        {label}
      </button>
    </form>
  )
}
