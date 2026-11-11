import { Check, Mail, Send, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function VisitorLogin({ open, onClose, onSubmit }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { if (open) { setSent(false); setError('') } }, [open])
  if (!open) return null
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    try { await onSubmit(email); setSent(true) } catch (err) { setError(err?.message || 'E-posta gönderilemedi.') } finally { setBusy(false) }
  }
  return <div className="brief-backdrop" onPointerDown={onClose}><section className="brief-panel feedback-panel" role="dialog" aria-modal="true" onPointerDown={(e) => e.stopPropagation()}>
    <header className="brief-head"><div><span><Mail size={13} /> THYKE / GİRİŞ</span><h2>E-postayla giriş yap.</h2><p>Şifre yok; tek kullanımlık doğrulama bağlantısı göndeririz.</p></div><button className="icon-btn" onClick={onClose} aria-label="Kapat"><X size={16} /></button></header>
    <form className="feedback-form" onSubmit={submit}>{sent ? <p className="brief-sent"><Check size={15} /> Bağlantı gönderildi. E-postanı açıp doğrula.</p> : <><label>E-posta adresin<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mail@ornek.com" required autoFocus /></label>{error && <p className="form-error">{error}</p>}<button className="btn btn-primary feedback-send" disabled={busy}><Send size={15} /> {busy ? 'Gönderiliyor...' : 'Doğrulama bağlantısı gönder'}</button></>}</form>
  </section></div>
}
