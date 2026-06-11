import { useMemo, useState } from 'react'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import DeliveryProof from '../../components/DeliveryProof'

function isActiveStatus(status) { return !['Pengiriman Selesai', 'Pesanan Diterima', 'Selesai', 'Diterima Cabang', 'Ditolak Gudang'].includes(status) }
export default function ManagerMonitoring({ data = {}, refreshData }) {
  const deliveries = Array.isArray(data.deliveries) ? data.deliveries : []
  const branchRequests = Array.isArray(data.branch_requests) ? data.branch_requests : []
  const [status, setStatus] = useState('Aktif')
  const [type, setType] = useState('Semua')
  const [keyword, setKeyword] = useState('')
  const [proofModal, setProofModal] = useState(null)
  const items = useMemo(() => {
    const deliveryItems = deliveries.map((row) => ({ key: `delivery:${row.id}`, type: 'Supplier → Gudang', source: row.supplier_name || '-', target: row.warehouse_name || '-', code: row.code, order_code: row.order_code, status: row.status, actor: row.courier_name || '-', updated_at: row.recorded_at || '-', proof: row }))
    const branchItems = branchRequests.map((row) => ({ key: `branch:${row.id}`, type: 'Gudang → Cabang', source: row.warehouse_name || 'Gudang', target: row.branch_name || 'Cabang', code: row.code, order_code: row.code, status: row.status, actor: row.courier_name || '-', updated_at: row.updated_at || row.created_at || '-', proof: row }))
    return [...deliveryItems, ...branchItems]
  }, [deliveries, branchRequests])
  const rows = useMemo(() => items.filter((row) => { const matchType = type === 'Semua' || row.type === type; const matchStatus = status === 'Semua' || (status === 'Aktif' ? isActiveStatus(row.status) : row.status === status); const haystack = `${row.type} ${row.code} ${row.order_code} ${row.actor} ${row.source} ${row.target} ${row.status}`.toLowerCase(); return matchType && matchStatus && (!keyword || haystack.includes(keyword.toLowerCase())) }), [items, type, status, keyword])
  const statuses = useMemo(() => ['Semua', 'Aktif', ...Array.from(new Set(items.map((item) => item.status).filter(Boolean)))], [items])
  const columns = [
    { key: 'type', label: 'Jenis' }, { key: 'code', label: 'Kode' }, { key: 'actor', label: 'Kurir' }, { key: 'source', label: 'Dari' }, { key: 'target', label: 'Ke' }, { key: 'updated_at', label: 'Update' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> }, { key: 'proof', label: 'Bukti', render: (row) => row.proof?.proof_photo ? <button type="button" className="soft-action" onClick={() => setProofModal(row.proof)}>Lihat Bukti</button> : <span className="muted-text">-</span> },
  ]
  return <><section className="page-head-card"><div><span>Manajemen</span><h2>Monitoring Operasional</h2><p>Manager melihat ringkasan status operasional dan bukti pengiriman. Maps operasional detail tetap berada di role gudang, supplier, cabang, dan kurir.</p></div><div className="head-actions"><button type="button" onClick={refreshData}>Refresh Data</button></div></section><article className="panel-card"><div className="filter-bar"><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Cari kode, PO, kurir, cabang, gudang, status..." /><select value={type} onChange={(event) => setType(event.target.value)}><option>Semua</option><option>Supplier → Gudang</option><option>Gudang → Cabang</option></select><select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div><ResponsiveTable columns={columns} rows={rows} /></article>{proofModal && <article className="panel-card"><DeliveryProof delivery={proofModal} /></article>}</>
}
