import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { GRADIENTS } from '../lib/gradients'
import { ICONS } from '../lib/icons'
import { PROJECT_CATEGORIES, cleanTags, normalizeCategory } from '../lib/projects'

const EMPTY = {
  title: '',
  url: '',
  description: '',
  icon: 'rocket',
  gradient: 'auto',
  public: false,
  category: 'web',
  tags: '',
  repo: '',
  story: '',
}

// Kart ekleme / düzenleme paneli.
export default function SiteModal({ open, site, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (site) {
      setForm({
        title: site.title || '',
        url: site.url || '',
        description: site.description || '',
        icon: site.icon || 'rocket',
        gradient: site.gradient || 'auto',
        public: !!site.public,
        category: normalizeCategory(site.category),
        tags: Array.isArray(site.tags) ? site.tags.join(', ') : site.tags || '',
        repo: site.repo || '',
        story: site.story || '',
      })
    } else {
      setForm(EMPTY)
    }
    setError('')
  }, [open, site])

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
    onSubmit({
      ...form,
      title: form.title.trim(),
      url: form.url.trim(),
      repo: form.repo.trim(),
      story: form.story.trim(),
      category: normalizeCategory(form.category),
      tags: cleanTags(form.tags),
    })
  }

  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div className="modal" onPointerDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{site ? 'Siteyi Düzenle' : 'Yeni Site Ekle'}</h2>
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

          <div className="form-section">
            <span className="form-section-title">
              Vitrin bilgileri <span className="optional">(isteğe bağlı)</span>
            </span>

            <div className="field">
              <span className="field-label">Kategori</span>
              <div className="cat-picker">
                {PROJECT_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={
                      'filter-chip filter-chip--sm' +
                      (form.category === c.id ? ' filter-chip--on' : '')
                    }
                    onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <label>
              Teknolojiler <span className="optional">(virgülle)</span>
              <input
                value={form.tags}
                onChange={set('tags')}
                placeholder="React, CSS, canvas"
              />
            </label>

            <label>
              GitHub bağlantısı
              <input
                value={form.repo}
                onChange={set('repo')}
                placeholder="https://github.com/thykeumut/..."
              />
            </label>

            <label>
              Kısa hikâye
              <textarea
                value={form.story}
                onChange={set('story')}
                rows={2}
                placeholder="Bu proje neden çıktı, neyi çözdü?"
              />
            </label>
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
              {site ? 'Değişiklikleri Kaydet' : 'Kartı Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
