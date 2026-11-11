import { LogIn, UserRound } from 'lucide-react'

export default function VisitorGate({ onEmail, onGuest }) {
  return (
    <div className="visitor-gate" role="dialog" aria-modal="true" aria-label="Portföye giriş">
      <section className="visitor-gate-card">
        <span>THYKE / HOŞ GELDİN</span>
        <h1>Devam etmek için<br /><em>bir yol seç.</em></h1>
        <p>Portföyü e-postanı doğrulayarak veya misafir olarak keşfedebilirsin.</p>
        <div className="visitor-gate-actions">
          <button className="btn btn-primary" type="button" onClick={onEmail}>
            <LogIn size={16} /> E-postayla giriş
          </button>
          <button className="btn btn-ghost" type="button" onClick={onGuest}>
            <UserRound size={16} /> Misafir olarak devam et
          </button>
        </div>
        <small>E-posta yalnızca doğrulama ve ziyaretçi kaydı için kullanılır.</small>
      </section>
    </div>
  )
}
