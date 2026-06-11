import { Icon } from '../../components/Icons'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'

export default function ManagerDashboard({ data = {} }) {
  const summary = data.summary || {}
  const orders = Array.isArray(data.orders) ? data.orders : []
  const branchRequests = Array.isArray(data.branch_requests) ? data.branch_requests : []
  const branchSales = Array.isArray(data.branch_sales) ? data.branch_sales : []
  const pendingBranch = branchRequests.filter((item) => item.status === 'Menunggu Persetujuan Gudang')
  return (
    <>
      <section className="role-hero manager-hero"><div><span className="eyebrow light">Manajemen</span><h2>Monitoring alur Supplier → Gudang → Cabang → Penjualan.</h2><p>Manager memantau akun, stok gudang, request cabang, pengiriman supplier, dan penjualan cabang secara real-time.</p></div></section>
      <section className="stats-grid">
        <StatCard icon={<Icon name="supplier" />} label="Supplier" value={summary.total_suppliers ?? 0} note="mitra bahan baku" tone="yellow" />
        <StatCard icon={<Icon name="stock" />} label="Gudang" value={summary.total_warehouses ?? 0} note="pusat stok" tone="blue" />
        <StatCard icon={<Icon name="partner" />} label="Cabang" value={summary.total_branches ?? 0} note="area penjualan" tone="green" />
        <StatCard icon={<Icon name="bell" />} label="Request Cabang" value={summary.pending_branch_requests ?? pendingBranch.length} note="menunggu gudang" tone="orange" />
      </section>
      <section className="stats-grid">
        <StatCard icon={<Icon name="order" />} label="PO Supplier" value={summary.total_orders ?? orders.length} note="gudang ke supplier" tone="red" />
        <StatCard icon={<Icon name="courier" />} label="Pengiriman Aktif" value={summary.active_deliveries ?? 0} note="supplier ke gudang" tone="blue" />
        <StatCard icon={<Icon name="report" />} label="Penjualan Cabang" value={summary.branch_sales ?? branchSales.length} note="catatan transaksi" tone="green" />
        <StatCard icon={<Icon name="bell" />} label="Risiko Stok" value={(summary.low_stock ?? 0) + (summary.branch_low_stock ?? 0)} note="gudang/cabang" tone="orange" />
      </section>
      <section className="content-grid two-one"><article className="panel-card wide"><div className="panel-head"><div><span>Cabang</span><h3>Request Barang Terbaru</h3></div></div><div className="compact-list">{branchRequests.slice(0, 7).map((item) => <div className="list-row" key={item.id}><div><b>{item.code} · {item.branch_name}</b><span>{item.material_name} — {item.quantity} {item.unit}</span></div><StatusBadge>{item.status}</StatusBadge></div>)}{branchRequests.length === 0 && <p className="muted-text">Belum ada request cabang.</p>}</div></article><article className="panel-card"><div className="panel-head"><div><span>Supplier</span><h3>PO Terbaru</h3></div></div><div className="compact-list">{orders.slice(0, 6).map((order) => <div className="list-row" key={order.id}><div><b>{order.code}</b><span>{order.supplier_name} · {order.items_text}</span></div><StatusBadge>{order.status}</StatusBadge></div>)}{orders.length === 0 && <p className="muted-text">Belum ada PO supplier.</p>}</div></article></section>
    </>
  )
}
