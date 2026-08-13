'use client'

import { useState, useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { login, type AuthState } from '@/features/auth/actions'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm({ locale }: { locale: 'en' | 'ja' | 'zh-CN' }) {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, {
    error: undefined,
  })

  function validateEmail(value: string): string | undefined {
    if (!value.trim()) return t('errorEmail')
    if (!EMAIL_RE.test(value)) return t('errorEmail')
    return undefined
  }

  function validatePassword(value: string): string | undefined {
    if (!value) return t('errorPassword')
    return undefined
  }

  function handleBlurEmail() {
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }))
  }

  function handleBlurPassword() {
    setErrors((prev) => ({ ...prev, password: validatePassword(password) }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    setErrors({ email: emailErr, password: passwordErr })
    // Block the server action when client-side validation fails.
    if (emailErr || passwordErr) event.preventDefault()
  }

  return (
    <form className="auth-form" action={formAction} onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="locale" value={locale} />

      <div className={`field${errors.email ? ' field--invalid' : ''}`}>
        <label className="field__label" htmlFor="auth-email">{t('emailLabel')}</label>
        <input
          id="auth-email"
          name="email"
          type="email"
          autoComplete="email"
          className="field__input"
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={handleBlurEmail}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'auth-email-error' : undefined}
          disabled={pending}
        />
        {errors.email ? (
          <p className="field__error" id="auth-email-error">{errors.email}</p>
        ) : null}
      </div>

      <div className={`field${errors.password ? ' field--invalid' : ''}`}>
        <label className="field__label" htmlFor="auth-password">{t('passwordLabel')}</label>
        <input
          id="auth-password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="field__input"
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={handleBlurPassword}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? 'auth-password-error' : undefined}
          disabled={pending}
        />
        {errors.password ? (
          <p className="field__error" id="auth-password-error">{errors.password}</p>
        ) : null}
      </div>

      <div className="auth-row">
        <label className="checkbox">
          <input type="checkbox" defaultChecked disabled={pending} />
          <span>{t('remember')}</span>
        </label>
        <a className="auth-link" href="#">{t('forgot')}</a>
      </div>

      {state.error ? (
        <p className="field__error" role="alert">{t('errorGeneric')}</p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        className="auth-submit"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? t('submitting') : t('submit')}
        {pending ? null : <LogIn aria-hidden="true" size={16} />}
      </Button>
    </form>
  )
}
