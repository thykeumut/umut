import {
  BarChart3,
  BookOpen,
  Camera,
  Code2,
  Film,
  FlaskConical,
  Gamepad2,
  Globe,
  Link,
  Music,
  Palette,
  PenLine,
  Puzzle,
  Rocket,
  Smartphone,
  Sparkles,
  Star,
  Wrench,
} from 'lucide-react'

// Kart simgeleri: tek renk, ince çizgili (Lucide) — emoji gibi dandik durmaz
export const ICONS = [
  { id: 'code', name: 'Kod', Icon: Code2 },
  { id: 'flask', name: 'Deney', Icon: FlaskConical },
  { id: 'palette', name: 'Tasarım', Icon: Palette },
  { id: 'camera', name: 'Fotoğraf', Icon: Camera },
  { id: 'film', name: 'Video', Icon: Film },
  { id: 'music', name: 'Müzik', Icon: Music },
  { id: 'rocket', name: 'Proje', Icon: Rocket },
  { id: 'smartphone', name: 'Mobil', Icon: Smartphone },
  { id: 'gamepad', name: 'Oyun', Icon: Gamepad2 },
  { id: 'chart', name: 'Veri', Icon: BarChart3 },
  { id: 'pen', name: 'Yazı', Icon: PenLine },
  { id: 'book', name: 'Blog', Icon: BookOpen },
  { id: 'puzzle', name: 'Parça', Icon: Puzzle },
  { id: 'sparkles', name: 'Yapay zekâ', Icon: Sparkles },
  { id: 'star', name: 'Yıldız', Icon: Star },
  { id: 'wrench', name: 'Araç', Icon: Wrench },
  { id: 'globe', name: 'Web', Icon: Globe },
  { id: 'link', name: 'Bağlantı', Icon: Link },
]

export const DEFAULT_ICON = 'link'

export function iconById(id) {
  const found = ICONS.find((i) => i.id === id)
  return (found || ICONS[ICONS.length - 1]).Icon
}

export function iconNameById(id) {
  const found = ICONS.find((i) => i.id === id)
  return found ? found.name : 'Bağlantı'
}

// Eski kayıtlardaki emojileri yeni simgelere çevir (veri kaybı olmasın)
const LEGACY_EMOJI = {
  '💻': 'code',
  '🧪': 'flask',
  '🎨': 'palette',
  '📷': 'camera',
  '🎬': 'film',
  '🎵': 'music',
  '🚀': 'rocket',
  '📱': 'smartphone',
  '🎮': 'gamepad',
  '📊': 'chart',
  '✍️': 'pen',
  '📚': 'book',
  '🧩': 'puzzle',
  '🧠': 'sparkles',
  '✨': 'sparkles',
  '🌙': 'star',
  '⭐': 'star',
  '🛠️': 'wrench',
  '🌐': 'globe',
  '🔗': 'link',
  '💡': 'sparkles',
  '🎯': 'star',
  '🔥': 'star',
}

export function iconFromLegacyEmoji(emoji) {
  return LEGACY_EMOJI[emoji] || null
}
