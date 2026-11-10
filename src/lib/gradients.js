// Kart kapakları sade antrasit tonlarını kullanır; görseli olan kartlarda
// ekran görüntüsü öne çıkar.
export const GRADIENTS = [
  { id: 'auto', label: 'Antrasit', css: 'var(--cover)' },
  { id: 'gold', label: 'Açık antrasit', css: 'linear-gradient(135deg, #636366 0%, #2c2c2e 100%)' },
  { id: 'wine', label: 'Koyu antrasit', css: 'linear-gradient(135deg, #48484a 0%, #1c1c1e 100%)' },
  { id: 'plum', label: 'Gece', css: 'linear-gradient(135deg, #3a3a3c 0%, #111113 100%)' },
  { id: 'ocean', label: 'Çelik', css: 'linear-gradient(135deg, #515154 0%, #2c2c2e 100%)' },
  { id: 'forest', label: 'Füme', css: 'linear-gradient(135deg, #424245 0%, #1c1c1e 100%)' },
  { id: 'rose', label: 'Kurşun', css: 'linear-gradient(135deg, #545458 0%, #2c2c2e 100%)' },
  { id: 'slate', label: 'Koyu gri', css: 'linear-gradient(135deg, #2c2c2e 0%, #000000 100%)' },
]

export const gradientById = (id) =>
  GRADIENTS.find((g) => g.id === id) || GRADIENTS[0]
