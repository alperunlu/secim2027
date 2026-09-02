/**
 * Oyunun tek kaynağı depo kökündeki index.html'dir.
 * Bu betik onu WebView'a gömülebilir bir JS modülüne çevirir.
 *
 * Artifact yapısından farkı: burada GERÇEK bir WebView viewport'u var, yani
 * oyunun position:fixed + 100dvh modeli olduğu gibi doğru çalışır — Artifact
 * için yazdığımız #frame-stage sarmalayıcısı buraya UYGULANMAZ.
 *
 * Çıkarılanlar: yalnızca native pakette 404 verecek ya da anlamsız olan
 * referanslar (service worker, PWA manifesti, apple-touch-icon).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, '../../index.html');
const OUT = resolve(here, '../game-html.js');

let html = readFileSync(SRC, 'utf8');
const before = html.length;

// service worker: capacitor://-benzeri şemada kaydolmaz, dosyası da pakette yok
// indexOf tabanlı: eski regex tam olarak 3 satırlık sıkı bir biçim
// varsayıyordu (satır1 if(...), satır2 gövde, satır3 tek başına "}") ve
// kaynak Prettier ile yeniden biçimlendirilince tutmaz oldu. Burada satır
// sayısına bağlı değiliz: "if (...serviceWorker..." ifadesinin başladığı
// yerden, ondan SONRA gelen ilk kapanış satırına kadar (üst düzey ifadenin
// kendi kapanışı — gövde tek satır olduğu için araya başka bir "}" girmiyor).
// \r?\n kullanıyoruz: kaynak CRLF'e (Windows) döndüğünde de kırılmasın.
{
  const marker = 'if ("serviceWorker" in navigator';
  const start = html.indexOf(marker);
  if (start === -1) {
    throw new Error('build-html: serviceWorker bloğu bulunamadı, kaynak değişmiş olabilir');
  }
  const closeMarker = /\r?\n\}\r?\n/;
  closeMarker.lastIndex = 0;
  const rest = html.slice(start);
  const m = closeMarker.exec(rest);
  if (!m) {
    throw new Error('build-html: serviceWorker bloğunun kapanışı bulunamadı');
  }
  const closeAt = start + m.index;
  html = html.slice(0, start) + html.slice(closeAt + m[0].length);
}
// PWA manifesti ve apple-touch-icon: native uygulamada karşılığı yok
html = html.replace(/^\s*<link rel="manifest"[^>]*>\s*$/m, '');
html = html.replace(/^\s*<link rel="apple-touch-icon"[^>]*>\s*$/m, '');

for (const banned of ['serviceWorker', 'manifest.json', 'apple-touch-icon']) {
  if (html.includes(banned)) {
    throw new Error(`build-html: "${banned}" hâlâ çıktıda — regex tutmadı`);
  }
}
if (!html.includes('btn-newgame')) {
  throw new Error('build-html: oyun içeriği kaybolmuş (btn-newgame yok)');
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  '// ÜRETİLMİŞ DOSYA — elle düzenlemeyin.\n' +
    '// Kaynak: ../index.html · Üretici: scripts/build-html.mjs\n' +
    `export const GAME_HTML = ${JSON.stringify(html)};\n`,
  'utf8'
);

console.log(
  `build-html: ${before} → ${html.length} karakter, ${OUT.split('/').pop()} yazıldı`
);
