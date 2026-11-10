import { ArrowUpRight, Clock3 } from 'lucide-react'
import { iconById } from '../lib/icons'
import { categoryName } from '../lib/projects'

// Ziyaretçinin kendi tarayıcısında tutulan kısa dönüş şeridi.
export default function RecentProjects({ sites, onSelect }) {
  if (!sites.length) return null

  return (
    <section className="recent-projects" aria-label="Son baktığın projeler">
      <div className="recent-title">
        <Clock3 size={14} strokeWidth={2} />
        <span>Kaldığın yer</span>
      </div>
      <div className="recent-list">
        {sites.map((site) => {
          const Icon = iconById(site.icon)
          return (
            <button key={site.id} type="button" className="recent-project" onClick={() => onSelect(site)}>
              <span className="recent-icon"><Icon size={15} strokeWidth={2} /></span>
              <span className="recent-copy">
                <strong>{site.title}</strong>
                <small>{categoryName(site.category)}</small>
              </span>
              <ArrowUpRight size={14} strokeWidth={2.1} aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </section>
  )
}
