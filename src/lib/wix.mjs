import { createClient, OAuthStrategy } from '@wix/sdk';

const clientId = import.meta.env.PUBLIC_WIX_CLIENT_ID;
let _token = null;

async function token() {
  if (_token) return _token;
  const c = createClient({ auth: OAuthStrategy({ clientId }) });
  const t = await c.auth.generateVisitorTokens();
  _token = t.accessToken.value;
  return _token;
}

async function blogQuery(fieldsets, extraQuery = {}) {
  const tk = await token();
  const r = await fetch('https://www.wixapis.com/blog/v3/posts/query', {
    method: 'POST',
    headers: { Authorization: tk, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: { paging: { limit: 100 }, sort: [{ fieldName: 'firstPublishedDate', order: 'DESC' }], ...extraQuery },
      fieldsets,
    }),
  });
  const d = await r.json();
  return d.posts || [];
}

// List view: covers + excerpt + url + slug (no heavy body)
export async function getPosts() {
  try { return await blogQuery(['URL']); }
  catch (e) { console.warn('getPosts failed:', e); return []; }
}

// Full view: includes richContent for rendering post pages
export async function getPostsFull() {
  try { return await blogQuery(['RICH_CONTENT', 'URL']); }
  catch (e) { console.warn('getPostsFull failed:', e); return []; }
}

export async function getProducts() {
  try {
    const tk = await token();
    const r = await fetch('https://www.wixapis.com/stores-reader/v1/products/query', {
      method: 'POST',
      headers: { Authorization: tk, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: {} }),
    });
    const d = await r.json();
    return d.products || [];
  } catch (e) { console.warn('getProducts failed:', e); return []; }
}

export function coverUrl(p) {
  const img = p && p.media && p.media.wixMedia && p.media.wixMedia.image;
  if (img && img.url) return img.url;
  if (img && img.id) return 'https://static.wixstatic.com/media/' + String(img.id).replace(/^wix:image:\/\/v1\//, '').split('/')[0];
  return null;
}
