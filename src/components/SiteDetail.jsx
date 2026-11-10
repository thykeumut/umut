import { useEffect } from 'react'
import { X, ArrowUpRight, GitBranch, Lock, Pencil, Share2 } from 'lucide-react'
import { gradientById } from '../lib/gradients'
import { iconById } from '../lib/icons'
import { categoryName, prettyUrl } from '../lib/projects'
import Shot from './Shot.jsx'

// Proje detay paneli: büyük önizleme, teknolojiler, hikâye, bağlantılar.
export default function SiteDetail({ site, isAdmin, onClose, onOpenSite, onEdit, onShare }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!site) return null

  const canSee = isAdmin || site.public
  const gradient = gradientById(site.gradient)
  const Icon = iconById(site.icon)
  const tags = Array.isArray(site.tags) ? site.tags : []

  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div
        className="modal modal--wide"
        role="dialog"
        aria-label={site.title}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="detail-heading">
            <span className="detail-cat">{categoryName(site.category)}</span>
            <h2>{site.title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} title="Kapat">
            <X size={15} strokeWidth={2.3} />
          </button>
        </div>

        <div className="detail">
          <div className="detail-media" style={{ background: gradient.css }}>
            {canSee && site.url ? (
              <Shot url={site.url} className="detail-shot" width={1000} height={620} alt="" />
            ) : (
              <div className="detail-locked">
                <Lock size={22} strokeWidth={1.8} />
                <span>Bu proje yalnızca sahibine açık</span>
              </div>
            )}
            <span className="detail-icon">
              <Icon size={22} strokeWidth={1.9} />
            </span>
          </div>

          <div className="detail-body">
            {site.description && <p className="detail-desc">{site.description}</p>}

            {site.story && <p className="detail-story">{site.story}</p>}

            {tags.length > 0 && (
              <div className="detail-tags">
                {tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="detail-meta">
              {site.public && site.url && (
                <span className="detail-url">{prettyUrl(site.url)}</span>
              )}
              {!site.public && <span className="detail-url">adres gizli</span>}
            </div>

            <div className="detail-actions">
              {canSee && site.url ? (
                <button className="btn btn-primary" onClick={() => onOpenSite(site)}>
                  <ArrowUpRight size={15} strokeWidth={2.2} />
                  Siteyi Aç
                </button>
              ) : (
                <button className="btn btn-ghost" disabled>
                  <Lock size={14} strokeWidth={2.2} />
                  Ziyaretçilere kapalı
                </button>
              )}

              {site.repo && (
                <a
                  className="btn btn-ghost"
                  href={site.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <GitBranch size={15} strokeWidth={2.1} />
                  GitHub
                </a>
              )}

              {site.public && (
                <button className="btn btn-ghost" onClick={() => onShare(site)}>
                  <Share2 size={14} strokeWidth={2.1} />
                  Paylaş
                </button>
              )}

              {isAdmin && (
                <button className="btn btn-ghost" onClick={() => onEdit(site)}>
                  <Pencil size={14} strokeWidth={2.1} />
                  Düzenle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
