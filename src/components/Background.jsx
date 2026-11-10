// Dikkati projelerden çalmayan, tek renkli arka plan.
export default function Background() {
  return (
    <div className="background" aria-hidden="true">
      <span className="bg-grid" />
      <span className="bg-aurora" />
    </div>
  )
}
