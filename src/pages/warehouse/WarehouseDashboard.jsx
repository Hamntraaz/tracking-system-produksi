import { Icon } from '../../components/Icons'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'

export default function WarehouseDashboard({ data = {} }) {
  const summary = data.summary || {}
  const materials = Array.isArray(data.materials) ? data.materials : []
  const orders = Array.isArray(data.orders) ? data.orders : []
  const branchRequests = Array.isArray(data.branch_requests) ? data.branch_requests : []
  const lowStock = materials.filter((item) => item.status === 'Menipis')
  const pendingBranch = branchRequests.filter((item) => item.status === 'Menunggu Persetujuan Gudang')
  const activeOrders = orders.filter((item) => !['Pesanan Diterima', 'Selesai'].includes(item.status))

  return (
    <>
      <section className="role-hero"><div><span className="eyebrow light">Gudang</span><h2>Pusat stok, pengadaan bahan, dan distribusi ke cabang.</h2><p>Gudang memesan bahan ke supplier, menerima barang dari kurir, lalu memenuhi permintaan stok dari cabang.</p></div></section>
      <section className="stats-grid">
        <StatCard icon={<Icon name="stock" />} label="Item Gudang" value={summary.total_materials || materials.length} note="bahan/produk" tone="yellow" />
        <StatCard icon={<Icon name="bell" />} label="Stok Menipis" value={summary.low_stock || lowStock.length} note="butuh PO supplier" tone="orange" />
        <StatCard icon={<Icon name="order" />} label="Request Cabang" value={summary.pending_branch_requests || pendingBranch.length} note="menunggu proses" tone="blue" />
        <StatCard icon={<Icon name="courier" />} label="Pengiriman Aktif" value={summary.active_deliveries || 0} note="supplier ke gudang" tone="green" />
      </section>
      <section className="content-grid two-one">
        <article className="panel-card wide"><div className="panel-head"><div><span>Prioritas</span><h3>Permintaan Cabang Terbaru</h3></div></div><div className="compact-list">{pendingBranch.length === 0 && <p className="muted-text">Belum ada permintaan cabang yang menunggu.</p>}{pendingBranch.slice(0, 6).map((item) => <div className="list-row" key={item.id}><div><b>{item.code} · {item.branch_name}</b><span>{item.material_name} — {item.quantity} {item.unit}</span></div><StatusBadge>{item.status}</StatusBadge></div>)}</div></article>
        <article className="panel-card"><div className="panel-head"><div><span>Supplier</span><h3>PO Aktif</h3></div></div><div className="compact-list">{activeOrders.length === 0 && <p className="muted-text">Belum ada PO aktif.</p>}{activeOrders.slice(0, 5).map((item) => <div className="list-row" key={item.id}><div><b>{item.code}</b><span>{item.supplier_name} · {item.material_name}</span></div><StatusBadge>{item.status}</StatusBadge></div>)}</div></article>
      </section>
    </>
  )
}
