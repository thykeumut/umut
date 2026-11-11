import { ArrowUpRight, Code2, FilePenLine } from 'lucide-react'

export default function ContactSection({ onBrief }) {
  return (
    <section className="contact-section" aria-labelledby="contact-title">
      <div className="contact-copy">
        <span className="contact-kicker">THYKE / BİRLİKTE ÇALIŞALIM</span>
        <h2 id="contact-title">Bir fikrin varsa,<br /><span>konuşalım.</span></h2>
        <p>İyi fikirler, net bir başlangıçla daha hızlı şekil alır.</p>
      </div>

      <div className="contact-card">
        <p className="contact-lead">Web deneyimi, küçük araç veya oyun fikri… Kısa bir brief hazırla; ihtiyacı birlikte netleştirelim.</p>
        <div className="contact-topics" aria-label="Çalışma alanları">
          <span>Web ürünleri</span>
          <span>Oyunlar</span>
          <span>Deneysel işler</span>
        </div>
        <div className="contact-actions">
          <a className="btn btn-primary" href="https://github.com/thykeumut" target="_blank" rel="noreferrer noopener">
            <Code2 size={15} strokeWidth={2.1} /> GitHub <ArrowUpRight size={14} strokeWidth={2.2} />
          </a>
          <button className="btn btn-ghost" type="button" onClick={onBrief}>
            <FilePenLine size={15} strokeWidth={2.1} /> Brief oluştur
          </button>
        </div>
      </div>
    </section>
  )
}
