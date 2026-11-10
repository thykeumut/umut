import { useEffect, useRef, useState } from 'react'
import { X, TerminalSquare } from 'lucide-react'
import { categoryName, prettyUrl } from '../lib/projects'

// Gizli terminal.
// ~ (ya da `) tuşuyla açılır. Komutlar Türkçe yazılışlarıyla da çalışır.
const BANNER = [
  '┌───────────────────────────────┐',
  '│   T H Y K E   ·   T E R M    │',
  '└───────────────────────────────┘',
]

const HELP = [
  ['help', 'komutları listele'],
  ['projects', 'projeler · projects 3 → detay'],
  ['github', 'GitHub profili'],
  ['stats', 'canlı istatistikler'],
  ['secret', 'gizli komutları aç'],
  ['clear', 'ekranı temizle'],
  ['exit', 'terminali kapat'],
]

const SECRET_HELP = [
  ['matrix', 'yağmur başlasın'],
  ['coffee', 'kahve molası'],
  ['whoami', 'sen kimsin?'],
  ['42', 'hayatın anlamı'],
  ['sudo', 'yetki denemesi'],
  ['rm -rf /', 'sakın deneme'],
  ['thyke', 'imza'],
]

const ASCII_THYKE = [
  '  ████████╗██╗  ██╗██╗   ██╗██╗  ██╗███████╗',
  '  ╚══██╔══╝██║  ██║╚██╗ ██╔╝██║ ██╔╝██╔════╝',
  '     ██║   ███████║ ╚████╔╝ █████╔╝ █████╗  ',
  '     ██║   ██╔══██║  ╚██╔╝  ██╔═██╗ ██╔══╝  ',
  '     ██║   ██║  ██║   ██║   ██║  ██╗███████╗',
  '     ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝',
]

export default function Terminal({
  open,
  onClose,
  sites,
  isAdmin,
  onDetail,
}) {
  const [lines, setLines] = useState([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [hIndex, setHIndex] = useState(-1)
  const [matrix, setMatrix] = useState(0)
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)
  const bodyRef = useRef(null)

  const prompt = `${isAdmin ? 'yonetici' : 'ziyaretci'}@thyke:~$`

  const say = (kind, text) => setLines((prev) => [...prev, { kind, text }])

  // Her açılışta taze bir oturum: hoş geldin mesajı + odak.
  useEffect(() => {
    if (!open) return
    setLines([
      { kind: 'art', text: BANNER.join('\n') },
      { kind: 'dim', text: 'Gizli terminal. Komutlar için: help' },
      { kind: 'dim', text: 'İpucu: secret' },
      { kind: 'plain', text: '' },
    ])
    setInput('')
    setHIndex(-1)
    const t = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [open])

  // Yeni satır gelince en alta kaydır
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  useEffect(() => {
    if (!shake) return
    const t = setTimeout(() => setShake(false), 600)
    return () => clearTimeout(t)
  }, [shake])

  if (!open) return null

  const findSite = (raw) => {
    const n = Number(raw)
    if (Number.isFinite(n) && n > 0) return sites[n - 1]
    const q = String(raw || '').toLocaleLowerCase('tr')
    return sites.find((s) => s.title.toLocaleLowerCase('tr').includes(q))
  }

  const run = (raw) => {
    const cmd = raw.trim()
    if (!cmd) return
    say('cmd', `${prompt} ${cmd}`)
    setHistory((h) => [...h, cmd].slice(-40))
    setHIndex(-1)

    const [nameRaw, ...rest] = cmd.split(/\s+/)
    const name = nameRaw.toLocaleLowerCase('tr')
    const arg = rest.join(' ')

    switch (name) {
      case 'help':
        if (/gizli|secret|all/.test(arg)) {
          say('ok', 'GİZLİ KOMUTLAR')
          SECRET_HELP.forEach(([c, d]) => say('dim', `  ${c.padEnd(10)} ${d}`))
        } else {
          say('ok', 'KOMUTLAR')
          HELP.forEach(([c, d]) => say('dim', `  ${c.padEnd(10)} ${d}`))
        }
        break

      case 'projects':
      case 'projeler': {
        if (!arg) {
          say('ok', `${sites.length} proje`)
          sites.forEach((s, i) => {
            const lock = s.public ? '' : '  [kilitli]'
            const cat = categoryName(s.category)
            const url = s.public && s.url ? prettyUrl(s.url) : '—'
            say(
              'dim',
              `  ${String(i + 1).padStart(2, ' ')}  ${s.title.padEnd(22, ' ').slice(
                0,
                22
              )} ${cat.padEnd(9)} ${url}${lock}`
            )
          })
          say('dim', 'Detay için: projects 2')
        } else {
          const site = findSite(arg)
          if (!site) {
            say('err', `proje bulunamadı: ${arg}`)
          } else {
            onDetail?.(site)
            say('ok', `${site.title} açıldı`)
          }
        }
        break
      }

      case 'github':
        say('plain', 'github.com/thykeumut')
        say('dim', 'Canlı istatistikler için: stats')
        break

      case 'stats':
      case 'istatistik':
        say('plain', 'Geliştirici laboratuvarı kaldırıldı.')
        onClose()
        break

      case 'pano':
      case 'board':
        onClose()
        break

      case 'gunluk':
      case 'log':
        say('plain', 'Geliştirme günlüğü artık bu sitede yer almıyor.')
        onClose()
        break

      case 'secret':
      case 'gizli':
        say('ok', 'Terminali buldun. İşte gizli komutlar:')
        SECRET_HELP.forEach(([c, d]) => say('dim', `  ${c.padEnd(10)} ${d}`))
        say('dim', 'Bir de: help gizli')
        break

      case 'matrix':
        setMatrix(Date.now())
        say('ok', 'yağmur yağıyor…')
        break

      case 'coffee':
        say('art', ['      ( (', '       ) )', '    ........', '    |      |]', '    \\      /', '     `----\''].join('\n'))
        say('dim', 'kahve hazır. şimdi kod.')
        break

      case 'whoami':
        say('plain', isAdmin ? 'yonetici' : 'ziyaretci')
        say('dim', isAdmin ? 'bu tarayıcıda yönetici modundasın' : 'sadece bir gezgin')
        break

      case '42':
        say('plain', '42')
        break

      case 'sudo':
        say('err', 'yetkin yok. ama denemek güzeldi.')
        break

      case 'rm':
        if (/^-rf\s+\/?$/.test(arg) || arg === '-rf /') {
          setShake(true)
          say('err', 'şaka şaka. hiçbir şey silinmedi.')
        } else {
          say('err', 'kullanım: rm -rf /')
        }
        break

      case 'thyke':
        say('art', ASCII_THYKE.join('\n'))
        break

      case 'clear':
      case 'temizle':
        setLines([])
        break

      case 'exit':
      case 'q':
        onClose()
        break

      default:
        say('err', `komut bulunamadı: ${nameRaw}`)
        say('dim', 'help yazabilirsin.')
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      run(input)
      setInput('')
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const next = hIndex < 0 ? history.length - 1 : Math.max(0, hIndex - 1)
      setHIndex(next)
      setInput(history[next])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (hIndex < 0) return
      const next = hIndex + 1
      if (next >= history.length) {
        setHIndex(-1)
        setInput('')
      } else {
        setHIndex(next)
        setInput(history[next])
      }
    }
  }

  return (
    <div className="term-backdrop" onPointerDown={onClose}>
      <div
        className={'term' + (shake ? ' term--shake' : '')}
        role="dialog"
        aria-label="Gizli terminal"
        onPointerDown={(e) => {
          e.stopPropagation()
          inputRef.current?.focus()
        }}
      >
        {matrix ? <MatrixRain key={matrix} onDone={() => setMatrix(0)} /> : null}

        <div className="term-head">
          <span className="term-icon">
            <TerminalSquare size={14} strokeWidth={2.2} />
          </span>
          <span className="term-title">thyke terminal</span>
          <button className="term-close" onClick={onClose} title="Kapat (Esc)">
            <X size={14} strokeWidth={2.4} />
          </button>
        </div>

        <div className="term-body" ref={bodyRef}>
          {lines.map((line, i) => (
            <div key={i} className={`term-line term-line--${line.kind}`}>
              {line.text}
            </div>
          ))}
        </div>

        <div className="term-inputrow">
          <span className="term-prompt">{prompt}</span>
          <input
            ref={inputRef}
            className="term-input"
            value={input}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="komut yaz…"
            aria-label="Terminal komutu"
          />
        </div>
      </div>
    </div>
  )
}

// Kısa bir "matrix" yağmuru (6 saniye, sonra kendini kapatır)
function MatrixRain({ onDone }) {
  const ref = useRef(null)
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const fit = () => {
      canvas.width = Math.max(1, canvas.clientWidth * dpr)
      canvas.height = Math.max(1, canvas.clientHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() ||
      '#8ef0a0'
    const cols = Math.max(12, Math.floor(canvas.clientWidth / 16))
    const drops = Array.from({ length: cols }, () => Math.random() * -40)
    const glyphs = '0123456789THYKE</>{}[]#$%&*'.split('')

    let raf = 0
    let start = performance.now()

    const frame = (now) => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.fillStyle = 'rgba(0, 0, 0, 0.09)'
      ctx.fillRect(0, 0, w, h)
      ctx.font = '13px ui-monospace, Consolas, monospace'
      ctx.fillStyle = accent

      drops.forEach((y, i) => {
        const ch = glyphs[Math.floor(Math.random() * glyphs.length)]
        ctx.fillText(ch, i * 16 + 4, y * 18)
        if (y * 18 > h && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.6 + Math.random() * 0.5
      })

      if (now - start < 6000) {
        raf = requestAnimationFrame(frame)
      } else {
        done.current?.()
      }
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={ref} className="term-matrix" aria-hidden="true" />
}
