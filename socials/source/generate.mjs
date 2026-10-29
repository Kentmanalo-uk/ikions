/**
 * Ikions social media kit generator.
 *
 * Renders every graphic in /socials from HTML with the website's real brand
 * assets: the "drift i" mark, the Sora wordmark, Geist type, the site colours,
 * Ikions icons and live counts from @ikions/metadata. Re-run it whenever the
 * library grows so the numbers stay true.
 *
 *   pnpm build:packages              # make sure the built packages are current
 *   node socials/source/generate.mjs
 *
 * Uses Playwright's Chromium from tests/ and the Geist font from Google Fonts
 * (needs an internet connection while rendering).
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUT = path.resolve(HERE, "..");
const requireTests = createRequire(path.join(ROOT, "tests/package.json"));
const { chromium } = requireTests("@playwright/test");

const { toSvg } = await import(pathToFileURL(path.join(ROOT, "packages/icons/dist/index.js")).href);
const metadata = await import(pathToFileURL(path.join(ROOT, "packages/metadata/dist/index.js")).href);

const ICONS = metadata.icons.length;
const CATEGORIES = metadata.categories.filter((c) => c.count > 0).length;
const fmt = (n) => n.toLocaleString("en");

// ---- Brand data, read from the website so the kit never drifts from it ----
const brandSrc = fs.readFileSync(path.join(ROOT, "apps/web/src/lib/brand.ts"), "utf8");
const WORD = {
  viewBox: brandSrc.match(/BRAND_WORDMARK = \{[\s\S]*?viewBox: "([^"]+)"/)[1],
  letters: brandSrc.match(/letters: "([^"]+)"/)[1],
  dots: JSON.parse(brandSrc.match(/dots: (\[[^\]]+\])/)[1]),
};
const logosSrc = fs.readFileSync(path.join(ROOT, "apps/web/src/lib/framework-logos.ts"), "utf8");
const LOGOS = Object.fromEntries(
  ["React", "Vue", "Svelte", "SVG"].map((name) => {
    const block = logosSrc.slice(logosSrc.indexOf(`"${name}": {`));
    return [name, { light: block.match(/light: "([^"]+)"/)[1], path: block.match(/path: "([^"]+)"/)[1] }];
  }),
);

const C = {
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  ink: "#18191B",
  ink2: "#6A6C72",
  line: "#E8E8E4",
  subtle: "#F1F1EE",
  accent: "#5555E8",
  accentText: "#4747D6",
  selected: "#EEEEFD",
  dark: "#121316",
  darkSurface: "#1B1C20",
  darkInk2: "#A1A2AA",
};

let uid = 0;
/** The gradient "drift i" mark. */
function mark(size, { white = false } = {}) {
  const id = `m${uid++}`;
  if (white) {
    return `<svg width="${size}" height="${size}" viewBox="3.75 3 26 26"><path d="M14.5 12H15a2 2 0 0 1 2 2v8.5a6.5 6.5 0 0 1-6.5 6.5H10a2 2 0 0 1-2-2v-8.5a6.5 6.5 0 0 1 6.5-6.5Z" fill="#fff"/><circle cx="21.25" cy="7.25" r="4.25" fill="#FFC9A6"/><circle cx="19.9" cy="5.9" r="1.2" fill="#fff" fill-opacity=".7"/></svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="3.75 3 26 26"><defs><linearGradient id="${id}s" x1="6" y1="11" x2="20" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7C6CFF"/><stop offset=".55" stop-color="#5548EA"/><stop offset="1" stop-color="#3A2BC9"/></linearGradient><linearGradient id="${id}d" x1="17" y1="2" x2="26" y2="12" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF8AC2"/><stop offset="1" stop-color="#FFB25E"/></linearGradient><linearGradient id="${id}g" x1="8" y1="12" x2="14" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><path d="M14.5 12H15a2 2 0 0 1 2 2v8.5a6.5 6.5 0 0 1-6.5 6.5H10a2 2 0 0 1-2-2v-8.5a6.5 6.5 0 0 1 6.5-6.5Z" fill="url(#${id}s)"/><path d="M14.5 13.4a5.1 5.1 0 0 0-5.1 5.1v3.2a7.5 7.5 0 0 1 6.2-8.3Z" fill="url(#${id}g)"/><circle cx="21.25" cy="7.25" r="4.25" fill="url(#${id}d)"/><circle cx="19.9" cy="5.9" r="1.2" fill="#fff" fill-opacity=".55"/></svg>`;
}

/** The "ikions" wordmark with gradient i-dots. */
function wordmark(height, color = C.ink) {
  const id = `w${uid++}`;
  const [, , w, h] = WORD.viewBox.split(" ").map(Number);
  return `<svg height="${height}" width="${(height * w) / h}" viewBox="${WORD.viewBox}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF8AC2"/><stop offset="1" stop-color="#FFB25E"/></linearGradient></defs><path d="${WORD.letters}" fill="${color}"/>${WORD.dots.map((d) => `<circle cx="${d.cx}" cy="${d.cy}" r="${d.r}" fill="url(#${id})"/>`).join("")}</svg>`;
}

const logo = (markSize, color = C.ink) =>
  `<div style="display:flex;align-items:center;gap:${markSize * 0.18}px">${mark(markSize)}${wordmark(markSize * 0.56, color)}</div>`;

const icon = (name, { size = 32, color = C.ink, variant = "outline", gradient } = {}) =>
  toSvg(name, variant, { size, color, ...(gradient ? { gradient } : {}) });

const fwLogo = (name, size) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="${LOGOS[name].path}" fill="${LOGOS[name].light}"/></svg>`;

const SHOWCASE_ICONS = ["home", "search", "bell", "mail", "chat", "user", "settings", "heart", "camera", "image", "music", "play", "calendar", "clock", "map-pin", "compass", "cart", "bag", "wallet", "credit-card", "file", "folder", "cloud", "sun", "moon", "umbrella", "lock", "shield-check", "key", "code", "terminal", "git-branch", "plane", "car", "coffee", "pizza", "book-open", "lightbulb", "trophy", "sparkles"];

/** A grid of icons in a white card, like the site's product window. */
function iconCard(names, { cols, size, gap, pad, variant = (i) => "outline", color = (i) => C.ink, radius = 32 }) {
  return `<div style="background:${C.surface};border-radius:${radius}px;padding:${pad}px;box-shadow:0 1px 2px rgba(20,20,40,.04),0 24px 60px -24px rgba(40,40,90,.22);display:grid;grid-template-columns:repeat(${cols},${size}px);gap:${gap}px;justify-content:center">${names
    .map((n, i) => `<div style="display:grid;place-items:center;height:${size}px">${icon(n, { size: size * 0.62, variant: variant(i), color: color(i) })}</div>`)
    .join("")}</div>`;
}

const glow = (x, y, color, size) =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:${color};filter:blur(${size / 3}px);opacity:.55"></div>`;

const page = (width, height, body, { background = C.bg, color = C.ink } = {}) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${width}px;height:${height}px;overflow:hidden}
body{position:relative;background:${background};color:${color};font-family:Geist,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.h{font-weight:600;letter-spacing:-.045em;line-height:1.02}
.p{color:${background === C.dark ? C.darkInk2 : C.ink2}}
.mono{font-family:"JetBrains Mono",ui-monospace,monospace}
.pill{display:inline-flex;align-items:center;gap:10px;border-radius:999px;font-weight:500}
</style></head><body>${body}</body></html>`;

// ---- Graphics ---------------------------------------------------------------
const assets = [];
const add = (file, width, height, html) => assets.push({ file, width, height, html });

// Brand
add("brand/ikions-mark.png", 1024, 1024, page(1024, 1024, `<div style="display:grid;place-items:center;height:100%">${mark(860)}</div>`, { background: "transparent" }));
add("brand/ikions-logo-light.png", 2000, 600, page(2000, 600, `<div style="display:grid;place-items:center;height:100%">${logo(360)}</div>`, { background: "transparent" }));
add("brand/ikions-logo-dark.png", 2000, 600, page(2000, 600, `<div style="display:grid;place-items:center;height:100%">${logo(360, "#F5F5F2")}</div>`, { background: "transparent" }));
fs.mkdirSync(path.join(OUT, "brand"), { recursive: true });
fs.writeFileSync(path.join(OUT, "brand/ikions-mark.svg"), mark(512));
fs.writeFileSync(path.join(OUT, "brand/ikions-wordmark.svg"), wordmark(120));
fs.writeFileSync(path.join(OUT, "brand/ikions-wordmark-white.svg"), wordmark(120, "#FFFFFF"));

// Profile pictures (1080 × 1080, safe for circle crops)
add("profile/pfp-light.png", 1080, 1080, page(1080, 1080, `${glow(240, 200, "#C9C6FF", 600)}${glow(520, 140, "#FFD3C2", 420)}<div style="position:relative;display:grid;place-items:center;height:100%">${mark(620)}</div>`));
add("profile/pfp-indigo.png", 1080, 1080, page(1080, 1080, `<div style="display:grid;place-items:center;height:100%;background:radial-gradient(circle at 30% 25%,#7C6CFF,#4B3FE0 55%,#2E22B0)">${mark(600, { white: true })}</div>`));
add("profile/pfp-dark.png", 1080, 1080, page(1080, 1080, `${glow(260, 240, "#3B33A8", 560)}<div style="position:relative;display:grid;place-items:center;height:100%">${mark(620)}</div>`, { background: C.dark }));

// Covers: text on the left inside a centred safe area, icons on the right.
// `left` moves the content clear of profile photos that overlap the lower-left corner (X, LinkedIn).
function cover(width, height, { safeW, safeH, left }) {
  const s = safeH / 400;
  const gridIcons = SHOWCASE_ICONS.slice(0, 24);
  return page(
    width,
    height,
    `${glow(width * 0.55, -height * 0.2, "#D6D3FF", height * 1.1)}${glow(width * 0.8, height * 0.4, "#FFE0D2", height * 0.8)}
    <div style="position:absolute;left:${left ?? (width - safeW) / 2}px;top:${(height - safeH) / 2}px;width:${safeW}px;height:${safeH}px;display:flex;align-items:center;justify-content:space-between;gap:${40 * s}px">
      <div style="max-width:${safeW * 0.5}px">
        ${logo(64 * s)}
        <div class="h" style="font-size:${58 * s}px;margin-top:${34 * s}px">Icons for everything you imagine.</div>
        <div class="p" style="font-size:${22 * s}px;margin-top:${16 * s}px">${fmt(ICONS)} free icons for React, Vue, Svelte and SVG</div>
        <div class="pill" style="margin-top:${26 * s}px;background:${C.accent};color:#fff;font-size:${20 * s}px;padding:${11 * s}px ${22 * s}px">ikions.cloud</div>
      </div>
      ${iconCard(gridIcons, { cols: 6, size: 58 * s, gap: 8 * s, pad: 26 * s, variant: (i) => (i % 3 === 1 ? "filled" : "outline"), color: (i) => (i % 5 === 2 ? C.accent : C.ink), radius: 28 * s })}
    </div>`,
  );
}
add("covers/facebook-cover-1640x624.png", 1640, 624, cover(1640, 624, { safeW: 1460, safeH: 470 }));
add("covers/x-header-1500x500.png", 1500, 500, cover(1500, 500, { safeW: 1080, safeH: 360, left: 360 }));
add("covers/linkedin-banner-1584x396.png", 1584, 396, cover(1584, 396, { safeW: 1080, safeH: 320, left: 440 }));
add("covers/youtube-banner-2560x1440.png", 2560, 1440, cover(2560, 1440, { safeW: 1546, safeH: 423 }));
add("covers/github-social-preview-1280x640.png", 1280, 640, cover(1280, 640, { safeW: 1140, safeH: 440 }));

// ---- Square posts (1080 × 1080), designed as a 3 × 3 profile grid ----------
const post = (body, opts) => page(1080, 1080, `<div style="position:relative;height:100%;padding:84px">${body}</div>`, opts);
const footer = (dark = false) =>
  `<div style="position:absolute;left:84px;right:84px;bottom:72px;display:flex;justify-content:space-between;align-items:center">${dark ? `<div style="display:flex;align-items:center;gap:12px">${mark(44)}${wordmark(26, "#F5F5F2")}</div>` : logo(44)}<span class="mono" style="font-size:22px;color:${dark ? C.darkInk2 : C.ink2}">ikions.cloud</span></div>`;
// Badge labels were removed from the kit on request; headings now open each graphic.
const eyebrow = () => "";

// 1. Launch
add("posts/01-launch.png", 1080, 1080, post(`${glow(420, -80, "#D6D3FF", 700)}${glow(700, 300, "#FFE0D2", 420)}
  <div style="position:relative">${eyebrow("Now live")}
  <div class="h" style="font-size:96px;">Icons for everything you imagine.</div>
  <div class="p" style="font-size:30px;margin-top:22px">${fmt(ICONS)} original icons. Free to use.</div></div>
  <div style="position:absolute;left:84px;right:84px;top:520px">${iconCard(SHOWCASE_ICONS.slice(0, 24), { cols: 8, size: 92, gap: 10, pad: 30, variant: (i) => (i % 4 === 1 ? "filled" : "outline"), color: (i) => (i % 6 === 3 ? C.accent : C.ink) })}</div>
  ${footer()}`));

// 2. Numbers
add("posts/02-numbers.png", 1080, 1080, post(`${glow(-120, 380, "#D6D3FF", 640)}
  <div style="position:relative">${eyebrow("The library")}
  <div class="h" style="font-size:250px;letter-spacing:-.06em">${fmt(ICONS)}</div>
  <div class="h" style="font-size:64px;margin-top:6px">free icons</div>
  <div style="display:flex;gap:56px;margin-top:56px">
    <div><div class="h" style="font-size:64px">${CATEGORIES}</div><div class="p" style="font-size:26px;margin-top:6px">categories</div></div>
    <div><div class="h" style="font-size:64px">4</div><div class="p" style="font-size:26px;margin-top:6px">frameworks</div></div>
    <div><div class="h" style="font-size:64px">$0</div><div class="p" style="font-size:26px;margin-top:6px">to use</div></div>
  </div></div>
  <div style="position:absolute;left:84px;right:84px;bottom:170px;display:flex;justify-content:space-between">${["camera", "bell", "heart", "map-pin", "wallet", "cloud", "music", "sparkles", "trophy"]
    .map((n, i) => icon(n, { size: 54, variant: i % 2 ? "filled" : "outline", color: i % 3 === 1 ? C.accent : C.ink }))
    .join("")}</div>${footer()}`));

// 3. Two styles
const pair = (name) => `<div style="flex:1;background:${C.surface};border-radius:32px;padding:30px 0;display:grid;place-items:center;gap:22px;box-shadow:0 24px 60px -28px rgba(40,40,90,.25)">
  <div style="display:flex;gap:40px">${icon(name, { size: 92 })}${icon(name, { size: 92, variant: "filled", color: C.accent })}</div>
  <span class="mono" style="font-size:22px;color:${C.ink2}">${name}</span></div>`;
add("posts/03-two-styles.png", 1080, 1080, post(`<div style="position:relative">${eyebrow("Outline + Filled")}
  <div class="h" style="font-size:84px;">Two styles.<br>One name.</div></div>
  <div style="position:absolute;left:84px;right:84px;top:420px;display:grid;gap:20px">
    <div style="display:flex;gap:20px">${pair("heart")}${pair("bell")}</div>
    <div style="display:flex;gap:20px">${pair("bookmark")}${pair("star")}</div>
  </div>${footer()}`));

// 4. Frameworks
const fw = (name, label) => `<div style="background:${C.surface};border-radius:32px;padding:38px;display:flex;align-items:center;gap:26px;box-shadow:0 24px 60px -28px rgba(40,40,90,.25)">${fwLogo(name, 76)}<div><div style="font-size:38px;font-weight:600;letter-spacing:-.02em">${label}</div><div class="mono" style="font-size:22px;color:${C.ink2};margin-top:6px">@ikions/${name === "SVG" ? "icons" : name.toLowerCase()}</div></div></div>`;
add("posts/04-frameworks.png", 1080, 1080, post(`<div style="position:relative">${eyebrow("Works everywhere")}
  <div class="h" style="font-size:84px;">Install once.<br>Use anywhere.</div></div>
  <div style="position:absolute;left:84px;right:84px;top:470px;display:grid;grid-template-columns:1fr 1fr;gap:22px">${fw("React", "React")}${fw("Vue", "Vue")}${fw("Svelte", "Svelte")}${fw("SVG", "Plain SVG")}</div>
  ${footer()}`));

// 5. Code (dark)
const tok = (t, c) => `<span style="color:${c}">${t}</span>`;
add("posts/05-code.png", 1080, 1080, post(`${glow(500, -100, "#3B33A8", 640)}
  <div style="position:relative">${eyebrow("For developers", true)}
  <div class="h" style="font-size:84px;color:#F5F5F2">Two lines.<br>Any icon.</div></div>
  <div class="mono" style="position:absolute;left:84px;right:84px;top:440px;background:${C.darkSurface};border-radius:32px;padding:44px 48px;font-size:27px;line-height:1.75;color:#E6E6E3;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)">
    <div style="color:#7D7F87">$ npm install @ikions/react</div><br>
    <div>${tok("import", "#FF7AB6")} { ${tok("CameraIcon", "#A9A9FF")} } ${tok("from", "#FF7AB6")} ${tok('"@ikions/react"', "#7EE0B5")};</div>
    <div>&lt;${tok("CameraIcon", "#A9A9FF")} ${tok("size", "#FFC38A")}={${tok("24", "#FFC38A")}} ${tok("variant", "#FFC38A")}=${tok('"filled"', "#7EE0B5")} /&gt;</div>
    <div style="display:flex;gap:30px;margin-top:34px">${["camera", "bell", "heart", "map-pin", "wallet", "sparkles"].map((n, i) => icon(n, { size: 52, color: i % 2 ? "#F5F5F2" : "#A9A9FF", variant: i % 2 ? "filled" : "outline" })).join("")}</div>
  </div>${footer(true)}`, { background: C.dark, color: "#F5F5F2" }));

// 6. Category spotlight
const weather = metadata.icons.filter((i) => i.category === "weather").slice(0, 15).map((i) => i.name);
add("posts/06-weather.png", 1080, 1080, post(`${glow(560, 340, "#CFE7FF", 600)}
  <div style="position:relative">${eyebrow("Category spotlight")}
  <div class="h" style="font-size:84px;">Weather &amp; Nature</div>
  <div class="p" style="font-size:30px;margin-top:16px">${metadata.categories.find((c) => c.slug === "weather")?.count ?? weather.length} icons, from sunrise to snowfall.</div></div>
  <div style="position:absolute;left:84px;right:84px;top:430px">${iconCard(weather, { cols: 5, size: 138, gap: 6, pad: 24, variant: (i) => (i % 3 === 1 ? "filled" : "outline"), color: (i) => (i % 4 === 0 ? "#2B7FD6" : C.ink) })}</div>
  ${footer()}`));

// 7. Gradients
const grads = [
  { from: "#7C6CFF", to: "#3A2BC9" },
  { from: "#FF8AC2", to: "#FFB25E" },
  { from: "#22D3EE", to: "#2563EB" },
  { from: "#34D399", to: "#059669" },
  { from: "#F472B6", to: "#8B5CF6" },
  { from: "#FBBF24", to: "#F97316" },
];
const gNames = ["sparkles", "heart", "cloud", "leaf", "music", "sun"];
add("posts/07-gradients.png", 1080, 1080, post(`<div style="position:relative">${eyebrow("New: gradients")}
  <div class="h" style="font-size:84px;">Paint any icon<br>with a gradient.</div></div>
  <div style="position:absolute;left:84px;right:84px;top:470px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px">${gNames
    .map((n, i) => `<div style="background:${C.surface};border-radius:32px;height:200px;display:grid;place-items:center;box-shadow:0 24px 60px -28px rgba(40,40,90,.25)">${icon(n, { size: 112, variant: i % 2 ? "filled" : "outline", gradient: { ...grads[i], angle: 135 } })}</div>`)
    .join("")}</div>${footer()}`));

// 8. Free to use
const check = (t) => `<div style="display:flex;align-items:center;gap:22px;font-size:36px;font-weight:500;letter-spacing:-.01em"><span style="display:grid;place-items:center;width:58px;height:58px;border-radius:50%;background:${C.selected}">${icon("check", { size: 30, color: C.accent })}</span>${t}</div>`;
add("posts/08-free.png", 1080, 1080, post(`${glow(620, 80, "#FFE0D2", 520)}${glow(-60, 520, "#D6D3FF", 520)}
  <div style="position:relative">${eyebrow("Ikions License")}
  <div class="h" style="font-size:120px;">Free.<br>Really.</div>
  <div style="display:grid;gap:26px;margin-top:56px">${check("Personal and commercial projects")}${check("Websites, apps and products")}${check("No credit needed")}</div></div>
  ${footer()}`));

// 9. Showcase (real screenshots of verified sites)
const shot = (file) => pathToFileURL(path.join(ROOT, "apps/web/public/showcase", file)).href;
const shotCard = (file, name, host) => `<div style="flex:1;background:${C.surface};border-radius:32px;overflow:hidden;box-shadow:0 24px 60px -28px rgba(40,40,90,.3)">
  <div style="height:300px;background:url('${shot(file)}') top center/cover"></div>
  <div style="padding:26px 30px"><div style="font-size:32px;font-weight:600;letter-spacing:-.02em">${name}</div><div class="mono" style="font-size:20px;color:${C.ink2};margin-top:6px">${host}</div></div></div>`;
add("posts/09-showcase.png", 1080, 1080, post(`<div style="position:relative">${eyebrow("Built with Ikions")}
  <div class="h" style="font-size:84px;">Already live on<br>real websites.</div></div>
  <div style="position:absolute;left:84px;right:84px;top:470px;display:flex;gap:22px">${shotCard("balairesort-desktop.jpg", "Balai-Reserve", "balairesort.site")}${shotCard("emoorm-desktop.jpg", "E-MOORM", "emoorm.shop")}</div>
  ${footer()}`));

// ---- Stories (1080 × 1920) ---------------------------------------------------
const story = (body, opts) => page(1080, 1920, `<div style="position:relative;height:100%;padding:260px 84px">${body}</div>`, opts);
add("stories/01-launch-story.png", 1080, 1920, story(`${glow(380, 0, "#D6D3FF", 800)}${glow(600, 900, "#FFE0D2", 520)}
  <div style="position:relative">${logo(70)}
  <div class="h" style="font-size:118px;margin-top:90px">Icons for everything you imagine.</div>
  <div class="p" style="font-size:38px;margin-top:30px">${fmt(ICONS)} original icons. Free to use.</div></div>
  <div style="position:absolute;left:84px;right:84px;top:900px">${iconCard(SHOWCASE_ICONS.slice(0, 15), { cols: 5, size: 160, gap: 6, pad: 32, variant: (i) => (i % 4 === 1 ? "filled" : "outline"), color: (i) => (i % 6 === 3 ? C.accent : C.ink) })}</div>
  <div class="pill" style="position:absolute;left:84px;right:84px;bottom:280px;justify-content:center;background:${C.accent};color:#fff;font-size:40px;padding:34px">ikions.cloud</div>`));
add("stories/02-search-story.png", 1080, 1920, story(`${glow(300, 200, "#D6D3FF", 700)}
  <div style="position:relative">${eyebrow("Find it fast")}
  <div class="h" style="font-size:110px;">Search by what you mean.</div>
  <div class="p" style="font-size:38px;margin-top:30px">Type “payment”, get wallets, cards and receipts.</div></div>
  <div style="position:absolute;left:84px;right:84px;top:800px">
    <div style="display:flex;align-items:center;gap:22px;background:${C.surface};border-radius:999px;padding:30px 40px;font-size:40px;box-shadow:0 24px 60px -24px rgba(40,40,90,.25)">${icon("search", { size: 44, color: C.ink2 })}<span>payment</span><span style="width:3px;height:46px;background:${C.accent}"></span></div>
    <div style="margin-top:36px">${iconCard(["wallet", "credit-card", "receipt", "cash-stack", "coin", "bank", "payment", "cash-register", "money-send", "piggy-bank", "card-tap", "invoice-paid"].filter((n) => metadata.icons.some((i) => i.name === n)), { cols: 4, size: 150, gap: 6, pad: 28, variant: (i) => (i % 3 === 1 ? "filled" : "outline"), color: (i) => (i % 3 === 1 ? C.accent : C.ink) })}</div>
  </div>
  <div style="position:absolute;left:84px;bottom:280px">${logo(56)}</div>`));
add("stories/03-install-story.png", 1080, 1920, story(`${glow(400, 300, "#3B33A8", 800)}
  <div style="position:relative">${eyebrow("For developers", true)}
  <div class="h" style="font-size:118px;color:#F5F5F2">One install. Every icon.</div></div>
  <div class="mono" style="position:absolute;left:84px;right:84px;top:820px;background:${C.darkSurface};border-radius:40px;padding:56px;font-size:34px;line-height:1.8;color:#E6E6E3;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)">
    <div style="color:#7D7F87">$ npm install @ikions/react</div><br>
    <div>${tok("import", "#FF7AB6")} { ${tok("BellIcon", "#A9A9FF")} }</div><div>${tok("from", "#FF7AB6")} ${tok('"@ikions/react"', "#7EE0B5")};</div><br>
    <div>&lt;${tok("BellIcon", "#A9A9FF")} ${tok("size", "#FFC38A")}={${tok("24", "#FFC38A")}} /&gt;</div>
  </div>
  <div style="position:absolute;left:84px;right:84px;bottom:280px;display:flex;justify-content:space-between;align-items:center"><div style="display:flex;align-items:center;gap:14px">${mark(60)}${wordmark(34, "#F5F5F2")}</div><span class="mono" style="font-size:30px;color:${C.darkInk2}">ikions.cloud</span></div>`, { background: C.dark, color: "#F5F5F2" }));

// ---- Landscape posts (1200 × 675) for X, LinkedIn and Facebook links ----------
const wide = (body, opts) => page(1200, 675, `<div style="position:relative;height:100%;padding:64px 72px">${body}</div>`, opts);
add("landscape/01-launch-1200x675.png", 1200, 675, wide(`${glow(600, -160, "#D6D3FF", 620)}
  <div style="position:relative;display:flex;justify-content:space-between;align-items:center;height:100%;gap:40px">
    <div style="max-width:560px">${logo(54)}<div class="h" style="font-size:66px;margin-top:40px">Icons for everything you imagine.</div><div class="p" style="font-size:24px;margin-top:20px">${fmt(ICONS)} free icons for React, Vue, Svelte and SVG</div><div class="pill" style="margin-top:30px;background:${C.accent};color:#fff;font-size:22px;padding:12px 24px">ikions.cloud</div></div>
    ${iconCard(SHOWCASE_ICONS.slice(0, 20), { cols: 4, size: 92, gap: 6, pad: 24, variant: (i) => (i % 4 === 1 ? "filled" : "outline"), color: (i) => (i % 6 === 3 ? C.accent : C.ink) })}
  </div>`));
add("landscape/02-frameworks-1200x675.png", 1200, 675, wide(`<div style="position:relative">${eyebrow("Works everywhere")}<div class="h" style="font-size:62px;">Install once. Import only what you use.</div><div class="p" style="font-size:24px;margin-top:16px">Only the icons you import end up in your bundle.</div></div>
  <div style="position:absolute;left:72px;right:72px;bottom:64px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px">${["React", "Vue", "Svelte", "SVG"]
    .map((n) => `<div style="background:${C.surface};border-radius:28px;padding:30px 26px;display:grid;justify-items:center;gap:16px;box-shadow:0 24px 50px -26px rgba(40,40,90,.25)">${fwLogo(n, 64)}<div style="font-size:26px;font-weight:600">${n === "SVG" ? "Plain SVG" : n}</div><div class="mono" style="font-size:16px;color:${C.ink2}">@ikions/${n === "SVG" ? "icons" : n.toLowerCase()}</div></div>`)
    .join("")}</div>`));
add("landscape/03-free-1200x675.png", 1200, 675, wide(`${glow(700, 60, "#FFE0D2", 480)}${glow(-60, 300, "#D6D3FF", 480)}
  <div style="position:relative;display:flex;justify-content:space-between;align-items:center;height:100%">
    <div>${eyebrow("Ikions License")}<div class="h" style="font-size:110px;">Free.<br>Really.</div></div>
    <div style="display:grid;gap:22px">${check("Personal and commercial use")}${check("Websites, apps and products")}${check("No credit needed")}<div style="margin-top:20px">${logo(48)}</div></div>
  </div>`));

// ---- Render -------------------------------------------------------------------
const RENDER_FILE = path.join(HERE, ".render.html");
const browser = await chromium.launch();
const tab = await browser.newPage({ deviceScaleFactor: 1 });
for (const asset of assets) {
  const file = path.join(OUT, asset.file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await tab.setViewportSize({ width: asset.width, height: asset.height });
  // Load from a file (not setContent) so local images such as the showcase screenshots are allowed.
  fs.writeFileSync(RENDER_FILE, asset.html);
  await tab.goto(pathToFileURL(RENDER_FILE).href, { waitUntil: "networkidle" });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: file, omitBackground: asset.file.startsWith("brand/"), clip: { x: 0, y: 0, width: asset.width, height: asset.height } });
  console.log(`✓ ${asset.file} (${asset.width}×${asset.height})`);
}
await browser.close();
fs.rmSync(RENDER_FILE, { force: true });
console.log(`\n${assets.length} graphics rendered with ${fmt(ICONS)} icons in ${CATEGORIES} categories.`);
