# Link Basket

Link Basket is a static Astro landing site and browser-only WhatsApp link generator. It creates `https://wa.me/<digits>?text=<encoded message>` links from a valid WhatsApp phone number and a required message.

## Features

- Create WhatsApp `wa.me` links with pre-filled messages.
- Validate phone numbers before generating links.
- Insert emoji into the message at the cursor.
- Copy generated links or open them in WhatsApp.
- Generate and download a client-side QR code PNG from the same link.
- Serve SEO-friendly localized landing pages for English and Malay WhatsApp link generator queries.

Link Basket does not use backend storage, accounts, analytics, uploads, WhatsApp API media sending, or server-side QR generation.

## Commands

Use Node.js `>=22.12.0` and npm.

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the Astro dev server |
| `npm test` | Run Vitest tests |
| `npm run build` | Build the production site to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run astro -- --help` | Show Astro CLI help |

## Project Structure

- `src/pages/index.astro` renders the English homepage and `src/pages/ms/index.astro` renders the Malay homepage.
- `src/layouts/Layout.astro` owns localized document metadata, canonical tags, alternate language tags, social tags, and JSON-LD.
- `src/components/LinkDropLanding.tsx` contains the interactive landing page and generator island.
- `src/components/ui/` contains shadcn-style UI primitives.
- `src/lib/i18n.ts` contains the locale dictionaries and route helpers.
- `src/lib/linkdrop.ts` contains testable WhatsApp link and QR filename helpers.
- `public/robots.txt` exposes crawl rules and the sitemap location.
