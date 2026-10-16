# Umut — Kişisel Portfolyo

React + Vite ile yapılmış, **kartları sürükleyebildiğin** kişisel portfolyo sitesi.

**🌐 Yayında: https://thykeumut.github.io/umut/**

## Özellikler

- 🔐 **Şifreli yönetici modu** — ziyaretçiler sadece görüntüler, düzenleyemez
- 👀 **Ziyaretçi modu** — kartları görürler, senin izin verdiğin sitelere gidebilirler
- 📤 **Yayına Al** — kartlarını tek tıkla GitHub'a yayınla, herkes görsün
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
npm run deploy    # GitHub Pages'e yayınlar
```

## 🌐 Yayın (GitHub Pages)

Site yayında: **https://thykeumut.github.io/umut/**

- Kaynak kod: https://github.com/thykeumut/umut (`main` dalı)
- Yayınlanan site: `gh-pages` dalı
- `npm run deploy` → derler ve `gh-pages` dalına gönderir.
  Yayındaki `sites.json` dosyasını **otomatik korur**, kartların kaybolmaz.

## 📤 Kartları herkesin görmesi (Yayına Al)

Kartlar normalde sadece senin tarayıcında (`localStorage`) durur. Yani sen kart
eklediğinde **ziyaretçiler bunu görmez**. Herkesin görmesi için kartlar `sites.json`
dosyasına yazılmalıdır. Bunun için:

1. Sitede yönetici girişi yap (şifre ile).
2. Kartlarını ekle, sürükleyerek yerleştir.
3. Üstteki **Yayına Al** düğmesine bas.

İki yol var:

| Yol | Nasıl |
|---|---|
| **Tek tık** (önerilen) | GitHub'dan ince erişim anahtarı (fine-grained token) oluştur, panele bir kez yapıştır ve kaydet. Sonra her seferinde tek tıkla yayınlanır. |
| **Elle** | Paneleki **JSON'u Kopyala** → **GitHub'da Aç** → içeriği yapıştır → **Commit changes**. Yarım dakika sonra sitede görünür. |

Anahtar oluştururken:

- **Repository access:** Only select repositories → `umut`
- **Permissions → Contents:** `Read and write`

> Anahtar sadece senin tarayıcında saklanır ve sadece bu depoya yazabilir.
> Yayınlandıktan ~30 saniye sonra sitede görünür.

## Kendi sitelerini ekleme

Üstteki **+ Site Ekle** düğmesine bas, formu doldur. Kart tahtaya eklenir;
yerini fareyle sürükleyerek ayarla. Kendi tarayıcında çalışırken veriler
`localStorage`'da saklanır, sayfayı kapatsan bile kaybolmaz.

Herkesin görmesi için **Yayına Al** düğmesini kullan (yukarıya bak).

> İlk sürümde tahtada hiç kart yoktur; örnek kart yoktur. İstediğini ekle,
> istediğini sil.

## Dosya yapısı

```
src/
  App.jsx                     # ana mantık: kartlar, tema, yönetici modu, yayın
  index.css                   # tüm tasarım ve tema renkleri
  lib/config.js               # ⚠️ yönetici şifresinin özeti (burayı düzenle)
  lib/github.js               # Yayına Al: GitHub'a sites.json yazma
  lib/themes.js               # seçilebilir temaların listesi
  lib/gradients.js            # kart kapağı renk seçenekleri
  lib/icons.js                # kart simgesi seçenekleri (Lucide ikonları)
  components/
    Background.jsx            # animasyonlu arka plan
    Hero.jsx                  # üst tanıtım + butonlar
    ThemeSwitcher.jsx         # tema seçici (renk noktaları)
    SiteCard.jsx              # sürüklenebilir proje kartı
    AddSiteModal.jsx          # site ekleme paneli
    AdminModal.jsx            # şifreli yönetici girişi
    PublishModal.jsx          # Yayına Al paneli
public/
  sites.json                  # herkesin gördüğü kart listesi
scripts/
  deploy.mjs                  # npm run deploy (sites.json'u koruyarak yayınlar)
```

## Sonraki adımlar (fikirler)

- Kartları düzenleme (şu an sadece ekleme/silme var)
- Karta tıklamak yerine klavyeyle de gezinebilme (Tab + Enter)
- Ziyaretçiler için arama / filtreleme
- Yedekleme: kart listesini içe/dışa aktarma (JSON)
- Gerçek (sunucu taraflı) yönetici girişi — şifre kilitini güçlendirmek için
