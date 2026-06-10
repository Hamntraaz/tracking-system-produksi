import { Icon } from '../../components/Icons'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'

export default function SupplierDashboard({ data = {} }) {
  const orders = data.orders || []
  const waiting = orders.filter((order) => order.status?.toLowerCase().includes('menunggu'))
  const process = orders.filter((order) => order.status?.toLowerCase().includes('proses'))
  return (
    <>
      <section className="role-hero supplier-hero"><div><span className="eyebrow light">Supplier</span><h2>Kelola pesanan masuk dan kurir pengiriman.</h2><p>Supplier menerima PO dari admin, memproses bahan, lalu assign kurir.</p></div></section>
      <section className="stats-grid">
        <StatCard icon={<Icon name="order" />} label="Total PO" value={orders.length} note="Pesanan database" tone="red" />
        <StatCard icon={<Icon name="bell" />} label="Menunggu" value={waiting.length} note="Butuh konfirmasi" tone="yellow" />
        <StatCard icon={<Icon name="supplier" />} label="Diproses" value={process.length} note="Sedang disiapkan" tone="orange" />
        <StatCard icon={<Icon name="courier" />} label="Kurir" value={data.couriers?.length || 0} note="Data kurir" tone="blue" />
      </section>
      <article className="panel-card"><div className="panel-head"><div><span>Pesanan masuk</span><h3>Daftar PO Terbaru</h3></div></div><div className="compact-list">{orders.slice(0, 5).map((order) => <div className="list-row" key={order.id}><div><b>{order.code}</b><span>{order.items_text}</span></div><StatusBadge>{order.status}</StatusBadge></div>)}</div></article>
    </>
  )
}
