/**
 * Android adaptive icon "monochrome" katmanı: tek renk kelime markası
 * (sistem bunu kullanıcının duvar kâğıdı temasına göre boyar, bu yüzden
 * renk ayrımı değil yalnız siluet taşımalı).
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <text x="518" y="482" text-anchor="middle"
        font-family="Charter, 'Bitstream Charter', 'Liberation Serif', Georgia, serif"
        font-size="196" font-weight="bold" letter-spacing="12" fill="#fff">SEÇİM</text>
  <text x="521" y="712" text-anchor="middle"
        font-family="Charter, 'Bitstream Charter', 'Liberation Serif', Georgia, serif"
        font-size="158" font-weight="bold" letter-spacing="18" fill="#fff">2027</text>
</svg>`;

const html = `<!doctype html><html><head><style>
  html,body{margin:0;padding:0;width:1024px;height:1024px;background:transparent}
</style></head><body>${svg}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
await page.setContent(html);
await page.waitForTimeout(60);
await page.screenshot({
  path: resolve(here, '../assets/android-icon-monochrome.png'),
  omitBackground: true,
});
await browser.close();
console.log('render-android-mono: assets/android-icon-monochrome.png yazıldı');
