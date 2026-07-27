import { useMemo, useState } from 'react'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { supplierConfirmOrder, updateOrderStatus } from '../../services/api'

export default function SupplierOrders({ data = {}, deviceLocation, requestLocation, refreshData, user }) {
  const allOrders = Array.isArray(data.orders) ? data.orders : []
  const allCouriers = Array.isArray(data.couriers) ? data.couriers : []
  const orders = user?.supplier_id ? allOrders.filter((order) => Number(order.supplier_id) === Number(user.supplier_id)) : allOrders
  const couriers = user?.supplier_id ? allCouriers.filter((courier) => Number(courier.supplier_id) === Number(user.supplier_id) && courier.status !== 'Nonaktif') : allCouriers
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState('')
  const [selectedCourier, setSelectedCourier] = useState({})
  const [proofModal, setProofModal] = useState(null)

  const pendingOrders = useMemo(() => orders.filter((order) => !['Pesanan Diterima', 'Selesai'].includes(order.status)), [orders])

  async function rejectOrder(order) {
    setBusyId(order.id)
    setMessage('')
    try {
      await updateOrderStatus(order.id, 'Ditolak')
      setMessage(`${order.code} ditolak.`)
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal menolak pesanan.')
    } finally {
      setBusyId(null)
    }
  }

  async function confirmAvailable(order) {
    const courierId = Number(selectedCourier[order.id] || order.courier_id || 0)
    if (!courierId) {
      setMessage('Pilih kurir dulu sebelum konfirmasi barang akan dikirim.')
      return
    }
    setBusyId(order.id)
    setMessage('')
    try {
      const position = deviceLocation ? { coords: deviceLocation } : await Promise.race([
        requestLocation?.(),
        new Promise((resolve) => window.setTimeout(() => resolve(null), 2500)),
      ])
      const coords = position?.coords || deviceLocation
      await supplierConfirmOrder({
        orderId: order.id,
        courierId,
        pickupLat: coords?.latitude,
        pickupLng: coords?.longitude,
        pickupAddress: 'Lokasi real supplier dari perangkat/browser supplier',
      })
      setMessage(`Barang ${order.code} dikonfirmasi tersedia. Gudang dan kurir menerima notifikasi.`)
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal konfirmasi pesanan.')
    } finally {
      setBusyId(null)
    }
  }

  const columns = [
    { key: 'code', label: 'Kode' },
    { key: 'items_text', label: 'Item' },
    { key: 'warehouse_name', label: 'Dari Gudang', render: (row) => row.warehouse_name || 'Gudang Rafiza' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'courier_name', label: 'Kurir' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status || '-'}</StatusBadge> },
    {
      key: 'assign',
      label: 'Pilih Kurir',
      render: (row) => (
        <select className="mini-select" value={selectedCourier[row.id] || row.courier_id || ''} onChange={(event) => setSelectedCourier((prev) => ({ ...prev, [row.id]: event.target.value }))} disabled={busyId === row.id || couriers.length === 0 || ['Kurir Dalam Perjalanan', 'Pesanan Diterima'].includes(row.status)}>
          <option value="">Pilih kurir</option>
          {couriers.map((courier) => <option key={courier.id} value={courier.id}>{courier.name} — {courier.status}</option>)}
        </select>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi Supplier',
      render: (row) => (
        <div className="table-actions stacked-mobile">
          <button type="button" onClick={() => confirmAvailable(row)} disabled={busyId === row.id || ['Kurir Dalam Perjalanan', 'Pesanan Diterima'].includes(row.status)}>Barang Ada & Akan Dikirim</button>
          <button type="button" className="soft-danger" onClick={() => rejectOrder(row)} disabled={busyId === row.id || ['Kurir Dalam Perjalanan', 'Pesanan Diterima'].includes(row.status)}>Tolak</button>
        </div>
      ),
    },
  ]

  return (
    <>
      <section className="page-head-card"><div><span>Supplier</span><h2>Pesanan Masuk</h2><p>Pesanan menampilkan nama gudang pemesan, item, kurir yang ditugaskan, dan status pengiriman.</p></div></section>
      {message && <div className="api-alert">{message}</div>}
      <article className="panel-card"><ResponsiveTable columns={columns} rows={pendingOrders} /></article>

      <article className="panel-card proof-list-card">
        <div className="panel-head"><div><span>Bukti Pengiriman</span><h3>Foto dari kurir</h3></div></div>
        <div className="proof-list">
          {(data.deliveries || []).filter((delivery) => delivery.proof_photo && (!user?.supplier_id || String(delivery.supplier_id || '') === String(user.supplier_id))).map((delivery) => (
            <button type="button" className="proof-mini" key={delivery.id} onClick={() => setProofModal(delivery)}>
              <img src={delivery.proof_photo} alt={`Bukti ${delivery.order_code}`} />
              <div><b>{delivery.order_code}</b><span>{delivery.proof_uploaded_at || 'Tersimpan'} • Klik lihat</span></div>
            </button>
          ))}
          {!(data.deliveries || []).some((delivery) => delivery.proof_photo && (!user?.supplier_id || String(delivery.supplier_id || '') === String(user.supplier_id))) && <p className="muted-text">Belum ada bukti foto pengiriman.</p>}
        </div>
      </article>

      <Modal open={Boolean(proofModal)} title={`Bukti Foto ${proofModal?.order_code || ''}`} size="lg" onClose={() => setProofModal(null)}>
        {proofModal && <div className="proof-modal-content"><img src={proofModal.proof_photo} alt={`Bukti ${proofModal.order_code}`} /><div className="detail-stack"><p><b>Status</b><span>{proofModal.status}</span></p><p><b>Kurir</b><span>{proofModal.courier_name || '-'}</span></p><p><b>Catatan</b><span>{proofModal.proof_note || '-'}</span></p></div><div className="modal-actions right-actions"><a className="soft-action" href={proofModal.proof_photo} target="_blank" rel="noreferrer">Buka Foto</a><button type="button" className="login-button" onClick={() => setProofModal(null)}>Tutup</button></div></div>}
      </Modal>
    </>
  )
}
