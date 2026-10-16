import { useEffect, useState } from 'react'
import { CloudOff, Lock } from 'lucide-react'
import ThemeSwitcher from './ThemeSwitcher.jsx'

const WORDS = ['Front-end', 'React', 'Tasarım', 'Projeler', 'Denemeler']

// Üstteki tanıtım alanı: isim, yazı-makinesi efekti ve butonlar
export default function Hero({
  onAdd,
  onReset,
  count,
  theme,
  onThemeChange,
  isAdmin,
  onAdminClick,
  publishNote,
  onPublishSetup,
}) {
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const full = WORDS[wordIndex]
    const delay = deleting ? 45 : 95

    const timer = setTimeout(() => {
      if (!deleting) {
        const next = full.slice(0, text.length + 1)
        setText(next)
        if (next === full) setTimeout(() => setDeleting(true), 1400)
      } else {
        const next = full.slice(0, Math.max(0, text.length - 1))
        setText(next)
        if (next === '') {
          setDeleting(false)
          setWordIndex((i) => (i + 1) % WORDS.length)
        }
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [text, deleting, wordIndex])

  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="hero-text">
          <span className="hero-badge">Kişisel Portfolyo</span>
          <h1 className="hero-title">
            Merhaba, ben <span className="gradient-text">Umut</span>
          </h1>
          <p className="hero-sub">
            <span className="typewriter">{text}</span>
            <span className="caret">|</span>
          </p>
          <p className="hero-hint">
            {isAdmin ? (
              <>
                Kartları fareyle <strong>sürükle</strong>, istediğin yere bırak. Açmak
                için kartın üzerine <strong>tıkla</strong>.
              </>
            ) : (
              <>
                Kartın üzerine <strong>tıklayarak</strong> siteye gidebilirsin. Kilitli
                kartlar yalnızca sahibine açıktır.
              </>
            )}
          </p>

          {isAdmin && publishNote && (
            <button className="publish-note" onClick={onPublishSetup}>
              <CloudOff size={13} strokeWidth={2.2} />
              <span>{publishNote}</span>
              <span className="publish-note-cta">Bağla</span>
            </button>
          )}
        </div>

        <div className="hero-actions">
          <ThemeSwitcher theme={theme} onChange={onThemeChange} />

          <div className="hero-buttons">
            <div className="stat">
              <span className="stat-num">{count}</span>
              <span className="stat-label">Site</span>
            </div>

            {isAdmin ? (
              <>
                <button className="btn btn-primary" onClick={onAdd}>
                  <span className="btn-plus">+</span> Site Ekle
                </button>
                <button className="btn btn-ghost" onClick={onReset}>
                  Yerleşimi Sıfırla
                </button>
                <button
                  className="btn btn-ghost btn-admin"
                  onClick={onAdminClick}
                  title="Yönetici modundan çık"
                >
                  <span className="dot-online" />
                  Yönetici
                </button>
              </>
            ) : (
              <button className="btn btn-ghost" onClick={onAdminClick}>
                <Lock size={14} strokeWidth={2.2} />
                Yönetici Girişi
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
