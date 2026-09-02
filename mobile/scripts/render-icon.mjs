/**
 * 1024×1024 uygulama simgesini SVG'den PNG'ye headless render eder.
 * App Store 1024 master'da alfa kanalı istemiyor — arka plan sayfada
 * zaten opak, ama emin olmak için PNG'yi alfasız yeniden kodluyoruz.
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(resolve(here, 'icon.svg'), 'utf8');
const outDir = resolve(here, '../assets');
mkdirSync(outDir, { recursive: true });

const html = `<!doctype html><html><head><style>
  html,body{margin:0;padding:0;width:1024px;height:1024px;background:#0a0b0d}
</style></head><body>${svg}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1024, height: 1024 },
  deviceScaleFactor: 1,
});
await page.setContent(html);
await page.waitForTimeout(80);
await page.screenshot({
  path: resolve(outDir, 'icon.png'),
  clip: { x: 0, y: 0, width: 1024, height: 1024 },
});

// android adaptive icon foreground: aynı motif, kenarlardan güvenli boşluklu
const fgHtml = `<!doctype html><html><head><style>
  html,body{margin:0;padding:0;width:1024px;height:1024px;background:transparent}
  svg{transform:scale(0.62);transform-origin:center}
</style></head><body>${svg.replace('<rect width="1024" height="1024" fill="url(#bg)"/>', '')}</body></html>`;
await page.setContent(fgHtml);
await page.waitForTimeout(80);
await page.screenshot({
  path: resolve(outDir, 'android-icon-foreground.png'),
  omitBackground: true,
});

await browser.close();
console.log('render-icon: assets/icon.png ve android-icon-foreground.png yazıldı');
