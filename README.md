# Umut — Kişisel Portfolyo

React + Vite ile yapılmış kişisel portfolyo: sürüklenebilir proje kartları
ve canlı güncellenen tek bir pano.

**🌐 Yayında: https://thyke.me/**

> **Alan adı notu:** Site kök dizinde (`/`) çalıştığı için `vite.config.js`
> içindeki `base` değeri `'/'`. `public/CNAME` dosyası `thyke.me` yazar; yayın
> betiği bu dosyayı her seferinde `dist` içine kopyalar.

## Özellikler

- 🔐 **Appwrite yönetici girişi** — e-posta + şifre; ziyaretçiler yalnızca görüntüler
- ⚡ **Canlı yayın** — kart değişiklikleri ortak veritabanına yazılır,
  açık ziyaretçi sekmelerine anında yansır (yenileme gerekmez)
- 🔒 **Gizli kartlar** — adresleri ziyaretçilere hiç gösterilmez
- 🖱️ Yönetici olarak kartları **serbestçe sürükle** — konumlar herkese yansır
- 🔗 Karta **tıkla** → site yeni sekmede açılır
- ➕ Site ekleme/düzenleme: başlık, URL, açıklama, simge, kapak rengi,
  kategori, teknolojiler ve ziyaretçi izni
- ⌨️ **Gizli terminal** — `~` tuşuyla açılır
- 🗑️ Kart silme ve "Yerleşimi Sıfırla"
- 📱 Mobilde kartlar alt alta listelenir

> Kart konumları ziyaretçiler için de geçerlidir: ziyaretçi kartları senin
> bıraktığın yerde görür, sadece taşıyamaz.

## 🔐 Yönetici girişi

Sağ üstteki **Yönetici Girişi** düğmesine basıp Appwrite hesabınla giriş yapınca
kart ekleme, silme, sürükleme ve görünürlük yetkileri açılır.

- Giriş Appwrite `Account` oturumu ile yapılır; parola kod içinde saklanmaz.
- Oturum tarayıcıda `umut-portfolyo:admin:v1` anahtarıyla hatırlanır.
- **Çıkış** için sağ üstteki "Yönetici" düğmesine bas.

## 👀 Ziyaretçi modu ve görünürlük

| Durum | Ziyaretçi ne olur |
|---|---|
| Kart **ziyaretçilere açık** | Adresi görür, tıklar ve siteye gider |
| Kart **kapalı** | Kartı görür ama adresi yazılmaz; tıklayınca uyarı çıkar |
| Kart ekleme / silme / sürükleme | Yapamaz (düğmeler görünmez) |

Gizli kartların adresi veritabanına yazılsa bile arayüzde gösterilmez; yayın
dosyasına (`public/sites.json`) hiçbir zaman düz adres yazılmaz.

## 🗂️ Veri ve canlı güncelleme

Proje kartları Appwrite üzerindeki tek bir tabloda tutulur. Yönetici bir
değişiklik yaptığında:

1. Değişiklik ~1 saniye içinde Appwrite'a yazılır.
2. Appwrite Realtime aboneliği açık ziyaretçi sekmelerini uyarır.
3. Sekmeler veriyi yeniden çeker; böylece herkes aynı panoyu görür.

`saveRemoteSites` yalnızca proje satırlarını yönetir.

### Appwrite yapılandırması

Değerler `src/lib/appwrite.js` içinde tanımlıdır:

```
endpoint : https://fra.cloud.appwrite.io/v1
project  : 6aec4b77002cb374916e
database : 6aec5c0100163d1ab125
table    : 6aec5c36003a2ebf0e50
```

Yeni bir ortam için bu değerleri ve tablo izinlerini güncelle. Tabloda
`data` (metin) alanı beklenir.

## 🗂️ Görünüm

Site tek bir görünümden oluşur: sürüklenebilir kart tahtası. Kartlar Appwrite
üzerinden gelir; yönetici düzenlemeleri açık sekmelere anında yansır.

## ⌨️ Gizli terminal

Sitede **`~`** (veya `` ` ``) tuşuna bas → terminal açılır. Mobilde alt bilgideki
`~ terminal` düğmesi aynı işi görür.

| Komut | Ne yapar |
|---|---|
| `help` | komutları listeler |
| `projects` | projeleri listeler; `projects 2` detayı açar |
| `github` | GitHub profili |
| `pano` | Panoya döner |
| `clear` · `exit` | ekranı temizler · kapatır |

Gizli komutlar `secret` ile açılır: `matrix`, `coffee`, `whoami`, `42`,
`sudo`, `rm -rf /`, `thyke`.

## Tasarım dili

Tasarım iOS/Apple diline göre kurulmuştur:

- **SF (Apple) yazı tipi** önceliği — Mac/iPhone'da sistem yazı tipi, diğerlerinde Inter
- **Buzlu cam yüzeyler**, nötr ince kenarlıklar ve yumuşak köşeler
- **Tek palet:** derin slate zemin + altın vurgu; tema seçici yok
- Sade zemin, çok hafif aurora/ızgara dokusu ve odak halkaları
- Simgeler emoji değil, tek renk çizgili **[Lucide](https://lucide.dev)** ikonları

## Kurulum ve çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` açılır.

## Yayına alma

```bash
npm run build     # dist/ klasörünü üretir
npm run preview   # üretilen sürümü yerel olarak dener
npm run deploy    # GitHub Pages'e yayınlar
```

## 🌐 Yayın (GitHub Pages)

- Kaynak kod: https://github.com/thykeumut/umut (`main` dalı)
- Yayınlanan site: `gh-pages` dalı
- `npm run deploy` → derler ve `gh-pages` dalına gönderir; yayındaki
  `sites.json` yedeğini korur.
- Alan adı: `public/CNAME` = `thyke.me`

> Kartlar Appwrite'ta tutulduğu için `sites.json` yalnızca yedek /
> ilk yükleme içindir.

## Dosya yapısı

```
src/
  App.jsx                     # ana mantık: kartlar, görünümler, yönetici
  index.css                   # tüm tasarım stilleri
  lib/appwrite.js             # kart okuma/yazma ve realtime
  lib/config.js               # yönetici oturum anahtarı
  lib/githubStats.js          # GitHub istatistikleri (yedekli)
  lib/log.js                  # geliştirme günlüğü kayıtları
  lib/projects.js             # kategoriler, etiketler, URL yardımcıları
  lib/gradients.js            # kart kapağı renk seçenekleri
  lib/icons.js                # kart simgesi seçenekleri (Lucide)
  components/
    Background.jsx            # aurora + ızgara arka plan
    Hero.jsx                  # üst tanıtım + butonlar
    SiteCard.jsx              # sürüklenebilir proje kartı
    Shot.jsx                  # site önizleme görseli (mShots)
    SiteModal.jsx             # site ekleme / düzenleme paneli
    SiteDetail.jsx            # proje detay paneli
    DeveloperPanel.jsx        # GitHub istatistikleri + günlük (kullanılmıyor)
    Terminal.jsx              # gizli terminal (~)
    AdminModal.jsx            # Appwrite yönetici girişi
public/
  sites.json                  # yedek kart listesi
scripts/
  deploy.mjs                  # npm run deploy
  sifre.mjs                   # eski yerel şifre üretici (artık kullanılmıyor)
```

## Sonraki adımlar (fikirler)

- Proje hikâyelerini ve teknoloji etiketlerini doldurmak
- Yedekleme: kart listesini içe/dışa aktarma (JSON)
- Terminale yeni gizli komutlar eklemek
