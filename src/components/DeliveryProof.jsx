export default function DeliveryProof({ delivery }) {
  if (!delivery?.proof_photo) {
    return <div className="proof-view empty-proof">Bukti foto belum tersedia.</div>
  }

  return (
    <div className="proof-view">
      <div className="proof-view-head">
        <b>Bukti Foto Pengiriman</b>
        <span>{delivery.proof_uploaded_at || '-'}</span>
      </div>
      <a href={delivery.proof_photo} target="_blank" rel="noreferrer" className="proof-image-link">
        <img src={delivery.proof_photo} alt="Bukti foto pengiriman" />
      </a>
      {delivery.proof_note && <p>{delivery.proof_note}</p>}
    </div>
  )
}
