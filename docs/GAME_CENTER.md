# Game Center kurulumu (yeni build gerektirir)

Kod tarafı hazır: `mobile/modules/game-center` (GameKit), `App.js` köprüsü ve
`app.json` içindeki `com.apple.developer.game-center` yetkisi. Oyun, rozet kazanıldığında
ve kampanya bittiğinde `{type:"gc"}` mesajı gönderir. Modül yoksa (eski build, Android,
Expo Go) her çağrı sessizce atlanır; OTA ile gelen kod eski build'i bozmaz.

## App Store Connect'te yapılacaklar
1. Uygulama → Hizmetler (Services) → Game Center → etkinleştir.
2. **Skor tablosu** ekle:
   - ID: `s27_national_vote` · Tür: Klasik, en yüksek skor üstte · Biçim: tam sayı
   - Değer: ilk tur ulusal oy × 10 (örn. %33,4 → 334)
3. **Başarımlar** ekle (her biri 100 puan gizli değil; ad ve açıklamalar oyundaki Rozet Defteri ile aynı):

| ID | Ad | Açıklama |
|---|---|---|
| `s27_win_first` | Sandıktan Birinci | İlk turda birinci çıkın. |
| `s27_historic` | Tarihî Eşik | Tek başına %50'yi aşın. |
| `s27_all_regions` | Yedi Bölge | Yedi bölgenin hepsinde birinci olun. |
| `s27_president` | Köşk | Cumhurbaşkanı seçilin. |
| `s27_kingmaker` | Kilit Parti | Kilit parti olarak desteklediğiniz adayı kazandırın. |
| `s27_kilit_tas` | Kilit Taşı | %15'in altında oyla ikinci turun sonucunu belirleyin. |
| `s27_tough_bargainer` | Çetin Pazarlıkçı | İkinci tur masasından 60 değerinde talep koparın. |
| `s27_baraj` | Meclis Kapısı | Baraj hedefini aşıp Meclis'e girin. |
| `s27_emek_win` | Sınıf Zaferi | Sosyalist Birlik ile hedefinize ulaşın. |
| `s27_debate75` | Stüdyonun Hâkimi | Canlı yayında salonu %75'e taşıyın. |
| `s27_rallies5` | Meydanların Sesi | Bir kampanyada 5 miting yapın. |
| `s27_promises10` | Söz Adamı | Bir kampanyada 10 vaat verin. |
| `s27_alti_ittifak` | Altı Masa | Altı ittifakın hepsiyle bir kampanya bitirin. |

4. Başarım görselleri: 512×512 veya 1024×1024 PNG. Oyundaki mühür dili (kızıl çift halka,
   ortada sembol) önerilir.

## Build
- Bu değişiklik native kod içerdiği için OTA ile gitmez; `eas-build-testflight.yml` iş akışıyla
  yeni build alınır. EAS, Game Center yeteneğini App ID'ye kendisi ekler.
- Sürüm numarasını yükseltmeden (1.1.0) build alınırsa mevcut OTA kanalı bozulmaz.
  Yükseltirsen (1.2.0), OTA'lar yalnızca 1.2.0 kurulumlarına gider.
