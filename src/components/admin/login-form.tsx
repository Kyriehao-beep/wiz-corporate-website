'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'

type Status = 'idle' | 'submitting' | 'wiring'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm() {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [status, setStatus] = useState<Status>('idle')

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
    event.preventDefault()
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    setErrors({ email: emailErr, password: passwordErr })
    if (emailErr || passwordErr) return
    setStatus('submitting')
    window.setTimeout(() => setStatus('wiring'), 1100)
  }

  const submitting = status === 'submitting'

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
          disabled={submitting}
        />
        {errors.email ? <p className="field__error" id="auth-email-error">{errors.email}</p> : null}
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
          disabled={submitting}
        />
        {errors.password ? <p className="field__error" id="auth-password-error">{errors.password}</p> : null}
      </div>

      <div className="auth-row">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            disabled={submitting}
          />
          <span>{t('remember')}</span>
        </label>
        <a className="auth-link" href="#">{t('forgot')}</a>
      </div>

      <Button type="submit" variant="primary" className="auth-submit" disabled={submitting} aria-busy={submitting}>
        {submitting ? t('submitting') : t('submit')}
        {submitting ? null : <LogIn aria-hidden="true" size={16} />}
      </Button>

      {status === 'wiring' ? (
        <p className="auth-hint" role="status">{t('wiringNote')}</p>
      ) : null}
    </form>
  )
}
