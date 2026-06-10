import { useState } from 'react'
import logo from '../assets/rafiza-logo.jpg'
import menuImage from '../assets/rafiza-menu.jpg'
import { dummyUsers, menuItems } from '../data/dummyData'
import { ChickenBadge, PartnerIcon, StockIcon, TruckIcon } from '../components/AnimatedIcons'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@gmail.com')
  const [password, setPassword] = useState('12345678')
  const [error, setError] = useState('')

  const selectedUser = dummyUsers.find((item) => item.email === email)

  function handleSubmit(event) {
    event.preventDefault()
    const user = dummyUsers.find((item) => item.email === email && item.password === password)

    if (!user) {
      setError('Email atau password dummy belum sesuai.')
      return
    }

    setError('')
    onLogin(user)
  }

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="nav-brand">
          <img src={logo} alt="Rafiza Fried Chicken" />
          <div>
            <b>Rafiza Fried Chicken</b>
            <span>Operational Partner System</span>
          </div>
        </div>
        <a href="#login" className="nav-cta">Masuk Demo</a>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">Juara Ayam Krispy • Sistem Mitra Operasional</span>
          <h1>Kelola stok, supplier, kurir, dan pengiriman mitra dalam satu dashboard.</h1>
          <p>
            Website ini bukan untuk order online customer. Fokusnya adalah sistem operasional internal
            untuk membantu mitra Rafiza memantau bahan baku, pesanan supplier, dan pengiriman secara rapi.
          </p>

          <div className="hero-actions">
            <a href="#login" className="primary-action">Coba Dashboard</a>
            <a href="#menu" className="secondary-action">Lihat Menu Mitra</a>
          </div>

          <div className="feature-strip">
            <div><StockIcon /><span>Stok real-time dummy</span></div>
            <div><TruckIcon /><span>Tracking pengiriman</span></div>
            <div><PartnerIcon /><span>Portal mitra</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <ChickenBadge />
          <div className="floating-card card-order">
            <b>PO-RFZ-001</b>
            <span>Ayam Potong • Dalam Perjalanan</span>
          </div>
          <div className="floating-card card-stock">
            <b>Stok Menipis</b>
            <span>Ayam Potong 35/50 Kg</span>
          </div>
        </div>
      </section>

      <section id="menu" className="menu-section">
        <div className="section-title">
          <span>Menu acuan operasional</span>
          <h2>Daftar menu Rafiza untuk kebutuhan perencanaan bahan baku.</h2>
        </div>
        <div className="menu-grid">
          <div className="menu-photo-card">
            <img src={menuImage} alt="List menu Rafiza Fried Chicken" />
          </div>
          <div className="menu-list-card">
            {menuItems.map((item) => (
              <div key={item.name} className="menu-row">
                <div>
                  <b>{item.name}</b>
                  <span>{item.category}</span>
                </div>
                <strong>{item.price}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="login" className="login-section">
        <form className="login-panel" onSubmit={handleSubmit}>
          <div className="login-title">
            <img src={logo} alt="Rafiza" />
            <div>
              <h2>Login Demo Sistem</h2>
              <p>Gunakan salah satu dari 4 akun dummy untuk presentasi.</p>
            </div>
          </div>

          <label>Pilih Akun</label>
          <select value={email} onChange={(event) => setEmail(event.target.value)}>
            {dummyUsers.map((user) => (
              <option key={user.email} value={user.email}>{user.role} — {user.email}</option>
            ))}
          </select>

          <label>Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />

          {selectedUser && <p className="helper-text">{selectedUser.description}</p>}
          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-button">Masuk ke Dashboard</button>
          <small>Password semua akun: <b>12345678</b></small>
        </form>
      </section>
    </div>
  )
}
