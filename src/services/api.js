const rawBase = import.meta.env.VITE_API_BASE_URL || '/api'
const API_BASE = rawBase.replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  let payload = null
  try { payload = await response.json() } catch { payload = null }

  if (!response.ok) {
    const message = payload?.message || `Gagal terhubung ke backend API (${response.status})`
    throw new Error(message)
  }
  return payload || {}
}

export function login(email, password) {
  return request('/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function getOverview() { return request('/overview') }

export function saveActorLocation({ userId, role, supplier_id, courier_id, warehouse_id, branch_id, latitude, longitude, accuracy }) {
  return request('/actor-location', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, role, supplier_id, courier_id, warehouse_id, branch_id, latitude, longitude, accuracy }),
  })
}

export function createPurchaseOrder(payload) {
  return request('/purchase-orders', { method: 'POST', body: JSON.stringify(payload) })
}

export function supplierConfirmOrder({ orderId, courierId, pickupLat, pickupLng, pickupAddress }) {
  return request('/supplier-confirm', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, courier_id: courierId, pickup_lat: pickupLat, pickup_lng: pickupLng, pickup_address: pickupAddress }),
  })
}

export function driverStart({ deliveryId, courierId, latitude, longitude, accuracy }) {
  return request('/driver-start', {
    method: 'POST',
    body: JSON.stringify({ delivery_id: deliveryId, courier_id: courierId, latitude, longitude, accuracy }),
  })
}

export function updateDeliveryLocation({ deliveryId, courierId, latitude, longitude, accuracy }) {
  return request('/delivery-location', {
    method: 'POST',
    body: JSON.stringify({ delivery_id: deliveryId, courier_id: courierId, latitude, longitude, accuracy }),
  })
}


export function courierTaskResponse({ deliveryId, courierId, action, reason, proof }) {
  return request('/courier-task-response', {
    method: 'POST',
    body: JSON.stringify({ delivery_id: deliveryId, courier_id: courierId, action, reason, proof }),
  })
}

export function driverArrived({ deliveryId, courierId, latitude, longitude, accuracy }) {
  return request('/driver-arrived', {
    method: 'POST',
    body: JSON.stringify({ delivery_id: deliveryId, courier_id: courierId, latitude, longitude, accuracy }),
  })
}

export function deliveryComplete({ deliveryId, courierId, latitude, longitude, proofPhoto, proofNote }) {
  return request('/delivery-complete', {
    method: 'POST',
    body: JSON.stringify({ delivery_id: deliveryId, courier_id: courierId, latitude, longitude, proof_photo: proofPhoto, proof_note: proofNote }),
  })
}

export function updateOrderStatus(orderId, status) {
  return request('/order-status', { method: 'POST', body: JSON.stringify({ order_id: orderId, status }) })
}

export function assignCourier(orderId, courierId) {
  return request('/assign-courier', { method: 'POST', body: JSON.stringify({ order_id: orderId, courier_id: courierId }) })
}

export function createCourier(payload) {
  return request('/couriers', { method: 'POST', body: JSON.stringify(payload) })
}


export function upsertMaterial(payload) {
  return request('/materials', { method: 'POST', body: JSON.stringify(payload) })
}

export function recordProductionUsage(payload) {
  return request('/production-usage', { method: 'POST', body: JSON.stringify(payload) })
}

export function receiveOrder(payload) {
  return request('/receive-order', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateCourierStatus(payload) {
  return request('/courier-status', { method: 'POST', body: JSON.stringify(payload) })
}

export function createManagedSupplier(payload) {
  return request('/manager-suppliers', { method: 'POST', body: JSON.stringify(payload) })
}

export function createManagedWarehouse(payload) {
  return request('/manager-warehouses', { method: 'POST', body: JSON.stringify(payload) })
}


export function updateManagedSupplier(payload) {
  return request('/manager-suppliers-update', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteManagedSupplier(id) {
  return request('/manager-suppliers-delete', { method: 'POST', body: JSON.stringify({ id }) })
}

export function updateManagedWarehouse(payload) {
  return request('/manager-warehouses-update', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteManagedWarehouse(id) {
  return request('/manager-warehouses-delete', { method: 'POST', body: JSON.stringify({ id }) })
}


export function updateManagedAccountStatus(payload) {
  return request('/manager-accounts-status', { method: 'POST', body: JSON.stringify(payload) })
}

export function createManagedBranch(payload) {
  return request('/manager-branches', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateManagedBranch(payload) {
  return request('/manager-branches-update', { method: 'POST', body: JSON.stringify(payload) })
}

export function deleteManagedBranch(id) {
  return request('/manager-branches-delete', { method: 'POST', body: JSON.stringify({ id }) })
}

export function createBranchRequest(payload) {
  return request('/branch-requests', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateBranchRequest(payload) {
  return request('/branch-request-status', { method: 'POST', body: JSON.stringify(payload) })
}

export function recordBranchSale(payload) {
  return request('/branch-sales', { method: 'POST', body: JSON.stringify(payload) })
}

export function getMapsRoute(waypoints) {
  return request('/maps-route', { method: 'POST', body: JSON.stringify({ waypoints }) })
}
