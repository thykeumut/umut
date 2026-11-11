import { BarChart3, Eye, EyeOff, FilePlus2, Inbox, LayoutGrid, Pencil, Star, X } from 'lucide-react'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(new Date(value))
  } catch {
    return '—'
  }
}

export default function AdminConsole({
  open,
  sites,
  briefs,
  verifiedVisitors,
  onClose,
  onAdd,
  onEdit,
  onTogglePublic,
  onToggleFeatured,
  onInbox,
  onStats,
  onReset,
}) {
  if (!open) return null
  const publicCount = sites.filter((site) => site.public).length
  const privateCount = sites.length - publicCount
  const featured = sites.find((site) => site.featured)
  const recent = [...sites]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 8)

  return (
    <div className="brief-backdrop admin-console-backdrop" onPointerDown={onClose}>
      <section className="brief-panel admin-console" role="dialog" aria-modal="true" aria-label="Yönetim merkezi" onPointerDown={(event) => event.stopPropagation()}>
        <header className="brief-head">
          <div>
            <span><LayoutGrid size={13} strokeWidth={2.2} /> THYKE / YÖNETİM MERKEZİ</span>
            <h2>Portföy kontrol paneli</h2>
            <p>Projeleri, görünürlüğü ve gelenleri tek yerden yönet.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Yönetim merkezini kapat"><X size={16} strokeWidth={2.3} /></button>
        </header>

        <div className="admin-console-metrics">
          <div><b>{sites.length}</b><span>toplam proje</span></div>
          <div><b>{publicCount}</b><span>ziyaretçiye açık</span></div>
          <div><b>{privateCount}</b><span>taslak / kapalı</span></div>
          <div><b>{briefs.length + verifiedVisitors.length}</b><span>toplam gelen kayıt</span></div>
        </div>

        <div className="admin-console-actions">
          <button type="button" className="btn btn-primary" onClick={onAdd}><FilePlus2 size={15} /> Yeni site</button>
          <button type="button" className="btn btn-ghost" onClick={onInbox}><Inbox size={15} /> Briefler <b>{briefs.length}</b></button>
          <button type="button" className="btn btn-ghost" onClick={onStats}><BarChart3 size={15} /> Ziyaretçiler <b>{verifiedVisitors.length}</b></button>
          <button type="button" className="btn btn-ghost" onClick={onReset}><LayoutGrid size={15} /> Yerleşimi düzenle</button>
        </div>

        <div className="admin-console-status">
          <span>VİTRİN</span>
          <strong>{featured ? featured.title : 'Henüz vitrin projesi seçilmedi'}</strong>
          <small>{featured ? 'Öne çıkarılmış proje aktif.' : 'Bir projeyi yıldızlayarak seçebilirsin.'}</small>
        </div>

        <section className="admin-project-list" aria-label="Proje yönetimi">
          <div className="admin-project-list-head"><span>PROJELER</span><small>Son güncellenenler</small></div>
          {recent.map((site) => (
            <article key={site.id} className="admin-project-row">
              <div className="admin-project-main">
                <strong>{site.title}</strong>
                <small>{site.public ? 'Canlı' : 'Kapalı'} · {formatDate(site.updatedAt || site.createdAt)}</small>
              </div>
              <div className="admin-project-actions">
                <button type="button" onClick={() => onToggleFeatured(site.id)} title={site.featured ? 'Vitrinden çıkar' : 'Vitrine al'} aria-label={site.featured ? 'Vitrinden çıkar' : 'Vitrine al'} className={site.featured ? 'is-on' : ''}><Star size={14} fill={site.featured ? 'currentColor' : 'none'} /></button>
                <button type="button" onClick={() => onTogglePublic(site.id)} title={site.public ? 'Ziyaretçiye kapat' : 'Ziyaretçiye aç'} aria-label={site.public ? 'Ziyaretçiye kapat' : 'Ziyaretçiye aç'}>{site.public ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                <button type="button" onClick={() => onEdit(site)} title="Projeyi düzenle" aria-label="Projeyi düzenle"><Pencil size={14} /></button>
              </div>
            </article>
          ))}
        </section>
      </section>
    </div>
  )
}
