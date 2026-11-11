import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function AdminModal({ open, onClose, onUnlock }) {
  const [email, setEmail] = useState('admin@thyke.me')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)

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

  useEffect(() => {
    if (!cooldown) return undefined
    const timer = window.setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  if (!open) return null

  const submit = async (event) => {
    event.preventDefault()
    if (busy || cooldown) return
    setBusy(true)
    setError('')
    try {
      await onUnlock({ email, password })
    } catch (err) {
      const message = err?.message || 'Giriş yapılamadı. E-posta ve şifreyi kontrol et.'
      if (/rate limit/i.test(message)) {
        setCooldown(3600)
        setError('Appwrite giriş denemelerini bir saatliğine sınırlandırdı. Sayaç bitmeden tekrar deneme yapma.')
      } else {
        setError(message)
      }
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
            <button type="submit" className="btn btn-primary" disabled={busy || cooldown > 0}>
              {busy ? 'Bağlanıyor...' : cooldown ? `${Math.ceil(cooldown / 60)} dk bekle` : 'Giriş Yap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
