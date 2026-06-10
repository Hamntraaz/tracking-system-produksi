import logo from '../assets/rafiza-logo.png'
import { Icon } from './Icons'

const navByRole = {
  admin: [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'stocks', label: 'Stok Bahan', icon: 'stock' },
    { key: 'usage', label: 'Pemakaian Produksi', icon: 'report' },
    { key: 'orders', label: 'Pesanan', icon: 'order' },
    { key: 'tracking', label: 'Tracking', icon: 'map' },
  ],
  supplier: [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'orders', label: 'Pesanan Masuk', icon: 'order' },
    { key: 'couriers', label: 'Kurir Supplier', icon: 'courier' },
    { key: 'monitoring', label: 'Monitoring Maps', icon: 'map' },
  ],
  courier: [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'tasks', label: 'Tugas Antar', icon: 'courier' },
    { key: 'tracking', label: 'Maps', icon: 'map' },
  ],
  manager: [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'accounts', label: 'Akun & Mitra', icon: 'supplier' },
    { key: 'monitoring', label: 'Monitoring', icon: 'chart' },
    { key: 'reports', label: 'Laporan', icon: 'report' },
  ],
}

export default function Layout({ user = {}, activePage, setActivePage, onLogout, onRefresh, loading, children }) {
  const safeUser = {
    name: user.name || 'User Rafiza',
    avatar: user.avatar || 'RF',
    role: user.role || 'admin',
    roleName: user.roleName || 'Dashboard',
  }
  const navigation = navByRole[safeUser.role] || navByRole.admin

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="Logo Rafiza" />
          <div><strong>Rafiza</strong><span>Operational System</span></div>
        </div>

        <div className="user-card">
          <div className="avatar">{safeUser.avatar}</div>
          <div><b>{safeUser.name}</b><span>{safeUser.roleName}</span></div>
        </div>

        <nav className="side-nav">
          {navigation.map((item) => (
            <button key={item.key} type="button" className={activePage === item.key ? 'active' : ''} onClick={() => setActivePage(item.key)}>
              <Icon name={item.icon} size={19} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <button type="button" className="ghost-action" onClick={onRefresh} disabled={loading}>
            <Icon name="bell" size={17} /> {loading ? 'Memuat...' : 'Refresh Data'}
          </button>
          <button type="button" className="logout-button" onClick={onLogout}>
            <Icon name="logout" size={18} /> Keluar
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Sistem operasional live database</span>
            <h1>{safeUser.roleName}</h1>
          </div>
          <span className="role-pill">{safeUser.roleName}</span>
        </header>
        <div className="page-transition">{children}</div>
      </main>
    </div>
  )
}
