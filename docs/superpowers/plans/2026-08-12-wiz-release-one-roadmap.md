# WIZ Release One Implementation Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved WIZ multilingual corporate website, guided RFQ, lightweight administration, and verified production deployment.

**Architecture:** Release one is divided into three reviewable plans. The public website first establishes a complete fixture-backed user experience; the data/RFQ plan replaces fixtures with secured Supabase services and adds the admin workflow; the launch plan completes owned assets, service provisioning, production configuration, and external verification.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, next-intl, Supabase, Resend, Cloudflare Turnstile, Vitest, Testing Library, Playwright, pnpm, GitHub Actions, Vercel.

## Global Constraints

- Keep every retained project artifact under `/Users/haozhisheng/Desktop/wiz网站定制`.
- Use Node.js 22.x and a committed `pnpm-lock.yaml`; do not commit floating dependency resolutions.
- Use English as the public fallback locale; release-one locales are `en`, `ja`, and `zh-CN`.
- Keep the admin interface in Simplified Chinese.
- Use the approved slogan `Precision in Every Color. Built for the Outdoors.`
- Do not publish fixed price, MOQ, sample-fee, production-time, freight, compliance, or customer-brand claims without approved evidence.
- Do not present generated factory imagery as documentary photography of the WIZ facility.
- Keep RFQ files, quotation files, internal notes, and service credentials private.
- Do not add ecommerce, inventory, production management, a blog, automatic translation, or a full CRM.
- Use test-driven development for behavior changes and run verification before every completion claim.
- Use applicable project skills throughout execution: using-git-worktrees, test-driven-development, vercel-react-best-practices, imagegen, browser or Playwright, security-best-practices for the explicit security gate, requesting-code-review, verification-before-completion, and GitHub publishing workflows.

---

## Execution order

0. Complete the repository bootstrap task in the production-launch plan: create the private GitHub repository, connect `origin`, and enable CI before feature code begins.
1. [Public website foundation and experience](./2026-08-12-wiz-public-website.md)
2. [RFQ, Supabase, and administration](./2026-08-12-wiz-rfq-admin.md)
3. [Content, infrastructure, and production launch](./2026-08-12-wiz-production-launch.md), beginning at task 2 because task 1 is the pre-development bootstrap.

Do not begin plan 2 until plan 1's full verification command passes. Do not begin plan 3 until plan 2's full verification command passes.

## Review checkpoints

- Checkpoint A: WIZ reviews the fixture-backed public website at desktop and mobile sizes.
- Checkpoint B: WIZ reviews the complete RFQ and Chinese admin workflow using non-production data.
- Checkpoint C: WIZ approves final three-language content, logo, reusable Alibaba product images, public company details, policies, and domain before production launch.

## Repository milestones

- Milestone 0: PRD and plans committed locally on `main`.
- Milestone 1: private GitHub repository connected, CI enabled, and public-site feature branch published.
- Milestone 2: RFQ/admin branch reviewed with preview deployment and test Supabase project.
- Milestone 3: production branch merged only after the launch checklist passes.

## Release-one completion command

Run from `/Users/haozhisheng/Desktop/wiz网站定制`:

```bash
pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:db && pnpm test:e2e && pnpm build
```

Expected: every command exits `0`, Playwright reports Chromium/WebKit/Firefox success for the configured release suite, and `next build` emits all required public and admin routes without errors.
