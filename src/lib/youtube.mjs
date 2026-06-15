// Fetches the channel's latest LONG-FORM video at build time via the YouTube
// Data API, filtering out Shorts (anything under MIN_SECONDS).
// Requires env var YOUTUBE_API_KEY (build-time only; not exposed to the client).

const CHANNEL_ID = 'UCmdtgh82euDe7iiSyzwSjcQ';
const UPLOADS_PLAYLIST = 'UUmdtgh82euDe7iiSyzwSjcQ'; // uploads playlist = channel id with UC->UU
const MIN_SECONDS = 180; // exclude Shorts / very short clips

function apiKey() {
  if (typeof process !== 'undefined' && process.env && process.env.YOUTUBE_API_KEY) return process.env.YOUTUBE_API_KEY;
  try { if (import.meta.env && import.meta.env.YOUTUBE_API_KEY) return import.meta.env.YOUTUBE_API_KEY; } catch {}
  return null;
}

function isoToSeconds(d) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(d || '') || [];
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
}

export async function getLatestVideo() {
  const key = apiKey();
  if (!key) { console.warn('No YOUTUBE_API_KEY set — skipping video embed.'); return null; }
  try {
    const plRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=15&playlistId=${UPLOADS_PLAYLIST}&key=${key}`);
    const plData = await plRes.json();
    const ids = (plData.items || []).map((i) => i.contentDetails && i.contentDetails.videoId).filter(Boolean);
    if (!ids.length) return null;
    const vRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${ids.join(',')}&key=${key}`);
    const vData = await vRes.json();
    const byId = {};
    for (const v of (vData.items || [])) byId[v.id] = v;
    // ids are newest-first; return the first one that's long-form
    for (const id of ids) {
      const v = byId[id];
      if (!v) continue;
      if (isoToSeconds(v.contentDetails && v.contentDetails.duration) >= MIN_SECONDS) {
        const th = (v.snippet && v.snippet.thumbnails) || {};
        const thumb = (th.maxres || th.high || th.medium || {}).url || ('https://i.ytimg.com/vi/' + id + '/hqdefault.jpg');
        return { id, title: (v.snippet && v.snippet.title) || 'Latest video', thumb };
      }
    }
    return null;
  } catch (e) {
    console.warn('getLatestVideo failed:', e);
    return null;
  }
}
