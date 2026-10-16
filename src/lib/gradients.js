// Kart kapağı için renk seçenekleri.
// 'auto' = seçili temanın ana rengini kullanır.
export const GRADIENTS = [
  { id: 'auto', label: 'Tema rengi', css: 'var(--cover)' },
  { id: 'gold', label: 'Altın', css: 'linear-gradient(135deg, #e3c46f 0%, #a1721c 100%)' },
  { id: 'wine', label: 'Vişne', css: 'linear-gradient(135deg, #8a2340 0%, #3c0a1c 100%)' },
  { id: 'plum', label: 'Erik', css: 'linear-gradient(135deg, #5b2a6e 0%, #25112e 100%)' },
  { id: 'ocean', label: 'Okyanus', css: 'linear-gradient(135deg, #1e6f9f 0%, #0a2740 100%)' },
  { id: 'forest', label: 'Orman', css: 'linear-gradient(135deg, #1f7a52 0%, #0a2b1f 100%)' },
  { id: 'rose', label: 'Gül', css: 'linear-gradient(135deg, #b03a5b 0%, #4d1425 100%)' },
  { id: 'slate', label: 'Antrasit', css: 'linear-gradient(135deg, #454e63 0%, #161a23 100%)' },
]

export const gradientById = (id) =>
  GRADIENTS.find((g) => g.id === id) || GRADIENTS[0]
