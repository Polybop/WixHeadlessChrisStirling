import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

// Static output — pages (incl. blog posts) are pre-rendered at build for SEO.
// Store/blog data is fetched at build via the Wix SDK; new posts appear on
// the next deploy (trigger a Cloudflare deploy hook from the blog pipeline).
export default defineConfig({
  site: 'https://www.chrisstirling.com',
  integrations: [sitemap()],
  adapter: cloudflare(),
});