import { useCallback, useEffect, useRef, useState } from 'react'
import Background from './components/Background.jsx'
import Hero from './components/Hero.jsx'
import SiteCard from './components/SiteCard.jsx'
import AddSiteModal from './components/AddSiteModal.jsx'
import AdminModal from './components/AdminModal.jsx'
import { GRADIENTS } from './lib/gradients.js'
import { DEFAULT_THEME, themeById } from './lib/themes.js'
import { DEFAULT_ICON, iconFromLegacyEmoji } from './lib/icons.js'
import { ADMIN_STORAGE_KEY } from './lib/config.js'

// Yöneticinin kendi tarayıcısındaki çalışma kopyası
const DRAFT_KEY = 'umut-portfolyo:sites:v1'
const THEME_KEY = 'umut-portfolyo:theme:v1'
// Yayındaki (herkesin gördüğü) kart listesi
const PUBLISHED_URL = `${import.meta.env.BASE_URL}sites.json`
const CARD_W = 280
const CARD_H = 210

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

// Kayıtlı kartı güncel biçime çevir (eski emoji alanını simgeye dönüştürür).
// Ayrıca konum/yetki alanları eksikse güvenli varsayılan verir; böylece
// eski kayıtlarda kartlar üst üste binmez.
function normalizeSite(site, index = 0) {
  const { emoji, ...rest } = site
  return {
    ...rest,
    icon: site.icon || iconFromLegacyEmoji(emoji) || DEFAULT_ICON,
    x: Number.isFinite(site.x) ? site.x : 28 + (index % 3) * 300,
    y: Number.isFinite(site.y) ? site.y : 28 + Math.floor(index / 3) * 232,
    public: !!site.public,
  }
}

// Yöneticinin kendi tarayıcısındaki çalışma kopyasını oku
function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map(normalizeSite)
  } catch {
    /* bozuk veri */
  }
  return null
}

// Yayındaki sites.json dosyasını oku (herkesin gördüğü liste)
async function fetchPublished() {
  try {
    const res = await fetch(PUBLISHED_URL, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    const list = Array.isArray(data) ? data : data?.sites
    if (!Array.isArray(list)) return null
    return list.map(normalizeSite)
  } catch {
    return null
  }
}

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved && themeById(saved).id === saved) return saved
  } catch {
    /* depolama kapalı olabilir */
  }
  return DEFAULT_THEME
}

function loadAdmin() {
  try {
    return localStorage.getItem(ADMIN_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [draft] = useState(loadDraft)
  const [sites, setSites] = useState(() => draft || [])
  const [published, setPublished] = useState(null)
  const [theme, setTheme] = useState(loadTheme)
  const [isAdmin, setIsAdmin] = useState(loadAdmin)
  const [activeId, setActiveId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 760
  )
  const [newIds, setNewIds] = useState(() => new Set())

  const boardRef = useRef(null)
  const toastTimer = useRef(null)

  // Seçilen temayı <html> etiketine uygula ve hatırla
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* depolama kapalı olabilir */
    }
  }, [theme])

  // Ekran boyutu değişimi (mobilde serbest sürükleme kapanır)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 760)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Yayındaki kart listesini getir. Yerel çalışma kopyası varsa ona dokunma.
  useEffect(() => {
    let alive = true
    fetchPublished().then((list) => {
      if (!alive || !list) return
      setPublished(list)
      if (!draft) setSites(list)
    })
    return () => {
      alive = false
    }
  }, [draft])

  // Değişiklikleri tarayıcıda sakla (yöneticinin çalışma kopyası)
  useEffect(() => {
    if (!isAdmin) return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(sites))
    } catch {
      /* depolama kapalı olabilir */
    }
  }, [sites, isAdmin])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const showToast = useCallback((message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }, [])

  // Kartları tahta sınırları içine çek
  const clampAll = useCallback(() => {
    const board = boardRef.current
    if (!board || isMobile) return
    const cardEls = board.querySelectorAll('.card')
    const boardW = board.clientWidth
    const boardH = board.clientHeight

    setSites((prev) => {
      let changed = false
      const next = prev.map((s, i) => {
        const el = cardEls[i]
        const maxX = Math.max(0, boardW - (el?.offsetWidth || CARD_W))
        const maxY = Math.max(0, boardH - (el?.offsetHeight || CARD_H))
        const x = Math.min(Math.max(0, s.x), maxX)
        const y = Math.min(Math.max(0, s.y), maxY)
        if (x !== s.x || y !== s.y) {
          changed = true
          return { ...s, x, y }
        }
        return s
      })
      return changed ? next : prev
    })
  }, [isMobile])

  useEffect(() => {
    clampAll()
    const onResize = () => clampAll()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clampAll])

  const moveSite = (id, x, y) =>
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)))

  // Karta tıklanınca: yönetici her siteye, ziyaretçi ise sadece
  // "ziyaretçilere açık" işaretlenen sitelere gidebilir.
  const openSite = (site) => {
    if (!site?.url) return
    if (!isAdmin && !site.public) {
      showToast(`“${site.title}” bu site ziyaretçilere kapalı`)
      return
    }
    const url = /^https?:\/\//i.test(site.url) ? site.url : `https://${site.url}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const deleteSite = (id) => {
    setSites((prev) => prev.filter((s) => s.id !== id))
    setActiveId((cur) => (cur === id ? null : cur))
  }

  // Ziyaretçilere aç / kapat
  const togglePublic = (id) => {
    setSites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, public: !s.public } : s))
    )
    const site = sites.find((s) => s.id === id)
    if (site) {
      showToast(
        site.public
          ? `“${site.title}” ziyaretçilere kapatıldı`
          : `“${site.title}” ziyaretçilere açıldı`
      )
    }
  }

  const addSite = (data) => {
    const board = boardRef.current
    const maxX = Math.max(0, (board?.clientWidth || 900) - CARD_W)
    const maxY = Math.max(0, (board?.clientHeight || 480) - CARD_H)
    const x = Math.round(maxX * (0.12 + Math.random() * 0.55))
    const y = Math.round(maxY * (0.1 + Math.random() * 0.6))

    const site = {
      id: uid(),
      ...data,
      gradient: data.gradient || GRADIENTS[0].id,
      icon: data.icon || DEFAULT_ICON,
      public: !!data.public,
      x,
      y,
    }

    setSites((prev) => [...prev, site])
    setActiveId(site.id)
    setNewIds((prev) => new Set(prev).add(site.id))
    setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev)
        next.delete(site.id)
        return next
      })
    }, 700)
    setModalOpen(false)
  }

  // Kartları düzenli bir ızgaraya dizer.
  // Kartların GERÇEK yüksekliğini ölçerek dizeriz; böylece uzun açıklamalı
  // kartlar bir sonraki satırla üst üste binmez. Izgara tahtadan uzun olursa
  // tahtayı büyütürüz ki kartlar sayfa dışına taşmasın.
  const resetLayout = () => {
    const board = boardRef.current
    if (!board || isMobile) return

    const gap = 24
    const width = board.clientWidth
    const els = board.querySelectorAll('.card')

    const sizes = sites.map((_, i) => ({
      w: els[i]?.offsetWidth || CARD_W,
      h: els[i]?.offsetHeight || CARD_H,
    }))

    const perRow = Math.max(1, Math.floor((width - gap) / (CARD_W + gap)))
    const positions = []
    let y = gap
    for (let i = 0; i < sizes.length; i += perRow) {
      const row = sizes.slice(i, i + perRow)
      let x = gap
      row.forEach((size, j) => {
        positions[i + j] = { x, y }
        x += size.w + gap
      })
      y += Math.max(...row.map((size) => size.h)) + gap
    }

    board.style.minHeight = `max(60vh, ${Math.max(60, y)}px)`

    setSites((prev) =>
      prev.map((s, i) => (positions[i] ? { ...s, ...positions[i] } : s))
    )
    setActiveId(null)
  }

  const unlockAdmin = () => {
    setIsAdmin(true)
    setAdminOpen(false)
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, '1')
    } catch {
      /* depolama kapalı olabilir */
    }
    showToast('Yönetici modu açıldı')
  }

  const lockAdmin = () => {
    setIsAdmin(false)
    setModalOpen(false)
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY)
    } catch {
      /* depolama kapalı olabilir */
    }
    showToast('Yönetici modu kapatıldı — artık ziyaretçi görünümündesin')
  }

  return (
    <div className="app">
      <Background />

      <Hero
        count={sites.length}
        theme={theme}
        onThemeChange={setTheme}
        isAdmin={isAdmin}
        onAdd={() => setModalOpen(true)}
        onReset={resetLayout}
        onAdminClick={() => (isAdmin ? lockAdmin() : setAdminOpen(true))}
      />

      <main
        ref={boardRef}
        className={'board' + (isMobile ? ' board--flow' : '')}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setActiveId(null)
        }}
      >
        {sites.map((site) => (
          <SiteCard
            key={site.id}
            site={site}
            boardRef={boardRef}
            isAdmin={isAdmin}
            draggingEnabled={isAdmin && !isMobile}
            isActive={activeId === site.id}
            isNew={newIds.has(site.id)}
            flowMode={isMobile}
            onMove={moveSite}
            onOpen={openSite}
            onDelete={deleteSite}
            onTogglePublic={togglePublic}
            onFocus={setActiveId}
          />
        ))}

        {sites.length === 0 && (
          <div className="empty">
            <p>Henüz kart yok.</p>
            {isAdmin ? (
              <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                + İlk Siteni Ekle
              </button>
            ) : (
              <p className="empty-note">Yakında burada projeler olacak.</p>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Umut</span>
        <span className="footer-dot">•</span>
        <span>{isAdmin ? 'Yönetici görünümü' : 'Ziyaretçi görünümü'}</span>
        <span className="footer-dot">•</span>
        <span>React ile yapıldı</span>
      </footer>

      <AddSiteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addSite}
      />

      <AdminModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        onUnlock={unlockAdmin}
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
