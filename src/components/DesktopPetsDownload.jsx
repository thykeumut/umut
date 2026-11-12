import { Download, MonitorDown, PawPrint, ShieldCheck } from 'lucide-react'

const DOWNLOAD_URL = `${import.meta.env.BASE_URL}downloads/Thyke-Son.exe`

export default function DesktopPetsDownload() {
  return (
    <section className="desktop-pets" aria-labelledby="desktop-pets-title">
      <div className="desktop-pets-orbit desktop-pets-orbit--one" aria-hidden="true" />
      <div className="desktop-pets-orbit desktop-pets-orbit--two" aria-hidden="true" />

      <div className="desktop-pets-copy">
        <span className="desktop-pets-kicker"><PawPrint size={13} strokeWidth={2.2} /> THYKE / MASAÜSTÜ HAYVANLARI</span>
        <h2 id="desktop-pets-title">Masaüstüne küçük bir <em>karakter</em> getir.</h2>
        <p>Thyke Son, Windows masaüstünde sana eşlik eden küçük bir masaüstü hayvanı deneyimi.</p>
        <div className="desktop-pets-meta" aria-label="İndirme bilgileri">
          <span><MonitorDown size={14} /> Windows</span>
          <span>80,7 MB</span>
          <span>Sürüm 1.0</span>
        </div>
      </div>

      <div className="desktop-pets-card">
        <div className="desktop-pets-art" aria-hidden="true">
          <div className="desktop-pets-window"><i /><i /><i /></div>
          <div className="desktop-pets-pet"><span>•</span><span>•</span><b>⌣</b></div>
          <div className="desktop-pets-shadow" />
        </div>
        <div className="desktop-pets-card-copy">
          <strong>Thyke Son.exe</strong>
          <span>Windows uygulaması · 80,7 MB</span>
        </div>
        <a className="btn btn-primary desktop-pets-download" href={DOWNLOAD_URL} download="Thyke-Son.exe">
          <Download size={16} strokeWidth={2.3} /> Windows için indir
        </a>
        <small><ShieldCheck size={12} /> Doğrudan thyke.me üzerinden indirilir.</small>
      </div>
    </section>
  )
}
