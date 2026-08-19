import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'button button--primary',
  secondary: 'button button--secondary',
  ghost: 'button button--ghost',
}

/**
 * Internal, root-relative destinations must go through `next/link` so that
 * `basePath` (e.g. the GitHub Pages project subpath) and `trailingSlash` are
 * applied consistently on the server and after hydration. Hashes, mailto:,
 * tel: and absolute URLs stay on a plain anchor.
 */
function isInternalHref(href: string | undefined): href is string {
  return typeof href === 'string' && href.startsWith('/')
}

export function ButtonLink({
  className = '',
  variant = 'primary',
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant }) {
  const cls = `${variantClassNames[variant]} ${className}`.trim()

  if (isInternalHref(href)) {
    return <Link className={cls} href={href} {...props} />
  }

  return <a className={cls} href={href} {...props} />
}

export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={`${variantClassNames[variant]} ${className}`.trim()} {...props} />
}
