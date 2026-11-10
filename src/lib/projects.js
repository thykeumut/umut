// Proje kategorileri ve yardımcılar.
export const CATEGORIES = [
  { id: 'all', name: 'Tümü' },
  { id: 'web', name: 'Web' },
  { id: 'oyun', name: 'Oyun' },
  { id: 'deneysel', name: 'Deneysel' },
  { id: 'tasarim', name: 'Tasarım' },
]

export const PROJECT_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'all')

export const categoryName = (id) =>
  (CATEGORIES.find((c) => c.id === id) || CATEGORIES[1]).name

export function normalizeCategory(value) {
  return PROJECT_CATEGORIES.some((c) => c.id === value) ? value : 'web'
}

// "React, CSS, canvas" → ['React','CSS','canvas']
export function cleanTags(value) {
  const list = Array.isArray(value) ? value : String(value || '').split(',')
  return list
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 6)
}

// Alan adı / URL gösterimi (https:// ve sondaki / atılır)
export function prettyUrl(url = '') {
  return String(url).replace(/^https?:\/\//, '').replace(/\/$/, '')
}
