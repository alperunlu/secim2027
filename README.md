# Seçim 2027

100 günlük bir seçim kampanyasını yönettiğin, Türkçe bir siyasi strateji oyunu.
Bir ittifak seçersin, her gün tek bir karar verirsin, kararların anket
oranını, bütçeni, teşkilat sadakatini ve bölgesel desteğini etkiler.
Kampanya, seçim gecesi canlı sayımla ve sonuç ekranıyla biter.

Tüm partiler, liderler ve olaylar kurgusaldır.

## Mimari

Oyunun tamamı **tek bir dosyada** yaşıyor: [`index.html`](index.html).
Harici bağımlılığı yok — CDN, build adımı, bundler gerekmez. Bu dosyayı
bir tarayıcıda açman oyunu çalıştırmaya yeter.

İki farklı paketleme yolu bu tek dosyayı sarmalıyor:

- **PWA / web** — `manifest.json` + `sw.js`, `index.html`'i doğrudan
  yayınlar. Statik herhangi bir sunucuya (GitHub Pages dahil) koyulabilir.
- **iOS/Android (native)** — [`mobile/`](mobile/) altında ayrı bir
  Expo/React Native paketi. `index.html`'i bir WebView içinde çalıştırır;
  native tarafta yalnızca kayıt (AsyncStorage köprüsü), haptik geri
  bildirim ve paylaşım sayfası gibi cihaz özellikleri var
  ([`mobile/bridge.js`](mobile/bridge.js), [`mobile/App.js`](mobile/App.js)).

`index.html` **tek kaynak**. `mobile/game-html.js` bundan otomatik üretilir
— elle düzenlenmez (bkz. aşağıda).

```
index.html          ← oyunun tamamı: HTML + CSS + JS, tek dosya
manifest.json, sw.js ← PWA/web paketleme
assets/              ← ikon, harita SVG'leri
mobile/               ← Expo/React Native iOS-Android sarmalayıcı
  App.js              ← WebView kurulumu, kayıt tohumlama, splash
  bridge.js           ← WebView ↔ native köprüsü (kayıt, haptik, paylaşım)
  game-html.js         ← ÜRETİLMİŞ — elle düzenleme
  scripts/build-html.mjs ← index.html → game-html.js dönüştürücüsü
  eas.json, app.json    ← EAS build/submit profilleri
```

App Store Connect listing metni ve ekran görüntüleri repo dışında,
diskte ayrı tutuluyor (App Store Connect'e girerken elle kullanılır,
koda bağımlı değil).

## Geliştirme

Oyunda değişiklik yapmak için tek dosyayı düzenle:

```bash
# herhangi bir statik sunucu ile aç, örn.:
npx serve .
```

## Mobil pakete senkronla

`index.html`'de değişiklik yaptıktan sonra, native build almadan önce
**mutlaka** şunu çalıştır:

```bash
cd mobile
npm install       # ilk kurulumda, veya bağımlılıklar değiştiyse
npm run sync-game # index.html -> game-html.js
```

Bunu atlarsan native pakette hâlâ eski oyun içeriği olur — `npm run
prestart`, `expo start` çalıştırdığında bunu otomatik yapar, ama
`eas build` bunu **yapmaz**; `game-html.js`'in güncel ve commit'lenmiş
olması senin sorumluluğunda.

## TestFlight'a build alma

```bash
cd mobile
npx eas build --platform ios --profile testflight
# build bitince:
npx eas submit --platform ios --profile testflight --latest
```

`eas.json`'da `testflight` profili `production`'ı `autoIncrement: true`
ile extend ediyor — sürüm numarasını elle artırmana gerek yok.

## Gizlilik

Oyun hiçbir kişisel veri toplamaz, sunucuya göndermez. Kampanya
ilerlemesi yalnızca cihazda tutulur. Ayrıntı: [`PRIVACY.md`](PRIVACY.md)
· yayınlanan sayfa: [`privacy.html`](privacy.html)

## Lisans

[LICENSE](LICENSE)
