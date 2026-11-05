// Seçilebilir renk temaları (iOS sistem renklerinden esinlenmiş).
// Gerçek değerler src/index.css içindeki [data-theme="..."] bloklarında.
export const THEMES = [
  { id: 'visne-altin', name: 'Vişne & Altın', dots: ['#372b3d', '#76566e', '#e0a458'] },
  { id: 'indigo', name: 'Indigo', dots: ['#25395b', '#406e8e', '#f2a65a'] },
  { id: 'okyanus', name: 'Okyanus', dots: ['#0f4c5c', '#2c7da0', '#e9c46a'] },
  { id: 'orman', name: 'Orman', dots: ['#264653', '#2a9d8f', '#e9c46a'] },
  { id: 'gul', name: 'Gül', dots: ['#62374e', '#b56576', '#6fa3a6'] },
  { id: 'kagit', name: 'Açık', dots: ['#3a5a40', '#6b8f71', '#b96a2c'] },
  {
    id: 'siyah-beyaz',
    name: 'Siyah & Beyaz',
    dots: ['#151515', '#707070', '#f4f4f4'],
  },
]

export const DEFAULT_THEME = 'visne-altin'

export const themeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0]
