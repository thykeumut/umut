// Seçilebilir renk temaları (iOS sistem renklerinden esinlenmiş).
// Gerçek değerler src/index.css içindeki [data-theme="..."] bloklarında.
export const THEMES = [
  { id: 'visne-altin', name: 'Gece', dots: ['#26333d', '#516372', '#d6a85a'] },
  { id: 'indigo', name: 'Kobalt', dots: ['#25395b', '#406e8e', '#f2a65a'] },
  { id: 'okyanus', name: 'Deniz', dots: ['#0f4c5c', '#2c7da0', '#e9c46a'] },
  { id: 'orman', name: 'Çam', dots: ['#264653', '#2a9d8f', '#e9c46a'] },
  { id: 'gul', name: 'Kiremit', dots: ['#62374e', '#b56576', '#6fa3a6'] },
  { id: 'kagit', name: 'Keten', dots: ['#3a5a40', '#6b8f71', '#b96a2c'] },
  {
    id: 'siyah-beyaz',
    name: 'Mono',
    dots: ['#151515', '#707070', '#f4f4f4'],
  },
]

export const DEFAULT_THEME = 'visne-altin'

export const themeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0]
