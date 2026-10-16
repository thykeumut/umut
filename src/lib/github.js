// GitHub'a kart listesini yayınlama yardımcıları.
// Kullanıcı bir kez GitHub "ince erişim anahtarı" (fine-grained token) girer,
// sonra "Yayına Al" düğmesi tek tıkla sites.json dosyasını günceller.

export const GH = {
  owner: 'thykeumut',
  repo: 'umut',
  branch: 'gh-pages',
  path: 'sites.json',
}

export const siteUrl = `https://${GH.owner}.github.io/${GH.repo}/`

export const editUrl = `https://github.com/${GH.owner}/${GH.repo}/edit/${GH.branch}/${GH.path}`

export const repoUrl = `https://github.com/${GH.owner}/${GH.repo}`

// Hazır ayarlı anahtar oluşturma sayfası: sadece bu depoya "Contents: write" izni ister
export const newTokenUrl =
  `https://github.com/settings/personal-access-tokens/new` +
  `?name=portfolyo-yayin&description=umut-portfolyo-sites.json` +
  `&target_name=${GH.owner}&expires_in=90&contents=write`

const API = `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${GH.path}`

const headers = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
})

// Türkçe karakterleri bozmadan base64'e çevir
function toBase64(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}

function friendlyError(status, body) {
  if (status === 401) return 'Anahtar geçersiz ya da süresi dolmuş. Yeni bir anahtar oluştur.'
  if (status === 403) return 'Bu anahtarın yazma izni yok. "Contents: Read and write" iznini ver.'
  if (status === 404) return 'Depo ya da dosya bulunamadı. Anahtarın bu depoya erişimi var mı?'
  if (status === 409) return 'Dosya başkası tarafından değiştirilmiş. Sayfayı yenileyip tekrar dene.'
  return `GitHub hatası (${status}). ${body ? String(body).slice(0, 120) : ''}`
}

/**
 * Kart listesini GitHub'daki sites.json dosyasına yazar.
 * @param {string} token GitHub ince erişim anahtarı
 * @param {Array} sites Kart listesi
 */
export async function publishSites(token, sites) {
  const h = headers(token)

  // Dosyanın mevcut sürümünü al (varsa sha gerekir)
  const current = await fetch(`${API}?ref=${GH.branch}`, { headers: h })
  let sha
  if (current.ok) {
    sha = (await current.json()).sha
  } else if (current.status !== 404) {
    throw new Error(friendlyError(current.status))
  }

  const content = toBase64(JSON.stringify({ sites }, null, 2) + '\n')

  const res = await fetch(API, {
    method: 'PUT',
    headers: h,
    body: JSON.stringify({
      message: 'Kartları güncelle (portfolyo paneli)',
      content,
      branch: GH.branch,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json()).message
    } catch {
      /* yoksay */
    }
    throw new Error(friendlyError(res.status, detail))
  }

  return true
}

/** Anahtarın gerçekten bu depoya yazabildiğini kutuyu kirletmeden sınar */
export async function checkToken(token) {
  const res = await fetch(`https://api.github.com/repos/${GH.owner}/${GH.repo}`, {
    headers: headers(token),
  })
  if (res.ok) return true
  throw new Error(friendlyError(res.status))
}
