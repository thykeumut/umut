import { THEMES } from '../lib/themes'

// Tema seçici: doğrudan görünen 6 renk noktası.
// Menü/açılır pencere yok — tek tıkla değişir.
export default function ThemeSwitcher({ theme, onChange }) {
  const active = THEMES.find((t) => t.id === theme) || THEMES[0]

  return (
    <div className="theme-bar" role="group" aria-label="Renk teması">
      <span className="theme-bar-label">Tema</span>

      <div className="theme-swatches">
        {THEMES.map((t) => {
          const on = t.id === theme
          return (
            <button
              key={t.id}
              type="button"
              className={'theme-swatch' + (on ? ' theme-swatch--on' : '')}
              style={{
                background: `linear-gradient(135deg, ${t.dots[0]} 0%, ${t.dots[1]} 100%)`,
              }}
              title={t.name}
              aria-label={t.name}
              aria-pressed={on}
              onClick={() => onChange(t.id)}
            />
          )
        })}
      </div>

      <span className="theme-bar-name">{active.name}</span>
    </div>
  )
}
