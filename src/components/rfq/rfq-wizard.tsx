'use client'

import { useState, useActionState } from 'react'
import { useTranslations } from 'next-intl'
import Script from 'next/script'

import { Button } from '@/components/ui/button'
import { submitRfqAction, type RfqFormState } from '@/features/inquiries/actions'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PRODUCTS = [
  { slug: 'custom-pvc-rubber-patches', key: 'product.customPvc' },
  { slug: 'embroidered-patches', key: 'product.embroidered' },
  { slug: 'woven-labels', key: 'product.woven' },
] as const

const APPLICATIONS = [
  { slug: 'apparel', key: 'application.apparel' },
  { slug: 'outdoor', key: 'application.outdoor' },
  { slug: 'automotive', key: 'application.automotive' },
] as const

const DIMENSIONS = [
  { value: '2d', key: 'dim2d' },
  { value: '3d', key: 'dim3d' },
  { value: 'need-advice', key: 'dimAdvice' },
] as const

const BACKINGS = [
  { value: 'sew-on', key: 'backingSewOn' },
  { value: 'heat-transfer', key: 'backingHeatTransfer' },
  { value: 'hook-and-loop', key: 'backingHookLoop' },
  { value: 'adhesive', key: 'backingAdhesive' },
  { value: 'none', key: 'backingNone' },
  { value: 'need-advice', key: 'backingAdvice' },
] as const

type Errors = Record<string, string | undefined>

export function RfqWizard({ locale }: { locale: 'en' | 'ja' | 'zh-CN' }) {
  const t = useTranslations('rfq')
  const [errors, setErrors] = useState<Errors>({})
  const [sizeKind, setSizeKind] = useState<'known' | 'undecided'>('undecided')
  const [state, formAction, pending] = useActionState<RfqFormState, FormData>(submitRfqAction, {})

  function validate(formData: FormData): boolean {
    const e: Errors = {}
    const req = (name: string) => {
      if (!String(formData.get(name) ?? '').trim()) e[name] = t('errorInvalid')
    }
    req('productSlug')
    req('applicationSlug')
    const qty = Number(formData.get('estimatedQuantity'))
    if (!Number.isFinite(qty) || qty <= 0) e.estimatedQuantity = t('errorInvalid')
    if (String(formData.get('sizeKind') ?? '') === 'known') {
      const w = Number(formData.get('widthMm'))
      const h = Number(formData.get('heightMm'))
      if (!Number.isFinite(w) || w <= 0) e.widthMm = t('errorInvalid')
      if (!Number.isFinite(h) || h <= 0) e.heightMm = t('errorInvalid')
    }
    req('dimension')
    req('backing')
    req('companyName')
    req('contactName')
    const email = String(formData.get('workEmail') ?? '').trim()
    if (!EMAIL_RE.test(email)) e.workEmail = t('errorInvalid')
    req('countryRegion')
    if (String(formData.get('projectDescription') ?? '').trim().length < 20) e.projectDescription = t('errorInvalid')
    if (formData.get('privacyAccepted') !== 'true') e.privacyAccepted = t('errorInvalid')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!validate(new FormData(event.currentTarget))) {
      event.preventDefault()
    }
  }

  if (state.inquiryNumber) {
    return (
      <div className="rfq-success" role="status">
        <h2>{t('successTitle')}</h2>
        <p>{t('successBody', { number: state.inquiryNumber })}</p>
      </div>
    )
  }

  return (
    <form className="rfq-form" action={formAction} onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="locale" value={locale} />
      <p className="rfq-intro">{t('intro')}</p>

      <div className="rfq-form__grid">
        <div className={`field${errors.productSlug ? ' field--invalid' : ''}`}>
          <label className="field__label" htmlFor="rfq-product">{t('productLabel')}</label>
          <select id="rfq-product" name="productSlug" className="field__input" defaultValue="" disabled={pending}>
            <option value="" disabled>{t('productPlaceholder')}</option>
            {PRODUCTS.map((p) => <option key={p.slug} value={p.slug}>{t(p.key)}</option>)}
          </select>
          {errors.productSlug ? <p className="field__error">{errors.productSlug}</p> : null}
        </div>

        <div className={`field${errors.applicationSlug ? ' field--invalid' : ''}`}>
          <label className="field__label" htmlFor="rfq-application">{t('applicationLabel')}</label>
          <select id="rfq-application" name="applicationSlug" className="field__input" defaultValue="" disabled={pending}>
            <option value="" disabled>{t('applicationPlaceholder')}</option>
            {APPLICATIONS.map((a) => <option key={a.slug} value={a.slug}>{t(a.key)}</option>)}
          </select>
          {errors.applicationSlug ? <p className="field__error">{errors.applicationSlug}</p> : null}
        </div>

        <div className={`field${errors.estimatedQuantity ? ' field--invalid' : ''}`}>
          <label className="field__label" htmlFor="rfq-qty">{t('quantityLabel')}</label>
          <input id="rfq-qty" name="estimatedQuantity" type="number" min={1} className="field__input" disabled={pending} />
          {errors.estimatedQuantity ? <p className="field__error">{errors.estimatedQuantity}</p> : null}
        </div>

        <div className={`field${errors.dimension ? ' field--invalid' : ''}`}>
          <label className="field__label" htmlFor="rfq-dimension">{t('dimensionLabel')}</label>
          <select id="rfq-dimension" name="dimension" className="field__input" defaultValue="" disabled={pending}>
            <option value="" disabled>{t('dimensionLabel')}</option>
            {DIMENSIONS.map((d) => <option key={d.value} value={d.value}>{t(d.key)}</option>)}
          </select>
          {errors.dimension ? <p className="field__error">{errors.dimension}</p> : null}
        </div>

        <div className={`field field--wide${errors.backing ? ' field--invalid' : ''}`}>
          <label className="field__label" htmlFor="rfq-backing">{t('backingLabel')}</label>
          <select id="rfq-backing" name="backing" className="field__input" defaultValue="" disabled={pending}>
            <option value="" disabled>{t('backingLabel')}</option>
            {BACKINGS.map((b) => <option key={b.value} value={b.value}>{t(b.key)}</option>)}
          </select>
          {errors.backing ? <p className="field__error">{errors.backing}</p> : null}
        </div>

        <fieldset className="field field--wide rfq-size">
          <legend className="field__label">{t('sizeLabel')}</legend>
          <label className="radio">
            <input type="radio" name="sizeKind" value="undecided" checked={sizeKind === 'undecided'} onChange={() => setSizeKind('undecided')} disabled={pending} />
            <span>{t('sizeUndecided')}</span>
          </label>
          <label className="radio">
            <input type="radio" name="sizeKind" value="known" checked={sizeKind === 'known'} onChange={() => setSizeKind('known')} disabled={pending} />
            <span>{t('sizeKnown')}</span>
          </label>
          {sizeKind === 'known' ? (
            <div className="rfq-form__grid rfq-size__dims">
              <div className={`field${errors.widthMm ? ' field--invalid' : ''}`}>
                <label className="field__label" htmlFor="rfq-width">{t('widthLabel')}</label>
                <input id="rfq-width" name="widthMm" type="number" min={0.1} step="0.1" className="field__input" disabled={pending} />
                {errors.widthMm ? <p className="field__error">{errors.widthMm}</p> : null}
              </div>
              <div className={`field${errors.heightMm ? ' field--invalid' : ''}`}>
                <label className="field__label" htmlFor="rfq-height">{t('heightLabel')}</label>
                <input id="rfq-height" name="heightMm" type="number" min={0.1} step="0.1" className="field__input" disabled={pending} />
                {errors.heightMm ? <p className="field__error">{errors.heightMm}</p> : null}
              </div>
            </div>
          ) : null}
        </fieldset>

        <div className={`field${errors.companyName ? ' field--invalid' : ''}`}>
          <label className="field__label" htmlFor="rfq-company">{t('companyLabel')}</label>
          <input id="rfq-company" name="companyName" type="text" className="field__input" autoComplete="organization" disabled={pending} />
          {errors.companyName ? <p className="field__error">{errors.companyName}</p> : null}
        </div>

        <div className={`field${errors.contactName ? ' field--invalid' : ''}`}>
          <label className="field__label" htmlFor="rfq-contact">{t('contactLabel')}</label>
          <input id="rfq-contact" name="contactName" type="text" className="field__input" autoComplete="name" disabled={pending} />
          {errors.contactName ? <p className="field__error">{errors.contactName}</p> : null}
        </div>

        <div className={`field${errors.workEmail ? ' field--invalid' : ''}`}>
          <label className="field__label" htmlFor="rfq-email">{t('emailLabel')}</label>
          <input id="rfq-email" name="workEmail" type="email" className="field__input" autoComplete="email" disabled={pending} />
          {errors.workEmail ? <p className="field__error">{errors.workEmail}</p> : null}
        </div>

        <div className={`field${errors.countryRegion ? ' field--invalid' : ''}`}>
          <label className="field__label" htmlFor="rfq-country">{t('countryLabel')}</label>
          <input id="rfq-country" name="countryRegion" type="text" className="field__input" autoComplete="country-name" disabled={pending} />
          {errors.countryRegion ? <p className="field__error">{errors.countryRegion}</p> : null}
        </div>

        <div className={`field field--wide${errors.projectDescription ? ' field--invalid' : ''}`}>
          <label className="field__label" htmlFor="rfq-project">{t('projectLabel')}</label>
          <textarea id="rfq-project" name="projectDescription" rows={6} className="field__input" placeholder={t('projectPlaceholder')} disabled={pending} />
          {errors.projectDescription ? <p className="field__error">{errors.projectDescription}</p> : null}
        </div>

        <fieldset className="field field--wide">
          <legend className="field__label">{t('artworkLabel')}</legend>
          <input
            type="file"
            name="artwork"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.ai,.eps,.svg"
            className="field__input"
            disabled={pending}
          />
          <p className="field__hint">{t('artworkHint')}</p>
        </fieldset>
      </div>

      <label className={`checkbox${errors.privacyAccepted ? ' field--invalid' : ''}`}>
        <input type="checkbox" name="privacyAccepted" value="true" disabled={pending} />
        <span>{t('privacyLabel')}</span>
      </label>
      {errors.privacyAccepted ? <p className="field__error">{errors.privacyAccepted}</p> : null}

      {state.error ? (
        <p className="field__error" role="alert">
          {state.error === 'rate_limited'
            ? t('errorRateLimited')
            : state.error === 'invalid_input'
              ? t('errorInvalid')
              : state.error === 'bot_check'
                ? t('errorBotCheck')
                : t('errorGeneric')}
        </p>
      ) : null}

      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
          />
          <div
            className="cf-turnstile"
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            data-theme="light"
          />
        </>
      ) : null}

      <Button type="submit" variant="primary" disabled={pending} aria-busy={pending}>
        {pending ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}
