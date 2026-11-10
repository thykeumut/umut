import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// Sayfanın etrafındaki küçük, işlevsel arayüz detayları.
export default function PageChrome() {
  const [pointer, setPointer] = useState({ x: -100, y: -100, visible: false })
  const [scroll, setScroll] = useState(0)
  const [canUseCursor, setCanUseCursor] = useState(false)
  const [dust, setDust] = useState([])
  const lastDustAt = useRef(0)
  const dustId = useRef(0)
  const dustTimers = useRef(new Set())

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
    const move = (event) => {
      const interactive = Boolean(
        event.target.closest('button, a, input, textarea, select, [role="button"], .card')
      )
      setPointer({ x: event.clientX, y: event.clientY, visible: true, interactive })

      const now = performance.now()
      if (now - lastDustAt.current < 20) return
      lastDustAt.current = now

      const particle = {
        id: ++dustId.current,
        x: event.clientX,
        y: event.clientY,
        size: 1.5 + Math.random() * 2.5,
        driftX: (Math.random() - 0.5) * 22,
        driftY: -4 - Math.random() * 22,
        delay: Math.random() * 35,
      }
      setDust((current) => [...current.slice(-22), particle])
      const timer = window.setTimeout(() => {
        setDust((current) => current.filter((item) => item.id !== particle.id))
        dustTimers.current.delete(timer)
      }, 590)
      dustTimers.current.add(timer)
    }
    const leave = () => setPointer((current) => ({ ...current, visible: false, interactive: false }))
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('mouseleave', leave)
      dustTimers.current.forEach((timer) => window.clearTimeout(timer))
      dustTimers.current.clear()
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
          <span className={'cursor-dot' + (pointer.visible ? ' is-visible' : '') + (pointer.interactive ? ' is-interactive' : '')} style={cursorStyle} aria-hidden="true" />
          <span className={'cursor-ring' + (pointer.visible ? ' is-visible' : '') + (pointer.interactive ? ' is-interactive' : '')} style={cursorStyle} aria-hidden="true" />
          <span className="cursor-dust" aria-hidden="true">
            {dust.map((particle) => (
              <i
                key={particle.id}
                style={{
                  left: `${particle.x}px`,
                  top: `${particle.y}px`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  '--dust-x': `${particle.driftX}px`,
                  '--dust-y': `${particle.driftY}px`,
                  '--dust-delay': `${particle.delay}ms`,
                }}
              />
            ))}
          </span>
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
