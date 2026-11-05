#!/usr/bin/env node
/* =========================================================
   NAMI — SEO snapshot builder

   Runs at deploy time (see .github/workflows/deploy-pages.yml).
   The menu and blog are rendered client-side from Supabase, so a
   search engine that doesn't wait for that fetch sees an empty page.
   This script pulls the current published menu from Supabase and
   writes it into index.html as a static Schema.org Menu JSON-LD
   block, so the dishes are visible in the page source itself.

   It also refreshes sitemap.xml's <lastmod> so it reflects the
   actual last successful deploy.

   Never fails the build: any Supabase/network error leaves index.html
   untouched (the placeholder stays `null`, which carries no SEO
   downside) rather than breaking the deploy.
   ========================================================= */

import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE_URL = 'https://nami.org.ge';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-great-wave.jpg`;

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const CATEGORY_LABELS_KA = {
  rolls: 'როლი',
  nigiri: 'ნიგირი',
  maki: 'მაკი',
  futomaki: 'ფუტომაკი',
  tempuraRoll: 'შემწვარი როლი',
  sets: 'სეტი',
  noodles: 'ატრია',
  appetizers: 'ხემსი',
  desserts: 'დესერტი',
  drinks: 'სასმელი',
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS_KA);

function readSupabaseConfig() {
  const src = readFileSync(path.join(ROOT, 'js/supabase-client.js'), 'utf8');
  const url = src.match(/SUPABASE_URL\s*=\s*'([^']+)'/)?.[1];
  const key = src.match(/SUPABASE_ANON_KEY\s*=\s*'([^']+)'/)?.[1];
  if (!url || !key) throw new Error('Could not read Supabase config from js/supabase-client.js');
  return { url, key };
}

async function fetchMenuItems({ url, key }) {
  const endpoint = `${url}/rest/v1/menu_items?select=category,name_ka,name_en,desc_ka,desc_en,price,sort_order&published=eq.true&order=category.asc,sort_order.desc`;
  const res = await fetch(endpoint, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase menu_items fetch failed: ${res.status}`);
  return res.json();
}

function buildMenuJsonLd(rows) {
  const byCategory = new Map();
  for (const row of rows) {
    const name = (row.name_ka || row.name_en || '').trim();
    if (!name) continue;
    const item = {
      '@type': 'MenuItem',
      name,
      ...(row.name_en && row.name_en !== name ? { alternateName: row.name_en } : {}),
      ...((row.desc_ka || row.desc_en) ? { description: row.desc_ka || row.desc_en } : {}),
      ...(row.price ? { offers: { '@type': 'Offer', price: String(row.price).replace(/[^\d.]/g, ''), priceCurrency: 'GEL' } } : {}),
    };
    if (!byCategory.has(row.category)) byCategory.set(row.category, []);
    byCategory.get(row.category).push(item);
  }

  const hasMenuSection = CATEGORY_ORDER
    .filter(cat => byCategory.has(cat))
    .map(cat => ({
      '@type': 'MenuSection',
      name: CATEGORY_LABELS_KA[cat],
      hasMenuItem: byCategory.get(cat),
    }));

  if (!hasMenuSection.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'NAMI • ნამი — მენიუ',
    inLanguage: 'ka',
    hasMenuSection,
  };
}

function injectMenuJsonLd(menuJsonLd) {
  const indexPath = path.join(ROOT, 'index.html');
  const html = readFileSync(indexPath, 'utf8');
  const marker = /<script type="application\/ld\+json" id="menuJsonLd">[\s\S]*?<\/script>/;
  if (!marker.test(html)) {
    console.warn('menuJsonLd placeholder not found in index.html — skipping injection');
    return;
  }
  const safeJson = JSON.stringify(menuJsonLd).replace(/</g, '\\u003c');
  const replacement = `<script type="application/ld+json" id="menuJsonLd">${safeJson}</script>`;
  writeFileSync(indexPath, html.replace(marker, replacement));
  console.log(`Injected menu JSON-LD: ${menuJsonLd.hasMenuSection.length} sections, ${menuJsonLd.hasMenuSection.reduce((n, s) => n + s.hasMenuItem.length, 0)} items`);
}

function escapeAttr(str) {
  return String(str || '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

async function fetchBlogPosts({ url, key }) {
  const endpoint = `${url}/rest/v1/blog_posts?select=slug,title_ka,title_en,excerpt_ka,excerpt_en,photo_url&published=eq.true`;
  const res = await fetch(endpoint, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase blog_posts fetch failed: ${res.status}`);
  return res.json();
}

function buildBlogPostPage(post) {
  const title = post.title_ka || post.title_en || 'NAMI ბლოგი';
  const excerpt = post.excerpt_ka || post.excerpt_en || '';
  const image = post.photo_url || DEFAULT_OG_IMAGE;
  const canonical = `${SITE_URL}/blog/${post.slug}.html`;
  const redirectTarget = `/#blog?post=${encodeURIComponent(post.slug)}`;

  return `<!doctype html>
<html lang="ka">
<head>
<meta charset="UTF-8">
<script>location.replace(${JSON.stringify(redirectTarget)});</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeAttr(title)} | NAMI • ნამი</title>
<meta name="description" content="${escapeAttr(excerpt)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(excerpt)}">
<meta property="og:image" content="${escapeAttr(image)}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(title)}">
<meta name="twitter:description" content="${escapeAttr(excerpt)}">
<meta name="twitter:image" content="${escapeAttr(image)}">
<meta http-equiv="refresh" content="0; url=${redirectTarget}">
<link rel="icon" href="/images/favicon.png">
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
         background: #11241c; color: #fbfbf4; font-family: system-ui, sans-serif; text-align: center; padding: 24px; }
  a { color: #93bb9e; }
</style>
</head>
<body>
<p><a href="${redirectTarget}">${escapeAttr(title)} — NAMI ბლოგში გასახსნელად დააჭირეთ აქ</a></p>
</body>
</html>
`;
}

function writeBlogPostPages(posts) {
  const blogDir = path.join(ROOT, 'blog');
  rmSync(blogDir, { recursive: true, force: true });
  if (!posts.length) return;
  mkdirSync(blogDir, { recursive: true });
  for (const post of posts) {
    if (!post.slug) continue;
    writeFileSync(path.join(blogDir, `${post.slug}.html`), buildBlogPostPage(post));
  }
  console.log(`Wrote ${posts.length} static blog post page(s) for sharing`);
}

function refreshSitemapLastmod() {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  const xml = readFileSync(sitemapPath, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const withLastmod = /<lastmod>[^<]*<\/lastmod>/.test(xml)
    ? xml.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${today}</lastmod>`)
    : xml.replace(/(<url>\s*<loc>[^<]*<\/loc>)/, `$1\n    <lastmod>${today}</lastmod>`);
  writeFileSync(sitemapPath, withLastmod);
  console.log(`sitemap.xml lastmod set to ${today}`);
}

async function main() {
  try {
    const config = readSupabaseConfig();
    const rows = await fetchMenuItems(config);
    const menuJsonLd = buildMenuJsonLd(rows);
    if (menuJsonLd) injectMenuJsonLd(menuJsonLd);
    else console.warn('No published menu items found — leaving menuJsonLd placeholder as null');
  } catch (e) {
    console.warn(`SEO snapshot: menu fetch/injection skipped (${e.message})`);
  }

  try {
    const config = readSupabaseConfig();
    const posts = await fetchBlogPosts(config);
    writeBlogPostPages(posts);
  } catch (e) {
    console.warn(`SEO snapshot: blog post pages skipped (${e.message})`);
  }

  try {
    refreshSitemapLastmod();
  } catch (e) {
    console.warn(`SEO snapshot: sitemap lastmod refresh skipped (${e.message})`);
  }
}

main();
