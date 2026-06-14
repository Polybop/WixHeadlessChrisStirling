// Cloudflare Pages Function: POST /api/subscribe
// Adds an email to the MailerLite "Newsletter" group, which triggers the
// existing "Send Chapter One Preview" automation (delivers the chapter PDF).
// Requires a Cloudflare Pages environment variable: MAILERLITE_API_KEY
// (Settings -> Environment variables). Never hard-code the key here.

const ML = 'https://connect.mailerlite.com/api';

export async function onRequestPost(context) {
  const { request, env } = context;
  const key = env.MAILERLITE_API_KEY;
  if (!key) {
    return json({ error: 'Signup not configured' }, 500);
  }

  let email;
  try {
    ({ email } = await request.json());
  } catch {
    return json({ error: 'Bad request' }, 400);
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'Invalid email' }, 400);
  }

  const headers = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    // Find the Newsletter group id
    const gRes = await fetch(`${ML}/groups`, { headers });
    const gData = await gRes.json();
    const group = (gData.data || []).find(
      (g) => (g.name || '').toLowerCase() === 'newsletter'
    );

    // Create/update the subscriber, attaching the Newsletter group (fires the automation)
    const body = { email, groups: group ? [String(group.id)] : [] };
    const sRes = await fetch(`${ML}/subscribers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!sRes.ok) {
      const detail = await sRes.text();
      return json({ error: 'Subscribe failed', detail }, 502);
    }
    return json({ ok: true });
  } catch (e) {
    return json({ error: 'Server error', detail: String(e) }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
