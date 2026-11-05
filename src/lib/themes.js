// Seçilebilir renk temaları (iOS sistem renklerinden esinlenmiş).
// Gerçek değerler src/index.css içindeki [data-theme="..."] bloklarında.
export const THEMES = [
  { id: 'visne-altin', name: 'Vişne & Altın', dots: ['#deb564', '#a93048', '#16090c'] },
  { id: 'indigo', name: 'Indigo', dots: ['#9da7e8', '#6681c4', '#0d0d1a'] },
  { id: 'okyanus', name: 'Okyanus', dots: ['#66c4dc', '#418caf', '#07151b'] },
  { id: 'orman', name: 'Orman', dots: ['#55bf7a', '#4f9f8d', '#07140d'] },
  { id: 'gul', name: 'Gül', dots: ['#da718b', '#aa72c9', '#170911'] },
  { id: 'kagit', name: 'Açık', dots: ['#fafafa', '#b03050', '#eceef2'] },
  {
    id: 'siyah-beyaz',
    name: 'Siyah & Beyaz',
    dots: ['#ffffff', '#9a9a9e', '#0b0b0c'],
  },
]

export const DEFAULT_THEME = 'visne-altin'

export const themeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0]
