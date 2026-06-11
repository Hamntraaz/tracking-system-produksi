export const publicRoutes = [
  { key: 'home', path: '/', label: 'Home' },
  { key: 'menu', path: '/menu', label: 'Menu' },
  { key: 'mitra', path: '/mitra', label: 'Kemitraan' },
  { key: 'kontak', path: '/kontak', label: 'Kontak' },
]

export const privateRoutes = {
  manager: [
    { key: 'dashboard', path: 'dashboard', label: 'Dashboard', title: 'Dashboard Manajemen', icon: 'dashboard' },
    { key: 'accounts', path: 'accounts', label: 'Akun & Mitra', title: 'Akun & Mitra', icon: 'supplier', aliases: ['akun-mitra'] },
    { key: 'monitoring', path: 'monitoring', label: 'Monitoring', title: 'Monitoring Operasional', icon: 'chart' },
    { key: 'reports', path: 'reports', label: 'Laporan', title: 'Laporan Operasional', icon: 'report', aliases: ['laporan'] },
  ],
  warehouse: [
    { key: 'dashboard', path: 'dashboard', label: 'Dashboard', title: 'Dashboard Gudang', icon: 'dashboard' },
    { key: 'stocks', path: 'stocks', label: 'Stok Gudang', title: 'Stok Gudang', icon: 'stock', aliases: ['stok-gudang'] },
    { key: 'orders', path: 'orders', label: 'Order Supplier', title: 'Order Bahan ke Supplier', icon: 'order', aliases: ['pesanan-supplier'] },
    { key: 'branchRequests', path: 'branch-requests', label: 'Permintaan Cabang', title: 'Permintaan Barang dari Cabang', icon: 'partner', aliases: ['permintaan-cabang'] },
    { key: 'tracking', path: 'tracking', label: 'Tracking Supplier', title: 'Tracking Barang dari Supplier', icon: 'map' },
  ],
  branch: [
    { key: 'dashboard', path: 'dashboard', label: 'Dashboard', title: 'Dashboard Cabang', icon: 'dashboard' },
    { key: 'stock', path: 'stock', label: 'Stok Cabang', title: 'Stok Cabang', icon: 'stock', aliases: ['stok-cabang'] },
    { key: 'requests', path: 'requests', label: 'Request ke Gudang', title: 'Request Barang ke Gudang', icon: 'order', aliases: ['request-gudang'] },
    { key: 'sales', path: 'sales', label: 'Penjualan', title: 'Penjualan Cabang', icon: 'report', aliases: ['penjualan'] },
    { key: 'tracking', path: 'tracking', label: 'Monitoring Maps', title: 'Monitoring Maps Cabang', icon: 'map', aliases: ['monitoring-maps', 'status-request'] },
  ],
  supplier: [
    { key: 'dashboard', path: 'dashboard', label: 'Dashboard', title: 'Dashboard Supplier', icon: 'dashboard' },
    { key: 'orders', path: 'orders', label: 'Pesanan Gudang', title: 'Pesanan dari Gudang', icon: 'order', aliases: ['pesanan-masuk'] },
    { key: 'couriers', path: 'couriers', label: 'Kurir Supplier', title: 'Kurir Supplier', icon: 'courier', aliases: ['kurir-supplier'] },
    { key: 'monitoring', path: 'monitoring', label: 'Monitoring Maps', title: 'Monitoring Maps', icon: 'map', aliases: ['monitoring-maps'] },
  ],
  courier: [
    { key: 'dashboard', path: 'dashboard', label: 'Dashboard', title: 'Dashboard Kurir', icon: 'dashboard' },
    { key: 'tasks', path: 'tasks', label: 'Tugas Antar', title: 'Tugas Pengiriman', icon: 'courier', aliases: ['tugas-antar'] },
    { key: 'tracking', path: 'tracking', label: 'Maps', title: 'Live Tracking', icon: 'map', aliases: ['maps'] },
  ],
}

export const validRoles = Object.keys(privateRoutes)

export function normalizePathname(pathname = '/') {
  const clean = pathname.split('?')[0].split('#')[0].replace(/\/+/g, '/').replace(/\/+$/, '')
  return clean || '/'
}

export function normalizeRole(role) {
  if (role === 'admin') return 'warehouse'
  return role
}

export function getPublicRouteByKey(key) {
  return publicRoutes.find((route) => route.key === key) || publicRoutes[0]
}

export function getPublicRouteByPath(pathname) {
  const clean = normalizePathname(pathname)
  return publicRoutes.find((route) => route.path === clean) || null
}

export function getRoutesForRole(role) {
  return privateRoutes[normalizeRole(role)] || privateRoutes.manager
}

export function getRouteForRolePage(role, pageKey = 'dashboard') {
  const routes = getRoutesForRole(role)
  return routes.find((route) => route.key === pageKey) || routes[0]
}

export function isValidRole(role) {
  return Boolean(privateRoutes[normalizeRole(role)])
}

export function isValidPageForRole(role, pageKey) {
  return getRoutesForRole(role).some((route) => route.key === pageKey)
}

export function routeKeyFromSegment(role, segment = 'dashboard') {
  const routes = getRoutesForRole(role)
  const cleanSegment = segment || 'dashboard'
  const route = routes.find((item) => item.path === cleanSegment || item.key === cleanSegment || item.aliases?.includes(cleanSegment))
  return route?.key || routes[0].key
}

export function buildPrivatePath(role, pageKey = 'dashboard') {
  const safeRole = isValidRole(role) ? normalizeRole(role) : 'manager'
  const route = getRouteForRolePage(safeRole, pageKey)
  return `/${safeRole}/${route.path}`
}

export function parsePrivatePath(pathname) {
  const parts = normalizePathname(pathname).split('/').filter(Boolean)
  let [role, segment = 'dashboard'] = parts
  role = normalizeRole(role)
  if (!isValidRole(role)) return null
  return { role, page: routeKeyFromSegment(role, segment) }
}

export function pageKeysByRole() {
  return Object.fromEntries(Object.entries(privateRoutes).map(([role, routes]) => [role, routes.map((route) => route.key)]))
}
