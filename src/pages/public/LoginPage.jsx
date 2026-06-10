import { useMemo, useState } from 'react'
import logo from '../../assets/rafiza-logo.jpg'
import menuImage from '../../assets/rafiza-menu.jpg'
import { BrandChicken, Icon } from '../../components/Icons'
import Modal from '../../components/Modal'
import { menuCatalog, users } from '../../data/dummyData'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState(users[0].email)
  const [password, setPassword] = useState('12345678')
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const selectedUser = useMemo(() => users.find((user) => user.email === email), [email])

  function submitHandler(event) {
    event.preventDefault()
    const found = users.find((user) => user.email === email && user.password === password)
    if (!found) {
      setError('Email atau password tidak sesuai.')
      return
    }
    setError('')
    onLogin(found)
  }

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <div className="nav-brand">
          <img src={logo} alt="Logo Rafiza" />
          <div>
            <strong>Rafiza Fried Chicken</strong>
            <span>Operational Partner System</span>
          </div>
        </div>
        <button type="button" className="nav-button" onClick={() => document.getElementById('login-panel')?.scrollIntoView({ behavior: 'smooth' })}>
          Login Demo
        </button>
      </nav>

      <section className="landing-hero professional">
        <div className="hero-copy">
          <span className="eyebrow">Sistem Operasional Mitra</span>
          <h1>Bukan online order, tapi pusat kendali bahan baku Rafiza.</h1>
          <p>
            Prototype ini dirancang untuk membantu calon mitra dan tim operasional memahami alur pengadaan bahan baku:
            stok dipantau, supplier memproses pesanan, kurir mengirim barang, dan manajemen melihat performa.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-action" onClick={() => document.getElementById('login-panel')?.scrollIntoView({ behavior: 'smooth' })}>
              Masuk Dashboard
            </button>
            <button type="button" className="secondary-action" onClick={() => setModalOpen(true)}>
              Lihat Alur Sistem
            </button>
          </div>
          <div className="trust-row">
            <div><Icon name="stock" /> Stok bahan baku</div>
            <div><Icon name="supplier" /> Supplier mitra</div>
            <div><Icon name="map" /> Tracking pengiriman</div>
          </div>
        </div>

        <div className="hero-visual clean">
          <BrandChicken />
          <div className="float-card card-a">
            <b>PO-RFZ-001</b>
            <span>Ayam Potong • Dalam Perjalanan</span>
          </div>
          <div className="float-card card-b">
            <b>Stock Alert</b>
            <span>Ayam Potong di bawah minimum</span>
          </div>
        </div>
      </section>

      <section className="partner-section">
        <div className="section-heading left">
          <span>Untuk presentasi mitra</span>
          <h2>Home dibuat sebagai landing operasional, bukan halaman jual beli makanan.</h2>
          <p>
            Menu Rafiza tetap ditampilkan sebagai referensi kebutuhan bahan baku. Fokus sistemnya adalah pengadaan,
            distribusi, dan monitoring operasional.
          </p>
        </div>
        <div className="partner-grid">
          <article>
            <Icon name="dashboard" />
            <h3>Admin Gudang</h3>
            <p>Cek stok, buat purchase order, dan konfirmasi barang diterima.</p>
          </article>
          <article>
            <Icon name="supplier" />
            <h3>Supplier</h3>
            <p>Terima pesanan, proses bahan baku, dan assign kurir pengiriman.</p>
          </article>
          <article>
            <Icon name="courier" />
            <h3>Kurir</h3>
            <p>Melihat tugas antar, update status, dan simulasi lokasi pengiriman.</p>
          </article>
          <article>
            <Icon name="chart" />
            <h3>Manajemen</h3>
            <p>Monitoring performa stok, supplier, pengiriman, dan laporan.</p>
          </article>
        </div>
      </section>

      <section className="menu-showcase">
        <div className="section-heading">
          <span>Menu sebagai acuan bahan baku</span>
          <h2>Daftar menu Rafiza membantu sistem membaca kebutuhan operasional.</h2>
        </div>
        <div className="menu-showcase-grid">
          <div className="menu-image-card"><img src={menuImage} alt="Menu Rafiza Fried Chicken" /></div>
          <div className="menu-data-card">
            {menuCatalog.map((item) => (
              <div className="menu-item-row" key={item.name}>
                <div>
                  <b>{item.name}</b>
                  <span>{item.category} • {item.bahanUtama}</span>
                </div>
                <strong>{item.price}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="login-panel" className="login-area">
        <form className="login-panel" onSubmit={submitHandler}>
          <div className="login-title">
            <img src={logo} alt="Rafiza" />
            <div>
              <span>Demo login</span>
              <h2>Masuk sesuai role</h2>
              <p>Setiap akun akan masuk ke halaman dan menu yang berbeda.</p>
            </div>
          </div>

          <label>Pilih akun role</label>
          <select value={email} onChange={(event) => setEmail(event.target.value)}>
            {users.map((user) => (
              <option key={user.email} value={user.email}>{user.roleName} — {user.email}</option>
            ))}
          </select>

          <label>Password</label>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />

          {selectedUser && <p className="helper-box">{selectedUser.description}</p>}
          {error && <p className="error-box">{error}</p>}

          <button type="submit" className="login-button">Masuk Dashboard {selectedUser?.roleName}</button>
          <small>Password semua akun: <b>12345678</b></small>
        </form>
      </section>

      <Modal open={modalOpen} title="Alur Singkat Sistem" onClose={() => setModalOpen(false)} width="large">
        <div className="flow-steps">
          <div><b>1</b><span>Admin cek stok dan membuat pesanan bahan baku.</span></div>
          <div><b>2</b><span>Supplier menerima pesanan dan menugaskan kurir.</span></div>
          <div><b>3</b><span>Kurir mengirim barang dan update status pengiriman.</span></div>
          <div><b>4</b><span>Manajemen memantau dashboard, laporan, dan risiko stok.</span></div>
        </div>
      </Modal>
    </main>
  )
}
