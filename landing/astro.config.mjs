// @ts-check
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://linkbasket.in',
	i18n: {
		locales: ['en', 'ms'],
		defaultLocale: 'en',
		routing: {
			prefixDefaultLocale: false,
		},
	},
	integrations: [react(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
});
