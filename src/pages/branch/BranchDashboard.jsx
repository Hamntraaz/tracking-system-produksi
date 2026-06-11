import { Icon } from '../../components/Icons'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'

function ownBranchId(user) { return user?.branch_id || null }
function belongs(row, user) { return !ownBranchId(user) || String(row.branch_id || '') === String(ownBranchId(user)) }

export default function BranchDashboard({ data = {}, user }) {
  const branchStocks = (Array.isArray(data.branch_stocks) ? data.branch_stocks : []).filter((row) => belongs(row, user))
  const requests = (Array.isArray(data.branch_requests) ? data.branch_requests : []).filter((row) => belongs(row, user))
  const sales = (Array.isArray(data.branch_sales) ? data.branch_sales : []).filter((row) => belongs(row, user))
  const lowStock = branchStocks.filter((item) => item.status !== 'Aman')
  const pending = requests.filter((item) => !['Diterima Cabang', 'Ditolak Gudang'].includes(item.status))
  return (
    <>
      <section className="role-hero supplier-hero"><div><span className="eyebrow light">Cabang</span><h2>Cabang fokus request stok ke gudang dan mencatat penjualan.</h2><p>Cabang tidak memesan langsung ke supplier. Cabang meminta barang ke gudang, menerima stok, lalu mencatat penjualan agar laporan manajemen real-time.</p></div></section>
      <section className="stats-grid">
        <StatCard icon={<Icon name="stock" />} label="Item Stok Cabang" value={branchStocks.length} note="stok lokal" tone="yellow" />
        <StatCard icon={<Icon name="bell" />} label="Stok Menipis" value={lowStock.length} note="perlu request" tone="orange" />
        <StatCard icon={<Icon name="order" />} label="Request Aktif" value={pending.length} note="ke gudang" tone="blue" />
        <StatCard icon={<Icon name="report" />} label="Catatan Penjualan" value={sales.length} note="riwayat sales" tone="green" />
      </section>
      <section className="content-grid two-one"><article className="panel-card wide"><div className="panel-head"><div><span>Status</span><h3>Request Terbaru ke Gudang</h3></div></div><div className="compact-list">{requests.slice(0, 6).map((item) => <div className="list-row" key={item.id}><div><b>{item.code}</b><span>{item.material_name} — {item.quantity} {item.unit}</span></div><StatusBadge>{item.status}</StatusBadge></div>)}{requests.length === 0 && <p className="muted-text">Belum ada request stok ke gudang.</p>}</div></article><article className="panel-card"><div className="panel-head"><div><span>Stok</span><h3>Stok Cabang Menipis</h3></div></div><div className="compact-list">{lowStock.slice(0, 6).map((item) => <div className="list-row" key={item.id}><div><b>{item.material_name}</b><span>{item.stock} {item.unit}</span></div><StatusBadge>{item.status}</StatusBadge></div>)}{lowStock.length === 0 && <p className="muted-text">Stok cabang masih aman.</p>}</div></article></section>
    </>
  )
}
