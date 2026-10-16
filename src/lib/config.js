// ---------------------------------------------------------------
// YÖNETİCİ KİLİDİ
//
// Şifrenin kendisi kodun içinde YOKTUR.
//
// Saklanan şey: şifreden PBKDF2-SHA256 ile 210.000 tur türetilmiş 256 bitlik
// bir özet. Özet ayrıca maskelenmiştir (koda bakan biri doğrudan kopyalayıp
// sözlük saldırısı başlatamaz). Tuz (salt) sayesinde hazır tablolar işe yaramaz.
//
// Şifreyi değiştirmek için terminalde:
//   npm run sifre -- "yeni-sifren"
// Bu komut tuzu ve özeti yeniden üretip bu dosyayı günceller.
// ---------------------------------------------------------------

// Özeti gizleyen maske (tarayıcıdaki çözme işlemiyle aynı olmalı)
const MASK = [90, 47, 145, 60, 119, 14, 181, 66, 33, 210, 7, 156, 88, 21, 174, 63]

export const ADMIN_KEY = {
  salt: 'f4cdf198b2387d7f161e0d3cd8f3582f',
  rounds: 600000,
  v: 'Yhv3WEI70XETs2KuPnecCm8epQRANoEjRLBhqDpxlwloG6YFFG3Rc0fmZf85I8xeO0ygXUI51nNC6mP9bSeXXg==',
}

/** Maskelenmiş özeti çözer (yalnızca gizleme amaçlıdır; güvenlik iddiası yok) */
export function openExpected() {
  try {
    const raw = atob(ADMIN_KEY.v)
    const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0))
    const plain = bytes.map((b, i) => b ^ MASK[i % MASK.length])
    return new TextDecoder().decode(plain)
  } catch {
    return ''
  }
}

// Yönetici modunun bu tarayıcıda hatırlanıp hatırlanmayacağı
export const ADMIN_STORAGE_KEY = 'umut-portfolyo:admin:v1'
