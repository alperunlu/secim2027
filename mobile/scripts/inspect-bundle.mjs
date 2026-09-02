/**
 * Hermes .hbc dosyasında dize arar. Hermes salt-ASCII dizeleri tek bayt,
 * ASCII-dışı (Türkçe karakter, emoji, — gibi) dizeleri UTF-16 saklar.
 * Düz bir grep bu yüzden var olan bir dizeyi "yok" gibi gösterebilir —
 * her iki kodlamayı da tarıyoruz.
 */
import { readFileSync } from 'node:fs';

const [, , bundlePath, ...args] = process.argv;
if (!bundlePath) {
  console.error('kullanım: node inspect-bundle.mjs <bundle.hbc> --require X --forbid Y');
  process.exit(2);
}

const require_ = [];
const forbid = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--require') require_.push(args[++i]);
  else if (args[i] === '--forbid') forbid.push(args[++i]);
}

const buf = readFileSync(bundlePath);
const asAscii = buf.toString('latin1');
const asUtf16 = buf.toString('utf16le');

function contains(needle) {
  return asAscii.includes(needle) || asUtf16.includes(needle);
}

let fail = false;

console.log(`bundle: ${bundlePath} (${(buf.length / 1024 / 1024).toFixed(2)} MB)\n`);

for (const s of require_) {
  const ok = contains(s);
  console.log(`${ok ? '✓' : '✗'} bulunmalı: "${s}"`);
  if (!ok) fail = true;
}
for (const s of forbid) {
  const ok = !contains(s);
  console.log(`${ok ? '✓' : '✗'} bulunmamalı: "${s}"`);
  if (!ok) fail = true;
}

process.exit(fail ? 1 : 0);
