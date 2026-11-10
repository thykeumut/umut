import { Lock, Moon, Sun } from 'lucide-react'

export default function Hero({
  onAdd,
  onReset,
  count,
  isAdmin,
  onAdminClick,
  appearance,
  onToggleAppearance,
  onCommand,
}) {
  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="hero-text">
          <span className="hero-badge">THYKE · PORTFOLYO</span>
          <h1 className="hero-title">
            Merhaba, ben <span className="gradient-text">Umut</span>
          </h1>
          <p className="hero-sub">
            Projelerim ve çalışmalarım.
          </p>
          <p className="hero-hint">
            {isAdmin ? (
              <>Projelerini buradan ekleyip düzenleyebilirsin.</>
            ) : (
              <>Projelerime göz atabilirsin.</>
            )}
          </p>
        </div>

        <div className="hero-actions">
          <div className="hero-buttons">
            <button
              type="button"
              className="command-trigger"
              onClick={onCommand}
              title="Hızlı komutlar (Ctrl + K)"
              aria-label="Hızlı komutları aç"
            >
              <span className="command-trigger-mark">⌘</span>
              <span>Komutlar</span>
              <kbd>Ctrl K</kbd>
            </button>
            <button
              type="button"
              className="appearance-toggle"
              onClick={onToggleAppearance}
              title={appearance === 'dark' ? 'Açık görünüme geç' : 'Koyu görünüme geç'}
              aria-label={appearance === 'dark' ? 'Açık görünüme geç' : 'Koyu görünüme geç'}
            >
              {appearance === 'dark' ? <Sun size={17} strokeWidth={2.1} /> : <Moon size={17} strokeWidth={2.1} />}
            </button>
            <div className="stat">
              <span className="stat-num">{count}</span>
              <span className="stat-label">Site</span>
            </div>

            {isAdmin ? (
              <>
                <button className="btn btn-primary" onClick={onAdd}>
                  <span className="btn-plus">+</span> Site Ekle
                </button>
                <button className="btn btn-ghost" onClick={onReset}>Yerleşimi Sıfırla</button>
                <button className="btn btn-ghost btn-admin" onClick={onAdminClick} title="Yönetici modundan çık">
                  <span className="dot-online" /> Yönetici
                </button>
              </>
            ) : (
              <button className="btn btn-ghost" onClick={onAdminClick}>
                <Lock size={14} strokeWidth={2.2} /> Yönetici Girişi
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
