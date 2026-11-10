// Geliştirme günlüğü.
// Kendi kayıtlarını buradan düzenleyebilirsin: en yeni en üstte olacak şekilde
// tarih (YYYY-MM-DD), başlık, kısa açıklama ve tür yaz.
//
// tür: 'yeni' | 'iyileştirme' | 'düzeltme' | 'deneme'

export const NOW = 'Portfolyo kartlarını ve site detaylarını güncelliyorum; değişiklikler herkese anında yansıyor.'

export const DEV_LOG = [
  {
    date: '2026-11-10',
    title: 'Daha sade pano',
    text:
      'Özgeçmiş görünümü ve ek sekmeler kaldırıldı; site artık tek bir proje panosundan oluşuyor. Kartlar ortak veritabanında tutulmaya devam ediyor.',
    tag: 'yeni',
  },
  {
    date: '2026-11-05',
    title: 'THYKE Hub ve daha sakin GitHub trafiği',
    text:
      'Günlük görevler, odak zamanlayıcısı ve durum ekranı eklendi. Ziyaretçilerin proje listesi için GitHub API yerine sitenin kendi yayın dosyası kullanılmaya başlandı.',
    tag: 'iyileştirme',
  },
  {
    date: '2026-11-05',
    title: 'Gizli terminal, vitrin ve THYKE LAB',
    text:
      'Sitede ~ tuşuyla açılan bir terminal, filtreli proje vitrini, deney alanı ve canlı GitHub istatistikleri eklendi.',
    tag: 'yeni',
  },
  {
    date: '2026-10-23',
    title: 'thyke.me alan adı',
    text:
      'Site kendi alan adına taşındı. Kök dizin ayarı, site haritası, robots.txt, favicon ve arama motoru etiketleri eklendi.',
    tag: 'yeni',
  },
  {
    date: '2026-10-23',
    title: 'Tema paletleri keskinleştirildi',
    text:
      'Yedi tema korunarak renkler daha net, kontrastı daha yüksek hâle getirildi; siyah-beyaz tema yeniden düzenlendi.',
    tag: 'iyileştirme',
  },
  {
    date: '2026-10-20',
    title: 'Kart önizlemeleri',
    text:
      'Herkese açık kartların kapağında sitenin küçük ekran görüntüsü gösteriliyor; gizli kartlarda önizleme yok.',
    tag: 'yeni',
  },
  {
    date: '2026-10-18',
    title: 'Gizli kartların adresi yayından kaldırıldı',
    text:
      'Gizli kartların adresi artık yayın dosyasına hiç yazılmıyor; ziyaretçi tıklayınca site açılmıyor.',
    tag: 'düzeltme',
  },
  {
    date: '2026-10-15',
    title: 'Otomatik yayın',
    text:
      'Kart eklenince, silinince veya taşınınca liste arka planda GitHub üzerinden yayına yazılıyor; ayrı bir düğme yok.',
    tag: 'yeni',
  },
]

export const TAG_LABEL = {
  yeni: 'Yeni',
  iyileştirme: 'İyileştirme',
  düzeltme: 'Düzeltme',
  deneme: 'Deneme',
}
