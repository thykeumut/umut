import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Pause, Play, Plus, RotateCcw, Timer, Trash2, X } from 'lucide-react'

const TODOS_KEY = 'thyke-focus:todos:v1'

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(TODOS_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter((item) => item && typeof item.text === 'string').slice(0, 12) : []
  } catch {
    return []
  }
}

export default function FocusPanel({ open, onClose }) {
  const [minutes, setMinutes] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [todos, setTodos] = useState(loadTodos)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const completed = secondsLeft === 0
  const progress = Math.max(0, Math.min(1, 1 - secondsLeft / (minutes * 60)))
  const display = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80)
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || !running || secondsLeft <= 0) return
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setRunning(false)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [open, running, secondsLeft])

  useEffect(() => {
    try {
      localStorage.setItem(TODOS_KEY, JSON.stringify(todos))
    } catch {
      // Private mode can disable storage; the panel still works for the session.
    }
  }, [todos])

  const doneCount = useMemo(() => todos.filter((todo) => todo.done).length, [todos])

  if (!open) return null

  const setPreset = (nextMinutes) => {
    setMinutes(nextMinutes)
    setSecondsLeft(nextMinutes * 60)
    setRunning(false)
  }

  const resetTimer = () => {
    setSecondsLeft(minutes * 60)
    setRunning(false)
  }

  const addTodo = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setTodos((items) => [{ id: `${Date.now()}-${Math.random()}`, text, done: false }, ...items].slice(0, 12))
    setDraft('')
  }

  return (
    <div className="focus-backdrop" onPointerDown={onClose}>
      <section className="focus-panel" role="dialog" aria-modal="true" aria-label="THYKE Focus" onPointerDown={(event) => event.stopPropagation()}>
        <header className="focus-head">
          <div><span>THYKE / FOCUS</span><h2>Odak alanın</h2></div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Focus panelini kapat"><X size={16} strokeWidth={2.3} /></button>
        </header>

        <div className="focus-grid">
          <section className="focus-timer-card" aria-label="Pomodoro zamanlayıcısı">
            <div className="focus-timer-ring" style={{ '--focus-progress': `${progress * 360}deg` }}>
              <Timer size={18} strokeWidth={2.1} />
              <strong>{display}</strong>
              <small>{completed ? 'Tur tamamlandı' : running ? 'Odak sürüyor' : 'Hazır olduğunda başla'}</small>
            </div>
            <div className="focus-presets" aria-label="Zaman seçimi">
              {[25, 50].map((preset) => <button key={preset} type="button" className={minutes === preset ? 'is-active' : ''} onClick={() => setPreset(preset)}>{preset} dk</button>)}
            </div>
            <div className="focus-actions">
              <button type="button" className="btn btn-primary" onClick={() => {
                if (completed) setSecondsLeft(minutes * 60)
                setRunning((current) => completed || !current)
              }}>
                {running ? <Pause size={15} strokeWidth={2.2} /> : <Play size={15} strokeWidth={2.2} />} {running ? 'Duraklat' : completed ? 'Tekrar başla' : 'Başlat'}
              </button>
              <button type="button" className="focus-reset" onClick={resetTimer} title="Zamanlayıcıyı sıfırla"><RotateCcw size={15} strokeWidth={2.2} /></button>
            </div>
          </section>

          <section className="focus-todos" aria-label="Odak görevleri">
            <div className="focus-todos-head"><span>BU TUR</span><small>{doneCount}/{todos.length} tamamlandı</small></div>
            <form className="focus-add" onSubmit={addTodo}>
              <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Küçük bir görev ekle..." maxLength={80} />
              <button type="submit" aria-label="Görev ekle"><Plus size={16} strokeWidth={2.4} /></button>
            </form>
            <div className="focus-todo-list">
              {todos.map((todo) => (
                <div className={'focus-todo' + (todo.done ? ' is-done' : '')} key={todo.id}>
                  <button type="button" className="focus-check" onClick={() => setTodos((items) => items.map((item) => item.id === todo.id ? { ...item, done: !item.done } : item))} aria-label={todo.done ? 'Görevi geri al' : 'Görevi tamamla'}><Check size={12} strokeWidth={2.8} /></button>
                  <span>{todo.text}</span>
                  <button type="button" className="focus-delete" onClick={() => setTodos((items) => items.filter((item) => item.id !== todo.id))} aria-label="Görevi sil"><Trash2 size={13} strokeWidth={2.1} /></button>
                </div>
              ))}
              {todos.length === 0 && <p className="focus-empty">Bu tur için tek bir iş seç. Küçük başla.</p>}
            </div>
          </section>
        </div>

        <footer className="focus-foot">Görevler yalnızca bu tarayıcıda saklanır.</footer>
      </section>
    </div>
  )
}
