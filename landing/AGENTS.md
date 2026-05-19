# Agent Instructions

## Project Overview

This is an Astro landing-site project for Link Basket, a static WhatsApp chat-link editor for solo sellers. Keep changes small, project-specific, and aligned with the existing Astro structure.

## Domain Source Of Truth

- The production domain is `https://linkbasket.in/`.
- Sitemap URLs should be rooted at `https://linkbasket.in/`, not `https://linkdrop.app/`.
- When updating site metadata, canonical URLs, Open Graph URLs, Astro `site` config, JSON-LD, or `robots.txt`, treat `linkbasket.in` as the source of truth.

## Site Features

- The home page is a focused Link Basket landing page with a hero, editor card, how-it-works section, and final CTA.
- The editor creates client-side `https://wa.me/<digits-only-phone>?text=<encoded message>` links.
- Required fields: WhatsApp phone number and message.
- Phone numbers are entered through the phone input component and validated before link generation.
- The message textarea is the source of the encoded `text` query and supports emoji insertion at the cursor.
- Generated links can be copied, opened in WhatsApp, and converted into a downloadable QR code PNG.
- QR code generation is browser-only and uses the same generated `wa.me` link. Do not add backend storage, WhatsApp API media sending, accounts, analytics, or upload flows unless explicitly requested.

## Environment

- Use Node.js `>=22.12.0`.
- Use npm for dependency and script commands.
- Run commands from the project root.

## Common Commands

- `npm install` installs dependencies.
- `npm run dev` starts the local Astro dev server.
- `npm test` runs Vitest tests.
- `npm run build` builds the production site to `dist/`.
- `npm run preview` previews the production build locally.
- `npm run astro -- --help` shows Astro CLI help.

## Project Structure

- `src/pages/` contains Astro routes. The home page is `src/pages/index.astro`.
- `src/layouts/` contains shared page layouts.
- `src/components/` contains reusable Astro components.
- `src/components/LinkDropLanding.tsx` contains the main interactive landing page island and chat-link editor.
- `src/components/ui/` contains shadcn-style UI primitives used by the page.
- `src/lib/linkdrop.ts` contains pure `wa.me` link and QR filename helpers.
- `src/assets/` contains imported source assets.
- `public/` contains static files served from the site root.

## Coding Guidelines

- Follow the existing Astro component style and file organization.
- Prefer scoped, direct edits over broad rewrites.
- Keep Link Basket as a static `wa.me` chat-link editor unless the user explicitly changes product direction.
- Preserve the current field behavior: valid WhatsApp phone number plus non-empty message are required.
- Keep generated-link logic in testable helpers when possible.
- Use `src/assets/` for assets imported by components and `public/` for files that should be served by URL.
- Keep page metadata and document-level markup in layouts unless a task specifically requires page-local behavior.
- Do not revert unrelated user changes.
- Do not replace starter content or restructure directories unless the requested task requires it.

## Verification

- Run `npm test` for editor/helper behavior changes.
- Run `npm run build` before reporting that implementation work is complete.
- If a visual or interaction change is made, also check the page in a browser at the local dev server URL.
- Browser checks for editor changes should cover validation, encoded `wa.me` output, emoji insertion, copy/open actions, QR visibility, QR download, and mobile no-overflow behavior.
