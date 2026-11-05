import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function AdminModal({ open, onClose, onUnlock }) {
  const [email, setEmail] = useState('admin@thyke.me')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setEmail('admin@thyke.me')
      setPassword('')
      setError('')
    }
  }, [open])

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onUnlock({ email, password })
    } catch (err) {
      setError(err?.message || 'Giriş yapılamadı. E-posta ve şifreyi kontrol et.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div className="modal modal--narrow" onPointerDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>Yönetici Girişi</h2>
          <button className="icon-btn" onClick={onClose} title="Kapat">
            <X size={15} strokeWidth={2.3} />
          </button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <p className="modal-note">
            Kart eklemek, silmek ve düzenlemek için Appwrite yönetici hesabıyla giriş yap.
            Değişiklikler tüm ziyaretçilere anında gönderilir.
          </p>

          <label>
            E-posta
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </label>

          <label>
            Şifre
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Bağlanıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
