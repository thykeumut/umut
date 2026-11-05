import { useRef, useState } from 'react'
import { ArrowUpRight, Globe, Lock, Trash2, GripVertical, Heart } from 'lucide-react'
import { gradientById } from '../lib/gradients'
import { iconById, iconNameById } from '../lib/icons'
import { prettyUrl } from '../lib/projects'
import Shot from './Shot.jsx'

// Tek bir proje kartı. Sürükleme + tıklayınca siteyi açma.
// Yönetim düğmeleri (sil / ziyaretçilere aç-kapat) sadece yöneticiye görünür.
export default function SiteCard({
  site,
  boardRef,
  onMove,
  onOpen,
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
}) {
  const cardRef = useRef(null)
  const drag = useRef(null)
  const [dragging, setDragging] = useState(false)

  const clamp = (x, y) => {
    const board = boardRef.current
    const el = cardRef.current
    if (!board || !el) return { x, y }
    const maxX = Math.max(0, board.clientWidth - el.offsetWidth)
    // Yönetici sürüklerken pano alta doğru büyür. Bu pay, kartın mevcut pano
    // yüksekliğine hapsolmasını engeller; onMove pano boyunu kalıcı büyütür.
    const growRoom = draggingEnabled ? 360 : 0
    const maxY = Math.max(0, board.clientHeight - el.offsetHeight + growRoom)
    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY),
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
    }

    if (!draggingEnabled) return

    const el = e.currentTarget
    try {
      el.setPointerCapture(e.pointerId)
    } catch {
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
    onMove(site.id, pos.x, pos.y)
  }

  const endDrag = (e) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const wasMoved = d.moved
    drag.current = null
    setDragging(false)
    // Yönetimde kart tıklaması önce kart araçlarını açar. Böylece imleç
    // kartın üstüne gelir gelmez butonlar fırlamaz; ziyaretçilerdeyse tıklama
    // doğrudan siteyi açmaya devam eder.
    if (!wasMoved && !isAdmin) onOpen(site)
  }

  const gradient = gradientById(site.gradient)
  const isPublic = !!site.public
  const SiteIcon = iconById(site.icon)

  return (
    <article
      ref={cardRef}
      className={[
        'card',
        dragging ? 'card--dragging' : '',
        isActive ? 'card--active' : '',
        isNew ? 'card--new' : '',
        draggingEnabled ? '' : 'card--static',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        // Konum her zaman uygulanır (ziyaretçi de kartları doğru yerde görsün).
        // Sadece mobil akış modunda CSS düzeni geçerli olduğu için uygulanmaz.
        flowMode
          ? undefined
          : { left: site.x, top: site.y, zIndex: isActive ? 40 : 1 }
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
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

        {!isPublic && (
          <span className="card-lock" title="Bu site ziyaretçilere kapalı">
            <Lock size={13} strokeWidth={2.3} />
          </span>
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
        {/* Gizli kartlarda adres hiç yazılmaz (kopyalanıp gidilmesin). */}
        {isPublic && site.url && (
          <span className="card-url">{prettyUrl(site.url)}</span>
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
