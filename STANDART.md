# Hendese standardı

Bu belge, pakete eklenen her parçanın uyması gereken kuralları toplar. Kuralların çoğunu testler denetler:

- **`tests/unit/standard.test.mjs`:** token kullanımı ve her sınıfın bir sayfada gösterilmesi.
- **`tools/demos.mjs`:** parça sayfasının yapısı.
- **`tests/e2e/`:** konsol hatası, dış istek, taşma ve axe denetimi (açık ve koyu temada).

Bir kural testle denetlenemiyorsa aşağıda "elle" diye işaretlidir.

## 1. Token'lar

Bileşen CSS'inde (`base`, `layout`, `components`, `blueprint`, `motion`) ham değer yazılmaz.

| Ne | Token | Ölçek dışı (serbest) |
|---|---|---|
| Yazı boyutu | `--fs-xs` 11 · `--fs-sm` 12.5 · `--fs-md` 14 · `--fs-base` 16 · `--fs-lg` 17.5 · `--fs-xl` 22 · `--fs-2xl` 30 · `--fs-h2` · `--fs-display` | Çizim içi boyut: `max(Npx, calc(M * var(--u)))` |
| Boşluk (padding, margin, gap, inset) | `--sp-1` 4 · `--sp-2` 6 · `--sp-3` 8 · `--sp-4` 10 · `--sp-5` 12 · `--sp-6` 14 · `--sp-7` 16 · `--sp-8` 20 · `--sp-9` 28 · `--sp-10` 32 · `--sp-11` 48 | 0–3px optik düzeltme; çizim birimi `calc(N * var(--u))` |
| Köşe | `--r-xs` 4 · `--r-sm` 6 · `--r-md` 10 · `--r-lg` 14 · `--r-pill` | `0` (çizilen nesneler köşelidir) |
| Süre ve eğri | `--dur-1` 120ms · `--dur-2` 250ms · `--dur-3` 320ms · `--dur-4` 650ms · `--dur-5` 2s; `--ease-out`, `--ease-in-out`, `--ease-snap` | — |
| Katman | `--z-topbar` · `--z-scrim` · `--z-rail` · `--z-hud` · `--z-hoca` · `--z-progress` · `--z-skip` | 0–2 yerel istifleme |
| Renk | `tokens.css` içindeki adlar | Yok. Hex, `rgb()` ve `hsl()` yalnız `tokens.css` içinde yazılır. |

Kurallar:

- **Kullanımdan kalkan adlar:** `--ease`, `--t-fast`, `--t-med`. 0.3'te silinir.
- **Yapısal istisnalar:** satırın sonuna `/* std:ok <gerekçe> */` yazılır. Örnek: kod sütununu kaydıran 54px. Toplam istisna sayısının üst sınırı 15'tir.
- **Özelleştirme:** tema `@layer` içindedir. Kullanan proje kendi katmansız CSS'inde token'ları ezer; seçici gücü gerekmez.

## 2. Durum

Durum taşıyan her bileşen rengini iki değişkenden okur: `--c` (çizgi ve metin) ve `--c-soft` (zemin). Bileşen bu iki değişkenin **kendi varsayılanını verir**; böylece iç içe bileşene sızmaz. Durum renkleri `.s-*` sınıflarıyla gelir:

| Sınıf | Anlam |
|---|---|
| `.s-ok` · `.s-warn` · `.s-bad` · `.s-sec` | başarılı · uyarı · hata · güvenlik |
| `.s-neutral` · `.s-accent` | nötr · vurgu |
| `.s-gitlab` · `.s-aws` · `.s-k8s` · `.s-argo` | servis rengi; zemin otomatik %10 |

`.s-*` sınıflarını kabul eden bileşenler: `.pill`, `.state`, `.readout`, `.check`, `.co`, `.steps>li`, `.survey-log>li`, `.cells>i` ve 0.3'teki form alanları.

Kullanımdan kalkan takma adlar 1.0'da silinir: `.pill-ok`, `.pill-neutral`, `.state.ok/.warn/.bad`, `.readout.ok/.bad`, `.p-auto/.p-manual/.p-inline`. `.co-*` sınıfları renk değil rol adıdır (ipucu, sorun…) ve kalır.

**Renk tek başına anlam taşımaz** (elle). Durum her zaman metinle ya da çizgi deseniyle de söylenir: "başarısız" yazısı, kesikli çizgi gibi.

## 3. Etkileşim durumları

Anlamı karşılayan bir ARIA özniteliği varsa o kullanılır; yoksa `data-state`.

| Durum | Nasıl verilir | Görünüş |
|---|---|---|
| Devre dışı | `:disabled`, `[aria-disabled="true"]` | Kesikli kenar, soluk mürekkep, `cursor:not-allowed` |
| Basılı / seçili | `aria-pressed`, `:checked`, `aria-selected` | Çizim rengi kenar |
| Şimdiki | `aria-current="step\|page\|true"` | 2px çizim kenarı |
| Tamamlandı / engelli | `data-state="done\|blocked"` ve görünür ya da `.visually-hidden` metin | `--c` başarılı ya da hata; engelli kesikli |
| Bekliyor | Bölgeye `aria-busy="true"` | — |
| Geçersiz | `aria-invalid="true"` ya da `:user-invalid` | `--c:var(--bad)` |

Dilin kuralı: **düz çizgi gerçek, kesikli çizgi örnek ya da henüz gerçek değil.** Devre dışı, engelli ve eksik durumların kesikli çizilmesi bundandır.

JS'in yazdığı sınıflar (`.on`, `.past`, `.now`, `.show`, `.complete`, `.is-live`) sayfada elle yazılmaz.

## 4. Yerleşim

- **Kap sorgusu:** bileşenler sayfa genişliğine değil, bulundukları sütuna göre düzenlenir.
  - `col` kabı: `main` ve `.sticky-text`. Kırılımlar: `@container col (max-width:719px)` (tablo kartı, saha defteri, adımlar, kontrol listesi başlığı), `640px` (tanım listesi), `760px` (pafta tek sütun).
  - `fig` kabı: `.f-map`, `.fig-sheet` ve `.sticky-fig`. Dar varyant `575px` altında devreye girer.
- **Pencere genişliğine bakan istisnalar:**
  - kabuk (ray, üst çubuk), hero ve Hoca;
  - canlı hareket eşiği (1100px; JS);
  - `.sheet` mobil yedeği;
  - baskı ve reduced-motion.

## 5. Bitmiş hal

- **CSS varsayılanı bitmiş haldir.** Reduced-motion, 1100px altı, JS'siz ve baskı modunda sayfa eksiksiz okunur.
- **JS yalnızca saklayabilir.** Yalnızca JS'in gösterebileceği bir şeyi CSS saklamaz.
- **Hareket kuralları** yalnız `@media screen` ile `.is-live` ya da `html.motion` altında yazılır. Değişkenler `var(--k,1)` ile okunur.

## 6. Erişilebilirlik

- **Önce yerel öğe:** `button`, `input`, `fieldset`, `dialog`, `details`, `popover`. ARIA yalnız yerel öğe yetmiyorsa kullanılır.
- **Odak:** her zaman görünür. Genel kural `:focus-visible`; gizli input üstüne kurulu denetimlerde `input:focus-visible+span`.
- **Otomatik denetim:** axe, açık ve koyu temada ciddi ya da kritik bulgu vermez. Taşan kaydırma alanı odaklanabilir olmalıdır (`tabindex="0"`).
- **Zorunlu renk (elle):** seçim ve ilerleme sistem rengiyle (`Highlight`) çizilir. Anlam yalnız zemin rengine bağlanmaz.
- **İkonlar:** yalnız ikonlu düğmede `aria-label` zorunludur. Süs ikonu `aria-hidden` ya da metinli kapsayıcının içindedir.

## 7. Dil

- **Kullanıcı metni Türkçedir.** Büyük harfe çevrilen etiketlerde İngilizce kelime `lang="en"` içine alınır; aksi halde "web-api" "WEB-APİ" olarak basılır. Sayfa bunu `Hendese.init({englishStems})` ile otomatik yaptırabilir.
- **CSS ile basılan metinler** (`--str-*`) token'dır; başka bir dil için ezilir.
- **Yasak adlar:** paketin hiçbir yerinde şirket adı ve asistan adı geçmez (`tests/unit/hygiene.test.mjs`).

## 8. Parça sayfası (`demos/_src/<ad>.html`)

**Meta alanları** (hepsi zorunlu): `title`, `group`, `order`, `tagline`, `intro`, `summary`. İsteğe bağlı: `facts`. Aynı grupta aynı `order` iki kez kullanılmaz.

**Zorunlu bölümler:**

| Grup | Zorunlu bölümler |
|---|---|
| Bileşenler | "Durumlar…" ve "Yap / yapma" |
| Blueprint | "Yap / yapma" |
| Hareket, Hoca | "Hareket kapalıyken…" ve "API" |
| Temel | serbest |

**İçerik:**

- Örnekler çeşitlidir; doküman örneklerinin kopyası değildir. Örnek veriler genel adlar taşır (web-api, eu-west-1…).
- Satır içi `style` yalnız yerleşim içindir (genişlik, ızgara) ve token kullanır. Paket bir şeyi karşılamıyorsa satır içi stille taklit edilmez; eksik olarak raporlanır.

## 9. Yeni parça eklerken

1. Yerel öğe ve HTML sözleşmesi; gerekiyorsa en küçük JS (`widgets.js`, data-API).
2. CSS doğru katmana yazılır: `components` ya da `blueprint`. Yalnız token kullanılır, `--c/--c-soft` varsayılanı verilir, `.s-*` kabul edilir.
3. Durumlar (§3), odak, açık ve koyu tema, `.scene-dark` ve `.scene-light`.
4. Kap sorgusu (§4), bitmiş hal (§5) ve baskı.
5. Parça sayfası (§8). Doküman sayfasında gerekiyorsa kısa bir bölüm.
6. CHANGELOG satırı. Kırıcı değişiklik "Değişti (kırıcı)" başlığı altına yazılır.
7. Gönderilmeden önce `npm test` çalıştırılır: build, birim (standart ve yasak adlar), e2e.
