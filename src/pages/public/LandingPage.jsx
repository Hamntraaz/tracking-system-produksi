import { useEffect, useState } from 'react'
import logo from '../../assets/rafiza-logo.png'
import Modal from '../../components/Modal'
import { HeroChicken, Icon } from '../../components/Icons'
import { login } from '../../services/api'
import { contactInfo, menuItems, partnerPackages } from '../../data/staticData'

const publicPages = [
  { key: 'home', label: 'Home' },
  { key: 'menu', label: 'Menu' },
  { key: 'mitra', label: 'Mitra' },
  { key: 'kontak', label: 'Kontak' },
]

export default function LandingPage({ onLogin, activePage: controlledActivePage = 'home', onNavigate, loginOpen: controlledLoginOpen, onLoginOpenChange, deviceLocation, locationStatus, locationError, requestLocation }) {
  const [internalLoginOpen, setInternalLoginOpen] = useState(false)
  const [internalActivePage, setInternalActivePage] = useState('home')


  const activePage = onNavigate ? controlledActivePage : internalActivePage
  const loginOpen = typeof controlledLoginOpen === 'boolean' ? controlledLoginOpen : internalLoginOpen

  function navigatePage(page) {
    if (onNavigate) onNavigate(page)
    else setInternalActivePage(page)
  }

  function changeLoginOpen(open) {
    if (onLoginOpenChange) onLoginOpenChange(open)
    else setInternalLoginOpen(open)
  }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (locationStatus === 'idle') requestLocation?.().catch(() => {})
  }, [locationStatus, requestLocation])

  async function submitHandler(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      requestLocation?.().catch(() => {})
      const payload = await login(email, password)
      await onLogin(payload?.user, payload?.token)
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa koneksi API dan data akun.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="landing-page clean-landing">
      <nav className="landing-nav page-nav">
        <button className="nav-brand brand-button" type="button" onClick={() => navigatePage('home')}>
          <img src={logo} alt="Logo Rafiza Fried Chicken" />
          <div><strong>Rafiza Fried Chicken</strong><span>Operational Partner System</span></div>
        </button>
        <div className="nav-links segmented-links">
          {publicPages.map((page) => (
            <button type="button" key={page.key} className={activePage === page.key ? 'active' : ''} onClick={() => navigatePage(page.key)}>{page.label}</button>
          ))}
        </div>
        <button type="button" className="nav-button" onClick={() => changeLoginOpen(true)}>Masuk Sistem</button>
      </nav>

      {activePage === 'home' && (
        <section className="public-page-panel landing-hero split-hero">
          <div className="hero-copy">
            <span className="eyebrow">Kemitraan & Operasional Bahan Baku</span>
            <h1>Kelola outlet Rafiza dengan stok, supplier, kurir, dan tracking pengiriman dalam satu sistem.</h1>
            <p>
              Sistem ini mendukung alur operasional mitra: gudang membuat permintaan bahan baku, supplier mengonfirmasi ketersediaan,
              kurir menjalankan pengiriman, lalu manajemen memantau proses secara real-time.
            </p>
            <div className="hero-actions">
              <button className="primary-action" type="button" onClick={() => navigatePage('mitra')}>Informasi Kemitraan</button>
              <button type="button" className="secondary-action" onClick={() => navigatePage('kontak')}>Hubungi Rafiza</button>
            </div>
            <div className="hero-kpi">
              <div><b>Tracking GPS</b><span>Berbasis perangkat kurir</span></div>
              <div><b>4 Role</b><span>Gudang, supplier, kurir, manajemen</span></div>
              <div><b>Bukti Foto</b><span>Tersimpan melalui Cloudinary</span></div>
            </div>
          </div>
          <div className="hero-visual no-photo-card">
            <div className="plate-card better-plate">
              <HeroChicken />
              <div className="plate-label"><b>Juara Ayam Krispy</b><span>Sistem operasional untuk mitra Rafiza</span></div>
            </div>
            <div className="workflow-mini">
              <div><Icon name="order" /> Gudang request barang</div>
              <div><Icon name="supplier" /> Supplier konfirmasi</div>
              <div><Icon name="courier" /> Driver berangkat</div>
              <div><Icon name="map" /> Tracking aktif</div>
            </div>
          </div>
        </section>
      )}

      {activePage === 'menu' && (
        <section className="public-page-panel section-block only-page">
          <div className="section-title">
            <span>Menu Rafiza</span>
            <h2>Menu utama Rafiza Fried Chicken.</h2>
            <p>Daftar menu digunakan sebagai gambaran kebutuhan bahan baku outlet, seperti ayam, tepung bumbu, minyak, topping, dan kemasan.</p>
          </div>
          <div className="menu-grid refined-menu">
            {menuItems.map((item) => (
              <article className="menu-card" key={item.name}>
                <div><span>{item.category}</span><h3>{item.name}</h3><p>{item.ingredients}</p></div>
                <strong>{item.price}</strong>
              </article>
            ))}
          </div>
        </section>
      )}

      {activePage === 'mitra' && (
        <section className="public-page-panel section-block partner-section only-page">
          <div className="section-title">
            <span>Kemitraan</span>
            <h2>Pilihan paket kemitraan Rafiza.</h2>
            <p>Detail paket dan ketersediaan program dapat dikonsultasikan langsung melalui kontak resmi Rafiza.</p>
          </div>
          <div className="package-grid refined-package">
            {partnerPackages.map((pkg) => (
              <article className={`package-card ${pkg.highlighted ? 'highlighted' : ''}`} key={pkg.name}>
                <span className="package-tag">{pkg.tag}</span>
                <h3>{pkg.name}</h3>
                <strong>{pkg.price}</strong>
                <ul>{pkg.items.map((item) => <li key={item}><Icon name="check" size={16} /> {item}</li>)}</ul>
                <button type="button" className={pkg.highlighted ? 'primary-action full' : 'secondary-action full'} onClick={() => navigatePage('kontak')}>Hubungi WhatsApp</button>
              </article>
            ))}
          </div>
        </section>
      )}

      {activePage === 'kontak' && (
        <section className="public-page-panel section-block contact-section only-page">
          <div>
            <span className="eyebrow">Kontak</span>
            <h2>Hubungi Rafiza untuk informasi kemitraan dan operasional.</h2>
            <p>Silakan menghubungi kontak resmi untuk konsultasi paket, kebutuhan outlet, serta informasi implementasi sistem operasional.</p>
            <div className="hero-actions contact-actions">
              <a className="primary-action link-action" href="https://wa.me/6280000000000" target="_blank" rel="noreferrer">Hubungi WhatsApp</a>
              <button type="button" className="secondary-action" onClick={() => changeLoginOpen(true)}>Masuk Sistem</button>
            </div>
          </div>
          <div className="contact-list">
            {contactInfo.map((item) => <div key={item.label}><b>{item.label}</b><span>{item.value}</span></div>)}
          </div>
        </section>
      )}

      <footer className="landing-footer compact-footer">
        <img src={logo} alt="Logo Rafiza" />
        <span>Rafiza Fried Chicken • Operational Partner System</span>
      </footer>

      <Modal open={loginOpen} title="Masuk Dashboard Operasional" onClose={() => changeLoginOpen(false)}>
        <form className="login-form" onSubmit={submitHandler}>
          <div className="login-brand-inline"><img src={logo} alt="Rafiza" /><div><b>Rafiza Operational System</b><span>Masuk sesuai hak akses pengguna</span></div></div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Masukkan email pengguna"
            autoComplete="email"
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Masukkan password"
            autoComplete="current-password"
            required
          />
          <p className="helper-box">Gunakan akun yang sudah dibuat oleh manajemen sesuai hak akses pengguna.</p>
          {error && <p className="error-box">{error}</p>}
          {locationError && <p className="warning-box">Lokasi belum aktif. Tracking akan tersedia setelah izin lokasi perangkat diberikan.</p>}
          <button type="submit" className="login-button" disabled={loading}>{loading ? 'Memproses...' : 'Masuk Dashboard'}</button>
        </form>
      </Modal>
    </main>
  )
}
