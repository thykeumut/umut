import { Command, ExternalLink, FolderPlus, Info, Search, TerminalSquare, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { categoryName } from '../lib/projects.js'

// Klavyeyle ve görünür kısayolla erişilen proje / eylem merkezi.
export default function QuickCommand({
  open,
  onClose,
  sites,
  isAdmin,
  onOpenSite,
  onShowDetail,
  onOpenTerminal,
  onAdmin,
  onAdd,
}) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onClose(open ? false : true)
      }
      if (event.key === 'Escape' && open) onClose(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return undefined
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 10)
    return () => window.clearTimeout(timer)
  }, [open])

  const visibleSites = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr')
    const pool = isAdmin ? sites : sites.filter((site) => site.public)
    if (!normalized) return pool.slice(0, 6)
    return pool
      .filter((site) => [site.title, site.description, site.category, ...(site.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('tr')
        .includes(normalized))
      .slice(0, 7)
  }, [query, sites, isAdmin])

  if (!open) return null

  const run = (callback) => {
    onClose(false)
    callback()
  }

  return (
    <div className="quick-command-backdrop" role="presentation" onMouseDown={() => onClose(false)}>
      <section
        className="quick-command"
        role="dialog"
        aria-modal="true"
        aria-label="Hızlı komutlar"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="quick-command-search">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Proje veya komut ara..."
            aria-label="Proje veya komut ara"
          />
          <kbd>ESC</kbd>
          <button type="button" onClick={() => onClose(false)} aria-label="Komut merkezini kapat">
            <X size={17} strokeWidth={2.2} />
          </button>
        </div>

        <div className="quick-command-list">
          {!query && <p className="quick-command-label">Hızlı işlemler</p>}
          {!query && (
            <>
              <button type="button" className="quick-command-item" onClick={() => run(onOpenTerminal)}>
                <TerminalSquare size={17} />
                <span><strong>Gizli terminali aç</strong><small>Komutları keşfet</small></span>
                <kbd>~</kbd>
              </button>
              <button type="button" className="quick-command-item" onClick={() => run(onAdmin)}>
                <Command size={17} />
                <span><strong>{isAdmin ? 'Yönetici görünümünü kapat' : 'Yönetici girişi'}</strong><small>Siteyi yönet</small></span>
              </button>
              {isAdmin && (
                <button type="button" className="quick-command-item" onClick={() => run(onAdd)}>
                  <FolderPlus size={17} />
                  <span><strong>Yeni site ekle</strong><small>Panoya kart ekle</small></span>
                </button>
              )}
            </>
          )}

          <p className="quick-command-label">Projeler</p>
          {visibleSites.map((site) => (
            <div className="quick-command-project" key={site.id}>
              <button type="button" onClick={() => run(() => onOpenSite(site))}>
                <ExternalLink size={16} />
                <span><strong>{site.title}</strong><small>{categoryName(site.category)}{site.description ? ` · ${site.description}` : ''}</small></span>
              </button>
              <button
                type="button"
                className="quick-command-detail"
                onClick={() => run(() => onShowDetail(site))}
                aria-label={`${site.title} detayları`}
                title="Detaylar"
              >
                <Info size={16} />
              </button>
            </div>
          ))}
          {visibleSites.length === 0 && <p className="quick-command-empty">Eşleşen proje bulunamadı.</p>}
        </div>

        <footer><span><kbd>Ctrl</kbd><kbd>K</kbd> hızlı aç</span><span>Projelerini hızlıca aç</span></footer>
      </section>
    </div>
  )
}
