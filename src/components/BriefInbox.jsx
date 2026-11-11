import { Inbox, Mail, Trash2, X } from 'lucide-react'

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return ''
  }
}

export default function BriefInbox({ open, briefs, onClose, onDelete }) {
  if (!open) return null

  return (
    <div className="brief-backdrop" onPointerDown={onClose}>
      <section className="brief-panel brief-inbox" role="dialog" aria-modal="true" aria-label="Gelen briefler" onPointerDown={(event) => event.stopPropagation()}>
        <header className="brief-head">
          <div>
            <span><Inbox size={13} strokeWidth={2.2} /> THYKE / GELEN KUTUSU</span>
            <h2>Gelen briefler</h2>
            <p>Ziyaretçilerin bıraktığı proje fikirleri burada görünür.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Gelen briefleri kapat"><X size={16} strokeWidth={2.3} /></button>
        </header>

        <div className="brief-inbox-list">
          {briefs.length ? briefs.map((brief) => (
            <article className="brief-inbox-item" key={brief._rowId}>
              <div className="brief-inbox-meta"><span>{brief.kind === 'feedback' ? `Geri bildirim · ${brief.subject || 'Genel'}` : (brief.projectType || 'Proje fikri')}</span><time>{formatDate(brief.createdAt)}</time></div>
              <p>{brief.kind === 'feedback' ? brief.message : brief.goal}</p>
              <dl>
                {brief.audience && <><dt>Hedef kitle</dt><dd>{brief.audience}</dd></>}
                {brief.style && <><dt>Yön</dt><dd>{brief.style}</dd></>}
                {brief.contact && <><dt><Mail size={12} /> İletişim</dt><dd>{brief.contact}</dd></>}
              </dl>
              <button type="button" className="brief-delete" onClick={() => onDelete(brief)} title="Briefi sil" aria-label="Briefi sil"><Trash2 size={14} /></button>
            </article>
          )) : <div className="brief-inbox-empty"><Inbox size={20} /><p>Henüz gelen bir brief yok.</p></div>}
        </div>
      </section>
    </div>
  )
}
