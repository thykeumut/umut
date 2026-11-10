import { ArrowUpRight, Info, Lock, RefreshCw } from 'lucide-react'
import { gradientById } from '../lib/gradients'
import { iconById } from '../lib/icons'
import { categoryName, prettyUrl } from '../lib/projects'
import Shot from './Shot.jsx'

// Panonun üstündeki vitrin: tek bir projeyi büyük ve okunur biçimde gösterir.
// Yönetici karttaki yıldızla hangi projenin öne çıkacağını seçebilir;
// seçim yoksa ilk herkese açık proje gösterilir.
export default function Featured({ site, isAdmin, onOpen, onDetail, onShuffle }) {
  if (!site) return null

  const gradient = gradientById(site.gradient)
  const Icon = iconById(site.icon)
  const tags = Array.isArray(site.tags) ? site.tags : []
  const canOpen = isAdmin || site.public

  return (
    <section className="featured" aria-label="Öne çıkan proje">
      <div className="featured-media" style={{ background: gradient.css }}>
        {site.public && site.url ? (
          <Shot url={site.url} className="featured-shot" width={1200} height={720} alt="" />
        ) : (
          <div className="featured-locked">
            <Lock size={20} strokeWidth={1.8} />
            <span>Yalnızca sahibine açık</span>
          </div>
        )}
        <span className="featured-icon">
          <Icon size={20} strokeWidth={1.9} />
        </span>
      </div>

      <div className="featured-body">
        <div className="featured-topline">
          <span className="featured-label">Keşif vitrini</span>
          <button
            type="button"
            className="featured-shuffle"
            onClick={onShuffle}
            title="Başka proje göster"
            aria-label="Başka proje göster"
          >
            <RefreshCw size={15} strokeWidth={2.1} />
          </button>
        </div>
        <h2 className="featured-title">{site.title}</h2>

        <p className="featured-meta">
          <span>{categoryName(site.category)}</span>
          {site.public && site.url && (
            <>
              <span className="featured-dot">•</span>
              <span>{prettyUrl(site.url)}</span>
            </>
          )}
        </p>

        {site.description && <p className="featured-desc">{site.description}</p>}

        {tags.length > 0 && (
          <div className="featured-tags">
            {tags.slice(0, 4).map((t) => (
              <span key={t} className="tag tag--sm">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="featured-actions">
          {canOpen && site.url ? (
            <button className="btn btn-primary" onClick={() => onOpen(site)}>
              <ArrowUpRight size={15} strokeWidth={2.2} />
              Siteyi aç
            </button>
          ) : (
            <span className="featured-private">
              <Lock size={13} strokeWidth={2.2} />
              Ziyaretçilere kapalı
            </span>
          )}

          <button className="btn btn-ghost" onClick={() => onDetail(site)}>
            <Info size={15} strokeWidth={2.1} />
            Detaylar
          </button>
        </div>
      </div>
    </section>
  )
}
