# Seçim 2027 — Sanat Yönetimi

## Fikir: "Basın odasının masası"
Oyuncu 100 gün boyunca bir kampanya karargâhının masasında oturur. Masada bir atlas, dosyalar,
gazete kupürleri, mühürler ve anket çıktıları vardır. Her ekran bu masanın bir parçasıdır:
kâğıt, mürekkep ve damga. Dijital arayüz öğesi (parlak gradyan, yuvarlak köşe, emoji) yoktur.

Referans duygu: 1970–90 arası Türk basını, arşiv dosyası, gravür portreler, eski atlaslar.
Suzerain ve Papers, Please'in "belge üzerinde karar" hissi.

## Malzemeler
| Malzeme | Kullanım | Renk |
|---|---|---|
| Kâğıt | Kartlar, sayfalar, paylaşım kartı | `#efe3c8`, gölge `#e6d7b4` |
| Mürekkep | Metin, çizgi, çerçeve, üst/alt çubuk | `#2b2318`, ikincil `#5b4d38` |
| Kızıl mürekkep | Ana eylem, damga, olumsuz etki | `#a8442f` |
| Altın | Oyuncunun kendi değeri, vurgu | `#b8892b` / koyu zeminde `#e8b84b` |
| Deniz | Atlas zemini | `#8ba894`, koyu `#5f7c6a` |
| Bölge mürekkepleri | Harita bölgeleri (baskı mürekkebi tonları, doygunluğu düşük) | `--bolge-*` |

Kural: Ekranda en fazla bir kızıl ana eylem. Altın yalnızca "siz".

## Tipografi (gömülü, OFL)
| Rol | Yazı tipi | Nerede |
|---|---|---|
| Manşet | Playfair Display 700/900 | Başlıklar, olay adları, damga dışı büyük yazılar, bölge adları |
| Metin | Source Serif 4 400/600 (+italik) | Olay metni, seçenekler, açıklamalar |
| Dosya | IBM Plex Mono 400/500/600 | Etiketler, sayılar, tarih, kategori, buton yazıları |

- Sayılar her yerde `lining + tabular`.
- Etiketler: Plex Mono, büyük harf, `letter-spacing: .14–.24em`, küçük punto.
- Büyük harfe çevirme her zaman `toLocaleUpperCase("tr")` veya `lang="tr"` ile.

## Şekil dili
- Köşe yok (0–2px). Çerçeve: 1px mürekkep; önemli yüzeyde çift çizgi (3px double) veya
  dış 3px + iç 1px.
- Gölge: kâğıdın masadan kalkması kadar (`--ad-golge`). Parlama yok.
- Damga: tek çizgi çerçeve, hafif dönük (−4°…−8°), mürekkep tonu sonuca göre
  (zafer `#7a5a0e`, kilit `#4f3a80`, kayıp `#a8442f`).

## Harita
- Atlas dili: tarama (hatch) dokusu, gölgeli kıyı, italik deniz adları.
- Etiket önceliği: bölge adı > oy yüzdesi > şehir > deniz. Uzak görünümde deniz adları soluk.
- Haritaya düşen her işaret (kampanya izi, yapı, vaat) mürekkep simgesidir:
  dolu = gerçekleşti, kesik çizgi = söz/taslak, kızıl = olumsuz.

## Hareket
- Süreler: 160 ms (dokunma), 280 ms (kart), 450–600 ms (kamera, damga).
- Eğri: `cubic-bezier(.2,.8,.2,1)`; damga için hafif aşma.
- Kâğıt kayar, mürekkep yayılır, damga vurur. Zıplayan/esneyen animasyon yok.
- `prefers-reduced-motion` her zaman saygı görür.

## Simge
- 24px ızgara, 1.6px çizgi, kare uç. Tek renk (currentColor). Emoji kullanılmaz.

## Uygulama
Tüm yeni stil `index.html` sonundaki "SANAT YÖNETİMİ KATMANI" bölümüne yazılır.
Eski katmanlardaki çakışan kurallar o bölümden ezilir; yeni ekranlar önce bu rehbere bakar.
