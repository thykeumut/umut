// ---------------------------------------------------------------
// YÖNETİCİ ŞİFRESİ
//
// Varsayılan şifre: umut2026
//
// Şifreyi değiştirmek için terminalde şunu çalıştır:
//   node -e "console.log(require('crypto').createHash('sha256').update('YENI_SIFREN').digest('hex'))"
// çıkan uzun yazıyı aşağıdaki tırnakların arasına yapıştır.
// ---------------------------------------------------------------
export const ADMIN_PASSWORD_HASH =
  'f7e5807865b0da90fc691950033d1b334f89088267446b66bc69e9d842ba810a'

// Yönetici modunun bu tarayıcıda hatırlanıp hatırlanmayacağı
export const ADMIN_STORAGE_KEY = 'umut-portfolyo:admin:v1'
