import { useMemo, useState } from 'react'
import Modal from '../components/Modal'
import { ChickenBadge, PartnerIcon, StockIcon, TruckIcon } from '../components/AnimatedIcons'
import { activityTimeline, couriers, purchaseOrders, stockItems, suppliers } from '../data/dummyData'

export default function DashboardPage({ user, activeMenu }) {
  const [trackingOpen, setTrackingOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)

  const stats = useMemo(() => ([
    { label: 'Bahan Baku', value: stockItems.length, trend: '+12% terdata', icon: <StockIcon /> },
    { label: 'Pesanan Aktif', value: purchaseOrders.filter((item) => item.status !== 'Selesai').length, trend: '2 perlu dipantau', icon: <TruckIcon /> },
    { label: 'Supplier Aktif', value: suppliers.length, trend: 'Mitra bahan baku', icon: <PartnerIcon /> },
    { label: 'Kurir Terdaftar', value: couriers.length, trend: 'Siap distribusi', icon: <TruckIcon /> },
  ]), [])

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="eyebrow dark">Dashboard Satu Role • Data Dummy</span>
          <h1>{activeMenu}</h1>
          <p>
            Halo, <b>{user.name}</b>. Ini adalah rancangan dashboard awal untuk operasional mitra Rafiza,
            dengan warna, logo, dan nuansa happy sesuai brand.
          </p>
        </div>
        <button type="button" className="primary-action button-reset" onClick={() => setOrderOpen(true)}>
          + Buat Pesanan Dummy
        </button>
      </header>

      <section className="ops-hero-card">
        <div>
          <span className="status-pill red">Operational Control Center</span>
          <h2>Pengadaan bahan baku dibuat lebih cepat, rapi, dan mudah dipantau.</h2>
          <p>
            Admin dapat memantau stok, supplier memproses pesanan, kurir melakukan pengiriman,
            dan manajemen melihat ringkasan performa tanpa proses manual yang tercecer.
          </p>
        </div>
        <ChickenBadge />
      </section>

      <section className="stats-grid">
        {stats.map((item) => (
          <article className="stat-card" key={item.label}>
            <div className="stat-icon-wrap">{item.icon}</div>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.trend}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel wide-panel">
          <div className="panel-title">
            <div>
              <span>Monitoring stok</span>
              <h3>Stok Bahan Baku</h3>
            </div>
            <button className="mini-button" type="button">Tambah Bahan</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Bahan</th>
                  <th>Stok</th>
                  <th>Minimum</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.stock} {item.unit}</td>
                    <td>{item.minStock} {item.unit}</td>
                    <td><span className={item.status === 'Aman' ? 'status-pill green' : 'status-pill yellow'}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel map-preview-panel">
          <div className="panel-title">
            <div>
              <span>Tracking dummy</span>
              <h3>Kurir Dalam Perjalanan</h3>
            </div>
          </div>
          <div className="fake-map-card">
            <div className="map-route" />
            <span className="map-pin supplier-pin">Supplier</span>
            <span className="map-pin courier-pin">Kurir</span>
            <span className="map-pin warehouse-pin">Gudang</span>
          </div>
          <button className="tracking-button" type="button" onClick={() => setTrackingOpen(true)}>
            Buka Popup Tracking
          </button>
        </article>
      </section>

      <section className="dashboard-grid bottom-grid">
        <article className="panel wide-panel">
          <div className="panel-title">
            <div>
              <span>Pesanan supplier</span>
              <h3>Purchase Order Bahan Baku</h3>
            </div>
            <span className="status-pill red">Demo</span>
          </div>
          <div className="order-list">
            {purchaseOrders.map((order) => (
              <div className="order-card" key={order.id}>
                <div>
                  <b>{order.id}</b>
                  <span>{order.material} • {order.qty} {order.unit}</span>
                </div>
                <div>
                  <small>{order.supplier}</small>
                  <span>{order.courier}</span>
                </div>
                <span className="status-pill yellow">{order.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-title">
            <div>
              <span>Timeline</span>
              <h3>Aktivitas Hari Ini</h3>
            </div>
          </div>
          <div className="timeline">
            {activityTimeline.map((item) => (
              <div className="timeline-item" key={`${item.time}-${item.title}`}>
                <b>{item.time}</b>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <Modal open={trackingOpen} title="Popup Tracking Pengiriman" onClose={() => setTrackingOpen(false)}>
        <div className="modal-map">
          <div className="map-route modal-route" />
          <span className="map-pin supplier-pin">Supplier</span>
          <span className="map-pin courier-pin moving-pin">Kurir</span>
          <span className="map-pin warehouse-pin">Gudang</span>
        </div>
        <div className="modal-info-grid">
          <div><span>Pesanan</span><b>PO-RFZ-001</b></div>
          <div><span>Kurir</span><b>Andi Pratama</b></div>
          <div><span>Estimasi</span><b>18 menit</b></div>
        </div>
        <p className="helper-text">
          Ini masih tracking dummy visual. Nanti saat backend siap, marker bisa diganti dari data GPS, Firebase, Socket.IO, atau API lokasi kurir.
        </p>
      </Modal>

      <Modal open={orderOpen} title="Buat Pesanan Bahan Baku" onClose={() => setOrderOpen(false)}>
        <div className="form-grid">
          <label>
            Bahan Baku
            <select defaultValue="Ayam Potong">
              <option>Ayam Potong</option>
              <option>Tepung Bumbu</option>
              <option>Minyak Goreng</option>
            </select>
          </label>
          <label>
            Jumlah
            <input defaultValue="100 Kg" />
          </label>
          <label>
            Supplier
            <select defaultValue="PT Ayam Segar Mandiri">
              <option>PT Ayam Segar Mandiri</option>
              <option>CV Sumber Minyak</option>
              <option>UD Bumbu Crispy</option>
            </select>
          </label>
        </div>
        <button className="login-button" type="button" onClick={() => setOrderOpen(false)}>Simpan Dummy</button>
      </Modal>
    </>
  )
}
