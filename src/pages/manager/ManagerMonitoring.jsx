import { useMemo, useState } from 'react'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import TrackingMap from '../../components/TrackingMap'
import DeliveryProof from '../../components/DeliveryProof'

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

function buildBranchMapDelivery(row, data = {}) {
  const locations = data.actor_locations || {}
  const warehouses = Array.isArray(data.warehouses) ? data.warehouses : []
  const branches = Array.isArray(data.branches) ? data.branches : []
  const warehouse = warehouses.find((item) => String(item.id) === String(row?.warehouse_id)) || warehouses[0]
  const branch = branches.find((item) => String(item.id) === String(row?.branch_id)) || branches[0]
  const warehouseLocation = pointFromLocation(locations[`warehouse:${row?.warehouse_id || warehouse?.id}`] || locations.warehouse)
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

export default function ManagerMonitoring({ data = {}, deviceLocation, refreshData, user }) {
  const deliveries = Array.isArray(data.deliveries) ? data.deliveries : []
  const branchRequests = Array.isArray(data.branch_requests) ? data.branch_requests : []
  const [status, setStatus] = useState('Aktif')
  const [type, setType] = useState('Semua')
  const [keyword, setKeyword] = useState('')
  const [selectedKey, setSelectedKey] = useState('')

  const items = useMemo(() => {
    const deliveryItems = deliveries.map((row) => ({
      key: `delivery:${row.id}`,
      type: 'Supplier → Gudang',
      source: row.pickup_address || row.supplier_name || '-',
      target: row.destination_address || row.warehouse_name || '-',
      code: row.code,
      order_code: row.order_code,
      status: row.status,
      actor: row.courier_name || '-',
      updated_at: row.recorded_at || '-',
      raw: row,
      mapDelivery: row,
      proof: row,
    }))
    const branchItems = branchRequests.map((row) => ({
      key: `branch:${row.id}`,
      type: 'Gudang → Cabang',
      source: row.warehouse_name || 'Gudang',
      target: row.branch_name || 'Cabang',
      code: row.code,
      order_code: row.code,
      status: row.status,
      actor: row.branch_name || '-',
      updated_at: row.updated_at || row.created_at || '-',
      raw: row,
      mapDelivery: buildBranchMapDelivery(row, data),
      proof: null,
    }))
    return [...deliveryItems, ...branchItems]
  }, [deliveries, branchRequests, data])

  const rows = useMemo(() => items.filter((row) => {
    const matchType = type === 'Semua' || row.type === type
    const matchStatus = status === 'Semua' || (status === 'Aktif' ? isActiveStatus(row.status) : row.status === status)
    const haystack = `${row.type} ${row.code} ${row.order_code} ${row.actor} ${row.source} ${row.target} ${row.status}`.toLowerCase()
    const matchKeyword = !keyword || haystack.includes(keyword.toLowerCase())
    return matchType && matchStatus && matchKeyword
  }), [items, type, status, keyword])

  const selected = useMemo(() => {
    if (selectedKey) return items.find((item) => item.key === selectedKey) || rows[0]
    return rows.find((item) => isActiveStatus(item.status)) || rows[0] || items[0]
  }, [items, rows, selectedKey])

  const statuses = useMemo(() => ['Semua', 'Aktif', ...Array.from(new Set(items.map((item) => item.status).filter(Boolean)))], [items])

  const columns = [
    { key: 'type', label: 'Jenis' },
    { key: 'code', label: 'Kode' },
    { key: 'actor', label: 'Aktor' },
    { key: 'source', label: 'Dari' },
    { key: 'target', label: 'Ke' },
    { key: 'updated_at', label: 'Update' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
    { key: 'action', label: 'Maps', render: (row) => <button type="button" className="soft-action" onClick={() => setSelectedKey(row.key)}>Pantau</button> },
  ]

  return (
    <>
      <section className="page-head-card">
        <div><span>Manajemen</span><h2>Monitoring Operasional Real-time</h2><p>Manager memantau pengiriman supplier ke gudang dan distribusi gudang ke cabang. Supplier tidak melihat rute cabang.</p></div>
        <div className="head-actions">
          {selected && <StatusBadge>{selected.status}</StatusBadge>}
          <button type="button" onClick={refreshData}>Refresh Data</button>
        </div>
      </section>

      <section className="content-grid two-one">
        <article className="panel-card wide"><TrackingMap delivery={selected?.mapDelivery} deviceLocation={deviceLocation} showUserLocation={Boolean(deviceLocation)} viewerUser={user} /></article>
        <article className="panel-card">
          <div className="panel-head"><div><span>Ringkasan Live</span><h3>{selected?.order_code || 'Belum ada monitoring'}</h3></div></div>
          {selected ? <div className="detail-stack"><p><b>Jenis</b><span>{selected.type}</span></p><p><b>Aktor</b><span>{selected.actor}</span></p><p><b>Status</b><span>{selected.status}</span></p><p><b>Update Terakhir</b><span>{selected.updated_at || '-'}</span></p><p><b>Dari</b><span>{selected.source}</span></p><p><b>Ke</b><span>{selected.target}</span></p></div> : <p className="muted-text">Belum ada aktivitas aktif.</p>}
          {selected?.proof && <DeliveryProof delivery={selected.proof} />}
        </article>
      </section>

      <article className="panel-card">
        <div className="filter-bar">
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Cari kode, PO, kurir, cabang, gudang, status..." />
          <select value={type} onChange={(event) => setType(event.target.value)}><option>Semua</option><option>Supplier → Gudang</option><option>Gudang → Cabang</option></select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)}>
            <option value="">Pilih otomatis aktivitas aktif</option>
            {rows.map((row) => <option key={row.key} value={row.key}>{row.type} - {row.code}</option>)}
          </select>
        </div>
        <ResponsiveTable columns={columns} rows={rows} />
      </article>
    </>
  )
}
