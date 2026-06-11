import { useMemo, useState } from 'react'
import TrackingMap from '../../components/TrackingMap'
import StatusBadge from '../../components/StatusBadge'
import DeliveryProof from '../../components/DeliveryProof'
import ResponsiveTable from '../../components/ResponsiveTable'

function isActiveDelivery(row) {
  return !['Pengiriman Selesai', 'Pesanan Diterima', 'Selesai'].includes(row?.status)
}

export default function SupplierMonitoring({ data = {}, deviceLocation, refreshData, user }) {
  const deliveries = (Array.isArray(data.deliveries) ? data.deliveries : []).filter((item) => !user?.supplier_id || String(item.supplier_id || item.supplierId || '') === String(user.supplier_id))
  const [status, setStatus] = useState('Aktif')
  const [selectedId, setSelectedId] = useState('')

  const rows = useMemo(() => deliveries.filter((row) => status === 'Semua' || (status === 'Aktif' ? isActiveDelivery(row) : row.status === status)), [deliveries, status])
  const delivery = useMemo(() => selectedId ? deliveries.find((item) => String(item.id) === String(selectedId)) || rows[0] : rows.find(isActiveDelivery) || rows[0], [deliveries, rows, selectedId])
  const statuses = useMemo(() => ['Semua', 'Aktif', ...Array.from(new Set(deliveries.map((item) => item.status).filter(Boolean)))], [deliveries])
  const columns = [
    { key: 'code', label: 'Kode Delivery' },
    { key: 'order_code', label: 'PO' },
    { key: 'courier_name', label: 'Kurir' },
    { key: 'destination_address', label: 'Tujuan' },
    { key: 'recorded_at', label: 'Update' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
    { key: 'action', label: 'Maps', render: (row) => <button type="button" className="soft-action" onClick={() => setSelectedId(String(row.id))}>Lihat</button> },
  ]

  return (
    <>
      <section className="page-head-card">
        <div>
          <span>Supplier</span>
          <h2>Monitoring Maps Pengiriman</h2>
          <p>Supplier hanya memantau pengiriman supplier ke gudang miliknya. Rute cabang tidak ditampilkan di role supplier.</p>
        </div>
        <div className="head-actions">
          {delivery && <StatusBadge>{delivery.status}</StatusBadge>}
          <button type="button" onClick={refreshData}>Refresh Data</button>
        </div>
      </section>

      <section className="content-grid two-one">
        <article className="panel-card wide">
          <TrackingMap delivery={delivery} deviceLocation={deviceLocation} showUserLocation={Boolean(deviceLocation)} viewerUser={user} />
        </article>
        <article className="panel-card">
          <div className="panel-head"><div><span>Detail Pengiriman</span><h3>{delivery?.order_code || 'Belum ada pengiriman'}</h3></div></div>
          {delivery ? (
            <>
              <div className="detail-stack">
                <p><b>Kurir</b><span>{delivery.courier_name || '-'}</span></p>
                <p><b>Status</b><span>{delivery.status || '-'}</span></p>
                <p><b>Pickup</b><span>{delivery.pickup_address || '-'}</span></p>
                <p><b>Tujuan</b><span>{delivery.destination_address || '-'}</span></p>
                <p><b>Update Terakhir</b><span>{delivery.recorded_at || '-'}</span></p>
              </div>
              <DeliveryProof delivery={delivery} />
            </>
          ) : <p className="muted-text">Belum ada pengiriman aktif.</p>}
        </article>
      </section>

      <article className="panel-card">
        <div className="filter-bar">
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
