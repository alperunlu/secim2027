/**
 * store/screenshots/*.png dosyalarını App Store Connect'in kabul ettiği
 * tam piksel ölçüsüne (1284×2778) yeniden boyutlandırır.
 *
 * Neden gerekli: ekran görüntüleri 1290×2796 (iPhone 15/16 Pro'nun 6.3"
 * simülatör çözünürlüğü) olarak alınmış, ama App Store Connect'in ekran
 * görüntüsü slotu yalnızca şu tam ölçüleri kabul ediyor:
 *   1242×2688, 2688×1242, 1284×2778, 2778×1284
 * En/boy oranı farkı ~%0.18 — göz ile fark edilmez, düz ölçekleme yeterli.
 */
import Jimp from 'jimp-compact';
import { readdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dir = resolve(here, '../../store/screenshots');
const TARGET_W = 1284;
const TARGET_H = 2778;

const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png'));
if (!files.length) {
  throw new Error(`resize-screenshots: ${dir} içinde PNG bulunamadı`);
}

for (const f of files) {
  const p = join(dir, f);
  const img = await Jimp.read(p);
  const { width, height } = img.bitmap;
  if (width === TARGET_W && height === TARGET_H) {
    console.log(`${f}: zaten ${width}x${height}, atlandı`);
    continue;
  }
  await img.resize(TARGET_W, TARGET_H).writeAsync(p);
  console.log(`${f}: ${width}x${height} -> ${TARGET_W}x${TARGET_H}`);
}
