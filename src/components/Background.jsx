// Animasyonlu arka plan: sade ve derin zemin + çok hafif ışımalar (iOS tarzı)
export default function Background() {
  return (
    <div className="background" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="bg-noise" />
      <div className="bg-vignette" />
    </div>
  )
}
