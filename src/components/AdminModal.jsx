import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { ADMIN_PASSWORD_HASH } from '../lib/config'

// Şifreyi SHA-256 özetine çevirir (şifrenin kendisi kodda durmaz)
async function sha256(text) {
  if (!globalThis.crypto?.subtle) throw new Error('unsupported')
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  )
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Yönetici girişi: doğru şifre girilince yönetim yetkileri açılır
export default function AdminModal({ open, onClose, onUnlock }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setPassword('')
      setError('')
    }
  }, [open])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const hash = await sha256(password)
      if (hash === ADMIN_PASSWORD_HASH) {
        onUnlock()
      } else {
        setError('Şifre yanlış, tekrar dene.')
      }
    } catch {
      setError('Bu tarayıcıda şifre kontrolü çalışmıyor (https veya localhost gerekir).')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div
        className="modal modal--narrow"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>Yönetici Girişi</h2>
          <button className="icon-btn" onClick={onClose} title="Kapat">
            <X size={15} strokeWidth={2.3} />
          </button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <p className="modal-note">
            Kart eklemek, silmek, taşımak ve siteleri ziyaretçilere açmak için şifreni
            gir. Ziyaretçiler şifre olmadan sadece görüntüler.
          </p>

          <label>
            Şifre
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
