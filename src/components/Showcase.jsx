import { useMemo, useState } from 'react'
import { ArrowUpRight, Lock } from 'lucide-react'
import { gradientById } from '../lib/gradients'
import { iconById } from '../lib/icons'
import { CATEGORIES, categoryName, normalizeCategory } from '../lib/projects'
import Shot from './Shot.jsx'

// Vitrin: projelerin zengin görünümü + kategori filtreleri.
export default function Showcase({ sites, isAdmin, onDetail }) {
  const [cat, setCat] = useState('all')

  const counts = useMemo(() => {
    const map = { all: sites.length }
    sites.forEach((s) => {
      const c = normalizeCategory(s.category)
      map[c] = (map[c] || 0) + 1
    })
    return map
  }, [sites])

  const list = useMemo(
    () =>
      cat === 'all'
        ? sites
        : sites.filter((s) => normalizeCategory(s.category) === cat),
    [sites, cat]
  )

  return (
    <section className="showcase">
      <div className="showcase-head">
        <div className="filters" role="group" aria-label="Proje filtresi">
          {CATEGORIES.map((c) => {
            const n = counts[c.id] || 0
            return (
              <button
                key={c.id}
                type="button"
                className={'filter-chip' + (cat === c.id ? ' filter-chip--on' : '')}
                onClick={() => setCat(c.id)}
                aria-pressed={cat === c.id}
              >
                {c.name}
                <span className="filter-count">{n}</span>
              </button>
            )
          })}
        </div>
        <span className="showcase-count">
          {list.length} proje{cat !== 'all' ? ` · ${categoryName(cat)}` : ''}
        </span>
      </div>

      {list.length === 0 ? (
        <p className="showcase-empty">Bu kategoride henüz proje yok.</p>
      ) : (
        <div className="project-grid">
          {list.map((site) => {
            const gradient = gradientById(site.gradient)
            const Icon = iconById(site.icon)
            const tags = Array.isArray(site.tags) ? site.tags : []
            const locked = !isAdmin && !site.public

            return (
              <article
                key={site.id}
                className="project"
                onClick={() => onDetail(site)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onDetail(site)
                  }
                }}
              >
                <div className="project-cover" style={{ background: gradient.css }}>
                  {site.public && site.url && (
                    <Shot url={site.url} className="project-shot" alt="" />
                  )}
                  <span className="project-icon">
                    <Icon size={18} strokeWidth={1.9} />
                  </span>
                  <span className="project-cat">{categoryName(site.category)}</span>
                  {locked && (
                    <span className="project-lock" title="Ziyaretçilere kapalı">
                      <Lock size={12} strokeWidth={2.3} />
                    </span>
                  )}
                  <span className="project-open">
                    <ArrowUpRight size={15} strokeWidth={2.2} />
                  </span>
                </div>

                <div className="project-body">
                  <h3 className="project-title">{site.title}</h3>
                  {site.description && (
                    <p className="project-desc">{site.description}</p>
                  )}

                  {tags.length > 0 && (
                    <div className="project-tags">
                      {tags.slice(0, 3).map((t) => (
                        <span key={t} className="tag tag--sm">
                          {t}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="tag tag--sm">+{tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
