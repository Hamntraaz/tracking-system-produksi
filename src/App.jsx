import { useEffect, useMemo, useRef, useState } from 'react'
import Layout from './components/Layout'
import LandingPage from './pages/public/LandingPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStocks from './pages/admin/AdminStocks'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProductionUsage from './pages/admin/AdminProductionUsage'
import AdminTracking from './pages/admin/AdminTracking'
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
import { getOverview, saveActorLocation } from './services/api'
import useBrowserLocation from './hooks/useBrowserLocation'

const emptyData = {
  summary: {},
  materials: [],
  suppliers: [],
  couriers: [],
  orders: [],
  deliveries: [],
  movements: [],
  warehouses: [],
  timeline: [],
  actor_locations: {},
  notifications: [],
  users: [],
}

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
    timeline: normalizeArray(raw.timeline),
    actor_locations: raw.actor_locations && typeof raw.actor_locations === 'object' ? raw.actor_locations : {},
    notifications: normalizeArray(raw.notifications),
    users: normalizeArray(raw.users),
  }
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
  const [user, setUser] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [toast, setToast] = useState(null)
  const snapshotRef = useRef('')
  const firstLoadRef = useRef(true)
  const lastLocationSendRef = useRef(0)
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

  async function handleLogin(userData) {
    const safeUser = userData || {}
    const nextUser = {
      id: safeUser.id || 0,
      name: safeUser.name || 'User Rafiza',
      email: safeUser.email || '-',
      role: safeUser.role || 'admin',
      roleName: safeUser.roleName || 'Dashboard',
      branch: safeUser.branch || 'Rafiza Fried Chicken',
      avatar: safeUser.avatar || 'RF',
      supplier_id: safeUser.supplier_id || null,
      courier_id: safeUser.courier_id || null,
      warehouse_id: safeUser.warehouse_id || null,
    }
    setUser(nextUser)
    setActivePage('dashboard')
    firstLoadRef.current = true
    snapshotRef.current = ''
    requestLocation?.()
      .then((position) => {
        if (position?.coords) {
          return saveActorLocation({ userId: nextUser.id, role: nextUser.role, latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy })
        }
        return null
      })
      .catch(() => {})
    await loadData()
  }

  function handleLogout() {
    stopWatching?.()
    setUser(null)
    setActivePage('dashboard')
    setData(emptyData)
    setApiError('')
    setToast(null)
    firstLoadRef.current = true
    snapshotRef.current = ''
  }

  useEffect(() => {
    if (!user || !deviceLocation) return
    const now = Date.now()
    if (now - lastLocationSendRef.current < 10000) return
    lastLocationSendRef.current = now
    saveActorLocation({
      userId: user.id,
      role: user.role,
      latitude: deviceLocation.latitude,
      longitude: deviceLocation.longitude,
      accuracy: deviceLocation.accuracy,
    }).catch(() => {})
  }, [user, deviceLocation])

  useEffect(() => {
    if (!user) return undefined
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
    admin: { dashboard: <AdminDashboard {...pageProps} />, stocks: <AdminStocks {...pageProps} />, usage: <AdminProductionUsage {...pageProps} />, orders: <AdminOrders {...pageProps} />, tracking: <AdminTracking {...pageProps} /> },
    supplier: { dashboard: <SupplierDashboard {...pageProps} />, orders: <SupplierOrders {...pageProps} />, couriers: <SupplierCouriers {...pageProps} />, monitoring: <SupplierMonitoring {...pageProps} /> },
    courier: { dashboard: <CourierDashboard {...pageProps} />, tasks: <CourierTasks {...pageProps} />, tracking: <CourierTracking {...pageProps} /> },
    manager: { dashboard: <ManagerDashboard {...pageProps} />, accounts: <ManagerAccounts {...pageProps} />, monitoring: <ManagerMonitoring {...pageProps} />, reports: <ManagerReports {...pageProps} /> },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [data, loading, apiError, user, deviceLocation, locationStatus, locationError])

  const rolePages = user ? (pageMap[user.role] || pageMap.admin) : null
  const currentPage = rolePages ? (rolePages[activePage] || rolePages.dashboard) : null

  if (!user) {
    return <LandingPage onLogin={handleLogin} deviceLocation={deviceLocation} locationStatus={locationStatus} locationError={locationError} requestLocation={requestLocation} />
  }

  return (
    <Layout user={user} activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} onRefresh={() => loadData()} loading={loading}>
      {toast && <div className="beep-toast"><b>{toast.title}</b><span>{toast.message}</span></div>}
      {apiError && <div className="api-alert"><b>API belum tersambung:</b> {apiError}</div>}
      {locationError && <div className="location-alert"><b>Lokasi belum aktif:</b> {locationError}</div>}
      {currentPage}
    </Layout>
  )
}
