import { ArrowDown, ArrowUpRight, CircleDot, Layers3, Sparkles } from 'lucide-react'
import { iconById } from '../lib/icons'
import { categoryName, statusName } from '../lib/projects'

const STATUS_ORDER = ['live', 'building', 'archive']

// Portfolyodaki mevcut kartlardan otomatik beslenen geniş çalışma özeti.
export default function WorkPulse({ sites, featuredSite, onExplore, onSelect }) {
  const visibleSites = sites.filter((site) => site.public)
  const statusCounts = STATUS_ORDER.map((status) => ({
    status,
    count: visibleSites.filter((site) => site.status === status).length,
  }))
  const categoryCounts = [...new Set(visibleSites.map((site) => site.category))]
    .map((category) => ({
      category,
      count: visibleSites.filter((site) => site.category === category).length,
    }))

  const focusSite = visibleSites.find((site) => site.status === 'building') || featuredSite || visibleSites[0]
  const FocusIcon = focusSite ? iconById(focusSite.icon) : Sparkles

  return (
    <section className="work-pulse" aria-labelledby="work-pulse-title">
      <div className="work-pulse-copy">
        <span className="work-pulse-kicker"><CircleDot size={13} strokeWidth={2.3} /> ŞU AN</span>
        <h2 id="work-pulse-title">Üretim akışı <span>canlı.</span></h2>
        <p>
          Burada yalnızca bitmiş işler değil, üzerinde çalışılan fikirlerin yönü de görünür.
        </p>
        <button type="button" className="work-pulse-link" onClick={onExplore}>
          Tüm projelere geç <ArrowDown size={15} strokeWidth={2.2} />
        </button>
      </div>

      <div className="work-pulse-panel">
        {focusSite && (
          <button type="button" className="work-focus" onClick={() => onSelect(focusSite)}>
            <span className="work-focus-icon"><FocusIcon size={21} strokeWidth={1.9} /></span>
            <span className="work-focus-copy">
              <small>ÖNE ÇIKAN AKIŞ</small>
              <strong>{focusSite.title}</strong>
              <em>{statusName(focusSite.status)} · {categoryName(focusSite.category)}</em>
            </span>
            <ArrowUpRight size={18} strokeWidth={2.1} aria-hidden="true" />
          </button>
        )}

        <div className="work-metrics" aria-label="Proje durumları">
          {statusCounts.map(({ status, count }) => (
            <div className={'work-metric work-metric--' + status} key={status}>
              <strong>{count}</strong>
              <span>{statusName(status)}</span>
            </div>
          ))}
        </div>

        <div className="work-categories" aria-label="Çalışma alanları">
          <span className="work-categories-label"><Layers3 size={13} strokeWidth={2.1} /> ALANLAR</span>
          {categoryCounts.map(({ category, count }) => (
            <span key={category} className="work-category">{categoryName(category)} <b>{count}</b></span>
          ))}
        </div>
      </div>
    </section>
  )
}
