import { Grid2X2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={'site-nav' + (scrolled ? ' site-nav--scrolled' : '')} aria-label="Ana menü">
      <button
        type="button"
        className="site-brand"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span className="site-brand-mark">t</span>
        <span>thyke</span>
      </button>
      <div className="site-nav-links">
        <button type="button" onClick={() => scrollToSection('projects')}>
          <Grid2X2 size={14} strokeWidth={2.1} /> Projeler
        </button>
        <button type="button" onClick={() => scrollToSection('showcase')}>
          <Sparkles size={14} strokeWidth={2.1} /> Keşfet
        </button>
      </div>
    </nav>
  )
}
