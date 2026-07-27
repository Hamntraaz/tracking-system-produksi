import { Icon } from '../../components/Icons'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'

const activeStatuses = ['Menunggu Persetujuan Kurir', 'Tugas Diterima Kurir', 'Menunggu Driver Berangkat', 'Kurir Berangkat', 'Driver Sampai']
const finishedStatuses = ['Pengiriman Selesai', 'Pesanan Diterima', 'Diterima Cabang']

function courierTasks(data = {}, user = {}) {
  const courierId = user?.courier_id ? String(user.courier_id) : ''
  const supplierTasks = (Array.isArray(data.deliveries) ? data.deliveries : [])
    .filter((item) => !courierId || String(item.courier_id || '') === courierId)
    .map((item) => ({ ...item, task_type: 'supplier', display_code: item.order_code || item.code, route_text: `${item.supplier_name || item.pickup_address || 'Supplier'} → ${item.warehouse_name || item.destination_address || 'Gudang'}` }))
  const warehouseTasks = (Array.isArray(data.branch_requests) ? data.branch_requests : [])
    .filter((item) => item.courier_id && (!courierId || String(item.courier_id || '') === courierId))
    .map((item) => ({ ...item, task_type: 'warehouse', display_code: item.code, route_text: `${item.warehouse_name || 'Gudang'} → ${item.branch_name || 'Cabang'}` }))
  return [...supplierTasks, ...warehouseTasks]
}

export default function CourierDashboard({ data = {}, user }) {
  const tasks = courierTasks(data, user)
  const activeDeliveries = tasks.filter((item) => activeStatuses.includes(item.status))
  const finishedDeliveries = tasks.filter((item) => finishedStatuses.includes(item.status))
  const rejectedDeliveries = tasks.filter((item) => ['Ditolak Kurir', 'Ditolak Gudang'].includes(item.status))
  const courierType = user?.courier_type === 'warehouse' ? 'Kurir Gudang' : user?.courier_type === 'supplier' ? 'Kurir Supplier' : 'Kurir'

  return (
    <>
      <section className="role-hero courier-hero"><div><span className="eyebrow light">{courierType}</span><h2>Tugas pengiriman milik akun ini.</h2><p>Data tugas difilter berdasarkan akun kurir yang login, sehingga kurir supplier dan kurir gudang tidak tercampur.</p></div></section>
      <section className="stats-grid">
        <StatCard icon={<Icon name="courier" />} label="Tugas Aktif" value={activeDeliveries.length} note="Belum final" tone="red" />
        <StatCard icon={<Icon name="check" />} label="Pengiriman Selesai" value={finishedDeliveries.length} note="Milik akun ini" tone="green" />
        <StatCard icon={<Icon name="bell" />} label="Ditolak" value={rejectedDeliveries.length} note="Dengan catatan" tone="orange" />
        <StatCard icon={<Icon name="map" />} label="Tipe Kurir" value={user?.courier_type === 'warehouse' ? 'Gudang' : user?.courier_type === 'supplier' ? 'Supplier' : '-'} note="Scope tracking" tone="blue" />
      </section>
      <article className="panel-card">
        <div className="panel-head"><div><span>Tugas</span><h3>Pengiriman Aktif</h3></div></div>
        <div className="compact-list">
          {activeDeliveries.length === 0 && <p className="muted-text">Belum ada tugas pengiriman aktif untuk akun ini.</p>}
          {activeDeliveries.map((delivery) => <div className="list-row" key={`${delivery.task_type}-${delivery.id}`}><div><b>{delivery.display_code}</b><span>{delivery.route_text}</span></div><StatusBadge>{delivery.status}</StatusBadge></div>)}
        </div>
      </article>
    </>
  )
}
