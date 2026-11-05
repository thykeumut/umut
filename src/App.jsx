import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Heart, Search, X } from 'lucide-react'
import Background from './components/Background.jsx'
import Hero from './components/Hero.jsx'
import SiteCard from './components/SiteCard.jsx'
import SiteModal from './components/SiteModal.jsx'
import AdminModal from './components/AdminModal.jsx'
import ViewTabs from './components/ViewTabs.jsx'
import SiteDetail from './components/SiteDetail.jsx'
import Lab from './components/Lab.jsx'
import DeveloperPanel from './components/DeveloperPanel.jsx'
import Terminal from './components/Terminal.jsx'
import { GRADIENTS } from './lib/gradients.js'
import { DEFAULT_THEME, themeById } from './lib/themes.js'
import { DEFAULT_ICON, iconFromLegacyEmoji } from './lib/icons.js'
import { cleanTags, normalizeCategory } from './lib/projects.js'
import { ADMIN_STORAGE_KEY } from './lib/config.js'
import { fromBase64 } from './lib/github.js'
import {
  loadRemoteSites,
  loginAdmin,
  logoutAdmin,
  saveRemoteSites,
  subscribeToSites,
} from './lib/appwrite.js'

// Yöneticinin kendi tarayıcısındaki çalışma kopyası
const DRAFT_KEY = 'umut-portfolyo:sites:v1'
const THEME_KEY = 'umut-portfolyo:theme:v1'
const FAVORITES_KEY = 'umut-portfolyo:favorites:v1'
// Yayındaki (herkesin gördüğü) kart listesi
const PUBLISHED_PATH = `${import.meta.env.BASE_URL}sites.json`
const CARD_W = 276
const CARD_H = 220
const PUBLIC_SYNC_MS = 90 * 1000

// Görünümler: adres çubuğunda #/vitrin gibi tutulur, böylece paylaşılabilir.
const VIEW_IDS = ['board', 'lab', 'developer']

function viewFromHash() {
  if (typeof window === 'undefined') return 'board'
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  return VIEW_IDS.includes(hash) ? hash : 'board'
}

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

// Kayıtlı kartı güncel biçime çevir (eski emoji alanını simgeye dönüştürür).
// Ayrıca konum/yetki alanları eksikse güvenli varsayılan verir; böylece
// eski kayıtlarda kartlar üst üste binmez.
function normalizeSite(site, index = 0) {
  const { emoji, u, ...rest } = site
  return {
    ...rest,
    // Gizli kartların adresi yayın dosyasında düz yazılmaz; burada çözülür.
    url: site.url || (u ? fromBase64(u) : ''),
    icon: site.icon || iconFromLegacyEmoji(emoji) || DEFAULT_ICON,
    x: Number.isFinite(site.x) ? site.x : 28 + (index % 3) * 300,
    y: Number.isFinite(site.y) ? site.y : 28 + Math.floor(index / 3) * 232,
    public: !!site.public,
    category: normalizeCategory(site.category),
    tags: cleanTags(site.tags),
    repo: site.repo || '',
    story: site.story || '',
  }
}

// Yayına yazılacak biçim: gizli kartların adresi düz yazılmaz
// (bkz. src/lib/github.js → publishShape)

// Yöneticinin kendi tarayıcısındaki çalışma kopyasını oku.
//
// ÖNEMLİ: boş liste "taslak yok" sayılır. Aksi hâlde, giriş sırasında boş bir
// taslak kaydedilirse yayındaki kartlar bir daha yüklenmez ve tahta boş kalır.
function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeSite)
  } catch {
    /* bozuk veri */
  }
  return null
}

// Ziyaretçiler proje listesini sitenin kendi statik dosyasından alır. Böylece
// her sayfa açılışında GitHub API kotası tüketilmez.
async function fetchPublished() {
  try {
    const remote = await loadRemoteSites()
    return remote.map(normalizeSite)
  } catch {
    // Yerel geliştirmede veya ilk kurulumda mevcut statik yayın dosyası yedek kalır.
  }
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 7000)
  try {
    const res = await fetch(`${PUBLISHED_PATH}?v=${Date.now()}`, {
      cache: 'no-store',
      signal: ctl.signal,
    })
    if (!res.ok) return null
    const data = await res.json()
    const list = Array.isArray(data) ? data : data?.sites
    return Array.isArray(list) ? list.map(normalizeSite) : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
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

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export default function App() {
  const draft = null
  const [sites, setSites] = useState([])
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
  const [view, setView] = useState(viewFromHash)
  const [termOpen, setTermOpen] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [editSite, setEditSite] = useState(null)
  const [boardQuery, setBoardQuery] = useState('')
  const [favoriteIds, setFavoriteIds] = useState(loadFavorites)
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  const boardRef = useRef(null)
  const toastTimer = useRef(null)
  const dirtyRef = useRef(false)
  const pendingReset = useRef(false)
  const sitesRef = useRef(sites)

  useEffect(() => {
    sitesRef.current = sites
  }, [sites])

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds))
    } catch {
      /* depolama kapalı olabilir */
    }
  }, [favoriteIds])

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

  // Görünümü adres çubuğuyla eşle (#/vitrin, #/lab, #/developer)
  const goView = useCallback((id) => {
    const next = VIEW_IDS.includes(id) ? id : 'board'
    setView(next)
    setActiveId(null)
    const hash = next === 'board' ? '' : `#/${next}`
    const url = hash || window.location.pathname + window.location.search
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', url)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const onHash = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // ~ (ya da `) tuşu gizli terminali açar/kapatır.
  // Türkçe klavyede ~ için AltGr gerekir; bu yüzden Ctrl/Alt'a bakılmaz.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '~' && e.key !== '`') return
      if (e.metaKey) return
      const t = e.target
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.tagName === 'SELECT' ||
          t.isContentEditable)
      ) {
        return
      }
      if (modalOpen || adminOpen || detailId) return
      e.preventDefault()
      setTermOpen((open) => !open)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, adminOpen, detailId])

  // Yayındaki kart listesini getir. Yerel çalışma kopyası varsa ona dokunma.
  useEffect(() => {
    let alive = true
    fetchPublished().then((list) => {
      if (!alive || !list) return
      setSites(list)
    })
    return () => {
      alive = false
    }
  }, [])

  // Değişiklikleri tarayıcıda sakla (yöneticinin çalışma kopyası).
  // SADECE yönetici gerçekten bir şey değiştirdiğinde yazılır; giriş anında
  // boş liste yazılırsa yayındaki kartlar bir daha yüklenmez.
  useEffect(() => {
    if (!isAdmin || !dirtyRef.current) return
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

  // Realtime keeps already-open visitor tabs in sync without a refresh.
  useEffect(() => {
    let alive = true
    let unsubscribe

    const sync = async (announce = false) => {
      try {
        const remote = await loadRemoteSites()
        if (!alive) return
        const next = remote.map(normalizeSite)
        if (JSON.stringify(next) === JSON.stringify(sitesRef.current)) return
        setSites(next)
        if (announce) showToast('Portfolyo güncellendi')
      } catch {
        // The published static list is used while the remote store is unreachable.
      }
    }

    Promise.resolve(subscribeToSites(() => sync(true))).then((subscription) => {
      if (alive) unsubscribe = subscription?.unsubscribe
      else subscription?.unsubscribe?.()
    })
    const onVisibility = () => {
      if (document.visibilityState === 'visible') sync(false)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      alive = false
      unsubscribe?.()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [showToast])

  // A short debounce turns one edit or drag into a single shared write.
  useEffect(() => {
    if (!isAdmin || !dirtyRef.current) return

    const timer = window.setTimeout(async () => {
      dirtyRef.current = false
      try {
        await saveRemoteSites(sites)
        showToast('Kaydedildi - tüm ziyaretçiler güncellendi')
      } catch (err) {
        dirtyRef.current = true
        showToast(`Kaydedilemedi: ${err.message || 'bağlantı hatası'}`)
      }
    }, 900)

    return () => window.clearTimeout(timer)
  }, [sites, isAdmin, showToast])

  // Açık ziyaretçi sekmeleri GitHub API'ye gitmeden, yalnızca sitenin kendi
  // küçük yayın dosyasını kontrol eder. Değişiklik görünür olduğunda hard reset
  // gerekmeksizin kartlar güncellenir; gizli veya arka plandaki sekmeler istek yapmaz.
  useEffect(() => {
    return undefined

    let alive = true
    let checking = false
    const checkForUpdate = async () => {
      if (!alive || checking || document.visibilityState === 'hidden') return
      checking = true
      const next = await fetchPublished()
      checking = false
      if (!alive || !next) return
      if (JSON.stringify(next) === JSON.stringify(sitesRef.current)) return
      setPublished(next)
      setSites(next)
      showToast('Portföy güncellendi')
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    }
    const timer = window.setInterval(checkForUpdate, PUBLIC_SYNC_MS)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      alive = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [draft, isAdmin, showToast])

  // Yönetici bir kart eklediğinde / taşıdığında / sildiğinde, listeyi
  // arka planda GitHub'a yaz. Böylece ayrı bir "yayınla" adımı gerekmez.
  useEffect(() => {
    if (!isAdmin || !dirtyRef.current) return
    return undefined

    clearTimeout(publishTimer.current)
    publishTimer.current = setTimeout(async () => {
      dirtyRef.current = false
      const mySeq = ++publishSeq.current

      if (!hasToken()) {
        setPublishWarn('Kartlar şu an sadece sende görünüyor')
        showToast('Kart kaydedildi — herkesin görmesi için yayın bağlantısını kur')
        if (!promptedRef.current) {
          promptedRef.current = true
          setPublishSetupOpen(true)
        }
        return
      }

      try {
        await publishSites(sites.map(publishShape))
        if (mySeq !== publishSeq.current) return
        setPublishWarn('')
        showToast('Yayınlandı — açık ziyaretçiler kısa süre içinde güncellenecek')
      } catch (err) {
        if (mySeq !== publishSeq.current) return
        setPublishWarn(err.message || 'Yayınlanamadı')
        showToast(`Yayınlanamadı: ${err.message || 'bilinmeyen hata'}`)
      }
    }, 1400)

    return () => clearTimeout(publishTimer.current)
  }, [sites, isAdmin, showToast])

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

  // Başka görünümdeyken "Yerleşimi Sıfırla"ya basıldıysa: panoya dönüp uygula
  useEffect(() => {
    if (view !== 'board' || !pendingReset.current) return
    pendingReset.current = false
    const t = setTimeout(() => resetLayout(), 120)
    return () => clearTimeout(t)
  }, [view])

  const markDirty = () => {
    dirtyRef.current = true
  }

  // Kartı taşı. Yönetici taşıdığında düzen yayına gönderilir; ziyaretçi
  // taşıdığında yalnızca kendi ekranında değişir (yayındaki düzen bozulmaz
  // ve sayfa yenilenince senin yerleşimin geri gelir).
  const moveSite = (id, x, y) => {
    if (isAdmin) {
      // Pano aşağı doğru genişleyebilsin; böylece kartlar mevcut ekranın
      // alt sınırında takılmadan istenen noktaya bırakılabilir.
      const board = boardRef.current
      if (board) {
        const neededHeight = y + CARD_H + 32
        if (neededHeight > board.clientHeight) {
          board.style.minHeight = `${neededHeight}px`
        }
      }
      markDirty()
    }
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)))
  }

  const toggleFavorite = useCallback((id) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id]
    )
  }, [])

  const shownSites = useMemo(() => {
    if (isAdmin) return sites
    const query = boardQuery.trim().toLocaleLowerCase('tr')
    return sites.filter((site) => {
      const matchesFavorite = !onlyFavorites || favoriteIds.includes(site.id)
      if (!matchesFavorite) return false
      if (!query) return true
      const haystack = [site.title, site.description, site.category, ...(site.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('tr')
      return haystack.includes(query)
    })
  }, [sites, isAdmin, boardQuery, onlyFavorites, favoriteIds])

  // Karta tıklanınca: yönetici her siteye, ziyaretçi ise sadece
  // "ziyaretçilere açık" işaretlenen sitelere gidebilir.
  const openSite = (site) => {
    if (!site) return
    // Kapalı kart: adresi yayında olmadığı için önce görünürlüğe bakılır ki
    // ziyaretçi tıklayınca sessizlik değil, açıklayıcı bir uyarı görsün.
    if (!isAdmin && !site.public) {
      showToast(`“${site.title}” bu site ziyaretçilere kapalı`)
      return
    }
    if (!site.url) return
    const url = /^https?:\/\//i.test(site.url) ? site.url : `https://${site.url}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const deleteSite = (id) => {
    markDirty()
    setSites((prev) => prev.filter((s) => s.id !== id))
    setActiveId((cur) => (cur === id ? null : cur))
  }

  // Ziyaretçilere aç / kapat
  const togglePublic = (id) => {
    markDirty()
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
    markDirty()
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
    if (view !== 'board') goView('board')
  }

  // Var olan kartı düzenle (vitrin detayından açılır)
  const updateSite = (id, data) => {
    markDirty()
    setSites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data, id: s.id } : s))
    )
    setEditSite(null)
    setModalOpen(false)
    showToast('Değişiklikler kaydedildi')
  }

  const openAdd = () => {
    setEditSite(null)
    setModalOpen(true)
  }

  const openEdit = (site) => {
    setDetailId(null)
    setEditSite(site)
  }

  // Kartları düzenli bir ızgaraya dizer.
  // Kartların GERÇEK yüksekliğini ölçerek dizeriz; böylece uzun açıklamalı
  // kartlar bir sonraki satırla üst üste binmez. Izgara tahtadan uzun olursa
  // tahtayı büyütürüz ki kartlar sayfa dışına taşmasın.
  const resetLayout = () => {
    const board = boardRef.current
    if (!board) {
      // Kullanıcı başka bir görünümde: önce panoya geç, sonra sıfırla
      pendingReset.current = true
      goView('board')
      return
    }
    if (isMobile) return
    markDirty()

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

  const unlockAdmin = async ({ email, password }) => {
    await loginAdmin(email, password)
    const remote = await loadRemoteSites()
    if (remote.length) {
      setSites(remote.map(normalizeSite))
    } else if (sitesRef.current.length) {
      await saveRemoteSites(sitesRef.current)
    }
    setIsAdmin(true)
    setAdminOpen(false)
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, '1')
    } catch {
      // Storage can be disabled by the visitor.
    }
    showToast('Yönetici modu açıldı')
    return undefined
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
    void logoutAdmin()
    setIsAdmin(false)
    setModalOpen(false)
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY)
    } catch {
      /* depolama kapalı olabilir */
    }
    showToast('Yönetici modu kapatıldı — artık ziyaretçi görünümündesin')
  }

  // Yayın anahtarı bağlandığında/çıkarıldığında bekleyen kartları hemen yayınla
  const handlePublishSetupSaved = () => {
    setPublishSetupOpen(false)
    setPublishWarn(hasToken() ? '' : 'Kartlar şu an sadece sende görünüyor')
    dirtyRef.current = true
    setSites((prev) => [...prev])
  }

  const detailSite = detailId
    ? sites.find((s) => s.id === detailId) || null
    : null

  return (
    <div className="app">
      <Background />

      <Hero
        count={sites.length}
        theme={theme}
        onThemeChange={setTheme}
        isAdmin={isAdmin}
        onAdd={openAdd}
        onReset={resetLayout}
        onAdminClick={() => (isAdmin ? lockAdmin() : setAdminOpen(true))}
      />

      <ViewTabs view={view} onChange={goView} />

      {view === 'board' ? (
        <>
          <section className="board-tools" aria-label="Pano araçları">
            {isAdmin ? (
              <p className="board-arrange-note">
                Serbest yerleşim açık — kartı tutup panonun istediğin yerine bırak. Pano aşağı doğru otomatik uzar.
              </p>
            ) : (
              <>
                <label className="board-search">
                  <Search size={16} strokeWidth={2} aria-hidden="true" />
                  <input
                    value={boardQuery}
                    onChange={(e) => setBoardQuery(e.target.value)}
                    placeholder="Projelerde ara..."
                    aria-label="Projelerde ara"
                  />
                  {boardQuery && (
                    <button type="button" onClick={() => setBoardQuery('')} aria-label="Aramayı temizle">
                      <X size={15} strokeWidth={2.2} />
                    </button>
                  )}
                </label>
                <button
                  type="button"
                  className={'board-favorites' + (onlyFavorites ? ' board-favorites--on' : '')}
                  onClick={() => setOnlyFavorites((value) => !value)}
                  aria-pressed={onlyFavorites}
                >
                  <Heart size={15} strokeWidth={2} fill={onlyFavorites ? 'currentColor' : 'none'} />
                  Favorilerim
                </button>
                <span className="board-result">{shownSites.length} proje</span>
              </>
            )}
          </section>
        <main
          ref={boardRef}
          className={'board' + (isMobile ? ' board--flow' : '')}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setActiveId(null)
          }}
        >
          {shownSites.map((site) => (
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
              onFocus={isAdmin ? setActiveId : () => {}}
              isFavorite={favoriteIds.includes(site.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}

          {shownSites.length === 0 && (
            <div className="empty">
              <p>Henüz kart yok.</p>
              {isAdmin ? (
                <button className="btn btn-primary" onClick={openAdd}>
                  + İlk Siteni Ekle
                </button>
              ) : (
                <p className="empty-note">Yakında burada projeler olacak.</p>
              )}
            </div>
          )}
        </main>
        </>
      ) : (
        <main className="view-main">
          {view === 'lab' && <Lab />}
          {view === 'developer' && <DeveloperPanel />}
        </main>
      )}

      <footer className="footer">
        <span>© {new Date().getFullYear()} Umut</span>
        <span className="footer-dot">•</span>
        <span>{isAdmin ? 'Yönetici görünümü' : 'Ziyaretçi görünümü'}</span>
        <span className="footer-dot">•</span>
        <button
          type="button"
          className="footer-term"
          onClick={() => setTermOpen(true)}
          title="Gizli terminal (~)"
        >
          <span className="footer-term-key">~</span> terminal
        </button>
      </footer>

      <SiteModal
        open={modalOpen || !!editSite}
        site={editSite}
        onClose={() => {
          setModalOpen(false)
          setEditSite(null)
        }}
        onSubmit={(data) =>
          editSite ? updateSite(editSite.id, data) : addSite(data)
        }
      />

      <SiteDetail
        site={detailSite}
        isAdmin={isAdmin}
        onClose={() => setDetailId(null)}
        onOpenSite={openSite}
        onEdit={openEdit}
      />

      <Terminal
        open={termOpen}
        onClose={() => setTermOpen(false)}
        sites={sites}
        isAdmin={isAdmin}
        theme={theme}
        onTheme={setTheme}
        onView={goView}
        onDetail={(site) => {
          setTermOpen(false)
          setDetailId(site.id)
        }}
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
