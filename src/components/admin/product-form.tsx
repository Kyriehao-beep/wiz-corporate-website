'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'

import {
  saveProductAction,
  type ProductFormState,
} from '@/features/catalog/admin-actions'
import type { ProductEditModel } from '@/features/catalog/admin-catalog-repository'
import type { Locale } from '@/i18n/locales'
import type { WizLocale } from '@/features/auth/require-admin'

const FORM_LOCALES: Locale[] = ['en', 'ja', 'zh-CN']
const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ja: 'Japanese',
  'zh-CN': 'Chinese',
}

interface ApplicationOption {
  slug: string
  name: string
}

interface ProductFormProps {
  locale: WizLocale
  mode: 'create' | 'edit'
  originalSlug?: string
  initial: ProductEditModel
  applications: ApplicationOption[]
}

export function ProductForm({ locale, mode, originalSlug, initial, applications }: ProductFormProps) {
  const t = useTranslations('admin')
  const [state, formAction] = useActionState<ProductFormState, FormData>(saveProductAction, {})

  return (
    <form action={formAction} className="admin-form" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="mode" value={mode} />
      {mode === 'edit' && originalSlug ? (
        <input type="hidden" name="originalSlug" value={originalSlug} />
      ) : null}

      {state.error ? (
        <p className="admin-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <fieldset className="admin-form__group">
        <legend>{t('prodCoreFields')}</legend>

        <label className="admin-field">
          <span>{t('prodFieldSlug')}</span>
          <input
            name="slug"
            type="text"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            defaultValue={initial.slug}
            disabled={mode === 'edit'}
            placeholder="heat-transfer-patch"
          />
        </label>

        <label className="admin-field">
          <span>{t('prodFieldStatus')}</span>
          <select name="status" defaultValue={initial.status}>
            <option value="draft">{t('prodStatusDraft')}</option>
            <option value="published">{t('prodStatusLive')}</option>
            <option value="archived">{t('prodStatusArchived')}</option>
          </select>
        </label>

        <label className="admin-field">
          <span>{t('prodFieldTone')}</span>
          <input name="tone" type="text" defaultValue={initial.tone} />
        </label>

        <label className="admin-field">
          <span>{t('prodFieldDisplayOrder')}</span>
          <input name="displayOrder" type="number" min={0} defaultValue={initial.displayOrder} />
        </label>

        <fieldset className="admin-form__checks">
          <legend>{t('prodFieldApplications')}</legend>
          {applications.map((app) => (
            <label key={app.slug} className="admin-check">
              <input
                type="checkbox"
                name="applicationSlugs"
                value={app.slug}
                defaultChecked={initial.applicationSlugs.includes(app.slug)}
              />
              <span>{app.name}</span>
            </label>
          ))}
        </fieldset>
      </fieldset>

      {FORM_LOCALES.map((l) => {
        const tr = initial.translations[l]
        const p = (k: string) => `${l}_${k}`
        return (
          <fieldset key={l} className="admin-form__group">
            <legend>
              {LOCALE_NAMES[l]} <span className="admin-form__locale-tag">{l}</span>
            </legend>

            <label className="admin-field">
              <span>{t('prodFieldTitle')}</span>
              <input name={p('title')} type="text" defaultValue={tr.title} required={l === 'en'} />
            </label>
            <label className="admin-field">
              <span>{t('prodFieldSummary')}</span>
              <textarea name={p('summary')} rows={2} defaultValue={tr.summary} />
            </label>
            <label className="admin-field">
              <span>{t('prodFieldBody')}</span>
              <textarea name={p('body')} rows={4} defaultValue={tr.body} />
            </label>
            <label className="admin-field">
              <span>{t('prodFieldEyebrow')}</span>
              <input name={p('eyebrow')} type="text" defaultValue={tr.eyebrow} />
            </label>
            <label className="admin-field">
              <span>{t('prodFieldSeoTitle')}</span>
              <input name={p('seoTitle')} type="text" defaultValue={tr.seoTitle} />
            </label>
            <label className="admin-field">
              <span>{t('prodFieldSeoDescription')}</span>
              <input name={p('seoDescription')} type="text" defaultValue={tr.seoDescription} />
            </label>

            <div className="admin-form__row">
              <label className="admin-field">
                <span>{t('prodFieldSuitability')}</span>
                <input name={p('suitability')} type="text" defaultValue={tr.suitability.join(', ')} />
              </label>
              <label className="admin-field">
                <span>{t('prodFieldConstruction')}</span>
                <input name={p('construction')} type="text" defaultValue={tr.construction.join(', ')} />
              </label>
            </div>
            <div className="admin-form__row">
              <label className="admin-field">
                <span>{t('prodFieldVisualOptions')}</span>
                <input name={p('visualOptions')} type="text" defaultValue={tr.visualOptions.join(', ')} />
              </label>
              <label className="admin-field">
                <span>{t('prodFieldAttachmentOptions')}</span>
                <input
                  name={p('attachmentOptions')}
                  type="text"
                  defaultValue={tr.attachmentOptions.join(', ')}
                />
              </label>
            </div>

            <label className="admin-field">
              <span>{t('prodFieldArtworkGuidance')}</span>
              <textarea name={p('artworkGuidance')} rows={3} defaultValue={tr.artworkGuidance} />
            </label>

            <div className="admin-form__row">
              <label className="admin-check">
                <input type="checkbox" name={p('approved')} defaultChecked={tr.approved} />
                <span>{t('prodFieldApproved')}</span>
              </label>
              <label className="admin-check">
                <input type="checkbox" name={p('fallbackToEn')} defaultChecked={tr.fallbackToEn} />
                <span>{t('prodFieldFallbackToEn')}</span>
              </label>
            </div>
          </fieldset>
        )
      })}

      <div className="admin-form__actions">
        <button type="submit" className="admin-btn admin-btn--primary">
          {t('prodSave')}
        </button>
      </div>
    </form>
  )
}
