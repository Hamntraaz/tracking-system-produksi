import { useMemo, useState } from 'react'
import TrackingMap from '../../components/TrackingMap'
import StatusBadge from '../../components/StatusBadge'
import DeliveryProof from '../../components/DeliveryProof'
import ResponsiveTable from '../../components/ResponsiveTable'

function isActiveStatus(status) { return !['Pengiriman Selesai', 'Pesanan Diterima', 'Selesai', 'Diterima Cabang', 'Ditolak Gudang'].includes(status) }
function pointFromLocation(location) { if (!location) return null; const lat = Number(location.latitude); const lng = Number(location.longitude); if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null; return { latitude: lat, longitude: lng, accuracy: Number(location.accuracy || 0), recorded_at: location.created_at } }
function belongsWarehouse(row, user) { return !user?.warehouse_id || !row?.warehouse_id || String(row.warehouse_id) === String(user.warehouse_id) }
function buildBranchMapDelivery(row, data = {}) {
  const locations = data.actor_locations || {}
  const branches = Array.isArray(data.branches) ? data.branches : []
  const branch = branches.find((item) => String(item.id) === String(row?.branch_id)) || branches[0]
  const branchLocation = pointFromLocation(locations[`branch:${row?.branch_id || branch?.id}`] || locations.branch)
  return { id: row?.id, code: row?.code, order_code: row?.code, status: row?.status, map_type: 'branch_request', delivery_type: 'branch_request', courier_id: row?.courier_id, courier_name: row?.courier_name, pickup_role: 'warehouse', pickup_label: row?.warehouse_name || 'Gudang', current_lat: row?.current_lat, current_lng: row?.current_lng, destination_role: 'branch', destination_label: branch?.name || row?.branch_name || 'Cabang', destination_lat: branchLocation?.latitude, destination_lng: branchLocation?.longitude, destination_address: branch?.address || row?.branch_name || 'Lokasi cabang', proof_photo: row?.proof_photo, proof_note: row?.proof_note, proof_uploaded_at: row?.proof_uploaded_at }
}
export default function WarehouseTracking({ data = {}, deviceLocation, locationStatus, locationError, refreshData, user }) {
  const deliveries = (Array.isArray(data.deliveries) ? data.deliveries : []).filter((row) => belongsWarehouse(row, user))
  const branchRequests = (Array.isArray(data.branch_requests) ? data.branch_requests : []).filter((row) => belongsWarehouse(row, user))
  const [type, setType] = useState('Semua')
  const [status, setStatus] = useState('Aktif')
  const [keyword, setKeyword] = useState('')
  const [selectedKey, setSelectedKey] = useState('')
  const items = useMemo(() => {
    const deliveryItems = deliveries.map((row) => ({ key: `delivery:${row.id}`, type: 'Supplier → Gudang', code: row.code, order_code: row.order_code, actor: row.courier_name || '-', source: row.supplier_name || '-', target: row.warehouse_name || '-', updated_at: row.recorded_at || '-', status: row.status, mapDelivery: row, proof: row, mapProps: { hidePickup: true, useDeviceAsDestination: true, showUserLocation: true } }))
    const branchItems = branchRequests.map((row) => ({ key: `branch:${row.id}`, type: 'Gudang → Cabang', code: row.code, order_code: row.code, actor: row.courier_name || 'Kurir gudang belum dipilih', source: row.warehouse_name || 'Gudang', target: row.branch_name || 'Cabang', updated_at: row.updated_at || row.created_at || '-', status: row.status, mapDelivery: buildBranchMapDelivery(row, data), proof: row, mapProps: { hidePickup: true } }))
    return [...deliveryItems, ...branchItems]
  }, [deliveries, branchRequests, data])
  const rows = useMemo(() => items.filter((row) => { const matchType = type === 'Semua' || row.type === type; const matchStatus = status === 'Semua' || (status === 'Aktif' ? isActiveStatus(row.status) : row.status === status); const haystack = `${row.type} ${row.code} ${row.order_code} ${row.actor} ${row.source} ${row.target} ${row.status}`.toLowerCase(); return matchType && matchStatus && (!keyword || haystack.includes(keyword.toLowerCase())) }), [items, type, status, keyword])
  const selected = useMemo(() => selectedKey ? items.find((item) => item.key === selectedKey) || rows[0] : rows.find((item) => isActiveStatus(item.status)) || rows[0], [items, rows, selectedKey])
  const statuses = useMemo(() => ['Semua', 'Aktif', ...Array.from(new Set(items.map((item) => item.status).filter(Boolean)))], [items])
  const columns = [
    { key: 'type', label: 'Jenis' }, { key: 'code', label: 'Kode' }, { key: 'actor', label: 'Kurir' }, { key: 'source', label: 'Dari' }, { key: 'target', label: 'Ke' }, { key: 'updated_at', label: 'Update' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> }, { key: 'action', label: 'Maps', render: (row) => <button type="button" className="soft-action" onClick={() => setSelectedKey(row.key)}>Pantau</button> },
  ]
  return (
    <>
      <section className="page-head-card"><div><span>Gudang</span><h2>Tracking Barang Real-time</h2><p>Gudang memantau titik kurir dan titik gudang untuk pengiriman supplier, serta titik kurir gudang dan cabang untuk distribusi cabang.</p></div><div className="head-actions">{selected && <StatusBadge>{selected.status}</StatusBadge>}<button type="button" onClick={refreshData}>Refresh</button></div></section>
      <section className="content-grid two-one"><article className="panel-card wide"><TrackingMap delivery={selected?.mapDelivery} deviceLocation={deviceLocation} viewerUser={user} {...(selected?.mapProps || {})} /></article><article className="panel-card"><div className="panel-head"><div><span>Detail Pengiriman</span><h3>{selected?.order_code || 'Belum ada tracking'}</h3></div></div>{selected ? <><div className="detail-stack compact-detail"><p><b>Jenis</b><span>{selected.type}</span></p><p><b>Kurir</b><span>{selected.actor}</span></p><p><b>Status</b><span>{selected.status}</span></p><p><b>Dari</b><span>{selected.source}</span></p><p><b>Ke</b><span>{selected.target}</span></p><p><b>Lokasi perangkat ini</b><span>{locationStatus}</span></p></div>{selected.proof && <DeliveryProof delivery={selected.proof} />}</> : <p className="muted-text">Data monitoring belum tersedia.</p>}{locationError && <p className="error-box">{locationError}</p>}</article></section>
      <article className="panel-card"><div className="filter-bar"><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Cari kode, kurir, cabang, supplier, status..." /><select value={type} onChange={(event) => setType(event.target.value)}><option>Semua</option><option>Supplier → Gudang</option><option>Gudang → Cabang</option></select><select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select><select value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)}><option value="">Pilih otomatis aktivitas aktif</option>{rows.map((row) => <option key={row.key} value={row.key}>{row.type} - {row.code}</option>)}</select></div><ResponsiveTable columns={columns} rows={rows} /></article>
    </>
  )
}
