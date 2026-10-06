# Hendese

> *hendese* (Osmanlıca): geometri, ölçme bilgisi; "mühendis" kelimesinin kökü.

Hendese, teknik doküman, eğitim ve araç sayfaları için bir **teknik çizim (blueprint) tasarım dilidir**. Kapsamı:

- token'lar, temel stil, sayfa iskeleti ve bileşenler;
- çizim primitifleri ve kopyala-yapıştır çizim tarifleri;
- kaydırmaya bağlı sahne motoru (pin, sticky, fig) ve HUD göstergesi;
- piksel maskot **Hoca**.

Çalışma zamanında bağımlılığı yoktur ve dışarıya istek atmaz (fontlar pakete gömülü).

```
dist/hendese.css        tüm tema (fontlar dist/fonts/)
dist/hendese.inline.css aynısı, fontlar base64 gömülü (tek dosyalık sayfalar)
dist/hendese.js         motor + bileşenler, global `Hendese` (IIFE)
dist/hendese.esm.js     ES modül
dist/head.js            flaşsız tema satırı
dist/icons.svg          ikon sprite'ı
```

Dokümantasyon `docs/` klasöründedir; `docs/index.html` dosyasını tarayıcıda açın. Her parçanın varyantları, bağlam örnekleri ve yap/yapma çiftleri ayrı sayfalardadır: `demos/index.html` (kaynaklar `demos/_src/`, üretici `tools/demos.mjs`, `npm run build` içinde koşar). Kopyala-başla sayfası `starter/index.html`.

Yeni parça eklerken ya da bir parçayı değiştirirken **[STANDART.md](STANDART.md)** izlenir: token ölçekleri, durum sözleşmesi (`--c`/`--c-soft`, `.s-*`), etkileşim durumları, kap sorguları ve parça sayfası yapısı. `npm test` bu kuralları denetler (`tests/unit/standard.test.mjs`, `tools/demos.mjs`).

## Hızlı başlangıç

```html
<head>
  <script>/* dist/head.js içeriği */</script>
  <link rel="stylesheet" href="hendese/dist/hendese.css">
</head>
<body>
  <!-- dist/icons.svg içeriği (ilk yorum satırı hariç) -->
  …
  <script src="hendese/dist/hendese.js"></script>
  <script>
    Hendese.init();                 // tema, çekmece, bölüm takibi, bileşenler
    Hendese.pinScene({ … });        // sahneler (isteğe bağlı)
    Hendese.start();                // ölçüm + canlı mod
  </script>
</body>
```

`init` seçenekleri:

| Seçenek | Varsayılan | Açıklama |
|---|---|---|
| `strings` | Türkçe metinler | Arayüz metinleri. |
| `themeKey` | `'hendese-theme'` | localStorage anahtarı. |
| `topId` | `'top'` | Sayfa başının id'si. |
| `englishStems` | yok | `RegExp`: büyük harfle basılan her etiketteki İngilizce kelimelere `lang="en"` ekler (Türkçe büyük İ sorunu). |

Temayı tek renkle değiştirmek: `:root{--accent:light-dark(#0f766e,#5eead4);--accent-2:light-dark(#0b5d57,#99f6e4)}`. Çizim, kalem ve vurgu zemini `--accent`'ten türetilir; `--accent-2` bağlantı rengidir, kontrastını elle doğrulayın.

## Felsefe

1. **Son hal her zaman doğrudur.** HTML ve CSS bitmiş çizimi tarif eder; animasyon oraya giden yoldur. Aşağıdaki durumların hepsinde son hal görünür:
   - reduced motion;
   - 1100px altı ekran;
   - baskı;
   - JS'siz sayfa.
2. **Tek çizgi ailesi.** Kılavuz, çizim, vurgu ve ölçü. Düz çizgi gerçeği, kesikli çizgi örneği ya da sınırı gösterir. Gölge, gradyan ve parıltı yoktur.
3. **Anlam metindedir.** Çizimler `aria-hidden`'dır; anlattıkları metinde de bulunur.
4. **Az ama yerinde.** Token'lar tek kaynaktır, CSS `@layer` ile katmanlıdır (sizin katmansız CSS'iniz her zaman kazanır), JS tek bir döngüdür ve boşta uyur.

## Geliştirme

```sh
npm install            # yalnızca geliştirme araçları: esbuild, Playwright, axe
npm run build          # src/ → dist/
npm run test:unit      # node:test
npm run test:e2e       # Playwright: konsol hatası, dış istek, taşma, erişilebilirlik (axe), görsel
npm run release        # build → test → CHANGELOG kontrolü → npm pack → zip → git tag
```

Görsel testlerin referans görüntüleri ilk kez `npx playwright test --update-snapshots` ile üretilir. Referanslar işletim sistemine bağlıdır; CI'ya geçildiğinde Linux imajında yeniden üretilmeleri gerekir.

## Sürümleme

[SemVer](https://semver.org). Belgelenmiş sözleşmenin herhangi bir parçası (sınıf, token, data özniteliği, id, olay, storage anahtarı, export) değişirse **majör** sürüm çıkar.

## Lisans

- **Kod:** lisans henüz seçilmedi (dışarıyla paylaşılmadan önce belirlenecek).
- **Fontlar:** SIL Open Font License 1.1 (`src/fonts/OFL-*.txt`).
