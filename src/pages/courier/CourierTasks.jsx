import { useState } from 'react'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import { courierTaskResponse } from '../../services/api'
import { isCloudinaryReady, uploadProofToCloudinary } from '../../services/cloudinary'

export default function CourierTasks({ data = {}, refreshData }) {
  const deliveries = Array.isArray(data.deliveries) ? data.deliveries : []
  const activeDeliveries = deliveries.filter((delivery) => !['Menunggu Konfirmasi Gudang', 'Pengiriman Selesai', 'Pesanan Diterima'].includes(delivery.status))
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState('')
  const [rejectOpenId, setRejectOpenId] = useState(null)
  const [rejectReason, setRejectReason] = useState({})
  const [rejectProof, setRejectProof] = useState({})
  const [uploadingId, setUploadingId] = useState(null)

  async function acceptTask(row) {
    setBusyId(row.id)
    setMessage('')
    try {
      await courierTaskResponse({ deliveryId: row.id, courierId: row.courier_id, action: 'accept' })
      setMessage(`${row.order_code} diterima. Silakan lanjut ke menu Maps untuk klik Driver Berangkat.`)
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal menerima tugas antar.')
    } finally {
      setBusyId(null)
    }
  }

  async function uploadRejectProof(row, file) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Ukuran bukti pendukung terlalu besar. Gunakan foto maksimal 5MB.')
      return
    }
    if (!isCloudinaryReady()) {
      setMessage('Cloudinary belum dikonfigurasi. Bukti pendukung tidak bisa diupload.')
      return
    }
    setUploadingId(row.id)
    setMessage('Mengupload bukti pendukung penolakan...')
    try {
      const uploaded = await uploadProofToCloudinary(file)
      setRejectProof((prev) => ({ ...prev, [row.id]: uploaded.url }))
      setMessage('Bukti pendukung berhasil diupload.')
    } catch (error) {
      setMessage(error.message || 'Upload bukti pendukung gagal.')
    } finally {
      setUploadingId(null)
    }
  }

  async function submitReject(row) {
    const reason = (rejectReason[row.id] || '').trim()
    if (!reason) {
      setMessage('Isi catatan alasan penolakan terlebih dahulu.')
      return
    }
    setBusyId(row.id)
    setMessage('')
    try {
      await courierTaskResponse({ deliveryId: row.id, courierId: row.courier_id, action: 'reject', reason, proof: rejectProof[row.id] || '' })
      setMessage(`${row.order_code} ditolak dan catatan sudah dikirim ke supplier, gudang, serta manajemen.`)
      setRejectOpenId(null)
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal menolak tugas antar.')
    } finally {
      setBusyId(null)
    }
  }

  const columns = [
    { key: 'order_code', label: 'Order' },
    { key: 'pickup_address', label: 'Pickup' },
    { key: 'destination_address', label: 'Tujuan' },
    { key: 'courier_name', label: 'Kurir' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row) => {
        const canRespond = row.status === 'Menunggu Persetujuan Kurir'
        return (
          <div className="table-actions task-actions">
            <button type="button" onClick={() => acceptTask(row)} disabled={!canRespond || busyId === row.id}>✓ Terima</button>
            <button type="button" className="soft-danger" onClick={() => setRejectOpenId(rejectOpenId === row.id ? null : row.id)} disabled={!canRespond || busyId === row.id}>Tolak</button>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <section className="page-head-card"><div><span>Kurir</span><h2>Tugas Pengiriman</h2><p>Supplier menugaskan pengiriman ke kurir. Terima tugas untuk melanjutkan perjalanan, atau tolak dengan catatan dan bukti pendukung.</p></div></section>
      {message && <div className="api-alert">{message}</div>}
      <article className="panel-card"><ResponsiveTable columns={columns} rows={activeDeliveries} /></article>

      {activeDeliveries.map((row) => rejectOpenId === row.id && (
        <article className="panel-card reject-task-card" key={`reject-${row.id}`}>
          <div className="panel-head"><div><span>Penolakan Tugas</span><h3>{row.order_code}</h3></div><StatusBadge>{row.status}</StatusBadge></div>
          <label>Catatan alasan penolakan</label>
          <textarea value={rejectReason[row.id] || ''} onChange={(event) => setRejectReason((prev) => ({ ...prev, [row.id]: event.target.value }))} placeholder="Contoh: kendaraan bermasalah, lokasi pickup tidak bisa dijangkau, atau jadwal bentrok." />
          <label>Bukti pendukung</label>
          <input type="file" accept="image/*" capture="environment" onChange={(event) => uploadRejectProof(row, event.target.files?.[0])} disabled={uploadingId === row.id || busyId === row.id} />
          {uploadingId === row.id && <p className="helper-box">Mengupload bukti pendukung...</p>}
          {rejectProof[row.id] && <a className="proof-link" href={rejectProof[row.id]} target="_blank" rel="noreferrer">Lihat bukti pendukung</a>}
          <div className="modal-actions right-actions">
            <button type="button" className="soft-action" onClick={() => setRejectOpenId(null)} disabled={busyId === row.id}>Batal</button>
            <button type="button" className="soft-danger filled" onClick={() => submitReject(row)} disabled={busyId === row.id || uploadingId === row.id}>{busyId === row.id ? 'Mengirim...' : 'Kirim Penolakan'}</button>
          </div>
        </article>
      ))}
    </>
  )
}
