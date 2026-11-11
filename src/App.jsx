import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Filter, Heart, Mail, MessageSquare, Move, Search, Share2, X } from 'lucide-react'
import Background from './components/Background.jsx'
import PageChrome from './components/PageChrome.jsx'
import Hero from './components/Hero.jsx'
import QuickCommand from './components/QuickCommand.jsx'
import BriefBuilder from './components/BriefBuilder.jsx'
import BriefInbox from './components/BriefInbox.jsx'
import FeedbackModal from './components/FeedbackModal.jsx'
import VisitorStats from './components/VisitorStats.jsx'
import VisitorLogin from './components/VisitorLogin.jsx'
import VisitorGate from './components/VisitorGate.jsx'
import ContactSection from './components/ContactSection.jsx'
import Featured from './components/Featured.jsx'
import ActivityRail from './components/ActivityRail.jsx'
import RecentProjects from './components/RecentProjects.jsx'
import SiteCard from './components/SiteCard.jsx'
import SiteModal from './components/SiteModal.jsx'
import AdminModal from './components/AdminModal.jsx'
import SiteDetail from './components/SiteDetail.jsx'
import Terminal from './components/Terminal.jsx'
import { GRADIENTS } from './lib/gradients.js'
import { DEFAULT_ICON, iconFromLegacyEmoji } from './lib/icons.js'
import { categoryName, cleanTags, normalizeCategory, normalizeStatus, statusName } from './lib/projects.js'
import { ADMIN_STORAGE_KEY } from './lib/config.js'
import { fromBase64 } from './lib/github.js'
import {
  hasAdminSession,
  createRemoteBrief,
  createRemoteFeedback,
  createRemoteVisit,
  completeVisitorEmailLink,
  deleteRemoteBrief,
  loadRemoteBriefs,
  loadRemoteVisits,
  loadVerifiedVisitors,
  requestVisitorEmailLink,
  saveVerifiedVisitor,
  loadRemoteSites,
  loginAdmin,
  logoutAdmin,
  saveRemoteSites,
  subscribeToSites,
} from './lib/appwrite.js'

const FAVORITES_KEY = 'umut-portfolyo:favorites:v1'
const RECENT_KEY = 'umut-portfolyo:recent-projects:v1'
const APPEARANCE_KEY = 'umut-portfolyo:appearance:v1'
// Yayındaki (herkesin gördüğü) kart listesi
const PUBLISHED_PATH = `${import.meta.env.BASE_URL}sites.json`
const CARD_W = 276
const CARD_H = 220

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
    status: normalizeStatus(site.status, !!site.public),
    tags: cleanTags(site.tags),
    repo: site.repo || '',
    story: site.story || '',
  }
}

// Yayına yazılacak biçim: gizli kartların adresi düz yazılmaz
// (bkz. src/lib/github.js → publishShape)

// Ziyaretçiler proje listesini sitenin kendi statik dosyasından alır. Böylece
// her sayfa açılışında GitHub API kotası tüketilmez.
async function fetchPublished() {
  try {
    const remote = await loadRemoteSites()
    if (remote.length) return remote.map(normalizeSite)
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

function loadRecentProjects() {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter((id) => typeof id === 'string').slice(0, 4) : []
  } catch {
    return []
  }
}

function loadAppearance() {
  try {
    return localStorage.getItem(APPEARANCE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export default function App() {
  const [sites, setSites] = useState([])
  const [sitesLoading, setSitesLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(loadAdmin)
  const [activeId, setActiveId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 760
  )
  const [appearance, setAppearance] = useState(loadAppearance)
  const [newIds, setNewIds] = useState(() => new Set())
  const [termOpen, setTermOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [briefOpen, setBriefOpen] = useState(false)
  const [briefInboxOpen, setBriefInboxOpen] = useState(false)
  const [briefs, setBriefs] = useState([])
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [visits, setVisits] = useState([])
  const [visitorLoginOpen, setVisitorLoginOpen] = useState(false)
  const [verifiedVisitors, setVerifiedVisitors] = useState([])
  const [visitorMode, setVisitorMode] = useState(() => {
    try {
      return localStorage.getItem('thyke:visitor-mode') || ''
    } catch {
      return ''
    }
  })
  const [detailId, setDetailId] = useState(null)
  const [editSite, setEditSite] = useState(null)
  const [boardQuery, setBoardQuery] = useState('')
  const [favoriteIds, setFavoriteIds] = useState(loadFavorites)
  const [recentIds, setRecentIds] = useState(loadRecentProjects)
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [featuredId, setFeaturedId] = useState(null)

  const boardRef = useRef(null)
  const searchInputRef = useRef(null)
  const toastTimer = useRef(null)
  const dirtyRef = useRef(false)
  const remoteMuteUntilRef = useRef(0)
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

  // Ekran boyutu değişimi (mobilde serbest sürükleme kapanır)
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds))
    } catch {
      /* depolama kapalı olabilir */
    }
  }, [recentIds])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 760)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
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

  // İlk yükleme: proje kartları Appwrite'tan gelir. Depo erişilemezse
  // statik yayın dosyası yedek olur.
  // Ziyaretçi görünümünde "/" doğrudan pano aramasına götürür. Yazı alanlarında
  // veya açık pencerelerde devreye girmez; sayfanın doğal kısayollarını bozmaz.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || isAdmin || modalOpen || adminOpen || detailId || termOpen) return
      const target = e.target
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) return
      e.preventDefault()
      searchInputRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isAdmin, modalOpen, adminOpen, detailId, termOpen])

  useEffect(() => {
    const onKey = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLocaleLowerCase('tr') !== 'k') return
      if (modalOpen || adminOpen || detailId || termOpen) return
      event.preventDefault()
      setCommandOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, adminOpen, detailId, termOpen])

  useEffect(() => {
    let alive = true
    const boot = async () => {
      try {
        const remoteSites = await loadRemoteSites()
        if (!alive) return
        const nextSites = remoteSites.map(normalizeSite)
        if (nextSites.length) {
          setSites(nextSites)
        } else {
          const fallback = await fetchPublished()
          if (alive && fallback) setSites(fallback)
        }
      } catch {
        const list = await fetchPublished()
        if (alive && list) setSites(list)
      }
      if (loadAdmin() && !(await hasAdminSession())) {
        if (!alive) return
        setIsAdmin(false)
        try {
          localStorage.removeItem(ADMIN_STORAGE_KEY)
        } catch {
          /* depolama kapalı olabilir */
        }
      }
    }
    boot().finally(() => {
      if (alive) setSitesLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const showToast = useCallback((message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }, [])

  const refreshBriefs = useCallback(async () => {
    if (!isAdmin) return
    try {
      setBriefs(await loadRemoteBriefs())
    } catch {
      // The inbox is only an admin convenience; project board stays available.
    }
  }, [isAdmin])

  useEffect(() => {
    completeVisitorEmailLink()
      .then((user) => {
        if (!user) return null
        return saveVerifiedVisitor(user).then(() => {
          localStorage.setItem('thyke:visitor-mode', 'verified')
          setVisitorMode('verified')
        })
      })
      .catch(() => {})
  }, [])

  const refreshVisits = useCallback(async () => {
    if (!isAdmin) return
    try {
      setVisits(await loadRemoteVisits())
    } catch {
      // İstatistik bağlantısı yoksa pano akışı etkilenmez.
    }
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin) {
      void refreshBriefs()
      void refreshVisits()
    } else {
      setBriefs([])
      setBriefInboxOpen(false)
      setVisits([])
      setStatsOpen(false)
    }
  }, [isAdmin, refreshBriefs, refreshVisits])

  useEffect(() => {
    if (isAdmin) return
    const day = new Date().toISOString().slice(0, 10)
    const key = `thyke:visit:${day}`
    if (localStorage.getItem(key)) return
    createRemoteVisit(day).then(() => localStorage.setItem(key, '1')).catch(() => {})
  }, [isAdmin])

  const submitBrief = useCallback(async (brief) => {
    await createRemoteBrief(brief)
    showToast('Brief gönderildi — teşekkürler!')
  }, [showToast])

  const submitFeedback = useCallback(async (feedback) => {
    await createRemoteFeedback(feedback)
    showToast('Geri bildirimin gönderildi — teşekkürler!')
  }, [showToast])

  const requestVisitorLogin = useCallback(async (email) => {
    await requestVisitorEmailLink(email)
  }, [])

  const removeBrief = useCallback(async (brief) => {
    try {
      await deleteRemoteBrief(brief._rowId)
      setBriefs((current) => current.filter((item) => item._rowId !== brief._rowId))
      showToast('Brief silindi')
    } catch (error) {
      showToast(error?.message || 'Brief silinemedi')
    }
  }, [showToast])

  // Realtime keeps already-open visitor tabs in sync without a refresh.
  useEffect(() => {
    let alive = true
    let unsubscribe

    const sync = async (announce = false) => {
      if (isAdmin && (dirtyRef.current || Date.now() < remoteMuteUntilRef.current)) return
      try {
        const remoteSites = await loadRemoteSites()
        if (!alive) return
        const next = remoteSites.map(normalizeSite)
        let changed = false
        if (next.length && JSON.stringify(next) !== JSON.stringify(sitesRef.current)) {
          setSites(next)
          changed = true
        }
        if (changed && announce) showToast('Portfolyo güncellendi')
      } catch {
        // The published static list is used while the remote store is unreachable.
      }
    }

    Promise.resolve(subscribeToSites(() => {
      sync(true)
      if (isAdmin) void refreshBriefs()
      if (isAdmin) void refreshVisits()
    })).then((subscription) => {
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
  }, [showToast, isAdmin, refreshBriefs, refreshVisits])

  // A short debounce turns one edit or drag into a single shared write.
  useEffect(() => {
    if (!isAdmin || !dirtyRef.current) return

    const timer = window.setTimeout(async () => {
      dirtyRef.current = false
      try {
        remoteMuteUntilRef.current = Date.now() + 3000
        await saveRemoteSites(sites)
        remoteMuteUntilRef.current = Date.now() + 1200
        showToast('Kaydedildi - tüm ziyaretçiler güncellendi')
      } catch (err) {
        dirtyRef.current = true
        if (err?.code === 401 || /permission|unauthorized/i.test(err?.message || '')) {
          setIsAdmin(false)
          try {
            localStorage.removeItem(ADMIN_STORAGE_KEY)
          } catch {
            /* depolama kapalı olabilir */
          }
          showToast('Yönetici oturumu sona ermiş — yeniden giriş yap')
          return
        }
        showToast(`Kaydedilemedi: ${err.message || 'bağlantı hatası'}`)
      }
    }, 900)

    return () => window.clearTimeout(timer)
  }, [sites, isAdmin, showToast])

  // Kartları tahta sınırları içine çek
  const clampAll = useCallback(() => {
    const board = boardRef.current
    if (!board || isMobile) return
    const cardEls = new Map(
      Array.from(board.querySelectorAll('.card')).map((el) => [
        el.dataset.siteId,
        el,
      ])
    )
    const boardW = board.clientWidth
    const boardH = board.clientHeight

    setSites((prev) => {
      let changed = false
      const next = prev.map((s) => {
        const el = cardEls.get(s.id)
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

  // Uzak kartlar yüklendiğinde konumları pano genişliğine sığdır. Aksi hâlde
  // başka bir ekran için kaydedilmiş x değerleri yatay kaydırma yaratır.
  useEffect(() => {
    clampAll()
  }, [sites.length, clampAll])

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
    setSites((prev) => prev.map((site) => (site.id === id ? { ...site, x, y } : site)))
  }

  const toggleFavorite = useCallback((id) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id]
    )
  }, [])

  const clearBoardFilters = useCallback(() => {
    setBoardQuery('')
    setOnlyFavorites(false)
    setSelectedCategory('all')
    setSelectedStatus('all')
  }, [])

  const copySiteLink = useCallback(async (site) => {
    if (!site?.url) return
    const url = /^https?:\/\//i.test(site.url) ? site.url : `https://${site.url}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('Site bağlantısı kopyalandı')
    } catch {
      showToast('Bağlantı kopyalanamadı')
    }
  }, [showToast])

  const copyPortfolioLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin)
      showToast('Portfolyo bağlantısı kopyalandı')
    } catch {
      showToast('Bağlantı kopyalanamadı')
    }
  }, [showToast])

  const shownSites = useMemo(() => {
    if (isAdmin) return sites
    const query = boardQuery.trim().toLocaleLowerCase('tr')
    return sites.filter((site) => {
      const matchesFavorite = !onlyFavorites || favoriteIds.includes(site.id)
      if (!matchesFavorite) return false
      if (selectedCategory !== 'all' && site.category !== selectedCategory) return false
      if (selectedStatus !== 'all' && site.status !== selectedStatus) return false
      if (!query) return true
      const haystack = [site.title, site.description, site.category, ...(site.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('tr')
      return haystack.includes(query)
    })
  }, [sites, isAdmin, boardQuery, onlyFavorites, favoriteIds, selectedCategory, selectedStatus])

  const availableCategories = useMemo(() => {
    const used = new Set(sites.filter((site) => site.public).map((site) => site.category))
    return [...used].filter(Boolean).sort((a, b) => categoryName(a).localeCompare(categoryName(b), 'tr'))
  }, [sites])

  const categoryCounts = useMemo(() => {
    return sites.filter((site) => site.public).reduce((counts, site) => {
      counts[site.category] = (counts[site.category] || 0) + 1
      return counts
    }, {})
  }, [sites])

  const statusCounts = useMemo(() => {
    return sites.filter((site) => site.public).reduce((counts, site) => {
      counts[site.status] = (counts[site.status] || 0) + 1
      return counts
    }, {})
  }, [sites])

  // Vitrin her ziyaretçiye rastgele bir açık proje gösterir.
  const featuredSite = useMemo(() => {
    const pool = sites.filter((site) => site.public)
    return pool.find((site) => site.id === featuredId) || null
  }, [sites, featuredId])

  useEffect(() => {
    const pool = sites.filter((site) => site.public)
    if (!pool.length) return
    setFeaturedId((current) =>
      pool.some((site) => site.id === current)
        ? current
        : pool[Math.floor(Math.random() * pool.length)].id
    )
  }, [sites])

  const shuffleFeatured = useCallback(() => {
    const pool = sites.filter((site) => site.public)
    if (!pool.length) return
    const alternatives = pool.filter((site) => site.id !== featuredId)
    const next = (alternatives.length ? alternatives : pool)[
      Math.floor(Math.random() * (alternatives.length ? alternatives : pool).length)
    ]
    setFeaturedId(next.id)
  }, [sites, featuredId])

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
  const togglePublic = (id) => {    markDirty()
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

  // Vitrindeki projeyi seç. Aynı karta tekrar basmak seçimi kaldırır.
  const toggleFeatured = (id) => {
    markDirty()
    setSites((prev) =>
      prev.map((s) => ({ ...s, featured: s.id === id ? !s.featured : false }))
    )
    const site = sites.find((s) => s.id === id)
    if (site) {
      showToast(
        site.featured
          ? 'Vitrin seçimi kaldırıldı'
          : `“${site.title}” vitrine eklendi`
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
      status: normalizeStatus(data.status, !!data.public),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

  // Var olan kartı düzenle (vitrin detayından açılır)
  const updateSite = (id, data) => {
    markDirty()
    setSites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data, id: s.id, updatedAt: new Date().toISOString() } : s))
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
    if (!board) return
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

  const detailSite = detailId
    ? sites.find((s) => s.id === detailId) || null
    : null

  const detailPool = useMemo(
    () => (isAdmin ? sites : sites.filter((site) => site.public)),
    [sites, isAdmin]
  )

  const recentSites = useMemo(() => {
    return recentIds
      .map((id) => detailPool.find((site) => site.id === id))
      .filter(Boolean)
  }, [recentIds, detailPool])

  const relatedSites = useMemo(() => {
    if (!detailSite) return []
    const detailTags = new Set(detailSite.tags || [])
    return detailPool
      .filter((site) => site.id !== detailSite.id)
      .map((site) => ({
        site,
        score: (site.category === detailSite.category ? 3 : 0) + (site.tags || []).filter((tag) => detailTags.has(tag)).length,
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.site.title.localeCompare(b.site.title, 'tr'))
      .slice(0, 3)
      .map(({ site }) => site)
  }, [detailSite, detailPool])

  const navigateDetail = useCallback((direction) => {
    setDetailId((currentId) => {
      const index = detailPool.findIndex((site) => site.id === currentId)
      if (index < 0 || detailPool.length < 2) return currentId
      return detailPool[(index + direction + detailPool.length) % detailPool.length].id
    })
  }, [detailPool])

  const openDetail = useCallback((site) => {
    if (!site) return
    setRecentIds((current) => [site.id, ...current.filter((id) => id !== site.id)].slice(0, 4))
    setDetailId(site.id)
  }, [])

  const shareProject = useCallback(async (site) => {
    if (!site) return
    const url = new URL(window.location.href)
    url.searchParams.set('project', site.id)
    const shareUrl = url.toString()
    try {
      if (navigator.share) {
        await navigator.share({ title: `${site.title} — Umut`, url: shareUrl })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        showToast('Proje bağlantısı kopyalandı')
      }
    } catch (error) {
      if (error?.name !== 'AbortError') showToast('Bağlantı paylaşılamadı')
    }
  }, [showToast])

  // Paylaşılmış bir proje bağlantısı doğrudan detay penceresini açar.
  useEffect(() => {
    const projectId = new URLSearchParams(window.location.search).get('project')
    if (projectId && sites.some((site) => site.id === projectId && site.public)) {
      setDetailId(projectId)
    }
  }, [sites])

  const closeDetail = useCallback(() => {
    setDetailId(null)
    const url = new URL(window.location.href)
    if (url.searchParams.has('project')) {
      url.searchParams.delete('project')
      window.history.replaceState({}, '', url)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.appearance = appearance
    try {
      localStorage.setItem(APPEARANCE_KEY, appearance)
    } catch {
      // Storage can be disabled by the visitor.
    }
  }, [appearance])

  return (
    <div className="app">
      <Background />
      <PageChrome />

      {!isAdmin && !visitorMode && !visitorLoginOpen && (
        <VisitorGate
          onEmail={() => setVisitorLoginOpen(true)}
          onGuest={() => {
            localStorage.setItem('thyke:visitor-mode', 'guest')
            setVisitorMode('guest')
          }}
        />
      )}

      <Hero
        count={sites.length}
        publicCount={sites.filter((site) => site.public).length}
        isAdmin={isAdmin}
        onAdd={openAdd}
        onReset={resetLayout}
        onAdminClick={() => (isAdmin ? lockAdmin() : setAdminOpen(true))}
        appearance={appearance}
        onToggleAppearance={() => setAppearance((value) => (value === 'dark' ? 'light' : 'dark'))}
        onCommand={() => setCommandOpen(true)}
        onInbox={() => setBriefInboxOpen(true)}
        inboxCount={briefs.length}
        onStats={() => setStatsOpen(true)}
        visitCount={visits.length}
      />

      <>

          <section className="projects-intro" aria-labelledby="projects-title">
            <div className="projects-intro-title">
              <span className="section-index">01</span>
              <h2 id="projects-title">Projeler</h2>
            </div>
            <p>Web deneyleri, oyunlar ve küçük internet fikirleri.</p>
          </section>

          <section className="board-tools" aria-label="Pano araçları">
            {isAdmin ? (
              <p className="board-arrange-note">
                <span className="board-arrange-icon" aria-hidden="true">
                  <Move size={14} strokeWidth={2.1} />
                </span>
                Kartları tutup istediğin yere bırak — pano aşağı doğru otomatik uzar.
              </p>
            ) : (
              <>
                <label className="board-search">
                  <Search size={16} strokeWidth={2} aria-hidden="true" />
                  <input
                    ref={searchInputRef}
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
                  {favoriteIds.length > 0 && <span className="board-favorite-count">{favoriteIds.length}</span>}
                </button>
              </>
            )}
            <span className="board-result" aria-live="polite">
              {shownSites.length} proje
            </span>
            {!isAdmin && (boardQuery || onlyFavorites || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <button type="button" className="board-clear" onClick={clearBoardFilters}>
                Temizle
              </button>
            )}
          </section>
          {!isAdmin && availableCategories.length > 1 && (
            <nav className="board-filters" aria-label="Proje kategorileri">
              <span className="board-filter-label"><Filter size={13} strokeWidth={2} /> Kategoriler</span>
              <button
                type="button"
                className={'board-filter' + (selectedCategory === 'all' ? ' board-filter--active' : '')}
                onClick={() => setSelectedCategory('all')}
                aria-pressed={selectedCategory === 'all'}
              >
                Tümü <span>{sites.filter((site) => site.public).length}</span>
              </button>
              {availableCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={'board-filter' + (selectedCategory === category ? ' board-filter--active' : '')}
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
                >
                  {categoryName(category)} <span>{categoryCounts[category]}</span>
                </button>
              ))}
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  type="button"
                  className={'board-filter board-filter--status' + (selectedStatus === status ? ' board-filter--active' : '')}
                  onClick={() => setSelectedStatus(selectedStatus === status ? 'all' : status)}
                  aria-pressed={selectedStatus === status}
                >
                  {statusName(status)} <span>{count}</span>
                </button>
              ))}
            </nav>
          )}
        <main
          id="projects"
          ref={boardRef}
          className={'board' + (isMobile ? ' board--flow' : '')}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setActiveId(null)
          }}
          onDoubleClick={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault()
              setActiveId(null)
            }
          }}
        >
          {sitesLoading && Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="card-skeleton"
              style={{ left: 24 + (index % 5) * 300, top: 24 + Math.floor(index / 5) * 244 }}
              aria-hidden="true"
            />
          ))}

          {!sitesLoading && shownSites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              boardRef={boardRef}
              isAdmin={isAdmin}
              draggingEnabled={!isMobile}
              isActive={activeId === site.id}
              isNew={newIds.has(site.id)}
              flowMode={isMobile}
              onMove={moveSite}
              onOpen={openSite}
              onDetail={openDetail}
              onDelete={deleteSite}
              onTogglePublic={togglePublic}
              onFocus={isAdmin ? setActiveId : () => {}}
              isFavorite={favoriteIds.includes(site.id)}
              onToggleFavorite={toggleFavorite}
              onCopyLink={copySiteLink}
              isFeatured={!!site.featured}
              onToggleFeatured={toggleFeatured}
            />
          ))}

          {!sitesLoading && shownSites.length === 0 && (
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
        <Featured
          site={featuredSite}
          isAdmin={isAdmin}
          onOpen={openSite}
          onDetail={openDetail}
          onShuffle={shuffleFeatured}
        />
        <ContactSection onBrief={() => setBriefOpen(true)} />
        <RecentProjects sites={recentSites} onSelect={openDetail} />
        </>

      <ActivityRail />

      <footer className="footer">
        <span>© {new Date().getFullYear()} Umut</span>
        <span className="footer-dot">•</span>
        <span>{isAdmin ? 'Yönetici görünümü' : 'Ziyaretçi görünümü'}</span>
        <span className="footer-dot">•</span>
        <button
          type="button"
          className="footer-share"
          onClick={copyPortfolioLink}
          title="Portfolyo bağlantısını kopyala"
        >
          <Share2 size={13} strokeWidth={2.1} /> paylaş
        </button>
        <span className="footer-dot">•</span>
        <button
          type="button"
          className="footer-share"
          onClick={() => setFeedbackOpen(true)}
          title="Geri bildirim gönder"
        >
          <MessageSquare size={13} strokeWidth={2.1} /> geri bildirim
        </button>
        <span className="footer-dot">•</span>
        <button type="button" className="footer-share" onClick={() => setVisitorLoginOpen(true)} title="E-postayla giriş yap"><Mail size={13} strokeWidth={2.1} /> giriş</button>
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
        onClose={closeDetail}
        onOpenSite={openSite}
        onEdit={openEdit}
        onShare={shareProject}
        relatedSites={relatedSites}
        onSelectRelated={openDetail}
        canNavigate={detailPool.length > 1}
        onPrevious={() => navigateDetail(-1)}
        onNext={() => navigateDetail(1)}
      />

      <QuickCommand
        open={commandOpen}
        sites={sites}
        onClose={() => setCommandOpen(false)}
        onDetail={openDetail}
        onTerminal={() => setTermOpen(true)}
      />

      <BriefBuilder open={briefOpen} onClose={() => setBriefOpen(false)} onSubmit={submitBrief} />

      <BriefInbox
        open={briefInboxOpen}
        briefs={briefs}
        onClose={() => setBriefInboxOpen(false)}
        onDelete={removeBrief}
      />

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} onSubmit={submitFeedback} />

      <VisitorStats open={statsOpen} visits={visits} onClose={() => setStatsOpen(false)} />

      <VisitorLogin open={visitorLoginOpen} onClose={() => setVisitorLoginOpen(false)} onSubmit={requestVisitorLogin} />

      <Terminal
        open={termOpen}
        onClose={() => setTermOpen(false)}
        sites={sites}
        isAdmin={isAdmin}
        onDetail={(site) => {
          setTermOpen(false)
          openDetail(site)
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
