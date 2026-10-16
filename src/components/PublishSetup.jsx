import { useEffect, useState } from 'react'
import { ArrowUpRight, KeyRound, X } from 'lucide-react'
import {
  checkToken,
  forgetToken,
  getToken,
  newTokenUrl,
  saveToken,
} from '../lib/github.js'

// TEK SEFERLİK ayar: kartların herkese görünmesi için yazma anahtarı bağlanır.
// Bu bir "yayınla" düğmesi değildir; bir kez bağlanır, sonra her kart
// eklediğinde site kendi kendine yayınlar.
export default function PublishSetup({ open, onClose, onSaved }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setToken('')
      setError('')
      setBusy(false)
    }
  }, [open])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const connected = !!getToken()

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await checkToken(token)
      saveToken(token)
      onSaved()
    } catch (err) {
      setError(err.message || 'Anahtar doğrulanamadı.')
    } finally {
      setBusy(false)
    }
  }

  const disconnect = () => {
    forgetToken()
    onSaved()
  }

  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div
        className="modal modal--narrow"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>Yayın Bağlantısı</h2>
          <button className="icon-btn" onClick={onClose} title="Kapat">
            <X size={15} strokeWidth={2.3} />
          </button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <p className="modal-note">
            <strong>Tek seferlik ayar.</strong> Bağladıktan sonra her yeni kart
            eklediğinde (veya taşıdığında) site kendiliğinden yayınlanır — herkes
            görür. Gizli işaretlediğin kartların adresi yayına yazılmaz.
          </p>

          <ol className="steps">
            <li>
              <a
                className="steps-link"
                href={newTokenUrl}
                target="_blank"
                rel="noreferrer"
              >
                github.com/settings/personal-access-tokens/new
                <ArrowUpRight size={13} strokeWidth={2.2} />
              </a>{' '}
              adresini aç.
            </li>
            <li>
              <em>Token name</em>: <code>umut-portfolyo</code> — <em>Expiration</em>:{' '}
              <code>1 yıl</code>
            </li>
            <li>
              <em>Repository access</em> → <em>Only select repositories</em> →{' '}
              <code>umut</code>
            </li>
            <li>
              <em>Permissions → Repository permissions →</em>{' '}
              <strong>Contents: Read and write</strong>
            </li>
            <li>
              <em>Generate token</em> → çıkan anahtarı kopyala (<code>github_pat_…</code>)
              → aşağıya yapıştır.
            </li>
          </ol>

          <label>
            <span className="field-label field-label--icon">
              <KeyRound size={13} strokeWidth={2.2} /> Yayın anahtarı
            </span>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="github_pat_…"
              spellCheck={false}
              autoFocus
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <p className="hint-small">
            Anahtar sadece bu tarayıcıda saklanır ve sadece{' '}
            <code>{'umut'}</code> deposuna yazabilir. Kodda bulunmaz.
          </p>

          <div className="modal-actions">
            {connected && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={disconnect}
                title="Bağlantıyı kaldır"
              >
                Bağlantıyı Kaldır
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Vazgeç
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy || !token.trim()}
            >
              {busy ? 'Doğrulanıyor…' : 'Bağla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
