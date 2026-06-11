import { useState } from 'react'
import Modal from './Modal'

export default function DeliveryProof({ delivery }) {
  const [open, setOpen] = useState(false)
  const proofUrl = delivery?.proof_photo || delivery?.reject_proof || ''

  if (!proofUrl) {
    return <div className="proof-view empty-proof">Bukti foto belum tersedia.</div>
  }

  return (
    <div className="proof-view">
      <div className="proof-view-head">
        <b>Bukti Foto Pengiriman</b>
        <span>{delivery.proof_uploaded_at || delivery.recorded_at || '-'}</span>
      </div>
      <button type="button" className="proof-image-link proof-preview-button" onClick={() => setOpen(true)}>
        <img src={proofUrl} alt="Bukti foto pengiriman" />
        <span>Lihat bukti foto</span>
      </button>
      {delivery.proof_note && <p>{delivery.proof_note}</p>}
      <Modal open={open} title={`Bukti Foto ${delivery.order_code || delivery.code || ''}`} size="lg" onClose={() => setOpen(false)}>
        <div className="proof-modal-content">
          <img src={proofUrl} alt="Bukti foto pengiriman" />
          <div className="detail-stack">
            <p><b>Status</b><span>{delivery.status || '-'}</span></p>
            <p><b>Kode</b><span>{delivery.order_code || delivery.code || '-'}</span></p>
            <p><b>Kurir</b><span>{delivery.courier_name || '-'}</span></p>
            <p><b>Catatan</b><span>{delivery.proof_note || '-'}</span></p>
          </div>
          <div className="modal-actions right-actions">
            <a className="soft-action" href={proofUrl} target="_blank" rel="noreferrer">Buka Foto</a>
            <button type="button" className="login-button" onClick={() => setOpen(false)}>Tutup</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
