import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Clipboard, Link2, Plus, Trash2, X } from 'lucide-react'

const PASTES_KEY = 'thyke-paste:items:v1'
const MAX_SHARE_LENGTH = 2200

function loadPastes() {
  try {
    const saved = JSON.parse(localStorage.getItem(PASTES_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter((item) => item && typeof item.content === 'string').slice(0, 12) : []
  } catch {
    return []
  }
}

function encodePaste(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function decodePaste(encoded) {
  try {
    const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/') + '==='.slice((encoded.length + 3) % 4)
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const value = JSON.parse(new TextDecoder().decode(bytes))
    return value && typeof value.content === 'string' ? value : null
  } catch {
    return null
  }
}

export default function PastePanel({ open, onClose }) {
  const [title, setTitle] = useState('Adsız not')
  const [content, setContent] = useState('')
  const [pastes, setPastes] = useState(loadPastes)
  const [feedback, setFeedback] = useState('')
  const contentRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const shared = decodePaste(new URLSearchParams(window.location.search).get('paste') || '')
    if (shared) {
      setTitle(shared.title || 'Paylaşılan not')
      setContent(shared.content)
    }
    const focusTimer = window.setTimeout(() => contentRef.current?.focus(), 60)
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    try {
      localStorage.setItem(PASTES_KEY, JSON.stringify(pastes))
    } catch {
      // Private browsing can disable local storage; editing still works.
    }
  }, [pastes])

  const wordCount = useMemo(() => content.trim() ? content.trim().split(/\s+/).length : 0, [content])

  if (!open) return null

  const showFeedback = (message) => {
    setFeedback(message)
    window.setTimeout(() => setFeedback(''), 1800)
  }

  const savePaste = () => {
    if (!content.trim()) return showFeedback('Önce bir not yaz')
    const item = { id: `${Date.now()}-${Math.random()}`, title: title.trim() || 'Adsız not', content, updatedAt: Date.now() }
    setPastes((items) => [item, ...items].slice(0, 12))
    showFeedback('Tarayıcına kaydedildi')
  }

  const copyLink = async () => {
    if (!content.trim()) return showFeedback('Önce bir not yaz')
    if (content.length > MAX_SHARE_LENGTH) return showFeedback('Paylaşım için notu biraz kısalt')
    const encoded = encodePaste({ title: title.trim() || 'Adsız not', content })
    const url = new URL(window.location.href)
    url.searchParams.set('paste', encoded)
    try {
      await navigator.clipboard.writeText(url.toString())
      showFeedback('Paylaşım bağlantısı kopyalandı')
    } catch {
      showFeedback('Bağlantı kopyalanamadı')
    }
  }

  return (
    <div className="paste-backdrop" onPointerDown={onClose}>
      <section className="paste-panel" role="dialog" aria-modal="true" aria-label="THYKE Paste" onPointerDown={(event) => event.stopPropagation()}>
        <header className="paste-head">
          <div><span><Clipboard size={13} strokeWidth={2.2} /> THYKE / PASTE</span><h2>Hızlı not alanı</h2></div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Paste panelini kapat"><X size={16} strokeWidth={2.3} /></button>
        </header>

        <div className="paste-layout">
          <section className="paste-editor">
            <input className="paste-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Not başlığı" maxLength={60} aria-label="Not başlığı" />
            <textarea ref={contentRef} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Kod, fikir, bağlantı veya kısa bir not yaz..." maxLength={5000} aria-label="Not içeriği" />
            <div className="paste-meta"><span>{content.length} karakter · {wordCount} kelime</span><span>{content.length > MAX_SHARE_LENGTH ? 'Bağlantı için uzun' : 'Bağlantıyla paylaşılabilir'}</span></div>
            <div className="paste-actions">
              <button type="button" className="btn btn-ghost" onClick={savePaste}><Plus size={15} strokeWidth={2.3} /> Kaydet</button>
              <button type="button" className="btn btn-primary" onClick={copyLink}><Link2 size={15} strokeWidth={2.2} /> Bağlantıyı kopyala</button>
            </div>
            {feedback && <p className="paste-feedback"><Check size={13} strokeWidth={2.5} /> {feedback}</p>}
          </section>

          <aside className="paste-library" aria-label="Kaydedilen notlar">
            <div className="paste-library-head"><span>KAYITLI NOTLAR</span><small>Bu tarayıcıda</small></div>
            <div className="paste-list">
              {pastes.map((paste) => (
                <div className="paste-item" key={paste.id}>
                  <button type="button" onClick={() => { setTitle(paste.title); setContent(paste.content); showFeedback('Not açıldı') }}>
                    <strong>{paste.title}</strong><small>{paste.content.slice(0, 54) || 'Boş not'}{paste.content.length > 54 ? '…' : ''}</small>
                  </button>
                  <button type="button" className="paste-remove" onClick={() => setPastes((items) => items.filter((item) => item.id !== paste.id))} aria-label="Notu sil"><Trash2 size={13} strokeWidth={2.1} /></button>
                </div>
              ))}
              {pastes.length === 0 && <p className="paste-empty">Kaydettiğin notlar burada durur.</p>}
            </div>
          </aside>
        </div>

        <footer className="paste-foot">Paylaşım bağlantısı notun içeriğini URL’de taşır; gizli bilgi ekleme.</footer>
      </section>
    </div>
  )
}
