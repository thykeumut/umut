import { Check, MessageSquare, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const SUBJECTS = ['Genel geri bildirim', 'Hata bildirimi', 'Özellik önerisi', 'Tasarım önerisi']

export default function FeedbackModal({ open, onClose, onSubmit }) {
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const messageRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setSent(false)
    setError('')
    const timer = window.setTimeout(() => messageRef.current?.focus(), 50)
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const submit = async (event) => {
    event.preventDefault()
    setSending(true)
    setError('')
    try {
      await onSubmit({ subject, message, contact })
      setSent(true)
      setMessage('')
      setContact('')
    } catch (submitError) {
      setError(submitError?.message || 'Mesaj şu an gönderilemedi.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="brief-backdrop" onPointerDown={onClose}>
      <section className="brief-panel feedback-panel" role="dialog" aria-modal="true" aria-label="Geri bildirim gönder" onPointerDown={(event) => event.stopPropagation()}>
        <header className="brief-head">
          <div>
            <span><MessageSquare size={13} strokeWidth={2.2} /> THYKE / GERİ BİLDİRİM</span>
            <h2>Siteyi birlikte iyileştirelim.</h2>
            <p>Hata, fikir veya tasarım notu bırakabilirsin.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Geri bildirim penceresini kapat"><X size={16} strokeWidth={2.3} /></button>
        </header>
        <form className="feedback-form" onSubmit={submit}>
          <label>Konu
            <select value={subject} onChange={(event) => setSubject(event.target.value)}>{SUBJECTS.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <label>Mesajın
            <textarea ref={messageRef} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ne geliştirebiliriz?" maxLength={600} required />
          </label>
          <label>İletişim bilgisi <em>(isteğe bağlı)</em>
            <input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="E-posta, Discord veya sosyal medya" maxLength={140} />
          </label>
          {error && <p className="form-error">{error}</p>}
          {sent ? <p className="brief-sent"><Check size={15} /> Mesajın ulaştı, teşekkürler!</p> : <button className="btn btn-primary feedback-send" type="submit" disabled={sending}><Send size={15} /> {sending ? 'Gönderiliyor...' : 'Gönder'}</button>}
        </form>
      </section>
    </div>
  )
}
