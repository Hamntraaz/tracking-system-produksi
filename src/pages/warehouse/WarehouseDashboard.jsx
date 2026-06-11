import { Icon } from '../../components/Icons'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'

function ChartBar({ value, total, tone = '' }) {
  const width = total > 0 && value > 0 ? Math.max(6, Math.min(100, Math.round((value / total) * 100))) : 0
  return <div className={`bar-track ${tone}`}><i style={{ width: `${width}%` }} /></div>
}

export default function WarehouseDashboard({ data = {} }) {
  const { summary = {}, materials = [], orders = [], deliveries = [], movements = [] } = data
  const lowStocks = materials.filter((item) => item.status === 'Menipis')
  const activeDelivery = deliveries[0]
  const stockIn = summary.stock_in ?? movements.filter((m) => m.movement_type === 'IN').reduce((sum, m) => sum + Number(m.quantity || 0), 0)
  const stockOut = summary.stock_out ?? movements.filter((m) => m.movement_type === 'OUT').reduce((sum, m) => sum + Number(m.quantity || 0), 0)
  const maxMetric = Math.max(Number(stockIn || 0), Number(stockOut || 0), 0)

  return (
    <>
      <section className="role-hero admin-hero">
        <div><span className="eyebrow light">Gudang/Cabang</span><h2>Kontrol stok dan pengadaan bahan baku.</h2><p>Data di halaman ini dibaca dari database MySQL melalui backend API.</p></div>
      </section>
      <section className="stats-grid">
        <StatCard icon={<Icon name="stock" />} label="Bahan Baku" value={summary.total_materials ?? materials.length} note="Item database" tone="red" />
        <StatCard icon={<Icon name="order" />} label="Pesanan Aktif" value={summary.active_orders ?? orders.length} note="PO berjalan" tone="yellow" />
        <StatCard icon={<Icon name="map" />} label="Pengiriman" value={deliveries.length} note="Data delivery" tone="orange" />
        <StatCard icon={<Icon name="bell" />} label="Stok Menipis" value={summary.low_stock ?? lowStocks.length} note="Butuh reorder" tone="blue" />
      </section>
      <section className="stats-grid compact-charts">
        <div className="mini-chart-card"><span>Barang Masuk</span><b>{stockIn}</b><ChartBar value={Number(stockIn || 0)} total={maxMetric} /></div>
        <div className="mini-chart-card"><span>Pemakaian Produksi</span><b>{stockOut}</b><ChartBar value={Number(stockOut || 0)} total={maxMetric} tone="red" /></div>
      </section>
      <section className="content-grid two-one">
        <article className="panel-card wide">
          <div className="panel-head"><div><span>Prioritas reorder</span><h3>Stok Menipis</h3></div></div>
          <div className="compact-list">
            {lowStocks.length === 0 && <p className="muted-text">Tidak ada stok menipis.</p>}
            {lowStocks.map((item) => (
              <div className="list-row" key={item.id}><div><b>{item.name}</b><span>{item.stock} {item.unit} / minimum {item.minimum_stock} {item.unit}</span></div><StatusBadge>{item.status}</StatusBadge></div>
            ))}
          </div>
        </article>
        <article className="panel-card">
          <div className="panel-head"><div><span>Tracking terbaru</span><h3>{activeDelivery?.order_code || 'Belum ada pengiriman'}</h3></div></div>
          {activeDelivery ? (
            <div className="delivery-mini"><b>{activeDelivery.status}</b><span>{activeDelivery.pickup_address} → {activeDelivery.destination_address}</span><small>Kurir: {activeDelivery.courier_name || '-'}</small></div>
          ) : <p className="muted-text">Belum ada data delivery.</p>}
        </article>
      </section>
    </>
  )
}
