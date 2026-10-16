import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { ADMIN_KEY, openExpected } from '../lib/config'

// Şifreden PBKDF2-SHA256 özeti üretir (210.000 tur).
// Şifrenin kendisi kodda saklanmaz; özet maskeli durur.
function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

async function derive(password) {
  if (!globalThis.crypto?.subtle) throw new Error('unsupported')
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBytes(ADMIN_KEY.salt),
      iterations: ADMIN_KEY.rounds,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  return [...new Uint8Array(bits)]
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
      const derived = await derive(password)
      if (derived && derived === openExpected()) {
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
