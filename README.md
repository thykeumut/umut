# Umut — Kişisel Portfolyo

React + Vite ile yapılmış, **kartları sürükleyebildiğin** kişisel portfolyo sitesi.

**🌐 Yayında: https://thykeumut.github.io/umut/**

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

> **Şifre: `umutyumus0640`**

Şifre **kodun içinde saklanmaz.** Saklanan şey:

- Rastgele bir **tuz (salt)**
- Şifreden **PBKDF2-SHA256** ile **600.000 tur** türetilmiş 256 bitlik özet
- Bu özet ayrıca **maskelenmiş** (base64 + XOR) hâlde durur

Yani koda bakan biri doğrudan kopyalayıp sözlük saldırısı başlatamaz; tuz
sayesinde hazır tablolar işe yaramaz. (Yine de tarayıcıda çalışan bir kilit
olduğu için "basit kilit" sayılır — banka seviyesi koruma değildir.)

Şifreyi değiştirmek için:

```bash
npm run sifre -- "yeni-sifren"
```

Bu komut yeni tuz ve özeti üretip `src/lib/config.js` dosyasını günceller.
Sitede geçerli olması için `npm run deploy` çalıştır.

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

## 🗂️ Kartların herkese görünmesi

Kartlar normalde sadece senin tarayıcında (`localStorage`) durur — yani sen kart
eklediğinde **ziyaretçiler bunu görmez**. Herkesin gördüğü liste repo içindeki
`sites.json` dosyasıdır:

- Yerel dosya: `public/sites.json` (yayına giderken `dist/` içine kopyalanır)
- Yayındaki dosya: `gh-pages` dalındaki `sites.json`

Güncellemenin iki yolu var:

1. **Bana söyle:** Kartlarını sitede ekle/düzenle, sonra bana "yayınla" de —
   listeyi `sites.json`'a yazıp yayınlayayım.
2. **Kendin:** GitHub'da `gh-pages` dalındaki `sites.json` dosyasını düzenle
   (kalem simgesi → yapıştır → *Commit changes*). ~30 saniye sonra sitede görünür.

> ⚠️ Bu yüzden `npm run deploy` çalıştırırken `sites.json` dosyan
> **otomatik korunur** (betik önce yayındaki listeyi indirir).

## Kendi sitelerini ekleme

Üstteki **+ Site Ekle** düğmesine bas, formu doldur. Kart tahtaya eklenir;
yerini fareyle sürükleyerek ayarla. Kendi tarayıcında çalışırken veriler
`localStorage`'da saklanır, sayfayı kapatsan bile kaybolmaz.

Herkesin görmesi için yukarıdaki **Kartların herkese görünmesi** bölümüne bak.


> İlk sürümde tahtada hiç kart yoktur; örnek kart yoktur. İstediğini ekle,
> istediğini sil.

## Dosya yapısı

```
src/
  App.jsx                     # ana mantık: kartlar, tema, yönetici modu
  index.css                   # tüm tasarım ve tema renkleri
  lib/config.js               # yönetici kilidi (tuz + PBKDF2 özeti, maskeli)
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
public/
  sites.json                  # herkesin gördüğü kart listesi
scripts/
  deploy.mjs                  # npm run deploy (sites.json'u koruyarak yayınlar)
  sifre.mjs                   # npm run sifre -- "yeni-sifre"
```

## Sonraki adımlar (fikirler)

- Kartları düzenleme (şu an sadece ekleme/silme var)
- Karta tıklamak yerine klavyeyle de gezinebilme (Tab + Enter)
- Ziyaretçiler için arama / filtreleme
- Yedekleme: kart listesini içe/dışa aktarma (JSON)
- Gerçek (sunucu taraflı) yönetici girişi — şifre kilitini güçlendirmek için
