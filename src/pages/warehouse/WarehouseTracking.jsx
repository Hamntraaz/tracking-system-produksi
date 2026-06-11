import { useMemo, useState } from 'react'
import TrackingMap from '../../components/TrackingMap'
import StatusBadge from '../../components/StatusBadge'
import DeliveryProof from '../../components/DeliveryProof'
import ResponsiveTable from '../../components/ResponsiveTable'

function isActiveStatus(status) {
  return !['Pengiriman Selesai', 'Pesanan Diterima', 'Selesai', 'Diterima Cabang', 'Ditolak Gudang'].includes(status)
}

function pointFromLocation(location) {
  if (!location) return null
  const lat = Number(location.latitude)
  const lng = Number(location.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { latitude: lat, longitude: lng, accuracy: Number(location.accuracy || 0), recorded_at: location.created_at }
}

function belongsWarehouse(row, user) {
  return !user?.warehouse_id || !row?.warehouse_id || String(row.warehouse_id) === String(user.warehouse_id)
}

function buildBranchMapDelivery(row, data = {}, user) {
  const locations = data.actor_locations || {}
  const warehouses = Array.isArray(data.warehouses) ? data.warehouses : []
  const branches = Array.isArray(data.branches) ? data.branches : []
  const warehouse = warehouses.find((item) => String(item.id) === String(row?.warehouse_id || user?.warehouse_id)) || warehouses[0]
  const branch = branches.find((item) => String(item.id) === String(row?.branch_id)) || branches[0]
  const warehouseLocation = pointFromLocation(locations[`warehouse:${row?.warehouse_id || user?.warehouse_id || warehouse?.id}`] || locations.warehouse)
  const branchLocation = pointFromLocation(locations[`branch:${row?.branch_id || branch?.id}`] || locations.branch)

  return {
    id: row?.id,
    code: row?.code,
    order_code: row?.code,
    status: row?.status,
    map_type: 'branch_request',
    pickup_role: 'warehouse',
    pickup_label: warehouse?.name || row?.warehouse_name || 'Gudang',
    pickup_lat: warehouseLocation?.latitude,
    pickup_lng: warehouseLocation?.longitude,
    pickup_address: warehouse?.address || row?.warehouse_name || 'Lokasi gudang',
    destination_role: 'branch',
    destination_label: branch?.name || row?.branch_name || 'Cabang',
    destination_lat: branchLocation?.latitude,
    destination_lng: branchLocation?.longitude,
    destination_address: branch?.address || row?.branch_name || 'Lokasi cabang',
  }
}

export default function WarehouseTracking({ data = {}, deviceLocation, locationStatus, locationError, refreshData, user }) {
  const deliveries = (Array.isArray(data.deliveries) ? data.deliveries : []).filter((row) => belongsWarehouse(row, user))
  const branchRequests = (Array.isArray(data.branch_requests) ? data.branch_requests : []).filter((row) => belongsWarehouse(row, user))
  const [type, setType] = useState('Semua')
  const [status, setStatus] = useState('Aktif')
  const [keyword, setKeyword] = useState('')
  const [selectedKey, setSelectedKey] = useState('')

  const items = useMemo(() => {
    const deliveryItems = deliveries.map((row) => ({ key: `delivery:${row.id}`, type: 'Supplier → Gudang', code: row.code, order_code: row.order_code, actor: row.courier_name || '-', source: row.pickup_address || row.supplier_name || '-', target: row.destination_address || row.warehouse_name || '-', updated_at: row.recorded_at || '-', status: row.status, mapDelivery: row, proof: row }))
    const branchItems = branchRequests.map((row) => ({ key: `branch:${row.id}`, type: 'Gudang → Cabang', code: row.code, order_code: row.code, actor: row.branch_name || '-', source: row.warehouse_name || 'Gudang', target: row.branch_name || 'Cabang', updated_at: row.updated_at || row.created_at || '-', status: row.status, mapDelivery: buildBranchMapDelivery(row, data, user), proof: null }))
    return [...deliveryItems, ...branchItems]
  }, [deliveries, branchRequests, data, user])

  const rows = useMemo(() => items.filter((row) => {
    const matchType = type === 'Semua' || row.type === type
    const matchStatus = status === 'Semua' || (status === 'Aktif' ? isActiveStatus(row.status) : row.status === status)
    const haystack = `${row.type} ${row.code} ${row.order_code} ${row.actor} ${row.source} ${row.target} ${row.status}`.toLowerCase()
    const matchKeyword = !keyword || haystack.includes(keyword.toLowerCase())
    return matchType && matchStatus && matchKeyword
  }), [items, type, status, keyword])
  const selected = useMemo(() => selectedKey ? items.find((item) => item.key === selectedKey) || rows[0] : rows.find((item) => isActiveStatus(item.status)) || rows[0], [items, rows, selectedKey])
  const statuses = useMemo(() => ['Semua', 'Aktif', ...Array.from(new Set(items.map((item) => item.status).filter(Boolean)))], [items])
  const columns = [
    { key: 'type', label: 'Jenis' }, { key: 'code', label: 'Kode' }, { key: 'actor', label: 'Aktor' }, { key: 'source', label: 'Dari' }, { key: 'target', label: 'Ke' }, { key: 'updated_at', label: 'Update' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> }, { key: 'action', label: 'Maps', render: (row) => <button type="button" className="soft-action" onClick={() => setSelectedKey(row.key)}>Pantau</button> },
  ]

  return (
    <>
      <section className="page-head-card"><div><span>Gudang</span><h2>Tracking Barang Real-time</h2><p>Gudang memantau barang masuk dari supplier serta pengiriman barang ke cabang. Rute biru tampil mengikuti jalan.</p></div><div className="head-actions">{selected && <StatusBadge>{selected.status}</StatusBadge>}<button type="button" onClick={refreshData}>Refresh</button></div></section>
      <section className="content-grid two-one"><article className="panel-card wide"><TrackingMap delivery={selected?.mapDelivery} deviceLocation={deviceLocation} showUserLocation={Boolean(deviceLocation)} viewerUser={user} /></article><article className="panel-card"><div className="panel-head"><div><span>Detail Pengiriman</span><h3>{selected?.order_code || 'Belum ada tracking'}</h3></div></div>{selected ? <><div className="detail-stack"><p><b>Jenis</b><span>{selected.type}</span></p><p><b>Aktor</b><span>{selected.actor}</span></p><p><b>Status</b><span>{selected.status}</span></p><p><b>Dari</b><span>{selected.source}</span></p><p><b>Ke</b><span>{selected.target}</span></p><p><b>Update Terakhir</b><span>{selected.updated_at || '-'}</span></p><p><b>Lokasi perangkat ini</b><span>{locationStatus}</span></p></div>{selected.proof && <DeliveryProof delivery={selected.proof} />}</> : <p className="muted-text">Data monitoring belum tersedia.</p>}{locationError && <p className="error-box">{locationError}</p>}</article></section>
      <article className="panel-card"><div className="filter-bar"><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Cari kode, PO, kurir, cabang, supplier, status..." /><select value={type} onChange={(event) => setType(event.target.value)}><option>Semua</option><option>Supplier → Gudang</option><option>Gudang → Cabang</option></select><select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select><select value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)}><option value="">Pilih otomatis aktivitas aktif</option>{rows.map((row) => <option key={row.key} value={row.key}>{row.type} - {row.code}</option>)}</select></div><ResponsiveTable columns={columns} rows={rows} /></article>
    </>
  )
}
