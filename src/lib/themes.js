// Seçilebilir renk temaları (iOS sistem renklerinden esinlenmiş).
// Gerçek değerler src/index.css içindeki [data-theme="..."] bloklarında.
export const THEMES = [
  { id: 'visne-altin', name: 'Vişne & Altın', dots: ['#e0be72', '#b03a55', '#160709'] },
  { id: 'indigo', name: 'Indigo', dots: ['#8a88ff', '#64d2ff', '#0a0a12'] },
  { id: 'okyanus', name: 'Okyanus', dots: ['#64d2ff', '#0a84ff', '#06121b'] },
  { id: 'orman', name: 'Orman', dots: ['#30d158', '#0f9d58', '#07130d'] },
  { id: 'gul', name: 'Gül', dots: ['#ff6482', '#bf5af2', '#170812'] },
  { id: 'kagit', name: 'Açık', dots: ['#f2f2f7', '#b03a55', '#d9a441'] },
  {
    id: 'siyah-beyaz',
    name: 'Siyah & Beyaz',
    dots: ['#ffffff', '#8a8a8a', '#000000'],
  },
]

export const DEFAULT_THEME = 'visne-altin'

export const themeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0]
