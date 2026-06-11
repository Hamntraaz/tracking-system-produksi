import { useMemo, useState } from 'react'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import TrackingMap from '../../components/TrackingMap'
import DeliveryProof from '../../components/DeliveryProof'

function isActiveDelivery(row) {
  return !['Pengiriman Selesai', 'Pesanan Diterima', 'Selesai'].includes(row?.status)
}

export default function ManagerMonitoring({ data = {}, deviceLocation, refreshData, user }) {
  const deliveries = Array.isArray(data.deliveries) ? data.deliveries : []
  const [status, setStatus] = useState('Aktif')
  const [keyword, setKeyword] = useState('')
  const [selectedId, setSelectedId] = useState('')

  const filteredDeliveries = useMemo(() => deliveries.filter((row) => {
    const matchStatus = status === 'Semua' || (status === 'Aktif' ? isActiveDelivery(row) : row.status === status)
    const haystack = `${row.code} ${row.order_code} ${row.courier_name} ${row.pickup_address} ${row.destination_address} ${row.status}`.toLowerCase()
    const matchKeyword = !keyword || haystack.includes(keyword.toLowerCase())
    return matchStatus && matchKeyword
  }), [deliveries, status, keyword])

  const delivery = useMemo(() => {
    if (selectedId) return deliveries.find((item) => String(item.id) === String(selectedId)) || filteredDeliveries[0]
    return filteredDeliveries.find(isActiveDelivery) || filteredDeliveries[0] || deliveries[0]
  }, [deliveries, filteredDeliveries, selectedId])

  const statuses = useMemo(() => ['Semua', 'Aktif', ...Array.from(new Set(deliveries.map((item) => item.status).filter(Boolean)))], [deliveries])

  const columns = [
    { key: 'code', label: 'Kode Delivery' },
    { key: 'order_code', label: 'Kode PO' },
    { key: 'courier_name', label: 'Kurir' },
    { key: 'pickup_address', label: 'Dari' },
    { key: 'destination_address', label: 'Ke' },
    { key: 'recorded_at', label: 'Update' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
    { key: 'action', label: 'Maps', render: (row) => <button type="button" className="soft-action" onClick={() => setSelectedId(String(row.id))}>Pantau</button> },
  ]

  return (
    <>
      <section className="page-head-card">
        <div><span>Manajemen</span><h2>Monitoring Operasional Real-time</h2><p>Memantau pengiriman supplier ke gudang, lokasi live kurir, serta rute jalan gratis berbasis OSRM.</p></div>
        <div className="head-actions">
          {delivery && <StatusBadge>{delivery.status}</StatusBadge>}
          <button type="button" onClick={refreshData}>Refresh Data</button>
        </div>
      </section>

      <section className="content-grid two-one">
        <article className="panel-card wide"><TrackingMap delivery={delivery} deviceLocation={deviceLocation} showUserLocation={Boolean(deviceLocation)} viewerUser={user} /></article>
        <article className="panel-card"><div className="panel-head"><div><span>Ringkasan Live</span><h3>{delivery?.order_code || 'Belum ada pengiriman'}</h3></div></div>{delivery ? <div className="detail-stack"><p><b>Kurir</b><span>{delivery.courier_name}</span></p><p><b>Status</b><span>{delivery.status}</span></p><p><b>Update Terakhir</b><span>{delivery.recorded_at || '-'}</span></p><p><b>Dari</b><span>{delivery.pickup_address}</span></p><p><b>Ke</b><span>{delivery.destination_address}</span></p></div> : <p className="muted-text">Belum ada pengiriman aktif.</p>} {delivery && <DeliveryProof delivery={delivery} />}</article>
      </section>

      <article className="panel-card">
        <div className="filter-bar">
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Cari delivery, PO, kurir, lokasi, status..." />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            <option value="">Pilih otomatis pengiriman aktif</option>
            {filteredDeliveries.map((row) => <option key={row.id} value={row.id}>{row.code} - {row.courier_name}</option>)}
          </select>
        </div>
        <ResponsiveTable columns={columns} rows={filteredDeliveries} />
      </article>
    </>
  )
}
