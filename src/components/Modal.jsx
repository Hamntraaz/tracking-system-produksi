export default function Modal({ open, title, children, onClose, size = 'md' }) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`modal-card ${size}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Tutup modal">×</button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  )
}
