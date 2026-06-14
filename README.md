# Chris Stirling — Headless Site (Astro + Wix SDK)

The coded front-end for chrisstirling.com. It reads the **existing Wix site's**
store and blog via the Wix SDK (self-managed headless), captures email signups
into MailerLite, and is built to deploy on **Cloudflare Pages**. The Wix backend
is unchanged.

## Run it locally

```bash
npm install
npm run dev
```

Then open the local URL Astro prints (usually http://localhost:4321). The
homepage's hero, about, books, and footer render immediately. The Books and
"From the blog" sections then try to load **live data** from your Wix site via
the SDK (using `PUBLIC_WIX_CLIENT_ID` in `.env`); if a call fails it falls back
to the static content, and the reason is logged to the browser console.

## Environment

- `.env` already contains the public Wix OAuth **client ID**
  (`PUBLIC_WIX_CLIENT_ID`). This is a public identifier, safe to commit-ignore.
- The email signup endpoint (`functions/api/subscribe.js`) needs a **secret**
  `MAILERLITE_API_KEY`, set in **Cloudflare Pages → Settings → Environment
  variables** (never in the repo). It is not available under `astro dev`, so the
  signup form degrades gracefully in local dev.

## Deploy (Cloudflare Pages)

1. Push this repo to GitHub (`Polybop/WixHeadlessChrisStirling`).
2. In Cloudflare Pages, create a project connected to the repo.
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables: `PUBLIC_WIX_CLIENT_ID` (public) and
     `MAILERLITE_API_KEY` (secret).
3. Every push builds and deploys, with a preview URL per branch/PR.
4. At go-live, point `chrisstirling.com` DNS at the Cloudflare Pages project
   (the live Wix site stays up until then).

## Structure

- `src/pages/index.astro` — the homepage (Storm & Crimson design, inline signup,
  live books + blog loaders).
- `functions/api/subscribe.js` — Cloudflare Function: signup → MailerLite
  Newsletter group → triggers the chapter-delivery automation.
- `astro.config.mjs`, `package.json`, `.env`.

## Status / next

- [x] Homepage scaffold + design + live-data loaders + signup wiring.
- [ ] Verify live products/posts render (run `npm run dev`, check console).
- [ ] Pages: About, Books/product detail (checkout), Blog index + post template,
      Press, Contact.
- [ ] Connect Cloudflare Pages + set env vars; first preview deploy.
- [ ] SEO per page + slug-preserving redirects, then domain cutover.
