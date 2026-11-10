import { Activity, ChevronDown, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { DEV_LOG, NOW, TAG_LABEL } from '../lib/log.js'

function shortDate(value) {
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`))
}

// Ana panoyu bölmeyen, isteğe bağlı gelişim günlüğü çekmecesi.
export default function ActivityRail() {
  const [open, setOpen] = useState(false)

  return (
    <section className={'activity-rail' + (open ? ' is-open' : '')} aria-label="Geliştirme günlüğü">
      <button
        type="button"
        className="activity-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span><Sparkles size={15} strokeWidth={2} /> Geliştirme günlüğü</span>
        <small>Son değişiklikler</small>
        <ChevronDown size={17} strokeWidth={2.1} />
      </button>

      {open && (
        <div className="activity-content">
          <div className="activity-now">
            <span className="activity-now-icon"><Activity size={17} strokeWidth={2.2} /></span>
            <div>
              <span className="activity-eyebrow"><i /> Şu an üzerinde çalışıyorum</span>
              <p>{NOW}</p>
            </div>
          </div>

          <div className="activity-updates">
            <p className="activity-heading">Son güncellemeler</p>
            <div className="activity-list">
              {DEV_LOG.slice(0, 3).map((item, index) => (
                <article className="activity-item" key={item.date + item.title} style={{ '--activity-delay': `${index * 80}ms` }}>
                  <time>{shortDate(item.date)}</time>
                  <div>
                    <span className={'activity-tag activity-tag--' + item.tag}>{TAG_LABEL[item.tag] || item.tag}</span>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
