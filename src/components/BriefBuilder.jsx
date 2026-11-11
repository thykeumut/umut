import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy, FilePenLine, X } from 'lucide-react'

const PROJECT_TYPES = ['Web sitesi', 'Web uygulaması', 'Oyun', 'Marka / tasarım', 'Diğer']
const STYLE_OPTIONS = ['Modern ve sade', 'Cesur ve deneysel', 'Minimal', 'Oyun odaklı', 'Bilmiyorum, öneri istiyorum']

// Ziyaretçinin fikrini anlaşılır bir proje notuna dönüştüren, veri göndermeyen küçük araç.
export default function BriefBuilder({ open, onClose }) {
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0])
  const [goal, setGoal] = useState('')
  const [audience, setAudience] = useState('')
  const [style, setStyle] = useState(STYLE_OPTIONS[0])
  const [copied, setCopied] = useState(false)
  const goalRef = useRef(null)

  useEffect(() => {
    if (!open) return
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
    '',
    'Not: Bu brief THYKE portföyünden oluşturuldu.',
  ].join('\n'), [projectType, goal, audience, style])

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

  return (
    <div className="brief-backdrop" onPointerDown={onClose}>
      <section className="brief-panel" role="dialog" aria-modal="true" aria-label="Proje briefi oluştur" onPointerDown={(event) => event.stopPropagation()}>
        <header className="brief-head">
          <div>
            <span><FilePenLine size={13} strokeWidth={2.2} /> THYKE / BRIEF</span>
            <h2>Fikrini netleştir.</h2>
            <p>Bir dakikada düzenli bir proje notu oluştur.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Brief aracını kapat"><X size={16} strokeWidth={2.3} /></button>
        </header>

        <div className="brief-grid">
          <form className="brief-form" onSubmit={(event) => { event.preventDefault(); void copyBrief() }}>
            <label>Ne yapmak istiyorsun?
              <select value={projectType} onChange={(event) => setProjectType(event.target.value)}>{PROJECT_TYPES.map((type) => <option key={type}>{type}</option>)}</select>
            </label>
            <label>Bu işin amacı ne?
              <textarea ref={goalRef} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Örn. İnsanların oyun kliplerini bulabileceği hızlı bir alan..." maxLength={420} />
            </label>
            <label>Kim kullanacak?
              <input value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="Örn. CS oyuncuları, öğrenciler, küçük ekipler..." maxLength={120} />
            </label>
            <label>Nasıl hissettirsin?
              <select value={style} onChange={(event) => setStyle(event.target.value)}>{STYLE_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select>
            </label>
          </form>

          <aside className="brief-preview" aria-label="Oluşturulan proje briefi">
            <div className="brief-preview-head"><span>ÖNİZLEME</span><small>Canlı güncellenir</small></div>
            <pre>{brief}</pre>
            <button type="button" className="btn btn-primary" onClick={copyBrief}>
              {copied ? <Check size={15} strokeWidth={2.4} /> : <Copy size={15} strokeWidth={2.2} />}
              {copied ? 'Kopyalandı' : 'Briefi kopyala'}
            </button>
          </aside>
        </div>

        <footer className="brief-foot">Bu araç hiçbir bilgi kaydetmez veya göndermez.</footer>
      </section>
    </div>
  )
}
