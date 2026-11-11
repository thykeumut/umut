import { Command, Lock, Moon, Sun } from 'lucide-react'

export default function Hero({
  onAdd,
  onReset,
  count,
  publicCount,
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
          <span className="hero-badge">THYKE / SELECTED WORK</span>
          <h1 className="hero-title">
            Merhaba, ben <span className="gradient-text">Umut.</span>
            <br />
            Dijital fikirleri <span className="hero-title-muted">inşa ediyorum.</span>
          </h1>
          <p className="hero-sub">Web araçları, oyunlar ve karakteri olan küçük deneyler.</p>
          <div className="hero-index" aria-label="Çalışma alanları">
            <span><b>01</b> Web ürünleri</span>
            <span><b>02</b> Oyunlar</span>
            <span><b>03</b> Deneyler</span>
          </div>
          <p className="hero-hint">
            {isAdmin ? (
              <>Projelerini buradan ekleyip düzenleyebilirsin.</>
            ) : (
              <>Projeleri incele, <kbd>/</kbd> ile ara veya <kbd>Ctrl K</kbd> ile hızlıca bul.</>
            )}
          </p>
        </div>

        <div className="hero-actions">
          <div className="hero-buttons">
            {!isAdmin && (
              <button type="button" className="command-trigger" onClick={onCommand} title="Hızlı proje bulucu (Ctrl + K)">
                <Command size={15} strokeWidth={2.2} /> Bul <kbd>Ctrl K</kbd>
              </button>
            )}
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
              <span className="stat-label">Proje</span>
            </div>

            <div className="hero-live-stat" title="Ziyaretçilere açık projeler">
              <i aria-hidden="true" /> {publicCount} canlı
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
