import { useEffect, useMemo, useRef, useState } from 'react'
import Layout from './components/Layout'
import LandingPage from './pages/public/LandingPage'
import WarehouseDashboard from './pages/warehouse/WarehouseDashboard'
import WarehouseStocks from './pages/warehouse/WarehouseStocks'
import WarehouseOrders from './pages/warehouse/WarehouseOrders'
import WarehouseBranchRequests from './pages/warehouse/WarehouseBranchRequests'
import WarehouseTracking from './pages/warehouse/WarehouseTracking'
import WarehouseCouriers from './pages/warehouse/WarehouseCouriers'
import SupplierDashboard from './pages/supplier/SupplierDashboard'
import SupplierOrders from './pages/supplier/SupplierOrders'
import SupplierCouriers from './pages/supplier/SupplierCouriers'
import SupplierMonitoring from './pages/supplier/SupplierMonitoring'
import CourierDashboard from './pages/courier/CourierDashboard'
import CourierTasks from './pages/courier/CourierTasks'
import CourierTracking from './pages/courier/CourierTracking'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import ManagerMonitoring from './pages/manager/ManagerMonitoring'
import ManagerReports from './pages/manager/ManagerReports'
import ManagerAccounts from './pages/manager/ManagerAccounts'
import BranchDashboard from './pages/branch/BranchDashboard'
import BranchStock from './pages/branch/BranchStock'
import BranchRequests from './pages/branch/BranchRequests'
import BranchSales from './pages/branch/BranchSales'
import BranchTracking from './pages/branch/BranchTracking'
import { getOverview, saveActorLocation } from './services/api'
import useBrowserLocation from './hooks/useBrowserLocation'
import {
  buildPrivatePath,
  getPublicRouteByKey,
  getPublicRouteByPath,
  getRouteForRolePage,
  isValidPageForRole,
  normalizePathname,
  parsePrivatePath,
  normalizeRole,
} from './routes'

const emptyData = {
  summary: {},
  materials: [],
  suppliers: [],
  couriers: [],
  orders: [],
  deliveries: [],
  movements: [],
  warehouses: [],
  branches: [],
  branch_stocks: [],
  branch_requests: [],
  branch_sales: [],
  timeline: [],
  actor_locations: {},
  notifications: [],
  users: [],
}

const STORAGE_KEY = 'rafiza_user'

function normalizeArray(value) { return Array.isArray(value) ? value : [] }
function normalizeData(payload) {
  const raw = payload?.data || payload || {}
  return {
    summary: raw.summary && typeof raw.summary === 'object' ? raw.summary : {},
    materials: normalizeArray(raw.materials),
    suppliers: normalizeArray(raw.suppliers),
    couriers: normalizeArray(raw.couriers),
    orders: normalizeArray(raw.orders),
    deliveries: normalizeArray(raw.deliveries),
    movements: normalizeArray(raw.movements),
    warehouses: normalizeArray(raw.warehouses),
    branches: normalizeArray(raw.branches),
    branch_stocks: normalizeArray(raw.branch_stocks),
    branch_requests: normalizeArray(raw.branch_requests),
    branch_sales: normalizeArray(raw.branch_sales),
    timeline: normalizeArray(raw.timeline),
    actor_locations: raw.actor_locations && typeof raw.actor_locations === 'object' ? raw.actor_locations : {},
    notifications: normalizeArray(raw.notifications),
    users: normalizeArray(raw.users),
  }
}

function getStoredUser() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return { ...parsed, role: normalizeRole(parsed.role) }
  } catch {
    return null
  }
}

function saveStoredUser(user) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user)) } catch {}
}

function clearStoredUser() {
  try { window.localStorage.removeItem(STORAGE_KEY) } catch {}
}

function setBrowserPath(path, replace = false) {
  if (!path) return
  const current = normalizePathname(window.location.pathname)
  const next = normalizePathname(path)
  if (current === next) return
  const action = replace ? 'replaceState' : 'pushState'
  window.history[action]({}, '', next)
}

function getInitialPublicPage() {
  const pathname = normalizePathname(window.location.pathname)
  if (pathname === '/login') return 'home'
  return getPublicRouteByPath(pathname)?.key || 'home'
}

function getInitialLoginOpen(storedUser) {
  const pathname = normalizePathname(window.location.pathname)
  if (storedUser) return false
  return pathname === '/login' || Boolean(parsePrivatePath(pathname))
}

function getInitialActivePage(storedUser) {
  const privateRoute = parsePrivatePath(window.location.pathname)
  if (storedUser && privateRoute?.role === storedUser.role) return privateRoute.page
  return 'dashboard'
}

function beep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
  } catch {}
}

function roleRelevantNotifications(data, role) {
  const notifications = normalizeArray(data.notifications).filter((item) => item.role === role)
  return notifications.slice(0, 5)
}

export default function App() {
  const initialUser = useMemo(() => getStoredUser(), [])
  const [user, setUser] = useState(initialUser)
  const [activePage, setActivePageState] = useState(() => getInitialActivePage(initialUser))
  const [publicPage, setPublicPage] = useState(() => getInitialPublicPage())
  const [loginOpen, setLoginOpen] = useState(() => getInitialLoginOpen(initialUser))
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [toast, setToast] = useState(null)
  const snapshotRef = useRef('')
  const firstLoadRef = useRef(true)
  const lastLocationSendRef = useRef(0)
  const intendedRouteRef = useRef(parsePrivatePath(window.location.pathname))
  const { deviceLocation, locationStatus, locationError, requestLocation, startWatching, stopWatching } = useBrowserLocation()

  function buildSnapshot(nextData, role) {
    const orders = normalizeArray(nextData.orders).map((o) => `${o.id}:${o.status}:${o.courier_id || ''}`).join('|')
    const deliveries = normalizeArray(nextData.deliveries).map((d) => `${d.id}:${d.status}:${d.current_lat || ''}:${d.current_lng || ''}`).join('|')
    const notifications = roleRelevantNotifications(nextData, role).map((n) => n.id).join('|')
    return `${role}::${orders}::${deliveries}::${notifications}`
  }

  async function loadData({ silent = false } = {}) {
    if (!silent) setLoading(true)
    setApiError('')
    try {
      const payload = await getOverview()
      const nextData = normalizeData(payload)
      setData(nextData)
      if (user) {
        const nextSnapshot = buildSnapshot(nextData, user.role)
        if (!firstLoadRef.current && snapshotRef.current && snapshotRef.current !== nextSnapshot) {
          const latestNotif = roleRelevantNotifications(nextData, user.role)[0]
          beep()
          setToast({ title: latestNotif?.title || 'Update status', message: latestNotif?.message || 'Ada perubahan data operasional.' })
          window.setTimeout(() => setToast(null), 3800)
        }
        snapshotRef.current = nextSnapshot
        firstLoadRef.current = false
      }
    } catch (error) {
      setData(emptyData)
      setApiError(error.message || 'Backend API belum berjalan.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  function navigatePrivate(page, { replace = false } = {}) {
    if (!user) return
    const safePage = isValidPageForRole(user.role, page) ? page : 'dashboard'
    setActivePageState(safePage)
    setBrowserPath(buildPrivatePath(user.role, safePage), replace)
  }

  function navigatePublic(page, { replace = false } = {}) {
    const route = getPublicRouteByKey(page)
    setPublicPage(route.key)
    setLoginOpen(false)
    setBrowserPath(route.path, replace)
  }

  function openLogin() {
    intendedRouteRef.current = parsePrivatePath(window.location.pathname)
    setLoginOpen(true)
    setBrowserPath('/login')
  }

  function closeLogin() {
    setLoginOpen(false)
    intendedRouteRef.current = null
    setBrowserPath(getPublicRouteByKey(publicPage).path)
  }

  async function handleLogin(userData) {
    const safeUser = userData || {}
    const nextUser = {
      id: safeUser.id || 0,
      name: safeUser.name || 'User Rafiza',
      email: safeUser.email || '-',
      role: normalizeRole(safeUser.role || 'warehouse'),
      roleName: safeUser.roleName || safeUser.role_name || (normalizeRole(safeUser.role) === 'warehouse' ? 'Gudang' : normalizeRole(safeUser.role) === 'branch' ? 'Cabang' : 'Dashboard'),
      branch: safeUser.branch || 'Rafiza Fried Chicken',
      avatar: safeUser.avatar || 'RF',
      supplier_id: safeUser.supplier_id || null,
      courier_id: safeUser.courier_id || null,
      warehouse_id: safeUser.warehouse_id || null,
      branch_id: safeUser.branch_id || null,
    }

    const currentRoute = parsePrivatePath(window.location.pathname)
    const intendedRoute = intendedRouteRef.current || currentRoute
    const targetPage = intendedRoute?.role === nextUser.role && isValidPageForRole(nextUser.role, intendedRoute.page)
      ? intendedRoute.page
      : 'dashboard'

    setUser(nextUser)
    saveStoredUser(nextUser)
    setLoginOpen(false)
    setActivePageState(targetPage)
    setBrowserPath(buildPrivatePath(nextUser.role, targetPage), true)
    intendedRouteRef.current = null
    firstLoadRef.current = true
    snapshotRef.current = ''
    requestLocation?.()
      .then((position) => {
        if (position?.coords) {
          return saveActorLocation({ userId: nextUser.id, role: nextUser.role, supplier_id: nextUser.supplier_id, courier_id: nextUser.courier_id, warehouse_id: nextUser.warehouse_id, branch_id: nextUser.branch_id, latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy })
        }
        return null
      })
      .catch(() => {})
    await loadData()
  }

  function handleLogout() {
    stopWatching?.()
    clearStoredUser()
    setUser(null)
    setActivePageState('dashboard')
    setData(emptyData)
    setApiError('')
    setToast(null)
    firstLoadRef.current = true
    snapshotRef.current = ''
    intendedRouteRef.current = null
    navigatePublic('home', { replace: true })
  }

  useEffect(() => {
    function handlePopState() {
      const pathname = normalizePathname(window.location.pathname)
      const privateRoute = parsePrivatePath(pathname)

      if (privateRoute && user) {
        if (privateRoute.role === user.role) {
          setActivePageState(privateRoute.page)
          const canonicalPath = buildPrivatePath(privateRoute.role, privateRoute.page)
          if (canonicalPath !== pathname) setBrowserPath(canonicalPath, true)
        } else {
          setActivePageState('dashboard')
          setBrowserPath(buildPrivatePath(user.role, 'dashboard'), true)
        }
        setLoginOpen(false)
        return
      }

      if (privateRoute && !user) {
        intendedRouteRef.current = privateRoute
        setPublicPage('home')
        setLoginOpen(true)
        return
      }

      if (pathname === '/login') {
        setPublicPage('home')
        setLoginOpen(true)
        return
      }

      const publicRoute = getPublicRouteByPath(pathname)
      setPublicPage(publicRoute?.key || 'home')
      setLoginOpen(false)
    }

    handlePopState()
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [user])

  useEffect(() => {
    if (!user) return
    const privateRoute = parsePrivatePath(window.location.pathname)
    if (!privateRoute || privateRoute.role !== user.role || privateRoute.page !== activePage) {
      setBrowserPath(buildPrivatePath(user.role, activePage), true)
    }
  }, [user, activePage])

  useEffect(() => {
    if (!user) {
      document.title = 'Rafiza Fried Chicken | Operational Partner System'
      return
    }
    const route = getRouteForRolePage(user.role, activePage)
    document.title = `${route.title} | Rafiza Operational System`
  }, [user, activePage])

  useEffect(() => {
    if (!user || !deviceLocation) return
    const now = Date.now()
    if (now - lastLocationSendRef.current < 10000) return
    lastLocationSendRef.current = now
    saveActorLocation({
      userId: user.id,
      role: user.role,
      supplier_id: user.supplier_id,
      courier_id: user.courier_id,
      warehouse_id: user.warehouse_id,
      branch_id: user.branch_id,
      latitude: deviceLocation.latitude,
      longitude: deviceLocation.longitude,
      accuracy: deviceLocation.accuracy,
    }).catch(() => {})
  }, [user, deviceLocation])

  useEffect(() => {
    if (!user) return undefined
    loadData({ silent: true })
    const interval = window.setInterval(() => loadData({ silent: true }), 4000)
    return () => window.clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const pageProps = {
    data,
    loading,
    apiError,
    refreshData: loadData,
    user,
    deviceLocation,
    locationStatus,
    locationError,
    requestLocation,
    startWatching,
    stopWatching,
  }

  const pageMap = useMemo(() => ({
    warehouse: {
      dashboard: <WarehouseDashboard {...pageProps} />,
      stocks: <WarehouseStocks {...pageProps} />,
      orders: <WarehouseOrders {...pageProps} />,
      branchRequests: <WarehouseBranchRequests {...pageProps} />,
      couriers: <WarehouseCouriers {...pageProps} />,
      tracking: <WarehouseTracking {...pageProps} />,
    },
    branch: {
      dashboard: <BranchDashboard {...pageProps} />,
      stock: <BranchStock {...pageProps} />,
      requests: <BranchRequests {...pageProps} />,
      sales: <BranchSales {...pageProps} />,
      tracking: <BranchTracking {...pageProps} />,
    },
    supplier: {
      dashboard: <SupplierDashboard {...pageProps} />,
      orders: <SupplierOrders {...pageProps} />,
      couriers: <SupplierCouriers {...pageProps} />,
      monitoring: <SupplierMonitoring {...pageProps} />,
    },
    courier: {
      dashboard: <CourierDashboard {...pageProps} />,
      tasks: <CourierTasks {...pageProps} />,
      tracking: <CourierTracking {...pageProps} />,
    },
    manager: {
      dashboard: <ManagerDashboard {...pageProps} />,
      accounts: <ManagerAccounts {...pageProps} />,
      monitoring: <ManagerMonitoring {...pageProps} />,
      reports: <ManagerReports {...pageProps} />,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [data, loading, apiError, user, deviceLocation, locationStatus, locationError])

  const rolePages = user ? (pageMap[normalizeRole(user.role)] || pageMap.manager) : null
  const currentPage = rolePages ? (rolePages[activePage] || rolePages.dashboard) : null

  if (!user) {
    return (
      <LandingPage
        onLogin={handleLogin}
        activePage={publicPage}
        onNavigate={navigatePublic}
        loginOpen={loginOpen}
        onLoginOpenChange={(open) => (open ? openLogin() : closeLogin())}
        deviceLocation={deviceLocation}
        locationStatus={locationStatus}
        locationError={locationError}
        requestLocation={requestLocation}
      />
    )
  }

  return (
    <Layout user={user} activePage={activePage} setActivePage={navigatePrivate} onLogout={handleLogout} onRefresh={() => loadData()} loading={loading}>
      {toast && <div className="beep-toast"><b>{toast.title}</b><span>{toast.message}</span></div>}
      {apiError && <div className="api-alert"><b>API belum tersambung:</b> {apiError}</div>}
      {locationError && <div className="location-alert"><b>Lokasi belum aktif:</b> {locationError}</div>}
      {currentPage}
    </Layout>
  )
}
