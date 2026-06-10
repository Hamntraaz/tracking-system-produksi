import TrackingMap from '../../components/TrackingMap'
import StatusBadge from '../../components/StatusBadge'
import DeliveryProof from '../../components/DeliveryProof'

export default function SupplierMonitoring({ data = {}, deviceLocation, refreshData, user }) {
  const delivery = (data.deliveries || []).find((item) => !['Pengiriman Selesai', 'Pesanan Diterima'].includes(item.status))

  return (
    <>
      <section className="page-head-card">
        <div>
          <span>Supplier</span>
          <h2>Monitoring Maps Pengiriman</h2>
          <p>Supplier dapat memantau posisi kurir setelah driver berangkat. Sebelum berangkat, peta menampilkan titik supplier dan gudang.</p>
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
    </>
  )
}
