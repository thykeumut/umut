import { useEffect, useState } from 'react'
import { X, Copy, Check, ExternalLink, UploadCloud, KeyRound } from 'lucide-react'
import {
  GH,
  editUrl,
  newTokenUrl,
  siteUrl,
  publishSites,
  checkToken,
} from '../lib/github'

const TOKEN_KEY = 'umut-portfolyo:github-token:v1'

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

// Kart listesini GitHub'daki sites.json dosyasına yazar.
// Böylece "benim eklediğim kartları herkes görsün" olayı gerçekten çalışır.
export default function PublishModal({ open, onClose, sites, published, onPublished }) {
  const [token, setToken] = useState(readToken)
  const [tokenDraft, setTokenDraft] = useState(readToken)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setDone('')
    setCopied(false)
    const saved = readToken()
    setToken(saved)
    setTokenDraft(saved)
  }, [open])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const currentJson = JSON.stringify(sites)
  const publishedJson = JSON.stringify(published || [])
  const upToDate = currentJson === publishedJson
  const hasToken = !!token

  const payload = () => JSON.stringify({ sites }, null, 2)

  const saveToken = async () => {
    const value = tokenDraft.trim()
    if (!value) {
      setToken('')
      try {
        localStorage.removeItem(TOKEN_KEY)
      } catch {
        /* yoksay */
      }
      setDone('Anahtar silindi.')
      return
    }
    setBusy(true)
    setError('')
    setDone('')
    try {
      await checkToken(value)
      setToken(value)
      try {
        localStorage.setItem(TOKEN_KEY, value)
      } catch {
        /* yoksay */
      }
      setDone('Anahtar kaydedildi. Artık tek tıkla yayınlayabilirsin.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const publish = async () => {
    setBusy(true)
    setError('')
    setDone('')
    try {
      await publishSites(token, sites)
      onPublished?.()
      setDone('Yayınlandı! 30 saniye içinde sitede görünür.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(payload())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Panoya kopyalanamadı. Elle seçip kopyalayabilirsin.')
    }
  }

  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div className="modal" onPointerDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Yayına Al</h2>
          <button className="icon-btn" onClick={onClose} title="Kapat">
            <X size={15} strokeWidth={2.3} />
          </button>
        </div>

        <div className="modal-form">
          <p className="modal-note">
            Sende <strong>{sites.length}</strong> kart var, sitede yayında{' '}
            <strong>{(published || []).length}</strong> kart görünüyor.
            {upToDate
              ? ' Her şey güncel.'
              : ' Yayınlanmamış değişiklikler var.'}
          </p>

          <p className="modal-note modal-note--soft">
            Kartların herkes tarafından görülmesi için bu listeyi GitHub'daki{' '}
            <code>{GH.path}</code> dosyasına yazman gerekir.
          </p>

          <div className="field">
            <span className="field-label">
              <KeyRound size={13} strokeWidth={2.2} /> GitHub anahtarı (tek tık
              için)
            </span>
            <input
              type="password"
              value={tokenDraft}
              onChange={(e) => setTokenDraft(e.target.value)}
              placeholder="github_pat_..."
              spellCheck={false}
            />
            <div className="publish-row">
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={saveToken}
                disabled={busy}
              >
                {hasToken ? 'Anahtarı Güncelle' : 'Anahtarı Kaydet'}
              </button>
              <a
                className="link-small"
                href={newTokenUrl}
                target="_blank"
                rel="noreferrer"
              >
                Anahtar oluştur <ExternalLink size={12} strokeWidth={2.2} />
              </a>
            </div>
            <p className="hint-small">
              Sadece bu tarayıcıda saklanır. Anahtar oluştururken{' '}
              <strong>Repository access → umut</strong> ve{' '}
              <strong>Permissions → Contents → Read and write</strong> seç.
            </p>
          </div>

          {error && <p className="form-error">{error}</p>}
          {done && <p className="form-ok">{done}</p>}

          <div className="modal-actions modal-actions--stack">
            <button
              type="button"
              className="btn btn-primary"
              onClick={publish}
              disabled={busy || !hasToken}
              title={hasToken ? '' : 'Önce GitHub anahtarını kaydet'}
            >
              <UploadCloud size={15} strokeWidth={2.1} />
              {busy ? 'Yayınlanıyor...' : 'Yayına Al'}
            </button>

            <div className="publish-row">
              <button
                type="button"
                className="btn btn-ghost btn-small"
                onClick={copyJson}
              >
                {copied ? (
                  <>
                    <Check size={13} strokeWidth={2.4} /> Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy size={13} strokeWidth={2.1} /> JSON'u Kopyala
                  </>
                )}
              </button>
              <a
                className="btn btn-ghost btn-small"
                href={editUrl}
                target="_blank"
                rel="noreferrer"
              >
                GitHub'da Aç <ExternalLink size={12} strokeWidth={2.2} />
              </a>
            </div>
          </div>

          <p className="hint-small">
            Elle yol: <strong>JSON'u Kopyala</strong> → <strong>GitHub'da Aç</strong> →
            içeriği yapıştır → <strong>Commit changes</strong>. Yarım dakika sonra{' '}
            <a href={siteUrl} target="_blank" rel="noreferrer">
              {siteUrl}
            </a>{' '}
            adresinde görünür.
          </p>
        </div>
      </div>
    </div>
  )
}
