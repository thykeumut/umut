import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Copy, Globe, Info, Lock, Trash2, GripVertical, Heart, Star } from 'lucide-react'
import { gradientById } from '../lib/gradients'
import { iconById, iconNameById } from '../lib/icons'
import { categoryName, prettyUrl, statusName } from '../lib/projects'
import Shot from './Shot.jsx'

// Tek bir proje kartı. Sürükleme + tıklayınca siteyi açma.
// Yönetim düğmeleri (sil / ziyaretçilere aç-kapat) sadece yöneticiye görünür.
export default function SiteCard({
  site,
  boardRef,
  onMove,
  onOpen,
  onDetail,
  onDelete,
  onTogglePublic,
  onFocus,
  isAdmin,
  isActive,
  isNew,
  draggingEnabled,
  flowMode,
  isFavorite,
  onToggleFavorite,
  onCopyLink,
  isFeatured,
  onToggleFeatured,
}) {
  const cardRef = useRef(null)
  const drag = useRef(null)
  const glideTimer = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [gliding, setGliding] = useState(false)

  useEffect(() => {
    return () => {
      drag.current?.cleanup?.()
      clearTimeout(glideTimer.current)
    }
  }, [])

  const clamp = (x, y) => {
    const board = boardRef.current
    const el = cardRef.current
    if (!board || !el) return { x, y }
    const maxX = Math.max(0, board.clientWidth - el.offsetWidth)
    // Yönetici sürüklerken pano alta doğru büyür. Bu pay, kartın mevcut pano
    // yüksekliğine hapsolmasını engeller; onMove pano boyunu kalıcı büyütür.
    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.max(0, y),
    }
  }

  const handlePointerDown = (e) => {
    onFocus(site.id)
    if (e.button !== 0) return
    if (e.target.closest('[data-no-drag]')) return

    // Sürükleme kapalıyken de tıklamayı yakalayabilmek için kayıt tut
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: site.x,
      originY: site.y,
      moved: false,
      lastX: e.clientX,
      lastY: e.clientY,
      lastAt: performance.now(),
      velocityX: 0,
      velocityY: 0,
      lastPos: { x: site.x, y: site.y },
    }
    clearTimeout(glideTimer.current)
    setGliding(false)

    if (!draggingEnabled) {
      beginTapTracking()
      return
    }

    beginTracking()
    const el = e.currentTarget
    try {
      el.setPointerCapture(e.pointerId)
      if (drag.current?.cleanup) return
      const forwardMove = (event) => handlePointerMove(event)
      const forwardEnd = (event) => endDrag(event)
      const cleanup = () => {
        window.removeEventListener('pointermove', forwardMove)
        window.removeEventListener('pointerup', forwardEnd)
        window.removeEventListener('pointercancel', forwardEnd)
      }
      drag.current.cleanup = cleanup
      window.addEventListener('pointermove', forwardMove)
      window.addEventListener('pointerup', forwardEnd)
      window.addEventListener('pointercancel', forwardEnd)
    } catch {
      if (drag.current?.cleanup) return
      const forwardMove = (event) => handlePointerMove(event)
      const forwardEnd = (event) => endDrag(event)
      const cleanup = () => {
        window.removeEventListener('pointermove', forwardMove)
        window.removeEventListener('pointerup', forwardEnd)
        window.removeEventListener('pointercancel', forwardEnd)
      }
      drag.current.cleanup = cleanup
      window.addEventListener('pointermove', forwardMove)
      window.addEventListener('pointerup', forwardEnd)
      window.addEventListener('pointercancel', forwardEnd)
      /* bazı tarayıcılarda güvenli değil, sorun değil */
    }
  }

  const handlePointerMove = (e) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    if (!draggingEnabled) return

    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY

    // A click often has a few pixels of pointer movement. Keep it a click
    // until the user clearly intends to drag the card.
    if (!d.moved && Math.hypot(dx, dy) > 12) {
      d.moved = true
      setDragging(true)
    }
    if (!d.moved) return

    const pos = clamp(d.originX + dx, d.originY + dy)
    const now = performance.now()
    const elapsed = Math.max(16, now - d.lastAt)
    d.velocityX = (e.clientX - d.lastX) / elapsed
    d.velocityY = (e.clientY - d.lastY) / elapsed
    d.lastX = e.clientX
    d.lastY = e.clientY
    d.lastAt = now
    d.lastPos = pos
    onMove(site.id, pos.x, pos.y)
  }

  const endDrag = (e) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const wasMoved = d.moved
    d.cleanup?.()
    drag.current = null
    setDragging(false)
    if (wasMoved && d.lastPos && Math.hypot(d.velocityX, d.velocityY) > 0.22) {
      const glide = clamp(
        d.lastPos.x + Math.max(-96, Math.min(96, d.velocityX * 88)),
        d.lastPos.y + Math.max(-96, Math.min(96, d.velocityY * 88))
      )
      setGliding(true)
      onMove(site.id, glide.x, glide.y)
      clearTimeout(glideTimer.current)
      glideTimer.current = window.setTimeout(() => setGliding(false), 380)
    }
    // Yönetimde kart tıklaması önce kart araçlarını açar. Böylece imleç
    // kartın üstüne gelir gelmez butonlar fırlamaz; ziyaretçilerdeyse tıklama
    // doğrudan siteyi açmaya devam eder.
    if (!wasMoved && !isAdmin) onOpen(site)
  }

  const beginTracking = () => {
    const forwardMove = (event) => handlePointerMove(event)
    const forwardEnd = (event) => endDrag(event)
    const cleanup = () => {
      window.removeEventListener('pointermove', forwardMove)
      window.removeEventListener('pointerup', forwardEnd)
      window.removeEventListener('pointercancel', forwardEnd)
    }
    drag.current.cleanup = cleanup
    window.addEventListener('pointermove', forwardMove)
    window.addEventListener('pointerup', forwardEnd)
    window.addEventListener('pointercancel', forwardEnd)
  }

  const beginTapTracking = () => {
    const markMoved = (event) => {
      const d = drag.current
      if (!d || d.id !== event.pointerId) return
      if (Math.hypot(event.clientX - d.startX, event.clientY - d.startY) > 12) d.moved = true
    }
    const finish = (event) => {
      markMoved(event)
      endDrag(event)
    }
    const cleanup = () => {
      window.removeEventListener('pointermove', markMoved)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
    }
    drag.current.cleanup = cleanup
    window.addEventListener('pointermove', markMoved)
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
  }

  const gradient = gradientById(site.gradient)
  const isPublic = !!site.public
  const projectStatus = site.status || (isPublic ? 'live' : 'building')
  const SiteIcon = iconById(site.icon)
  const cardTags = Array.isArray(site.tags) ? site.tags.slice(0, 2) : []
  const cardStyle = flowMode
    ? undefined
    : {
        left: site.x,
        top: site.y,
        zIndex: isActive ? 40 : 1,
      }

  return (
    <article
      ref={cardRef}
      data-site-id={site.id}
      className={[
        'card',
        dragging ? 'card--dragging' : '',
        gliding ? 'card--gliding' : '',
        isActive ? 'card--active' : '',
        isNew ? 'card--new' : '',
        isFavorite ? 'card--fav' : '',
        draggingEnabled ? '' : 'card--static',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        // Konum her zaman uygulanır (ziyaretçi de kartları doğru yerde görsün).
        // Sadece mobil akış modunda CSS düzeni geçerli olduğu için uygulanmaz.
        cardStyle
      }
      onPointerDown={handlePointerDown}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className={
          'card-cover' + (isPublic && site.url ? ' card-cover--shot' : '')
        }
        style={{ background: gradient.css }}
      >
        {/* Sitenin küçük önizlemesi — yalnızca herkese açık kartlarda.
            Gizli kartlarda gösterilmez: görsel adresi sızdırırdı. */}
        {isPublic && site.url && (
          <Shot url={site.url} className="card-shot" alt="" />
        )}

        <span className="card-icon-wrap" title={iconNameById(site.icon)}>
          <SiteIcon className="card-icon" size={23} strokeWidth={1.9} />
        </span>

        <span className="card-cat">{categoryName(site.category)}</span>

        {isPublic && (
          <span className={'card-live card-live--' + projectStatus} title={statusName(projectStatus)}>
            <i aria-hidden="true" /> {statusName(projectStatus)}
          </span>
        )}

        {!isPublic && (
          <span className="card-lock" title="Bu site ziyaretçilere kapalı">
            <Lock size={13} strokeWidth={2.3} />
          </span>
        )}

        {!isAdmin && isPublic && site.url && (
          <button
            type="button"
            className="card-copy"
            data-no-drag
            title="Bağlantıyı kopyala"
            aria-label="Bağlantıyı kopyala"
            onClick={(e) => {
              e.stopPropagation()
              onCopyLink(site)
            }}
          >
            <Copy size={14} strokeWidth={2.2} />
          </button>
        )}

        {!isAdmin && (
          <button
            type="button"
            className="card-detail"
            data-no-drag
            title="Proje detayları"
            aria-label={`${site.title} proje detayları`}
            onClick={(e) => {
              e.stopPropagation()
              onDetail(site)
            }}
          >
            <Info size={14} strokeWidth={2.2} />
          </button>
        )}

        {!isAdmin && (
          <button
            type="button"
            className={'card-favorite' + (isFavorite ? ' card-favorite--on' : '')}
            data-no-drag
            title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(site.id)
            }}
          >
            <Heart size={15} strokeWidth={2.1} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}

        {isAdmin && (
          <div className="card-actions" data-no-drag>
            <button
              className={
                'icon-btn' + (isFeatured ? ' icon-btn--star' : '')
              }
              title={isFeatured ? 'Vitrinden çıkar' : 'Vitrine ekle'}
              onClick={(e) => {
                e.stopPropagation()
                onToggleFeatured(site.id)
              }}
            >
              <Star
                size={14}
                strokeWidth={2.1}
                fill={isFeatured ? 'currentColor' : 'none'}
              />
            </button>
            <button
              className="icon-btn"
              title="Siteyi aç"
              onClick={(e) => {
                e.stopPropagation()
                onOpen(site)
              }}
            >
              <ArrowUpRight size={15} strokeWidth={2.2} />
            </button>
            <button
              className={
                'icon-btn' + (isPublic ? ' icon-btn--world' : ' icon-btn--lock')
              }
              title={
                isPublic
                  ? 'Ziyaretçilere kapat'
                  : 'Ziyaretçilere aç (karttan tıklanıp gidilebilsin)'
              }
              onClick={(e) => {
                e.stopPropagation()
                onTogglePublic(site.id)
              }}
            >
              {isPublic ? (
                <Globe size={14} strokeWidth={2.1} />
              ) : (
                <Lock size={14} strokeWidth={2.1} />
              )}
            </button>
            <button
              className="icon-btn icon-btn--danger"
              title="Kartı sil"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(site.id)
              }}
            >
              <Trash2 size={14} strokeWidth={2.1} />
            </button>
          </div>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title">{site.title}</h3>
        {site.description && <p className="card-desc">{site.description}</p>}
        {cardTags.length > 0 && (
          <div className="card-tech" aria-label="Kullanılan teknolojiler">
            {cardTags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        )}
        {/* Gizli kartlarda adres hiç yazılmaz (kopyalanıp gidilmesin). */}
        {isPublic && site.url && (
          <span className="card-url">
            <Globe size={11} strokeWidth={2.1} aria-hidden="true" />
            <span className="card-url-text">{prettyUrl(site.url)}</span>
          </span>
        )}
      </div>

      {dragging && (
        <span className="card-grip">
          <GripVertical size={15} strokeWidth={2} />
        </span>
      )}
    </article>
  )
}
