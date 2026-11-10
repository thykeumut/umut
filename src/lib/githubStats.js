// Canlı GitHub istatistikleri (herkese açık API, anahtarsız).
//
// İki istek yeterli: kullanıcı + depolar. Dil dağılımı depoların "language"
// alanından hesaplanır; ayrı dil isteği yapılmaz (saatlik istek sınırı 60).
// Sonuç tarayıcıda 6 saat saklanır; böylece her ziyaretçi API'yi yormaz.

import { GH } from './github.js'

const CACHE_KEY = 'umut-portfolyo:github-stats:v1'
const TTL = 6 * 60 * 60 * 1000
let activeRequest = null

// GitHub API'si hiç cevap vermezse (istek sınırı ya da çevrimdışı) gösterilecek
// son bilinen anlık görüntü. Ara ara elle güncellenir; "son bilinen veriler"
// olarak etiketlenir, canlı veri gibi sunulmaz.
const FALLBACK = {
  fetchedAt: 0,
  snapshotAt: '2026-11-02T13:42:24Z',
  user: {
    login: 'thykeumut',
    name: 'thykeumut',
    bio: '',
    avatar: 'https://avatars.githubusercontent.com/u/237419747?v=4',
    followers: 0,
    publicRepos: 16,
    url: 'https://github.com/thykeumut',
    createdAt: '2025-10-11T11:29:36Z',
  },
  stars: 0,
  languages: [
    { name: 'HTML', count: 7, pct: 47 },
    { name: 'JavaScript', count: 6, pct: 40 },
    { name: 'CSS', count: 2, pct: 13 },
  ],
  recent: [
    {
      name: 'thyke-studio',
      description: 'Client-side premium media editor',
      language: 'HTML',
      url: 'https://github.com/thykeumut/thyke-studio',
      pushedAt: '2026-11-02T13:42:24Z',
      stars: 0,
    },
    {
      name: 'boykot-listesi',
      description: '',
      language: 'HTML',
      url: 'https://github.com/thykeumut/boykot-listesi',
      pushedAt: '2026-11-02T12:02:01Z',
      stars: 0,
    },
    {
      name: 'testhane',
      description: '',
      language: 'JavaScript',
      url: 'https://github.com/thykeumut/testhane',
      pushedAt: '2026-11-02T07:19:19Z',
      stars: 0,
    },
    {
      name: 'umut',
      description:
        'Kisisel portfolyo: suruklenebilir kartlar, temalar ve yonetici modu',
      language: 'JavaScript',
      url: 'https://github.com/thykeumut/umut',
      pushedAt: '2026-10-23T07:33:18Z',
      stars: 0,
    },
    {
      name: 'thykeumut.github.io',
      description: '',
      language: '',
      url: 'https://github.com/thykeumut/thykeumut.github.io',
      pushedAt: '2026-10-23T06:40:07Z',
      stars: 0,
    },
  ],
}

const json = async (url) => {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 9000)
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      signal: ctl.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return { status: res.status, data: null }
    return { status: res.status, data: await res.json() }
  } catch {
    return { status: 0, data: null }
  } finally {
    clearTimeout(timer)
  }
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.fetchedAt) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    /* depolama kapalı olabilir */
  }
}

function shape(user, repos) {
  const clean = (Array.isArray(repos) ? repos : [])
    .filter((r) => !r.fork && !r.archived)
    .sort((a, b) => new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0))

  const counts = new Map()
  clean.forEach((r) => {
    if (r.language) counts.set(r.language, (counts.get(r.language) || 0) + 1)
  })
  const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1
  const languages = [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    fetchedAt: Date.now(),
    user: {
      login: user.login,
      name: user.name || user.login,
      bio: user.bio || '',
      avatar: user.avatar_url,
      followers: user.followers,
      publicRepos: user.public_repos,
      url: user.html_url,
      createdAt: user.created_at,
    },
    stars: clean.reduce((sum, r) => sum + (r.stargazers_count || 0), 0),
    languages,
    recent: clean.slice(0, 5).map((r) => ({
      name: r.name,
      description: r.description || '',
      language: r.language || '',
      url: r.html_url,
      pushedAt: r.pushed_at,
      stars: r.stargazers_count || 0,
    })),
  }
}

export async function getGithubStats({ force = false } = {}) {
  const cached = readCache()

  if (!force && cached && Date.now() - cached.fetchedAt < TTL) {
    return { data: cached, cached: true, stale: false }
  }

  if (activeRequest) return activeRequest
  activeRequest = loadGithubStats(cached)
  try {
    return await activeRequest
  } finally {
    activeRequest = null
  }
}

async function loadGithubStats(cached) {

  const [userRes, repoRes] = await Promise.all([
    json(`https://api.github.com/users/${GH.owner}`),
    json(
      `https://api.github.com/users/${GH.owner}/repos?sort=pushed&per_page=100&type=owner`
    ),
  ])

  if (!userRes.data || !repoRes.data) {
    const limited = userRes.status === 403 || repoRes.status === 403
    const data = cached || FALLBACK
    return {
      data,
      cached: !!cached,
      fallback: !cached,
      stale: true,
      error: limited
        ? cached
          ? 'GitHub istek sınırı doldu; önbellekteki veriler gösteriliyor.'
          : 'GitHub istek sınırı doldu; son bilinen veriler gösteriliyor.'
        : cached
          ? 'GitHub verileri alınamadı; önbellekteki veriler gösteriliyor.'
          : 'GitHub verileri alınamadı; son bilinen veriler gösteriliyor.',
    }
  }

  const data = shape(userRes.data, repoRes.data)
  writeCache(data)
  return { data, cached: false, stale: false }
}

// "3 gün önce" gibi kısa zaman farkı
export function timeAgo(dateStr) {
  const t = new Date(dateStr).getTime()
  if (!t) return ''
  const diff = Math.max(0, Date.now() - t)
  const dk = Math.floor(diff / 60000)
  if (dk < 60) return dk < 1 ? 'az önce' : `${dk} dk önce`
  const sa = Math.floor(dk / 60)
  if (sa < 24) return `${sa} saat önce`
  const gun = Math.floor(sa / 24)
  if (gun < 30) return `${gun} gün önce`
  const ay = Math.floor(gun / 30)
  if (ay < 12) return `${ay} ay önce`
  return `${Math.floor(ay / 12)} yıl önce`
}
