import { useMemo, useState } from 'react'
import TrackingMap from '../../components/TrackingMap'
import StatusBadge from '../../components/StatusBadge'
import DeliveryProof from '../../components/DeliveryProof'
import ResponsiveTable from '../../components/ResponsiveTable'

function belongs(row, user) { return !user?.branch_id || String(row.branch_id || '') === String(user.branch_id || '') }
function pointFromLocation(location) { if (!location) return null; const lat = Number(location.latitude); const lng = Number(location.longitude); if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null; return { latitude: lat, longitude: lng, accuracy: Number(location.accuracy || 0), recorded_at: location.created_at } }
export default function BranchTracking({ data = {}, deviceLocation, locationStatus, locationError, refreshData, user }) {
  const requests = (Array.isArray(data.branch_requests) ? data.branch_requests : []).filter((row) => belongs(row, user))
  const [status, setStatus] = useState('Aktif')
  const [selectedId, setSelectedId] = useState('')
  const [keyword, setKeyword] = useState('')
  const activeStatuses = ['Menunggu Persetujuan Kurir', 'Tugas Diterima Kurir', 'Kurir Dalam Perjalanan', 'Driver Sampai', 'Menunggu Konfirmasi Cabang']
  const rows = useMemo(() => requests.filter((row) => { const matchStatus = status === 'Semua' || (status === 'Aktif' ? activeStatuses.includes(row.status) : row.status === status); const haystack = `${row.code} ${row.material_name} ${row.warehouse_name} ${row.courier_name} ${row.status}`.toLowerCase(); return matchStatus && (!keyword || haystack.includes(keyword.toLowerCase())) }), [requests, status, keyword])
  const selectedRequest = useMemo(() => selectedId ? requests.find((row) => String(row.id) === String(selectedId)) || rows[0] : rows.find((row) => activeStatuses.includes(row.status)) || rows[0], [requests, rows, selectedId])
  const branch = useMemo(() => (Array.isArray(data.branches) ? data.branches : []).find((item) => String(item.id) === String(user?.branch_id || selectedRequest?.branch_id)) || (data.branches || [])[0], [data.branches, selectedRequest?.branch_id, user?.branch_id])
  const locations = data.actor_locations || {}
  const savedBranchLocation = pointFromLocation(locations[`branch:${user?.branch_id || selectedRequest?.branch_id || branch?.id}`] || locations.branch)
  const branchDeviceLocation = deviceLocation || savedBranchLocation
  const mapDelivery = selectedRequest ? { id: selectedRequest.id, code: selectedRequest.code, order_code: selectedRequest.code, status: selectedRequest.status, map_type: 'branch_request', delivery_type: 'branch_request', courier_id: selectedRequest.courier_id, courier_name: selectedRequest.courier_name, current_lat: selectedRequest.current_lat, current_lng: selectedRequest.current_lng, destination_role: 'branch', destination_label: branch?.name || selectedRequest.branch_name || 'Cabang', destination_lat: branchDeviceLocation?.latitude, destination_lng: branchDeviceLocation?.longitude, destination_address: branch?.address || selectedRequest.branch_name || 'Lokasi cabang/perangkat cabang', proof_photo: selectedRequest.proof_photo, proof_note: selectedRequest.proof_note, proof_uploaded_at: selectedRequest.proof_uploaded_at } : null
  const statuses = useMemo(() => ['Semua', 'Aktif', ...Array.from(new Set(requests.map((item) => item.status).filter(Boolean)))], [requests])
  const columns = [
    { key: 'code', label: 'Kode' }, { key: 'material_name', label: 'Barang' }, { key: 'quantity', label: 'Jumlah', render: (row) => `${row.quantity} ${row.unit}` }, { key: 'courier_name', label: 'Kurir Gudang' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> }, { key: 'action', label: 'Maps', render: (row) => <button type="button" className="soft-action" onClick={() => setSelectedId(String(row.id))}>Lihat Maps</button> },
  ]
  return (
    <>
      <section className="page-head-card"><div><span>Cabang</span><h2>Monitoring Maps Cabang</h2><p>Cabang hanya memantau kurir gudang yang sedang mengirim barang ke cabangnya sendiri.</p></div><div className="head-actions">{selectedRequest && <StatusBadge>{selectedRequest.status}</StatusBadge>}<button type="button" onClick={refreshData}>Refresh</button></div></section>
      <section className="content-grid two-one"><article className="panel-card wide"><TrackingMap delivery={mapDelivery} deviceLocation={branchDeviceLocation} viewerUser={user} hidePickup useDeviceAsDestination /></article><article className="panel-card"><div className="panel-head"><div><span>Detail Monitoring</span><h3>{selectedRequest?.code || 'Belum ada request'}</h3></div></div>{selectedRequest ? <><div className="detail-stack compact-detail"><p><b>Barang</b><span>{selectedRequest.material_name}</span></p><p><b>Jumlah</b><span>{selectedRequest.quantity} {selectedRequest.unit}</span></p><p><b>Kurir</b><span>{selectedRequest.courier_name || 'Belum ditugaskan'}</span></p><p><b>Status</b><span>{selectedRequest.status}</span></p><p><b>Lokasi cabang</b><span>{locationStatus || '-'}</span></p></div><DeliveryProof delivery={selectedRequest} /></> : <p className="muted-text">Belum ada request barang dari cabang.</p>}{locationError && <p className="error-box">{locationError}</p>}</article></section>
      <article className="panel-card"><div className="filter-bar"><input placeholder="Cari kode/barang/gudang/kurir/status" value={keyword} onChange={(event) => setKeyword(event.target.value)} /><select value={status} onChange={(e) => setStatus(e.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select><select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">Pilih request aktif otomatis</option>{requests.map((row) => <option key={row.id} value={row.id}>{row.code} - {row.material_name}</option>)}</select></div><ResponsiveTable columns={columns} rows={rows} /></article>
    </>
  )
}
