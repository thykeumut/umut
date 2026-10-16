// Kartları GitHub'daki yayın dosyasına yazar (arka planda, düğmesiz).
//
// ÖNEMLİ: yazma anahtarı KODUN İÇİNDE ASLA bulunmaz. Depo herkese açık
// olduğu için koda konsaydı herkes görürdü. Anahtar yalnızca yöneticinin
// kendi tarayıcısında (localStorage) saklanır ve sadece bu depoya yazabilir.

export const GH = {
  owner: 'thykeumut',
  repo: 'umut',
  branch: 'gh-pages',
  path: 'sites.json',
  tokenKey: 'umut-portfolyo:github-token:v1',
}

// İnce erişim anahtarı oluşturma sayfası
export const newTokenUrl =
  'https://github.com/settings/personal-access-tokens/new'

const API = `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${GH.path}`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

// Türkçe karakterleri bozmadan base64'e çevir
export function toBase64(text) {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin)
}

export function fromBase64(b64) {
  try {
    const bin = atob(b64)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
}

export function getToken() {
  try {
    return localStorage.getItem(GH.tokenKey) || ''
  } catch {
    return ''
  }
}

export function saveToken(token) {
  const clean = token.trim()
  try {
    localStorage.setItem(GH.tokenKey, clean)
  } catch {
    /* depolama kapalı olabilir */
  }
  return clean
}

export function forgetToken() {
  try {
    localStorage.removeItem(GH.tokenKey)
  } catch {
    /* depolama kapalı olabilir */
  }
}

export function hasToken() {
  return !!getToken()
}

// Yayına yazılacak kart biçimi. "Gizli" kartların adresi düz metin olarak
// yayınlanmaz (kart görünür ama adres yayında bulunmaz).
export function publishShape(s) {
  const base = {
    id: s.id,
    title: s.title,
    description: s.description || '',
    icon: s.icon,
    gradient: s.gradient,
    public: !!s.public,
    x: s.x,
    y: s.y,
  }
  return s.public
    ? { ...base, url: s.url }
    : { ...base, u: toBase64(s.url || '') }
}

// Anahtar gerçekten bu depoya yazabiliyor mu?
export async function checkToken(token) {
  const t = (token || '').trim()
  if (!t) throw new Error('Anahtar boş.')
  let res
  try {
    res = await fetch(`https://api.github.com/repos/${GH.owner}/${GH.repo}`, {
      headers: headers(t),
      cache: 'no-store',
    })
  } catch {
    throw new Error('GitHub\'a ulaşılamadı (internet bağlantısını kontrol et).')
  }
  if (res.status === 401) throw new Error('Anahtar geçersiz ya da süresi dolmuş.')
  if (res.status === 404) {
    throw new Error(
      `Bu anahtar "${GH.owner}/${GH.repo}" deposuna erişemiyor. Depo seçimini kontrol et.`
    )
  }
  if (!res.ok) throw new Error(`GitHub hatası (${res.status}).`)
  const data = await res.json()
  if (!data?.permissions?.push) {
    throw new Error(
      'Anahtarın yazma izni yok. Permissions → Contents: Read and write seçilmeli.'
    )
  }
  return true
}

// Kart listesini yayına yazar. Aynı anda başka bir yazma olursa birkaç kez dener.
export async function publishSites(sites, attempt = 0) {
  const token = getToken()
  if (!token) throw new Error('Yayın anahtarı ayarlanmamış.')

  const content = toBase64(JSON.stringify({ sites }, null, 2))

  // Dosyanın mevcut sürümünü al (varsa güncellemek için gerekir)
  let sha = null
  let cur
  try {
    cur = await fetch(`${API}?ref=${GH.branch}`, {
      headers: headers(token),
      cache: 'no-store',
    })
  } catch {
    throw new Error('GitHub\'a ulaşılamadı.')
  }
  if (cur.ok) {
    sha = (await cur.json()).sha
  } else if (cur.status === 401) {
    throw new Error('Anahtar geçersiz ya da süresi dolmuş.')
  } else if (cur.status !== 404) {
    throw new Error(`Yayın dosyası okunamadı (${cur.status}).`)
  }

  let res
  try {
    res = await fetch(API, {
      method: 'PUT',
      headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Kartlar guncellendi',
        content,
        branch: GH.branch,
        ...(sha ? { sha } : {}),
      }),
    })
  } catch {
    throw new Error('GitHub\'a ulaşılamadı.')
  }

  if (res.ok) return res.json()

  // Aynı anda başka yazma olduysa (sha eskidi) tekrar dene
  if ((res.status === 409 || res.status === 422) && attempt < 3) {
    await sleep(700)
    return publishSites(sites, attempt + 1)
  }

  if (res.status === 401 || res.status === 403) {
    throw new Error('Anahtar reddedildi. Yeni anahtar oluşturup tekrar bağla.')
  }
  const body = await res.text().catch(() => '')
  throw new Error(`GitHub hatası (${res.status}): ${body.slice(0, 140)}`)
}
