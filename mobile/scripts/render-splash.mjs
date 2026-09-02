/**
 * Açılış ekranı görseli: yalnızca amblem, saydam zemin üzerinde.
 * app.json'daki expo-splash-screen eklentisi bunu backgroundColor'ın
 * (#0a0b0d) üzerine ortalayıp imageWidth:200 ile ölçekliyor.
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(resolve(here, 'icon.svg'), 'utf8')
  .replace('<rect width="1024" height="1024" fill="url(#bg)"/>', ''); // zemin yok

const html = `<!doctype html><html><head><style>
  html,body{margin:0;padding:0;width:1024px;height:1024px;background:transparent}
</style></head><body>${svg}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
await page.setContent(html);
await page.waitForTimeout(80);
await page.screenshot({
  path: resolve(here, '../assets/splash-icon.png'),
  omitBackground: true,
});
await browser.close();
console.log('render-splash: assets/splash-icon.png yazıldı');
