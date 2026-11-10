import { useEffect, useRef, useState } from 'react'

// Sitenin küçük ekran görüntüsü.
//
// Kaynak: WordPress'in ücretsiz mShots servisi. İlk istekte "hazırlanıyor"
// yer tutucusunu (400x300) verir; görüntü birkaç saniye sonra hazır olur.
// Yer tutucu gelirse göstermeyip kısa süre sonra tekrar deneriz.
// Görüntü hiç gelmezse kapak yalnızca renk geçişi olarak kalır.
const SHOT_W = 360
const SHOT_H = 220

export function absoluteUrl(url = '') {
  const t = String(url).trim()
  if (!t) return ''
  return /^https?:\/\//i.test(t) ? t : `https://${t}`
}

// Önizleme görselinin adresi.
//
// Adrese haftalık bir sürüm etiketi eklenir ("umut-onizleme=2946" gibi):
// servis bir kez aldığı görüntüyü çok uzun süre saklıyor. Site o sırada
// yayında değilse 404 görüntüsü önbellekte kalıyor ve düzelmiyor. Etiket
// sayesinde böyle eski görüntüler atlanır ve görseller haftada bir tazelenir.
export function shotUrl(url, tryNo = 0, w = SHOT_W, h = SHOT_H) {
  const hedef = absoluteUrl(url)
  if (!hedef) return ''
  const hafta = Math.floor(Date.now() / 604800000)
  const ayrac = hedef.includes('?') ? '&' : '?'
  const hedefTam = `${hedef}${ayrac}umut-onizleme=${hafta}`
  const ek = tryNo ? `&r=${tryNo}` : ''
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(
    hedefTam
  )}?w=${w}&h=${h}${ek}`
}

export default function Shot({ url, className = '', width, height, alt = '' }) {
  const [src, setSrc] = useState(() => shotUrl(url, 0, width, height))
  const [shown, setShown] = useState(false)
  const tries = useRef(0)
  const timer = useRef(null)

  useEffect(() => {
    setSrc(shotUrl(url, 0, width, height))
    setShown(false)
    tries.current = 0
  }, [url, width, height])

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    // Yer tutucu (hazır değil) → biraz sonra tekrar dene.
    // Ağır sayfaların (ör. WebGL oyunları) görüntüsü ~30 saniyede hazır
    // olabiliyor; bu yüzden birkaç kez denenir. Görüntü bir kez üretildikten
    // sonra servis onu herkese anında verir.
    if (!w || (w === 400 && h === 300)) {
      if (tries.current < 2) {
        tries.current += 1
        clearTimeout(timer.current)
        timer.current = setTimeout(
          () => setSrc(shotUrl(url, tries.current, width, height)),
          12000
        )
      }
      return
    }
    setShown(true)
  }

  return (
    <img
      className={`${className}${shown ? ' is-in' : ''}`}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      onLoad={handleLoad}
      onError={() => clearTimeout(timer.current)}
    />
  )
}
