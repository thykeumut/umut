import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Command, Search, TerminalSquare, X } from 'lucide-react'
import { categoryName } from '../lib/projects'
import { iconById } from '../lib/icons'

// Ctrl/Cmd + K ile açılan, ziyaretçinin projeleri hızlıca bulduğu küçük komut penceresi.
export default function QuickCommand({ open, sites, onClose, onDetail, onTerminal }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const publicSites = useMemo(() => sites.filter((site) => site.public), [sites])
  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr')
    if (!needle) return publicSites.slice(0, 7)
    return publicSites.filter((site) =>
      [site.title, site.description, site.category, ...(site.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('tr')
        .includes(needle)
    ).slice(0, 7)
  }, [publicSites, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 30)
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const openProject = (site) => {
    onDetail(site)
    onClose()
  }

  return (
    <div className="quick-command-backdrop" role="presentation" onPointerDown={onClose}>
      <section className="quick-command" role="dialog" aria-modal="true" aria-label="Hızlı proje bulucu" onPointerDown={(event) => event.stopPropagation()}>
        <label className="quick-command-search">
          <Search size={18} strokeWidth={2.1} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Proje, teknoloji veya kategori ara..."
            aria-label="Hızlı proje ara"
          />
          <button type="button" onClick={onClose} aria-label="Kapat" title="Kapat">
            <X size={17} strokeWidth={2.2} />
          </button>
        </label>

        <div className="quick-command-list">
          {!query && (
            <>
              <p className="quick-command-label">Hızlı işlemler</p>
              <button type="button" className="quick-command-item" onClick={() => { onTerminal(); onClose() }}>
                <TerminalSquare size={17} strokeWidth={2} />
                <span><strong>Gizli terminal</strong><small>Komutları çalıştır ve projeleri ara</small></span>
                <kbd>~</kbd>
              </button>
            </>
          )}

          <p className="quick-command-label">{query ? 'Sonuçlar' : 'Projeler'}</p>
          {results.map((site) => {
            const Icon = iconById(site.icon)
            return (
              <div className="quick-command-project" key={site.id}>
                <button type="button" onClick={() => openProject(site)}>
                  <Icon size={17} strokeWidth={2} />
                  <span><strong>{site.title}</strong><small>{categoryName(site.category)} · detayları aç</small></span>
                </button>
                <button type="button" className="quick-command-detail" onClick={() => openProject(site)} aria-label={`${site.title} detayları`} title="Detayları aç">
                  <ArrowUpRight size={16} strokeWidth={2.1} />
                </button>
              </div>
            )
          })}
          {results.length === 0 && <p className="quick-command-empty">Bu aramayla eşleşen proje yok.</p>}
        </div>

        <footer>
          <span><Command size={12} strokeWidth={2} /> Ctrl / ⌘ + K</span>
          <span><kbd>Esc</kbd> kapat</span>
        </footer>
      </section>
    </div>
  )
}
