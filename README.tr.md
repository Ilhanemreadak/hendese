[English](README.md) | **Türkçe**

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/hero-dark.png">
    <img src=".github/assets/hero-light.png" alt="Bir Hendese şekli: ölçü çizgisinin altında oklarla bağlanmış üç kutu ve elinde pano tutan piksel maskot Hoca." width="860">
  </picture>

  <h1>Hendese</h1>

  <p><strong>Ölçerek anlatan teknik sayfalar için blueprint (teknik çizim) tarzı bir tasarım dili.</strong></p>

  <p>
    <a href="https://github.com/Ilhanemreadak/hendese/actions/workflows/ci.yml"><img src="https://github.com/Ilhanemreadak/hendese/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="https://github.com/Ilhanemreadak/hendese/releases"><img src="https://img.shields.io/github/v/tag/Ilhanemreadak/hendese?label=s%C3%BCr%C3%BCm" alt="Son sürüm"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/lisans-MIT-blue" alt="MIT lisansı"></a>
  </p>

  <p>
    <a href="docs/index.html">Dokümantasyon</a> ·
    <a href="demos/index.html">Parça galerisi</a> ·
    <a href="starter/index.html">Başlangıç sayfası</a> ·
    <a href="CHANGELOG.md">Değişiklik günlüğü</a>
  </p>
</div>

*hendese* (Osmanlıca): geometri, ölçme bilgisi; "mühendis" kelimesinin kökü.

Hendese dokümantasyon, eğitim ve araç sayfalarını bir mühendisin paftasını çizdiği gibi çizer: kalemle kılavuz, mürekkeple şekil, ölçü çizgileri ve antet. Pakette tasarım token'ları, katmanlı CSS bileşenleri, çizim primitifleri, küçük bir kaydırma sahnesi motoru ve şekiller arasında yürüyüp önemli yeri gösteren piksel maskot **Hoca** var.

> **Durum:** 0.x sürümünde, tek kişi tarafından geliştiriliyor. API belgelenmiş ve testli, ama küçük sürümler arasında değişebilir. Dokümantasyon sayfaları ve varsayılan arayüz metinleri şimdilik Türkçe; İngilizce çevirisi planlanıyor.

## Neden Hendese

- **Son hal her zaman doğrudur.** HTML ve CSS bitmiş çizimi tarif eder; animasyon yalnızca oraya giden yoldur. Hareket azaltılmışsa, ekran darsa, sayfa basılıyorsa ya da JavaScript yoksa okuyucu yine eksiksiz şekli görür.
- **Tek çizgi ailesi, süs yok.** Kılavuz, mürekkep, vurgu ve ölçü çizgisi. Düz çizgi gerçeği, kesikli çizgi örneği ya da sınırı gösterir. Gölge, gradyan ve parıltı yoktur.
- **Anlam metindedir.** Çizimler `aria-hidden`'dır; gösterdikleri her şey metinde de söylenir.
- **Küçük ve öngörülebilir.** Token'lar tek kaynaktır, stiller cascade layer'lardadır (sizin katmansız CSS'iniz her zaman kazanır), JavaScript boşta uyuyan tek bir döngüdür ve çalışırken ağdan hiçbir şey istenmez: fontlar pakettedir.

## Hızlı başlangıç

### İndirme

[Releases](https://github.com/Ilhanemreadak/hendese/releases) sayfasından `hendese-<sürüm>.zip` dosyasını indirin. İçinde `dist/`, dokümantasyon, parça galerisi ve başlangıç sayfası var.

### CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Ilhanemreadak/hendese@v0.4.0/dist/hendese.css">
<script src="https://cdn.jsdelivr.net/gh/Ilhanemreadak/hendese@v0.4.0/dist/hendese.js"></script>
```

### Kaynaktan

```sh
git clone https://github.com/Ilhanemreadak/hendese.git
cd hendese && npm install && npm run build
```

Paket henüz npm'de değil. Yayımlandığında `import * as Hendese from 'hendese'` `dist/hendese.esm.js` dosyasını, `hendese/css` de stil dosyasını gösterecek.

## Kullanım

En küçük sayfa için yalnızca stil dosyası yeter:

```html
<link rel="stylesheet" href="dist/hendese.css">

<div class="co co-tip">
  <span class="co-label">İpucu</span>
  <div class="co-body"><p>İmaj etiketini sabitleyin, <code>latest</code> kullanmayın.</p></div>
</div>
```

Sayfa iskeleti, tema düğmesi, bölüm takibi ve kaydırma sahneleri için betiği ekleyin; sahneleri `init()` ile `start()` arasında kaydedin:

```html
<head>
  <script>/* dist/head.js içeriği: temayı ilk boyamadan önce ayarlar */</script>
  <link rel="stylesheet" href="dist/hendese.css">
</head>
<body>
  <!-- dist/icons.svg içeriği -->
  …
  <script src="dist/hendese.js"></script>
  <script>
    Hendese.init();                       // tema, çekmece, bölüm takibi, bileşenler
    Hendese.pinScene({                    // isteğe bağlı: kaydırmaya bağlı bir şekil
      el: '#deploy',
      render: (p, api) => { api.set('ink', p); return { hud: { stage: p < .5 ? 'build' : 'push' } }; }
    });
    Hendese.start();                      // ölç, hareket izin veriyorsa canlı moda geç
  </script>
</body>
```

Kopyalayıp başlayabileceğiniz eksiksiz sayfa: [`starter/index.html`](starter/index.html).

## Tema

Bütün renkler birkaç token'dan türer. Temayı tek renkle değiştirmek için:

```css
:root {
  --accent: light-dark(#0f766e, #5eead4);    /* çizim mürekkebi, kalem ve yumuşak zeminler bundan türer */
  --accent-2: light-dark(#0b5d57, #99f6e4);  /* bağlantı rengi: kontrastını kendiniz doğrulayın */
}
```

Açık ve koyu tema sistem tercihini izler; `[data-theme-toggle]` düğmeleri temayı değiştirir ve seçimi hatırlar.

## Yapılandırma

`Hendese.init(seçenekler)`:

| Seçenek | Varsayılan | Açıklama |
|---|---|---|
| `strings` | Türkçe | Arayüz metinleri: `intro`, `copy`, `copied`, `copyFail`, `toLight`, `toDark`. |
| `themeKey` | `'hendese-theme'` | Tema seçiminin saklama anahtarı. `head.js` de aynı anahtarı okusun diye `<html data-theme-key="…">` olarak da verilebilir. |
| `topId` | `'top'` | Sayfa başı bölümünün id'si. |
| `englishStems` | yok | `RegExp`; büyük harfli etiketlerdeki İngilizce kelimeleri `lang="en"` içine alır (Türkçedeki noktalı büyük İ sorununu önler). |

Sahneler: `pinScene`, `stickyScene`, `figScene` ve alt seviye `scene`. Çalışma zamanı: `Hendese.state` (`motion`, `idle`, `section`, …), `Hendese.refresh()`, `Hendese.lockTo(id)`, `Hendese.hoca.dismiss()`. Olaylar: `hendese:theme`, `hendese:runbook`, `hendese:explore`, `hendese:tab`.

## Paket içeriği

| Dosya | İçerik |
|---|---|
| `dist/hendese.css` | Bütün katmanlar; fontlar lisanslarıyla `dist/fonts/` altında. |
| `dist/hendese.inline.css` | Aynısı, fontlar gömülü; tek dosyalık sayfalar için. |
| `dist/hendese.js` | Motor ve bileşenler, IIFE (global `Hendese`). |
| `dist/hendese.esm.js` | Aynısı, ES modül olarak. |
| `dist/head.js` | `<head>` içine satır içi konan, tema flaşını önleyen kod. |
| `dist/icons.svg` | İkon sprite'ı. |

## Tarayıcı desteği

Chrome, Edge, Firefox ve Safari'nin güncel sürümleri (2024 ve sonrası motorlar). Hendese cascade layer'lara, kap sorgularına (container queries), `:has()` ve `light-dark()` özelliklerine dayanır. Popover API, anchor positioning, invoker commands ve scroll-driven animations gibi yeni özellikler, yedekleriyle birlikte aşamalı iyileştirme olarak kullanılır. Canlı kaydırma sahneleri 1100 px ve üstünde çalışır; daha dar ekranda sayfa son hali gösterir.

## Erişilebilirlik

Hedef WCAG 2.2 AA. Her CI çalışmasında bütün doküman ve parça sayfaları açık ve koyu temada axe ile denetlenir; davranış testleri çekmece, sekmeler, diyalog ve form alanlarının klavyeyle kullanımını kapsar. Hareket azaltma, baskı ve JavaScript'siz modda her zaman son hal görünür. Nasıl test edildiği ve bir engelin nasıl bildirileceği [ACCESSIBILITY.md](ACCESSIBILITY.md) dosyasında; bilinen eksikler [yayın öncesi incelemede](docs/audits/2026-10-pre-release-review.md) listelenir.

## Dokümantasyon

- [`docs/`](docs/index.html): token'lar, bileşenler, blueprint tarifleri, hareket motoru ve Hoca. Dosyaları tarayıcıda açmanız yeter, sunucu gerekmez.
- [`demos/`](demos/index.html): her parça için ayrı sayfa; varyantlar, durumlar ve yap / yapma çiftleri.
- [`STANDART.md`](STANDART.md): her parçanın uyduğu kurallar. Test paketi bunları denetler.

## Geliştirme

```sh
npm run build        # src/ → dist/, ayrıca demos/ altındaki parça sayfaları
npm test             # build, birim testleri (node:test) ve Playwright paketi
npm run release      # yerel sürüm: denetimler, npm pack, zip ve git etiketi
```

Görsel testlerin temel görüntüleri Windows (`*-win32.png`) ve Linux (`*-linux.png`) için var. CI resmi Playwright imajında çalışır; aynı ortamı yerelde çalıştırmak ya da Linux temel görüntülerini yenilemek için:

```sh
docker run --rm -v "$PWD:/work" -v /work/node_modules -w /work mcr.microsoft.com/playwright:v1.63.0-noble \
  bash -c "npm ci && npx playwright test --update-snapshots=missing"
```

## Katkı

Issue ve pull request'ler açıktır. Önce [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun; bir güvenlik sorununu bildirmek için [SECURITY.md](SECURITY.md) dosyasındaki yolu izleyin.

## Sürümleme

[Semantic Versioning](https://semver.org). Belgelenmiş sözleşmenin herhangi bir parçası (sınıf, token, data özniteliği, id, olay, saklama anahtarı, export) değişirse majör sürüm çıkar. Ayrıntılar [değişiklik günlüğünde](CHANGELOG.md).

## Teşekkürler

- IBM'in [IBM Plex Sans ve IBM Plex Mono](https://github.com/IBM/plex) fontları ve [Pixelify Sans](https://github.com/eifetx/Pixelify-Sans) proje yazarlarının fontu; hepsi SIL Open Font License 1.1 ile.
- İkon geometrisi Feather ve Lucide'ın yaygınlaştırdığı 24 px çizgi kurallarını izler.

## Lisans

Kod [MIT Lisansı](LICENSE) ile yayımlanır. © İlhan Emre Adak. Pakete gömülü fontlar kendi lisanslarını korur: SIL OFL 1.1 (`dist/fonts/OFL-*.txt`).
