import { Icon } from '../../components/Icons'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'

function ChartBar({ value, total, tone = '' }) {
  const width = total > 0 && value > 0 ? Math.max(6, Math.min(100, Math.round((value / total) * 100))) : 0
  return <div className={`bar-track ${tone}`}><i style={{ width: `${width}%` }} /></div>
}

export default function ManagerDashboard({ data = {} }) {
  const summary = data.summary || {}
  const stockIn = Number(summary.stock_in || 0)
  const stockOut = Number(summary.stock_out || 0)
  const waitingReceive = Number(summary.waiting_receive || 0)
  const maxMetric = Math.max(stockIn, stockOut, waitingReceive, 0)

  return (
    <>
      <section className="role-hero manager-hero"><div><span className="eyebrow light">Manajemen</span><h2>Monitoring performa operasional Rafiza.</h2><p>Manajemen melihat ringkasan stok, supplier, akun gudang/cabang, pesanan, dan pengiriman.</p></div></section>
      <section className="stats-grid">
        <StatCard icon={<Icon name="stock" />} label="Bahan Baku" value={summary.total_materials ?? 0} note="Item stok" tone="red" />
        <StatCard icon={<Icon name="supplier" />} label="Supplier" value={summary.total_suppliers ?? 0} note="Mitra aktif" tone="yellow" />
        <StatCard icon={<Icon name="dashboard" />} label="Gudang/Cabang" value={summary.total_warehouses ?? 0} note="Akun operasional" tone="orange" />
        <StatCard icon={<Icon name="bell" />} label="Risiko Stockout" value={summary.low_stock ?? 0} note="Stok menipis" tone="blue" />
      </section>
      <section className="stats-grid compact-charts">
        <div className="mini-chart-card"><span>Barang Masuk</span><b>{stockIn}</b><ChartBar value={stockIn} total={maxMetric} /></div>
        <div className="mini-chart-card"><span>Pemakaian Produksi</span><b>{stockOut}</b><ChartBar value={stockOut} total={maxMetric} tone="red" /></div>
        <div className="mini-chart-card"><span>Menunggu Terima Gudang</span><b>{waitingReceive}</b><ChartBar value={waitingReceive} total={maxMetric} tone="orange" /></div>
      </section>
      <section className="content-grid two-one"><article className="panel-card wide"><div className="panel-head"><div><span>Monitoring</span><h3>Status Pesanan</h3></div></div><div className="compact-list">{(data.orders || []).length === 0 && <p className="muted-text">Belum ada pesanan operasional.</p>}{(data.orders || []).map((order) => <div className="list-row" key={order.id}><div><b>{order.code}</b><span>{order.items_text}</span></div><StatusBadge>{order.status}</StatusBadge></div>)}</div></article><article className="panel-card"><div className="panel-head"><div><span>Ringkasan</span><h3>Kondisi Sistem</h3></div></div><div className="detail-stack"><p><b>Data</b><span>Live dari MySQL</span></p><p><b>Maps</b><span>OpenStreetMap</span></p><p><b>Pengguna</b><span>{summary.total_users ?? 0} akun sistem</span></p></div></article></section>
    </>
  )
}
