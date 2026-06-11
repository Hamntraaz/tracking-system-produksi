import { useMemo, useState } from 'react'
import TrackingMap from '../../components/TrackingMap'
import StatusBadge from '../../components/StatusBadge'
import DeliveryProof from '../../components/DeliveryProof'
import ResponsiveTable from '../../components/ResponsiveTable'

function isActiveDelivery(row) {
  return !['Pengiriman Selesai', 'Pesanan Diterima', 'Selesai'].includes(row?.status)
}

export default function WarehouseTracking({ data = {}, deviceLocation, locationStatus, locationError, refreshData, user }) {
  const deliveries = Array.isArray(data.deliveries) ? data.deliveries : []
  const [status, setStatus] = useState('Aktif')
  const [keyword, setKeyword] = useState('')
  const [selectedId, setSelectedId] = useState('')

  const rows = useMemo(() => deliveries.filter((row) => {
    const matchStatus = status === 'Semua' || (status === 'Aktif' ? isActiveDelivery(row) : row.status === status)
    const haystack = `${row.code} ${row.order_code} ${row.courier_name} ${row.pickup_address} ${row.destination_address} ${row.status}`.toLowerCase()
    const matchKeyword = !keyword || haystack.includes(keyword.toLowerCase())
    return matchStatus && matchKeyword
  }), [deliveries, status, keyword])
  const delivery = useMemo(() => selectedId ? deliveries.find((item) => String(item.id) === String(selectedId)) || rows[0] : rows.find(isActiveDelivery) || rows[0], [deliveries, rows, selectedId])
  const statuses = useMemo(() => ['Semua', 'Aktif', ...Array.from(new Set(deliveries.map((item) => item.status).filter(Boolean)))], [deliveries])
  const columns = [
    { key: 'code', label: 'Kode Delivery' },
    { key: 'order_code', label: 'PO' },
    { key: 'courier_name', label: 'Kurir' },
    { key: 'pickup_address', label: 'Supplier' },
    { key: 'recorded_at', label: 'Update' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
    { key: 'action', label: 'Maps', render: (row) => <button type="button" className="soft-action" onClick={() => setSelectedId(String(row.id))}>Pantau</button> },
  ]

  return (
    <>
      <section className="page-head-card">
        <div>
          <span>Gudang</span>
          <h2>Tracking Barang Real-time</h2>
          <p>Peta membaca posisi kurir dan rute jalan gratis. Gunakan filter untuk memilih pengiriman aktif atau riwayat pengiriman tertentu.</p>
        </div>
        <div className="head-actions">
          {delivery && <StatusBadge>{delivery.status}</StatusBadge>}
          <button type="button" onClick={refreshData}>Refresh</button>
        </div>
      </section>

      <section className="content-grid two-one">
        <article className="panel-card wide">
          <TrackingMap delivery={delivery} deviceLocation={deviceLocation} showUserLocation={Boolean(deviceLocation)} viewerUser={user} />
        </article>
        <article className="panel-card">
          <div className="panel-head">
            <div><span>Detail Pengiriman</span><h3>{delivery?.order_code || 'Belum ada delivery'}</h3></div>
          </div>
          {delivery ? (
            <>
            <div className="detail-stack">
              <p><b>Kurir</b><span>{delivery.courier_name}</span></p>
              <p><b>Status</b><span>{delivery.status}</span></p>
              <p><b>Pickup</b><span>{delivery.pickup_address}</span></p>
              <p><b>Tujuan</b><span>{delivery.destination_address}</span></p>
              <p><b>Latitude Kurir</b><span>{delivery.current_lat || '-'}</span></p>
              <p><b>Longitude Kurir</b><span>{delivery.current_lng || '-'}</span></p>
              <p><b>Update Terakhir</b><span>{delivery.recorded_at || '-'}</span></p>
              <p><b>Lokasi perangkat ini</b><span>{locationStatus}</span></p>
            </div>
            <DeliveryProof delivery={delivery} />
            </>
          ) : <p className="muted-text">Data pengiriman belum tersedia.</p>}
          {locationError && <p className="error-box">{locationError}</p>}
        </article>
      </section>

      <article className="panel-card">
        <div className="filter-bar">
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Cari delivery, PO, kurir, supplier, status..." />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            <option value="">Pilih otomatis pengiriman aktif</option>
            {rows.map((row) => <option key={row.id} value={row.id}>{row.code} - {row.courier_name}</option>)}
          </select>
        </div>
        <ResponsiveTable columns={columns} rows={rows} />
      </article>
    </>
  )
}
