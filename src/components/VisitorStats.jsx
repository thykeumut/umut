import { BarChart3, Users, X } from 'lucide-react'

function dateKey(offset = 0) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - offset)
  return date.toISOString().slice(0, 10)
}

function shortDay(key) {
  return new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(new Date(`${key}T12:00:00`))
}

export default function VisitorStats({ open, visits, onClose }) {
  if (!open) return null
  const days = Array.from({ length: 7 }, (_, index) => dateKey(6 - index))
  const counts = new Map(days.map((day) => [day, 0]))
  visits.forEach((visit) => counts.has(visit.day) && counts.set(visit.day, counts.get(visit.day) + 1))
  const max = Math.max(1, ...counts.values())
  const today = counts.get(dateKey()) || 0
  const weekly = [...counts.values()].reduce((sum, value) => sum + value, 0)

  return (
    <div className="brief-backdrop" onPointerDown={onClose}>
      <section className="brief-panel visitor-stats" role="dialog" aria-modal="true" aria-label="Ziyaretçi istatistikleri" onPointerDown={(event) => event.stopPropagation()}>
        <header className="brief-head">
          <div>
            <span><BarChart3 size={13} strokeWidth={2.2} /> THYKE / ZİYARETÇİLER</span>
            <h2>Ziyaretçi istatistikleri</h2>
            <p>Kişisel veri olmadan, tarayıcı başına günlük sayım.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Ziyaretçi istatistiklerini kapat"><X size={16} strokeWidth={2.3} /></button>
        </header>
        <div className="visitor-summary">
          <div><Users size={17} /><span><b>{today}</b> bugün</span></div>
          <div><BarChart3 size={17} /><span><b>{weekly}</b> son 7 gün</span></div>
          <div><span><b>{visits.length}</b> toplam kayıt</span></div>
        </div>
        <div className="visitor-chart" aria-label="Son yedi gün ziyaret grafiği">
          {days.map((day) => <div key={day}><i style={{ height: `${Math.max(5, (counts.get(day) / max) * 100)}%` }} title={`${counts.get(day)} ziyaret`} /><span>{shortDay(day)}</span><small>{counts.get(day)}</small></div>)}
        </div>
      </section>
    </div>
  )
}
