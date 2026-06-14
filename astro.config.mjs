import { defineConfig } from 'astro/config';

// Static output — deploys to Cloudflare Pages as a static site.
// Store/blog data is fetched client-side via the Wix SDK (visitor OAuth).
export default defineConfig({
  site: 'https://www.chrisstirling.com',
});
