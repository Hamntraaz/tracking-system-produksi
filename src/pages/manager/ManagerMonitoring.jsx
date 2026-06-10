import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import TrackingMap from '../../components/TrackingMap'
import DeliveryProof from '../../components/DeliveryProof'

export default function ManagerMonitoring({ data = {}, deviceLocation, refreshData, user }) {
  const delivery = data.deliveries?.[0]
  const columns = [
    { key: 'code', label: 'Kode PO' },
    { key: 'items_text', label: 'Item' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'courier_name', label: 'Kurir' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
  ]
  return (
    <>
      <section className="page-head-card">
        <div><span>Manajemen</span><h2>Monitoring Operasional Real-time</h2><p>Memantau pesanan dan posisi pengiriman bahan baku yang sedang berjalan.</p></div>
        <button type="button" onClick={refreshData}>Refresh Data</button>
      </section>
      <section className="content-grid two-one">
        <article className="panel-card wide"><TrackingMap delivery={delivery} deviceLocation={deviceLocation} showUserLocation={Boolean(deviceLocation)} viewerUser={user} /></article>
        <article className="panel-card"><div className="panel-head"><div><span>Ringkasan Live</span><h3>{delivery?.order_code || 'Belum ada pengiriman'}</h3></div></div>{delivery ? <div className="detail-stack"><p><b>Kurir</b><span>{delivery.courier_name}</span></p><p><b>Status</b><span>{delivery.status}</span></p><p><b>Update Terakhir</b><span>{delivery.recorded_at || '-'}</span></p><p><b>Dari</b><span>{delivery.pickup_address}</span></p><p><b>Ke</b><span>{delivery.destination_address}</span></p></div> : <p className="muted-text">Belum ada pengiriman aktif.</p>} {delivery && <DeliveryProof delivery={delivery} />}</article>
      </section>
      <article className="panel-card"><ResponsiveTable columns={columns} rows={data.orders || []} /></article>
    </>
  )
}
