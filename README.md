# Umut — Kişisel Portfolyo

React + Vite ile yapılmış, **kartları sürükleyebildiğin** kişisel portfolyo sitesi.

## Özellikler

- 🔐 **Şifreli yönetici modu** — ziyaretçiler sadece görüntüler, düzenleyemez
- 👀 **Ziyaretçi modu** — kartları görürler, senin izin verdiğin sitelere gidebilirler
- 🎨 **7 seçilebilir tema** — varsayılan: **Vişne Çürüğü & Altın** (düz siyah-beyaz dahil)
- 🖱️ Yönetici olarak kartları fareyle **serbestçe sürükle** — konumlar saklanır
- 🔗 Karta **tıkla** → site yeni sekmede açılır
- ➕ "Site Ekle" paneli: başlık, URL, açıklama, **simge seçici**, kapak rengi ve **ziyaretçi izni**
- 🗑️ Kart silme ve "Yerleşimi Sıfırla" (kartları düzenli ızgaraya dizer)
- 📱 Mobilde kartlar otomatik olarak alt alta listelenir

> Kart konumları **ziyaretçiler için de geçerlidir**: ziyaretçi kartları senin
> bıraktığın yerde görür, sadece taşıyamaz.

## 🔐 Yönetici girişi (şifre)

Sağ üstteki **Yönetici Girişi** düğmesine basıp şifreyi girince; kart ekleme,
silme, sürükleme ve "ziyaretçilere aç/kapat" yetkileri açılır.

> **Varsayılan şifre: `umut2026`**

Şifreyi değiştirmek için yeni şifrenin SHA-256 özetini üret:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('YENI_SIFREN').digest('hex'))"
```

Çıkan uzun yazıyı `src/lib/config.js` içindeki `ADMIN_PASSWORD_HASH` değerine yapıştır.

> Not: Bu, tarayıcıda çalışan bir sitede olduğu için **basit bir kilit**tir —
> kaynak koda bakan biri atlayabilir. Siteyi net bir şekilde korumak istersen
> gerçek bir giriş sunucusu (ör. Supabase Auth) gerekir; istersen onu da kurabiliriz.

## 👀 Ziyaretçi modu ve site görünürlüğü

Ziyaretçiler (şifre girmeyenler) kartları görür ama:

| Durum | Ziyaretçi ne olur |
|---|---|
| Kart **🌐 ziyaretçilere açık** | Tıklar ve siteye gider |
| Kart **🔒 kapalı** | Kartı görür, tıklayınca site açılmaz — "ziyaretçilere kapalı" uyarısı çıkar |
| Kart ekleme / silme / sürükleme | Yapamaz (düğmeler görünmez) |

İzni **site eklerken** "Ziyaretçiler bu siteye gidebilsin" anahtarıyla verirsin.
Sonradan değiştirmek için yönetici modunda kartın üstüne gel, **🌐 / 🔒** düğmesine bas.

## Tasarım dili

Tasarım iOS/Apple diline göre kurulmuştur:

- **SF (Apple) yazı tipi** önceliği — Mac/iPhone'da sistem yazı tipi, diğerlerinde Inter
- **Materyal yüzeyler:** `blur(30px) saturate(180%)` buzlu cam, nötr ince kenarlıklar
- **Yumuşak köşeler:** kartlar 22px, butonlar 13px, paneller 26px
- **Sade zemin:** büyük renk lekeleri yerine derin, nötr arka plan + çok hafif ışıma
- iOS tarzı **anahtar (switch)**, "tinted" butonlar ve basılınca küçülen dokunuş geri bildirimi
- Kartlardaki simge, iPhone **uygulama ikonu** gibi yuvarlak köşeli cam kutu içinde
- Simgeler **emoji değil**, tek renk ince çizgili **[Lucide](https://lucide.dev)** ikonları — her cihazda aynı ve net görünür

## Renk temaları

Sağ üstteki **Tema** düğmesinden değiştirilir, seçim tarayıcıda hatırlanır:

| Tema | Hava |
|---|---|
| **Vişne & Altın** (varsayılan) | Derin vişne zemini, yumuşak altın vurgular |
| Indigo | iOS indigo + camgöbeği |
| Okyanus | Sistem mavisi + cyan |
| Orman | Sistem yeşili |
| Gül | Sistem pembesi + mor |
| Açık | iOS açık tema: kırık beyaz zemin, beyaz kartlar, bordo vurgu |
| Siyah & Beyaz | Düz siyah zemin, tamamen renksiz (gri tonları) — sade ve çarpıcı |

Yeni bir tema eklemek için `src/lib/themes.js` dosyasına bir kayıt ve
`src/index.css` içine `[data-theme='senin-tema'] { ... }` bloğu eklemen yeterli.

## Kurulum ve çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` açılır.

## Yayına alma (build)

```bash
npm run build     # dist/ klasörünü üretir
npm run preview   # üretilen sürümü yerel olarak dener
```

`dist/` klasörünü Netlify, Vercel veya GitHub Pages'e yükleyebilirsin.

## Kendi sitelerini ekleme

Sol üstteki **+ Site ekle** düğmesine bas, formu doldur. Kart tahtaya eklenir;
yerini fareyle sürükleyerek ayarla. Veriler tarayıcının `localStorage`'ında
saklanır, sayfayı kapatsan bile kaybolmaz.

> İpucu: İlk açılışta gelen GitHub / CodePen / Behance kartları örnektir,
> çöp kutusu simgesiyle silip kendi sitelerini ekleyebilirsin.

## Dosya yapısı

```
src/
  App.jsx                     # ana mantık: kartlar, tema, yönetici modu
  index.css                   # tüm tasarım ve tema renkleri
  lib/config.js               # ⚠️ yönetici şifresinin özeti (burayı düzenle)
  lib/themes.js               # seçilebilir temaların listesi
  lib/gradients.js            # kart kapağı renk seçenekleri
  lib/icons.js                # kart simgesi seçenekleri (Lucide ikonları)
  lib/defaultSites.js         # başlangıçtaki örnek kartlar
  components/
    Background.jsx            # animasyonlu arka plan
    Hero.jsx                  # üst tanıtım + butonlar
    ThemeSwitcher.jsx         # tema seçici (renk noktaları)
    SiteCard.jsx              # sürüklenebilir proje kartı
    AddSiteModal.jsx          # site ekleme paneli
    AdminModal.jsx            # şifreli yönetici girişi
```

## Sonraki adımlar (fikirler)

- Kartları düzenleme (şu an sadece ekleme/silme var)
- Karta tıklamak yerine klavyeyle de gezinebilme (Tab + Enter)
- Ziyaretçiler için arama / filtreleme
- Yedekleme: kart listesini içe/dışa aktarma (JSON)
- Gerçek (sunucu taraflı) yönetici girişi — şifre kilitini güçlendirmek için
