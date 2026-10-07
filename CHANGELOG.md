# Değişiklik günlüğü

Biçim: [Keep a Changelog](https://keepachangelog.com/tr-TR/1.1.0/). Sürümleme: [SemVer](https://semver.org).

## [Unreleased]

Açık kaynak yayınına hazırlık.

### Eklendi
- MIT lisansı (`LICENSE`) ve paket meta alanları (`license`, `author`, `repository`, `homepage`, `bugs`, `keywords`).
- İngilizce `README.md`, Türkçe `README.tr.md`, `CONTRIBUTING.md`, `SECURITY.md`.
- GitHub Actions CI: resmi Playwright imajında build, `dist/` güncellik denetimi, birim ve e2e testleri.
- Linux görsel temel görüntüleri (`*-linux.png`).
- Yayın öncesi inceleme raporu `docs/audits/` altına taşındı ve her bulgunun durumu güncellendi.
- Topluluk ve yönetişim dosyaları: `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1), `ACCESSIBILITY.md`, issue formları (hata, erişilebilirlik, özellik, dokümantasyon), PR şablonu, `CODEOWNERS`, Dependabot.
- CI denetimleri: PR başlığı (Conventional Commits), bağımlılık incelemesi, CodeQL; bütün action'lar commit SHA'sına sabitlendi.
- README kahraman görseli ve kaynağı (`.github/assets/hero.html`, `tools/readme-hero.mjs`).

## [0.4.0] - 2026-10-06

[Yayın öncesi incelemenin](docs/audits/2026-10-pre-release-review.md) yayınla ilgili olmayan bulguları düzeltildi. Kod içi yorumların hepsi İngilizceye çevrildi.

### Değişti (kırıcı)
- **Paket girişi:** `module`, `main` ve `exports["."]` artık derlenmiş `dist/hendese.esm.js` dosyasını gösterir; önceden derlenmemiş `src/js/index.js` geliyordu ve `version` değeri `'dev'` dönüyordu. IIFE (`dist/hendese.js`) `unpkg`/`jsdelivr` alanlarından ve `./dist/*` yolundan alınır. `./package.json` dışa açıldı; `engines.node >= 21`.
- **Kontrol listesi kaydı:** ilerleme sıra numarasıyla değil öğe kimliğiyle saklanır (`id`, varsayılan olmayan `value`, yoksa öğe metni). Böylece araya adım eklemek, yapılmamış bir adımı "yapıldı" göstermez. Önceki sürümlerin dizi biçimi ilk açılışta bir kez taşınır.
- **İstasyon gezgini:** bitmiş halde (JS'siz ve baskıda) bütün açıklamalar görünür; seçili olmayanları JS gizler. Sayfaya `class="show"` elle yazılmaz.
- **Kahraman girişi:** `.intro-pending`/`.intro-go` kuralları `@media screen` altına alındı ve entegratör kancası olarak belgelendi; kütüphane bu sınıfları eklemez.
- **`[data-reveal="draw"]`:** çizim animasyonu yalnız `pathLength="1"` taşıyan şekillere uygulanır; özniteliği olmayan şekiller artık kalıcı noktalı kalmaz.

### Eklendi
- `<html data-theme-key="…">`: `head.js` ve `Hendese.init()` özel tema anahtarını buradan okur; `init({themeKey})` artık ilk boyamada da geçerlidir.
- Yazı tipi lisansları: IBM Plex Mono OFL metni eklendi; bütün OFL dosyaları `dist/fonts/` içine kopyalanır.
- Regresyon testleri: `tests/e2e/robust.spec.mjs` (11 test) ve `math` uç değerleri.

### Düzeltildi
- **Motor:**
  - Bir sahnede, kancada ya da bileşende atılan hata artık döngüyü kalıcı olarak durdurmaz; her çağrı ayrı çalışır ve hata raporlanır.
  - Bilinmeyen Hoca pozu `idle` olarak çizilir.
  - `start()` sonrasında kaydedilen sahneler hemen o anki moda girer; Hoca ilk ihtiyaçta oluşturulur.
  - Eksik alt öğesi olan sahne uyarıyla atlanır; boş kök (`$(s, null)`) bütün belgeyi aramaz.
  - Yükseksiz çizim `NaN` üretmez; `clamp01(NaN)` 0 döner.
  - Sahne kapanınca yazarın satır içi stili ve sınıfları geri yüklenir.
- **Gezinme:**
  - Bölüm içindeki bir hedefe (şekil, dipnot) gidiş, çevreleyen bölümü işaretler; sayaç artık `0-1` göstermez.
  - Yüzde kodlu (ASCII dışı) kimlikler eşleşir; `replaceState` her karede çağrılmaz ve `history.state` korunur.
  - Derin bağlantı, kullanıcı kaydırana kadar hedef bölümde kalır.
  - Çekmece, ekran 1100px üstüne çıkınca odak tuzağını bırakır.
  - Okuma çubuğu esneme kaydırmasında eksiye düşmez.
  - Kesirli genişliklerde (1099–1100px) CSS ve JS eşiği artık aynıdır: `(width < 1100px)`.
- **HUD ve Hoca:**
  - HUD, yeni sahnenin vermediği alanları temizler.
  - `hoca.dismiss()` reduced motion'daki durgun kopyaları da kaldırır.
  - Ev noktası olmayan sayfada Hoca, sol üst köşeye yürümek yerine gizlenir.
- **Bileşenler:**
  - Yalnız ikonlu kopyala düğmesi çalışır; sonuç ayrı bir durum düğümünden bir kez duyurulur; ardışık tıklamalarda zamanlayıcılar çakışmaz.
  - Kart görünümündeki tablo etiketleri `colspan`'ı sayar, başlıktaki düğme ve ölçü notu metnini almaz; `<th data-th>` ile ezilebilir.
  - Kart görünümünde gizli başlıktaki denetimler odak almaz.
  - Gezgin önizlemesi canlı bölgeyi konuşturmaz; yalnız seçim duyurulur.
  - Seçili rozeti erişilebilir ada girmez.
  - Sekmeler Alt/Ctrl/Meta kombinasyonlarını tarayıcıya bırakır; olay yalnız seçim değişince yayılır.
  - Form alanı, sayfanın sonradan eklediği `aria-describedby` kimliklerini korur.
  - Boş kontrol listesi "tamamlandı" görünmez.
- **Erişilebilirlik ve görünüm:**
  - Kontrol listesi kutusu kenarı 3:1 kontrasta çıktı.
  - Geçersiz alanın kırmızı kenarı üzerine gelince kaybolmaz.
  - Atlama bağlantısı üzerine gelince kontrastını korur.
  - Birimli alanın birleşen köşeleri düzleşti (mantıksal köşe özellikleri).
  - Diyalog odak çerçevesi dinlenme çerçevesinden ayrışır.
  - Zorunlu renk modu (forced colors): HUD çubuğu, okuma çubuğu, etkin bölüm bağlantısı, şimdiki kayıt satırı, kod imleci ve `aria-disabled` sistem renkleriyle çizilir.
- **Düzen ve baskı:**
  - Dar ekranda üst çubuk açık çekmeceyi ve kapat düğmesini örtmez.
  - Pin çerçevesi dar sütunda tek sütuna iner.
  - Baskıda kod blokları ve koyu tema koyu mürekkeple basılır.
  - Geniş tablolar ve uzun kod satırları kâğıtta kesilmez.
- **Araçlar:**
  - Build ve demo üreticisi, boşluk ya da ASCII dışı karakter içeren yollarda çalışır (`fileURLToPath`).
  - Yayın zip'i Node'da yazılır; önceki sürümlerde `tar -a` GNU tar ile zip yerine tar üretiyordu.
  - Yayın betiği build sonrasında ağacın değişmediğini doğrular ve CHANGELOG'da en üstte tarihli başlık arar.
  - Demo üreticisi kaynağı silinen sayfaları kaldırır, bütün yinelenen `order` değerlerini raporlar ve bozuk meta JSON'unda dosya adını verir.
  - Standart testi:
    - yorumları tüm dosyada temizler;
    - çok satırlı değerleri, eksi boşlukları, modern renk fonksiyonlarını, adlı renkleri, `rem`/`pt` yazı boyutlarını ve kullanılmayan `std:ok` işaretlerini yakalar.
  - `tools/icons-inline.mjs` kaldırıldı; sprite `docs/_sablon.html` içine bir kez gömüldü.

## [0.3.0] - 2026-10-06

Yeni parçalar; hepsi `STANDART.md`'ye göre yazıldı ve kod incelemesinden geçti.

### Eklendi
- Form alanı:
  - kap ve alanlar: `.field` (etiket, input, textarea, select), `.field-help`, `.field-error`, `.field-row`, birimli alan `.field-unit`;
  - durumlar: geçersiz `aria-invalid="true"` ya da `:user-invalid` (kenar ve hata metni), devre dışı kesikli kenar, `:required` için `--str-required` işareti (erişilebilir ada girmez);
  - hata metni yalnız alan geçersizken `aria-describedby`'a bağlanır (`widgets.js`).
- Onay, radyo ve kaydırıcı: `.field-check` (yerel öğe, `accent-color`), `fieldset.field`, `input[type=range]` + `output`.
- Sekmeler:
  - yapı: `.tabs[data-tabs]` (ARIA tablist, roving tabindex, oklar/Home/End), panel başlığı `.tab-h`, olay `hendese:tab`;
  - JS'siz ve baskıda tüm paneller başlıklarıyla görünür.
- Diyalog: yerel `<dialog class="dialog">`, `command`/`commandfor` ile açılır; Invoker Commands desteklemeyen tarayıcı için küçük yedek.
- Ölçü notu: `popovertarget` + `.dim-tip[popover]`, tıklayınca açılan ipucu; anchor positioning varsa düğmeye bağlanır.
- Boş durum: `.empty`.
- Parça sayfaları: form alanları; onay, radyo ve kaydırıcı; sekmeler; diyalog; ölçü notu; boş durum. Bileşenler dokümanına "Form ve kaplar" bölümü.
- Metin token'ları: `--str-error`, `--str-required`.

### Değişti (kırıcı)
- `--ease`, `--t-fast`, `--t-med` silindi; yerine `--ease-out`, `--dur-1`, `--dur-3`.

### Düzeltildi
- Parça sayfası üreticisi, etiket değerinde HTML olan `<demo label="…">` öğesini kesiyordu (düğmeler sayfasında etiket "true" görünüyordu).
- Doküman örnek kutusunun son öğe kuralı yerel diyaloğun `margin:auto` değerini eziyordu; diyalog ekranın altında açılıyordu.

### Bilinçli olarak eklenmedi
- Anahtar (switch): `.toggle-btn` ve onay kutusu karşılıyor.
- Bildirim (toast): geri bildirim satır içi veriliyor (kopyalama etiketi, `.readout`, `.rb-done`).
- Yükleniyor iskeleti: statik sayfa eşzamansız içerik yüklemiyor; bekleme `aria-busy` ve metinle anlatılır.
- Zaman çizelgesi: `.survey-log` ve `.s-*` karşılıyor.

## [0.2.0] - 2026-10-06

Sistem mantığı ve standart sürümü. Ayrıntı: `STANDART.md`.

### Eklendi
- `STANDART.md`: token, durum, etkileşim durumu, yerleşim, bitmiş hal, erişilebilirlik, dil ve parça sayfası kuralları; yeni parça kontrol listesi.
- Standart denetimi:
  - `tests/unit/standard.test.mjs`, bileşen CSS'inde ham yazı boyutu, boşluk, köşe, süre, z-index ve renk yazılmasını yasaklar; gerekçeli istisna `/* std:ok … */` en fazla 15 tane olabilir;
  - aynı test, bileşen ve blueprint CSS'indeki her sınıfın bir sayfada gösterilmesini ister;
  - `tools/demos.mjs`, her parça sayfasında zorunlu meta alanlarını ve grubun zorunlu bölümlerini denetler.
- Token ölçekleri:
  - yazı: `--fs-xs … --fs-2xl`, `--fs-h2`, `--fs-display`;
  - boşluk: `--sp-1 … --sp-11`;
  - köşe: `--r-xs`, `--r-pill`;
  - katman: `--z-*`;
  - diğer: kod renkleri (`--code-ink-2`, `--code-fill`, `--code-fill-2`), `--shadow-drawer`, `--scene-shade`.
- Tek renkten tema: `--draw`, `--accent-soft`, `--pencil`, `--pencil-2` artık `--accent`'ten türer. Temayı değiştirmek için `:root`'ta yalnız `--accent` ve `--accent-2` ezilir.
- Durum standardı:
  - `.s-ok`, `.s-warn`, `.s-bad`, `.s-sec`, `.s-neutral`, `.s-accent`; servis sınıflarının zemini otomatik;
  - `.pill`, `.state`, `.readout`, `.check`, `.co`, `.steps>li`, `.survey-log>li`, `.cells>i` ve `.lamp` aynı `--c`/`--c-soft` sözleşmesini okur.
- Etkileşim durumları:
  - devre dışı (`:disabled`, `[aria-disabled]`): kesikli kenar;
  - adımlarda `aria-current` ve `data-state="done|blocked"`;
  - kopyalama sonucu `data-state="done|fail"`, `aria-live` ile duyurulur.
- Kap sorguları: `col` (`main`, `.sticky-text`) ve `fig` (`.f-map`, `.fig-sheet`, `.sticky-fig`). Dar varyant artık paket deseni: `--naw`/`--nah`, `.is-wide`/`.is-nar`, `--nx`/`--ny`/`--nw`; sayfada CSS gerekmez.
- Tariflerden pakete taşınanlar:
  - etiket ve hücre: `.tag`/`.tag.is-ghost`, `.cells` (`data-state="miss|ghost"`, `data-mark`);
  - ibre: `.needle`/`.needle.is-actual`;
  - lamba: `.lamp` (`data-state="on|ghost"`, `.s-*`), `.lamps`;
  - diğer: çizimde ölçeklenen `.stamp-k`, `.fill-shade`, `.fill-soft`, `.ln-c`.
- Yardımcılar: `.visually-hidden`, `.tnum`, `.ic`, tablo sayı sütunu `.num`. İkonlar boyutunu yazıdan alır (1em).
- Sahneler ve uyum:
  - `.scene-light`;
  - kendi pafta zemini olmayan `.scene-dark`/`.scene-light` kabı sahne zeminini otomatik alır;
  - `prefers-contrast: more` ve `forced-colors` kuralları.
- `<ol class="steps" start="4">`: numaralandırma yerleşik `list-item` sayacıyla çalışır.
- Bileşen sayfalarına "Durumlar" bölümleri eklendi; Blueprint tarifleri ve parça sayfaları paket sınıflarına taşındı.

### Değişti (kırıcı)
- Yazı boyutları ve boşluklar en yakın ölçek adımına yuvarlandı:
  - yazı en çok ±0.5px (9 ve 10px etiketler 11px'e, 20px numara 22px'e, kod 13px'ten 12.5px'e);
  - boşluk en çok ±2px.
- Köşeler: `.btn`, `.icon-btn`, `.skip`, adım rozeti ve kontrol listesi satırı 6px; `.station` köşesiz.
- Hareket: `--t-fast` 160ms'den 120ms'ye indi; `.8s` hero girişi `--dur-4` (650ms).
- `.pill` ve diğer durum bileşenleri artık kendi `--c` varsayılanını verir; üst öğeden durum rengi almaz.
- Kap sorgusu kırılımları:
  - pafta, pencere 1099px yerine sütun 760px'in altında tek sütuna geçer;
  - tanım listesi 640px sütunda tek sütun olur;
  - tablo kartı ve saha defteri sütuna göre değişir; sticky metin sütunundaki tablolar statik modda da kart olur.
- Tablo kartı yalnız JS varken açılır; JS'siz dar kapta tablo yatay kayar.
- Koyu tema: `--paper` #1a2331, `--draw` #8aaeff (`--accent`).
- `lang.js`: `englishStems` artık büyük harfle basılan her etiketi tarar, seçici listesiyle sınırlı değil.

### Kullanımdan kalkıyor
- `--ease`, `--t-fast`, `--t-med` (0.3'te silinir).
- `.pill-ok`, `.pill-neutral`, `.state.ok/.warn/.bad`, `.readout.ok/.bad`, `.p-auto/.p-manual/.p-inline` (1.0'da silinir; `.s-*` kullanın).

### Düzeltildi
- Adım içindeki `.check` rengi `.steps>li p` kuralına yeniliyordu.
- Basılı ve devre dışı aç/kapa düğmesi kırmızı kesikli kenarla çiziliyordu.
- Katlanan pin beat'inin yüksekliği eski 10.5px'e göre hesaplanıyordu.
- Reduced-motion'da durgun Hoca kopyası, dar varyantın hesaplanmış `--aw`/`--ah` değerini okumuyordu.
- Kod bloğu içindeki servis renkleri ve kopyalama sonucu açık temada koyu zemine göre okunaksızdı (`.code` artık koyu şemada).
- Koyu temada kontrol listesi işaretinin kontrastı düşüktü.

## [0.1.1] - 2026-10-06

### Eklendi
- Parça sayfaları (`demos/`): 37 parçanın her biri kendi sayfasında; varyantlar, durumlar, bağlam örnekleri, yap/yapma çiftleri ve galeri (`demos/index.html`). Kaynaklar `demos/_src/`, üretici `tools/demos.mjs` (`npm run build` içinde).
- e2e: her parça sayfası açık + koyu temada konsol hatası, dış istek, taşma ve axe denetiminden geçer.

### Düzeltildi
- Hareket motoru:
  - sahnenin Hoca talebindeki `hidden` kontrolcüye ulaşmıyordu (belgelenmiş ama etkisizdi);
  - `Hendese.refresh()` canlı modda devir durumunu sıfırlıyor, Hoca'nın yürüme/solma geçişi zıplamaya dönüşüyordu;
  - `api.aw`/`api.ah` kayıt anında donuyordu; pin ve fig sahneleri kap sorgusuyla değişen `--aw`/`--ah`'ı okumuyordu. Artık her `measure()`'da güncellenir;
  - pin ve sticky `render()` dönüşündeki `tb` (HUD antet hali) yok sayılıyordu;
  - durgun Hoca kopyasında balon sol kenara sığmıyorsa sağa geçmiyordu.
- Kontrol listesi: kayıt yokken HTML'deki `checked` işaretleri siliniyordu.
- Taşan `.tbl` klavyeyle kaydırılamıyordu (axe `scrollable-region-focusable`); kap artık odaklanabilir.
- Koyu temada seçili segmentteki ikincil metin (`.choice small`) AA kontrastının altındaydı.
- Mono yazı 600 ağırlıkta tarayıcının sahte kalınıyla çiziliyordu; IBM Plex Mono 600 eklendi. Tüm `@font-face` kurallarına `unicode-range` eklendi (sayfa yalnız gereken alt kümeyi indirir).
- `.pillrow` öğeleri dikeyde ortalanır (yan yana düğme ve durum etiketi); `.co-body` son öğesi liste ya da kod olsa da alt boşluk bırakmaz; yinelenen `.s-k8s` kuralı kaldırıldı.
- Doküman örnek kutusundaki kod sıfırlaması (`.demo .code`) örneğin içindeki canlı kod bloklarını da etkiliyordu; artık yalnızca kutunun kendi kod alanına uygulanır.

## [0.1.0] - 2026-10-06

### Eklendi
- Token'lar: açık/koyu renkler `light-dark()` ile tek satırda; hareket token'ları (`--dur-*`, `--ease-out`, `--ease-in-out`, `--ease-snap`); metin token'ları.
- `@layer` ile katmanlı CSS: tokens, base, layout, components, blueprint, motion, hoca, print.
- Gömülü fontlar: IBM Plex Sans/Mono ve Pixelify Sans (latin + latin-ext, OFL). Dışarıya istek yok.
- Bileşenler:
  - kod bloğu, callout, tablo, adımlar ve kontrol listesi (`data-store`, `hendese:runbook` olayı);
  - seçim grupları (`.choice`, `.choice.is-seg`), `.toggle-btn` ve `.readout`;
  - değişken kaydı, damga ve saha defteri;
  - diff kenar şeridi ve kod içi yürütme imleci.
- Blueprint: pafta, çizim birimleri, etiketler, çizgi aileleri, antet, istasyon gezgini (`data-explorer`, `hendese:explore` olayı), `.fig-sheet` ve `.scene-dark`.
- Hareket motoru:
  - tek rAF döngüsü; boşta uyur;
  - `pinScene`, `stickyScene`, `figScene` ve düşük seviyeli `scene`;
  - HUD;
  - bölüm takibi, okuma çubuğu, hash kilidi ve yeniden demirleme;
  - `.sticky--dense`, kalem taslağı ve CSS-only `[data-reveal]`.
- Hoca:
  - 21 pozlu sprite;
  - kontrolcü (ev noktası, sessiz bölüm, yürüme ve solarak geçiş);
  - reduced-motion için durgun kopyalar.
- Dokümantasyon (`docs/`, 6 sayfa), başlangıç sayfası (`starter/`), esbuild ile build, birim ve e2e testleri.

### Düzeltildi (kaynak sayfaya göre)
- WCAG AA kontrastı (axe, açık + koyu): açık temada `--ink-3` #60656e, `--ok` #127a4c, `--warn` #93610f, `--bad` #c23434, `--aws` #9c5600, `--gitlab` #b54418, `--argo` #ad4829; koyu temada `--ink-3` #8a93a3. Değerlendirmede istisnalar:
  - `--ok` ve `--warn`, en koyu yüzeyde (`--surface-3`) 4.5'in hemen altında kalıyor (4.48 / 4.43);
  - hareket modunda etkin olmayan beat'ler bilerek soluk; axe reduced-motion modunda koşar.
- `.state` çizim dışında kullanıldığında font tanımı geçersiz kalıyordu (`--u` yoktu); artık her yerde mono, 600.
- Katlanan pin beat'lerinde alt satırın üst kenarı görünüyordu.
- `.scene-dark` içindeki sınıfsız metin açık temanın mürekkep rengini koruyordu.
- Eksik `.s-k8s` rozet rengi eklendi.
