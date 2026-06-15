// Minimal Ricos (Wix rich content) -> HTML renderer for blog post bodies.
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function mediaUrl(src) {
  if (!src) return null;
  if (src.url) return src.url;
  if (src.id) return 'https://static.wixstatic.com/media/' + String(src.id).replace(/^wix:image:\/\/v1\//, '').split('/')[0];
  return null;
}
function renderText(n) {
  let t = esc(n.textData && n.textData.text);
  const decs = (n.textData && n.textData.decorations) || [];
  let href = null;
  for (const d of decs) {
    if (d.type === 'BOLD') t = '<strong>' + t + '</strong>';
    else if (d.type === 'ITALIC') t = '<em>' + t + '</em>';
    else if (d.type === 'UNDERLINE') t = '<u>' + t + '</u>';
    else if (d.type === 'LINK' && d.linkData && d.linkData.link) href = d.linkData.link.url;
  }
  if (href) t = '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + t + '</a>';
  return t;
}
function inline(nodes) {
  return (nodes || []).map((n) => (n.type === 'TEXT' ? renderText(n) : renderNode(n))).join('');
}
function renderNode(node) {
  if (!node) return '';
  switch (node.type) {
    case 'PARAGRAPH': { const c = inline(node.nodes); return c.trim() ? '<p>' + c + '</p>' : ''; }
    case 'HEADING': { const lv = (node.headingData && node.headingData.level) || 2; const l = Math.min(Math.max(lv, 2), 3); return '<h' + l + '>' + inline(node.nodes) + '</h' + l + '>'; }
    case 'BULLETED_LIST': return '<ul>' + (node.nodes || []).map(renderNode).join('') + '</ul>';
    case 'ORDERED_LIST': return '<ol>' + (node.nodes || []).map(renderNode).join('') + '</ol>';
    case 'LIST_ITEM': return '<li>' + (node.nodes || []).map((n) => (n.type === 'PARAGRAPH' ? inline(n.nodes) : renderNode(n))).join('') + '</li>';
    case 'BLOCKQUOTE': return '<blockquote>' + (node.nodes || []).map(renderNode).join('') + '</blockquote>';
    case 'IMAGE': { const u = mediaUrl(node.imageData && node.imageData.image && node.imageData.image.src); const alt = esc(node.imageData && node.imageData.altText); return u ? '<img src="' + u + '" alt="' + alt + '" loading="lazy">' : ''; }
    case 'DIVIDER': return '<hr>';
    case 'TEXT': return renderText(node);
    default: return node.nodes ? node.nodes.map(renderNode).join('') : '';
  }
}
export function renderRicos(nodes) {
  try { return (nodes || []).map(renderNode).join(''); }
  catch (e) { console.warn('renderRicos failed:', e); return ''; }
}
