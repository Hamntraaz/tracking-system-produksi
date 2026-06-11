import logo from '../assets/rafiza-logo.png'
import { Icon } from './Icons'
import { getRouteForRolePage, getRoutesForRole } from '../routes'

export default function Layout({ user = {}, activePage, setActivePage, onLogout, onRefresh, loading, children }) {
  const safeUser = {
    name: user.name || 'User Rafiza',
    avatar: user.avatar || 'RF',
    role: user.role || 'admin',
    roleName: user.roleName || user.role_name || 'Dashboard',
  }
  const navigation = getRoutesForRole(safeUser.role)
  const currentRoute = getRouteForRolePage(safeUser.role, activePage)

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
            <span className="breadcrumb">{safeUser.roleName} / {currentRoute.label}</span>
            <h1>{currentRoute.title}</h1>
          </div>
          <span className="role-pill">{safeUser.roleName}</span>
        </header>
        <div className="page-transition">{children}</div>
      </main>
    </div>
  )
}
