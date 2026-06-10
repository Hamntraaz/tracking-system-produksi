import TrackingMap from '../../components/TrackingMap'
import StatusBadge from '../../components/StatusBadge'
import DeliveryProof from '../../components/DeliveryProof'

export default function AdminTracking({ data = {}, deviceLocation, locationStatus, locationError, refreshData, user }) {
  const delivery = (data.deliveries || []).find((item) => !['Pengiriman Selesai', 'Pesanan Diterima'].includes(item.status))
  return (
    <>
      <section className="page-head-card">
        <div>
          <span>Admin Gudang/Cabang</span>
          <h2>Tracking Barang Real-time</h2>
          <p>Peta membaca posisi terakhir kurir dari database. Data otomatis diperbarui dari backend API dan menampilkan bukti foto setelah pengiriman selesai.</p>
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
    </>
  )
}
