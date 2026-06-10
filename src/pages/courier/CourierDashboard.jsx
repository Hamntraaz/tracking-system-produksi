import { Icon } from '../../components/Icons'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'

const activeStatuses = ['Menunggu Persetujuan Kurir', 'Menunggu Driver Berangkat', 'Kurir Dalam Perjalanan', 'Driver Sampai']
const finishedStatuses = ['Menunggu Konfirmasi Gudang', 'Pengiriman Selesai', 'Pesanan Diterima']

export default function CourierDashboard({ data = {} }) {
  const deliveries = Array.isArray(data.deliveries) ? data.deliveries : []
  const activeDeliveries = deliveries.filter((item) => activeStatuses.includes(item.status))
  const finishedDeliveries = deliveries.filter((item) => finishedStatuses.includes(item.status))
  const rejectedDeliveries = deliveries.filter((item) => item.status === 'Ditolak Kurir')

  return (
    <>
      <section className="role-hero courier-hero"><div><span className="eyebrow light">Kurir</span><h2>Tugas pengiriman bahan baku.</h2><p>Jumlah tugas aktif dan selesai dihitung dari status pengiriman database.</p></div></section>
      <section className="stats-grid">
        <StatCard icon={<Icon name="courier" />} label="Tugas Aktif" value={activeDeliveries.length} note="Belum final" tone="red" />
        <StatCard icon={<Icon name="check" />} label="Pengiriman Selesai" value={finishedDeliveries.length} note="Sudah selesai" tone="green" />
        <StatCard icon={<Icon name="bell" />} label="Ditolak" value={rejectedDeliveries.length} note="Dengan catatan" tone="orange" />
        <StatCard icon={<Icon name="map" />} label="Tracking" value="Live" note="Aktif saat berangkat" tone="blue" />
      </section>
      <article className="panel-card">
        <div className="panel-head"><div><span>Tugas</span><h3>Pengiriman Aktif</h3></div></div>
        <div className="compact-list">
          {activeDeliveries.length === 0 && <p className="muted-text">Belum ada tugas pengiriman aktif.</p>}
          {activeDeliveries.map((delivery) => <div className="list-row" key={delivery.id}><div><b>{delivery.order_code}</b><span>{delivery.pickup_address} → {delivery.destination_address}</span></div><StatusBadge>{delivery.status}</StatusBadge></div>)}
        </div>
      </article>
    </>
  )
}
