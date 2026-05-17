# Agent Instructions

## Project Overview

This is an Astro landing-site project. Keep changes small, project-specific, and aligned with the existing Astro starter structure.

## Environment

- Use Node.js `>=22.12.0`.
- Use npm for dependency and script commands.
- Run commands from the project root.

## Common Commands

- `npm install` installs dependencies.
- `npm run dev` starts the local Astro dev server.
- `npm run build` builds the production site to `dist/`.
- `npm run preview` previews the production build locally.
- `npm run astro -- --help` shows Astro CLI help.

## Project Structure

- `src/pages/` contains Astro routes. The home page is `src/pages/index.astro`.
- `src/layouts/` contains shared page layouts.
- `src/components/` contains reusable Astro components.
- `src/assets/` contains imported source assets.
- `public/` contains static files served from the site root.

## Coding Guidelines

- Follow the existing Astro component style and file organization.
- Prefer scoped, direct edits over broad rewrites.
- Use `src/assets/` for assets imported by components and `public/` for files that should be served by URL.
- Keep page metadata and document-level markup in layouts unless a task specifically requires page-local behavior.
- Do not revert unrelated user changes.
- Do not replace starter content or restructure directories unless the requested task requires it.

## Verification

- Run `npm run build` before reporting that implementation work is complete.
- If a visual change is made, also check the page in a browser at the local dev server URL.

