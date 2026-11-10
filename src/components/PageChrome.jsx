import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

// Sayfanın etrafındaki küçük, işlevsel arayüz detayları.
export default function PageChrome() {
  const [pointer, setPointer] = useState({ x: -100, y: -100, visible: false })
  const [scroll, setScroll] = useState(0)
  const [canUseCursor, setCanUseCursor] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const syncCursorAvailability = () => setCanUseCursor(media.matches)
    syncCursorAvailability()
    media.addEventListener?.('change', syncCursorAvailability)

    return () => media.removeEventListener?.('change', syncCursorAvailability)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('has-custom-cursor', canUseCursor)
    return () => document.documentElement.classList.remove('has-custom-cursor')
  }, [canUseCursor])

  useEffect(() => {
    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScroll(max > 0 ? Math.min(window.scrollY / max, 1) : 0)
    }
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', updateScroll)
    return () => {
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', updateScroll)
    }
  }, [])

  useEffect(() => {
    if (!canUseCursor) return undefined
    const move = (event) => setPointer({ x: event.clientX, y: event.clientY, visible: true })
    const leave = () => setPointer((current) => ({ ...current, visible: false }))
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('mouseleave', leave)
    }
  }, [canUseCursor])

  const cursorStyle = { left: `${pointer.x}px`, top: `${pointer.y}px` }

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${scroll})` }} />
      </div>

      {canUseCursor && (
        <>
          <span className={'cursor-dot' + (pointer.visible ? ' is-visible' : '')} style={cursorStyle} aria-hidden="true" />
          <span className={'cursor-ring' + (pointer.visible ? ' is-visible' : '')} style={cursorStyle} aria-hidden="true" />
        </>
      )}

      <button
        className={'scroll-top' + (scroll > 0.14 ? ' is-visible' : '')}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Sayfanın başına dön"
        title="Yukarı çık"
      >
        <ArrowUp size={18} strokeWidth={2.2} />
      </button>
    </>
  )
}
