import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { GRADIENTS } from '../lib/gradients'
import { ICONS } from '../lib/icons'

const EMPTY = {
  title: '',
  url: '',
  description: '',
  icon: 'rocket',
  gradient: 'auto',
  public: false,
}

// Yeni site ekleme paneli (modal)
export default function AddSiteModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setError('')
    }
  }, [open])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('Kart için bir başlık gir.')
    if (!form.url.trim()) return setError('Bir site adresi (link) gir.')
    onSubmit({ ...form, title: form.title.trim(), url: form.url.trim() })
  }

  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div className="modal" onPointerDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Yeni Site Ekle</h2>
          <button className="icon-btn" onClick={onClose} title="Kapat">
            <X size={15} strokeWidth={2.3} />
          </button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <label>
            Başlık
            <input
              value={form.title}
              onChange={set('title')}
              placeholder="Örn: Kişisel blogum"
              autoFocus
            />
          </label>

          <label>
            Site adresi (URL)
            <input
              value={form.url}
              onChange={set('url')}
              placeholder="https://ornek.com"
            />
          </label>

          <label>
            Açıklama <span className="optional">(isteğe bağlı)</span>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="Kısa bir açıklama..."
            />
          </label>

          <div className="field">
            <span className="field-label">Simge</span>
            <div className="icon-grid">
              {ICONS.map(({ id, name, Icon }) => (
                <button
                  key={id}
                  type="button"
                  title={name}
                  aria-label={name}
                  className={
                    'icon-opt' + (form.icon === id ? ' icon-opt--on' : '')
                  }
                  onClick={() => setForm((f) => ({ ...f, icon: id }))}
                >
                  <Icon size={20} strokeWidth={1.7} />
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label">Kapak Rengi</span>
            <div className="swatches">
              {GRADIENTS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  title={g.label}
                  className={
                    'swatch' + (form.gradient === g.id ? ' swatch--on' : '')
                  }
                  style={{ background: g.css }}
                  onClick={() => setForm((f) => ({ ...f, gradient: g.id }))}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={form.public}
            className={'switch-row' + (form.public ? ' switch-row--on' : '')}
            onClick={() => setForm((f) => ({ ...f, public: !f.public }))}
          >
            <span className="switch-text">
              <strong>Ziyaretçiler bu siteye gidebilsin</strong>
              <small>
                Kapalıysa kart herkese görünür ama tıklayınca site açılmaz.
              </small>
            </span>
            <span className="switch" aria-hidden="true">
              <span className="switch-knob" />
            </span>
          </button>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" className="btn btn-primary">
              Kartı Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
