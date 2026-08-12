# WIZ Repository Operations

## Repository contract

- Repository: `Kyriehao-beep/wiz-corporate-website`
- Visibility: private
- Default branch: `main`
- Local project root: `/Users/haozhisheng/Desktop/wiz网站定制`
- Feature branches: `agent/<short-description>`
- Pull requests start as drafts and must include verification evidence.

## Current CI phase

The repository begins with a documentation-baseline workflow because the approved PRD and implementation plans precede application scaffolding. The first public-website foundation task must replace or extend this workflow with Node.js 22, pnpm frozen-lockfile installation, lint, type checking, unit tests, and production build checks in the same commit that creates `package.json` and `pnpm-lock.yaml`.

## Protected material

Never commit environment files, API keys, database credentials, customer artwork, quotation files, signed storage URLs, production exports, or downloaded private account data.
