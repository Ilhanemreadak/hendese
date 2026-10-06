# Değişiklik günlüğü

Biçim: [Keep a Changelog](https://keepachangelog.com/tr-TR/1.1.0/). Sürümleme: [SemVer](https://semver.org).

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
