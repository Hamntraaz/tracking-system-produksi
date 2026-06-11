import { useMemo, useState } from 'react'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import TrackingMap from '../../components/TrackingMap'

function belongs(row, user) {
  return !user?.branch_id || String(row.branch_id || '') === String(user.branch_id || '')
}

function pointFromLocation(location) {
  if (!location) return null
  const lat = Number(location.latitude)
  const lng = Number(location.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { latitude: lat, longitude: lng, accuracy: Number(location.accuracy || 0), recorded_at: location.created_at }
}

export default function BranchTracking({ data = {}, user, deviceLocation, locationStatus, locationError, refreshData }) {
  const requests = (Array.isArray(data.branch_requests) ? data.branch_requests : []).filter((row) => belongs(row, user))
  const [status, setStatus] = useState('Semua')
  const [keyword, setKeyword] = useState('')
  const [selectedId, setSelectedId] = useState('')

  const rows = useMemo(() => requests.filter((row) => {
    const matchStatus = status === 'Semua' || row.status === status
    const haystack = `${row.code} ${row.material_name} ${row.warehouse_name} ${row.status}`.toLowerCase()
    const matchKeyword = !keyword || haystack.includes(keyword.toLowerCase())
    return matchStatus && matchKeyword
  }), [requests, status, keyword])
  const selectedRequest = useMemo(() => {
    if (selectedId) return requests.find((row) => String(row.id) === String(selectedId)) || requests[0]
    return requests.find((row) => !['Diterima Cabang', 'Ditolak Gudang'].includes(row.status)) || requests[0]
  }, [requests, selectedId])

  const branch = useMemo(() => {
    const list = Array.isArray(data.branches) ? data.branches : []
    return list.find((item) => String(item.id) === String(user?.branch_id || selectedRequest?.branch_id)) || list[0]
  }, [data.branches, selectedRequest?.branch_id, user?.branch_id])

  const warehouse = useMemo(() => {
    const list = Array.isArray(data.warehouses) ? data.warehouses : []
    return list.find((item) => String(item.id) === String(selectedRequest?.warehouse_id)) || list[0]
  }, [data.warehouses, selectedRequest?.warehouse_id])

  const locations = data.actor_locations || {}
  const warehouseLocation = pointFromLocation(locations[`warehouse:${selectedRequest?.warehouse_id || warehouse?.id}`] || locations.warehouse)
  const savedBranchLocation = pointFromLocation(locations[`branch:${user?.branch_id || selectedRequest?.branch_id || branch?.id}`] || locations.branch)
  const branchDeviceLocation = deviceLocation || savedBranchLocation

  const mapDelivery = selectedRequest ? {
    id: selectedRequest.id,
    code: selectedRequest.code,
    status: selectedRequest.status,
    map_type: 'branch_request',
    pickup_role: 'warehouse',
    pickup_label: warehouse?.name || selectedRequest.warehouse_name || 'Gudang',
    pickup_lat: warehouseLocation?.latitude,
    pickup_lng: warehouseLocation?.longitude,
    pickup_address: warehouse?.address || selectedRequest.warehouse_name || 'Lokasi gudang',
    destination_role: 'branch',
    destination_label: branch?.name || selectedRequest.branch_name || 'Cabang',
    destination_lat: branchDeviceLocation?.latitude,
    destination_lng: branchDeviceLocation?.longitude,
    destination_address: branch?.address || selectedRequest.branch_name || 'Lokasi cabang/perangkat cabang',
  } : null

  const columns = [
    { key: 'code', label: 'Kode' },
    { key: 'material_name', label: 'Barang' },
    { key: 'quantity', label: 'Jumlah', render: (row) => `${row.quantity} ${row.unit}` },
    { key: 'warehouse_name', label: 'Gudang' },
    { key: 'updated_at', label: 'Update' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
    { key: 'action', label: 'Maps', render: (row) => <button type="button" className="soft-action" onClick={() => setSelectedId(String(row.id))}>Lihat Maps</button> },
  ]

  return (
    <>
      <section className="page-head-card">
        <div>
          <span>Cabang</span>
          <h2>Monitoring Maps Cabang</h2>
          <p>Pantau request barang dari gudang ke cabang. Marker cabang memakai ikon khusus cabang, sedangkan lokasi perangkat menampilkan posisi cabang saat ini.</p>
        </div>
        <div className="head-actions">
          {selectedRequest && <StatusBadge>{selectedRequest.status}</StatusBadge>}
          <button type="button" onClick={refreshData}>Refresh</button>
        </div>
      </section>

      <section className="content-grid two-one">
        <article className="panel-card wide">
          <TrackingMap delivery={mapDelivery} deviceLocation={branchDeviceLocation} showUserLocation={Boolean(branchDeviceLocation)} viewerUser={user} />
        </article>
        <article className="panel-card">
          <div className="panel-head">
            <div><span>Detail Monitoring</span><h3>{selectedRequest?.code || 'Belum ada request'}</h3></div>
          </div>
          {selectedRequest ? (
            <div className="detail-stack">
              <p><b>Barang</b><span>{selectedRequest.material_name}</span></p>
              <p><b>Jumlah</b><span>{selectedRequest.quantity} {selectedRequest.unit}</span></p>
              <p><b>Gudang</b><span>{warehouse?.name || selectedRequest.warehouse_name || '-'}</span></p>
              <p><b>Cabang</b><span>{branch?.name || selectedRequest.branch_name || '-'}</span></p>
              <p><b>Status</b><span>{selectedRequest.status}</span></p>
              <p><b>Lokasi perangkat ini</b><span>{locationStatus || '-'}</span></p>
              <p><b>Koordinat cabang</b><span>{branchDeviceLocation ? `${Number(branchDeviceLocation.latitude).toFixed(6)}, ${Number(branchDeviceLocation.longitude).toFixed(6)}` : '-'}</span></p>
            </div>
          ) : <p className="muted-text">Belum ada request barang dari cabang.</p>}
          {locationError && <p className="error-box">{locationError}</p>}
        </article>
      </section>

      <article className="panel-card">
        <div className="filter-bar">
          <input placeholder="Cari kode/barang/gudang/status" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Semua</option>
            <option>Menunggu Persetujuan Gudang</option>
            <option>Disetujui Gudang</option>
            <option>Dikirim ke Cabang</option>
            <option>Diterima Cabang</option>
            <option>Ditolak Gudang</option>
          </select>
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            <option value="">Pilih request aktif otomatis</option>
            {requests.map((row) => <option key={row.id} value={row.id}>{row.code} - {row.material_name}</option>)}
          </select>
        </div>
        <ResponsiveTable columns={columns} rows={rows} />
      </article>
    </>
  )
}
