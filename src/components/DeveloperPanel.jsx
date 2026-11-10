import { useEffect, useState } from 'react'
import {
  GitBranch,
  Star,
  Users,
  FolderGit2,
  RefreshCw,
  ArrowUpRight,
  CircleDot,
} from 'lucide-react'
import { getGithubStats, timeAgo } from '../lib/githubStats.js'
import { DEV_LOG, NOW, TAG_LABEL } from '../lib/log.js'

const aylar = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]

const STATUS_ITEMS = [
  {
    name: 'Portföy',
    detail: 'Pano, Hakkımda ve proje detayları',
    state: 'Operasyonel',
  },
  {
    name: 'Veri ve yayın',
    detail: 'Appwrite ile canlı güncellenen kartlar',
    state: 'Operasyonel',
  },
  {
    name: 'Yayın akışı',
    detail: 'Yönetici değişiklikleri anında yansır',
    state: 'Hazır',
  },
]

function fmtDate(value) {
  const [y, m, d] = String(value).split('-').map(Number)
  if (!y || !m || !d) return value
  return `${d} ${aylar[m - 1]} ${y}`
}

export default function DeveloperPanel() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [cached, setCached] = useState(false)
  const [fallback, setFallback] = useState(false)

  const load = async (force = false) => {
    setLoading(true)
    setError('')
    const res = await getGithubStats({ force })
    setData(res.data)
    setError(res.error || '')
    setCached(res.cached)
    setFallback(!!res.fallback)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section className="dev">
      <div className="dev-head">
        <div>
          <h2>Geliştirici</h2>
          <p>GitHub'daki son durum ve geliştirme günlüğü.</p>
        </div>
        <div className="dev-head-actions">
          <a
            className="btn btn-ghost btn--xs"
            href="https://github.com/thykeumut"
            target="_blank"
            rel="noreferrer noopener"
          >
            <GitBranch size={13} strokeWidth={2.1} />
            github.com/thykeumut
          </a>
          <button
            type="button"
            className="btn btn-ghost btn--xs"
            onClick={() => load(true)}
            disabled={loading}
          >
            <RefreshCw size={13} strokeWidth={2.2} />
            Yenile
          </button>
        </div>
      </div>

      {error && <p className="dev-error">{error}</p>}

      <div className="dev-tiles">
        <Tile
          icon={<FolderGit2 size={15} strokeWidth={2.1} />}
          label="Herkese açık depo"
          value={data ? data.user.publicRepos : '—'}
        />
        <Tile
          icon={<Users size={15} strokeWidth={2.1} />}
          label="Takipçi"
          value={data ? data.user.followers : '—'}
        />
        <Tile
          icon={<Star size={15} strokeWidth={2.1} />}
          label="Yıldız"
          value={data ? data.stars : '—'}
        />
        <Tile
          icon={<CircleDot size={15} strokeWidth={2.1} />}
          label="Dil"
          value={data ? data.languages.length : '—'}
        />
      </div>

      <div className="dev-cols">
        <div className="dev-card">
          <h3>Kullanılan diller</h3>
          {loading && !data ? (
            <p className="dev-muted">yükleniyor…</p>
          ) : data && data.languages.length ? (
            <>
              <div className="langbar">
                {data.languages.map((l, i) => (
                  <span
                    key={l.name}
                    className="langbar-seg"
                    style={{
                      width: `${Math.max(6, l.pct)}%`,
                      opacity: 1 - i * 0.17,
                    }}
                    title={`${l.name} · ${l.pct}%`}
                  />
                ))}
              </div>
              <ul className="langlist">
                {data.languages.map((l, i) => (
                  <li key={l.name}>
                    <span
                      className="langdot"
                      style={{ opacity: 1 - i * 0.17 }}
                    />
                    {l.name}
                    <b>{l.pct}%</b>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="dev-muted">veri yok</p>
          )}
          {cached && <p className="dev-muted">önbellekten gösteriliyor</p>}
          {fallback && data?.snapshotAt && (
            <p className="dev-muted">
              son bilinen veriler · {fmtDate(data.snapshotAt.slice(0, 10))}
            </p>
          )}
        </div>

        <div className="dev-card">
          <h3>Son çalışmalar</h3>
          {loading && !data ? (
            <p className="dev-muted">yükleniyor…</p>
          ) : data && data.recent.length ? (
            <ul className="recent">
              {data.recent.map((r) => (
                <li key={r.name}>
                  <a href={r.url} target="_blank" rel="noreferrer noopener">
                    <span className="recent-name">
                      {r.name}
                      <ArrowUpRight size={12} strokeWidth={2.2} />
                    </span>
                    {r.description && (
                      <span className="recent-desc">{r.description}</span>
                    )}
                    <span className="recent-meta">
                      {r.language || '—'}
                      <i>·</i>
                      {timeAgo(r.pushedAt)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dev-muted">veri yok</p>
          )}
        </div>
      </div>

      <section className="status-panel" aria-label="THYKE STATUS">
        <div className="status-panel-head">
          <div>
            <span>THYKE STATUS</span>
            <h3>Servis durumu</h3>
          </div>
          <p><i /> Son kontrol: bu oturum</p>
        </div>
        <div className="status-panel-list">
          {STATUS_ITEMS.map((item) => (
            <div key={item.name} className="status-panel-item">
              <i />
              <div>
                <strong>{item.name}</strong>
                <p>{item.detail}</p>
              </div>
              <b>{item.state}</b>
            </div>
          ))}
        </div>
      </section>

      <div className="dev-log">
        <h3>Geliştirme günlüğü</h3>

        <div className="now-card">
          <span className="now-dot" />
          <div>
            <strong>Şu an</strong>
            <p>{NOW}</p>
          </div>
        </div>

        <ol className="timeline">
          {DEV_LOG.map((item) => (
            <li key={item.date + item.title}>
              <span className="tl-date">{fmtDate(item.date)}</span>
              <div className="tl-body">
                <div className="tl-top">
                  <h4>{item.title}</h4>
                  <span className={'tl-tag tl-tag--' + item.tag}>
                    {TAG_LABEL[item.tag] || item.tag}
                  </span>
                </div>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Tile({ icon, label, value }) {
  return (
    <div className="dev-tile">
      <span className="dev-tile-icon">{icon}</span>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}
