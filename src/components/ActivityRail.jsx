import { Activity, ArrowDownRight, Sparkles } from 'lucide-react'
import { DEV_LOG, NOW, TAG_LABEL } from '../lib/log.js'

function shortDate(value) {
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`))
}

// Portfolyonun canlı kaldığını gösteren kısa geliştirme akışı.
export default function ActivityRail() {
  return (
    <section className="activity-rail" aria-label="Geliştirme akışı">
      <div className="activity-now">
        <span className="activity-now-icon"><Activity size={17} strokeWidth={2.2} /></span>
        <div>
          <span className="activity-eyebrow"><i /> Şu an üzerinde çalışıyorum</span>
          <p>{NOW}</p>
        </div>
      </div>

      <div className="activity-updates">
        <div className="activity-heading">
          <span><Sparkles size={15} strokeWidth={2} /> Son güncellemeler</span>
          <a href="#projects">Panoya git <ArrowDownRight size={14} strokeWidth={2.1} /></a>
        </div>
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
    </section>
  )
}
