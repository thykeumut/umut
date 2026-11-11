import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy, FilePenLine, Send, X } from 'lucide-react'

const PROJECT_TYPES = ['Web sitesi', 'Web uygulaması', 'Oyun', 'Marka / tasarım', 'Diğer']
const STYLE_OPTIONS = ['Modern ve sade', 'Cesur ve deneysel', 'Minimal', 'Oyun odaklı', 'Bilmiyorum, öneri istiyorum']

export default function BriefBuilder({ open, onClose, onSubmit }) {
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0])
  const [goal, setGoal] = useState('')
  const [audience, setAudience] = useState('')
  const [style, setStyle] = useState(STYLE_OPTIONS[0])
  const [contact, setContact] = useState('')
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const goalRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setSent(false)
    setError('')
    const focusTimer = window.setTimeout(() => goalRef.current?.focus(), 60)
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const brief = useMemo(() => [
    'PROJE BRIEFİ',
    '',
    `Proje türü: ${projectType}`,
    `Amaç: ${goal.trim() || 'Henüz netleştirilmedi.'}`,
    `Hedef kitle: ${audience.trim() || 'Henüz netleştirilmedi.'}`,
    `Görsel yön: ${style}`,
    contact.trim() ? `İletişim: ${contact.trim()}` : '',
  ].filter(Boolean).join('\n'), [projectType, goal, audience, style, contact])

  if (!open) return null

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(brief)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const sendBrief = async (event) => {
    event.preventDefault()
    setSending(true)
    setError('')
    try {
      await onSubmit({ projectType, goal, audience, style, contact })
      setSent(true)
    } catch (submitError) {
      setError(submitError?.message || 'Brief şu an gönderilemedi. Lütfen yeniden dene.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="brief-backdrop" onPointerDown={onClose}>
      <section className="brief-panel" role="dialog" aria-modal="true" aria-label="Proje briefi oluştur" onPointerDown={(event) => event.stopPropagation()}>
        <header className="brief-head">
          <div>
            <span><FilePenLine size={13} strokeWidth={2.2} /> THYKE / BRIEF</span>
            <h2>Fikrini netleştir.</h2>
            <p>Briefini doğrudan Umut'un gelen kutusuna gönder.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Brief aracını kapat"><X size={16} strokeWidth={2.3} /></button>
        </header>

        <div className="brief-grid">
          <form className="brief-form" onSubmit={sendBrief}>
            <label>Ne yapmak istiyorsun?
              <select value={projectType} onChange={(event) => setProjectType(event.target.value)}>{PROJECT_TYPES.map((type) => <option key={type}>{type}</option>)}</select>
            </label>
            <label>Bu işin amacı ne?
              <textarea ref={goalRef} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Örn. İnsanların oyun kliplerini bulabileceği hızlı bir alan..." maxLength={420} required />
            </label>
            <label>Kim kullanacak?
              <input value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="Örn. CS oyuncuları, öğrenciler, küçük ekipler..." maxLength={120} />
            </label>
            <label>Nasıl hissettirsin?
              <select value={style} onChange={(event) => setStyle(event.target.value)}>{STYLE_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select>
            </label>
            <label>İletişim bilgisi <em>(isteğe bağlı)</em>
              <input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="E-posta, Discord veya sosyal medya" maxLength={140} />
            </label>
            {error && <p className="form-error">{error}</p>}
            {sent ? <p className="brief-sent"><Check size={15} /> Briefin Umut'a ulaştı. Teşekkürler!</p> : (
              <button className="btn btn-primary brief-send" type="submit" disabled={sending}>
                <Send size={15} strokeWidth={2.2} /> {sending ? 'Gönderiliyor...' : 'Briefi gönder'}
              </button>
            )}
          </form>

          <aside className="brief-preview" aria-label="Oluşturulan proje briefi">
            <div className="brief-preview-head"><span>ÖNİZLEME</span><small>Canlı güncellenir</small></div>
            <pre>{brief}</pre>
            <button type="button" className="btn btn-ghost" onClick={copyBrief}>
              {copied ? <Check size={15} strokeWidth={2.4} /> : <Copy size={15} strokeWidth={2.2} />}
              {copied ? 'Kopyalandı' : 'Kopyala'}
            </button>
          </aside>
        </div>

        <footer className="brief-foot">İletişim bilgisi zorunlu değildir; yalnızca briefi yanıtlamak için görünür.</footer>
      </section>
    </div>
  )
}
