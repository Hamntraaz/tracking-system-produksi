import { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import { updateBranchRequest } from '../../services/api'

export default function WarehouseBranchRequests({ data = {}, user, refreshData }) {
  const requests = Array.isArray(data.branch_requests) ? data.branch_requests : []
  const [filters, setFilters] = useState({ search: '', status: 'Semua' })
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const filtered = useMemo(() => requests.filter((row) => (filters.status === 'Semua' || row.status === filters.status) && [row.code, row.branch_name, row.material_name, row.status].some((v) => String(v || '').toLowerCase().includes(filters.search.toLowerCase()))), [requests, filters])
  function openAction(row, nextAction) { setSelected(row); setAction(nextAction); setReason(''); setMessage('') }
  async function submitAction() {
    if (!selected || !action) return
    setSaving(true); setMessage('')
    try { await updateBranchRequest({ id: selected.id, action, reason, approved_by: user?.name || 'Gudang' }); setSelected(null); setAction(''); setMessage('Permintaan cabang berhasil diproses.'); await refreshData?.() }
    catch (error) { setMessage(error.message || 'Gagal memproses permintaan cabang.') } finally { setSaving(false) }
  }
  const columns = [
    { key: 'code', label: 'Kode' }, { key: 'branch_name', label: 'Cabang' }, { key: 'material_name', label: 'Barang' }, { key: 'quantity', label: 'Jumlah', render: (row) => `${row.quantity} ${row.unit}` }, { key: 'created_at', label: 'Tanggal' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
    { key: 'actions', label: 'Aksi', render: (row) => <div className="table-actions"><button type="button" onClick={() => openAction(row, 'approve')} disabled={row.status !== 'Menunggu Persetujuan Gudang'}>Setujui</button><button type="button" className="soft-success" onClick={() => openAction(row, 'send')} disabled={!['Disetujui Gudang', 'Menunggu Persetujuan Gudang'].includes(row.status)}>Kirim</button><button type="button" className="soft-danger" onClick={() => openAction(row, 'reject')} disabled={['Ditolak Gudang', 'Diterima Cabang'].includes(row.status)}>Tolak</button></div> },
  ]
  const actionLabel = action === 'approve' ? 'menyetujui' : action === 'send' ? 'mengirim barang ke cabang' : 'menolak'
  return <><section className="page-head-card"><div><span>Gudang</span><h2>Permintaan Barang dari Cabang</h2><p>Gudang menyetujui, menolak, atau mengirim stok ke cabang. Saat dikirim, stok gudang otomatis berkurang.</p></div></section>{message && <div className="api-alert">{message}</div>}<article className="panel-card"><div className="filter-bar"><input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Cari kode, cabang, barang..." /><select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}><option>Semua</option><option>Menunggu Persetujuan Gudang</option><option>Disetujui Gudang</option><option>Dikirim ke Cabang</option><option>Diterima Cabang</option><option>Ditolak Gudang</option></select></div><ResponsiveTable columns={columns} rows={filtered} /></article><Modal open={Boolean(selected)} title="Konfirmasi Proses Permintaan" onClose={() => setSelected(null)}><div className="confirm-modal-content"><p>Anda akan <b>{actionLabel}</b> untuk <b>{selected?.code}</b> dari {selected?.branch_name}.</p><p className="helper-box">{selected?.material_name} — {selected?.quantity} {selected?.unit}</p>{action === 'reject' && <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan penolakan" />}<div className="modal-actions"><button type="button" className="soft-action" onClick={() => setSelected(null)}>Batal</button><button type="button" className={action === 'reject' ? 'soft-danger' : 'soft-success'} onClick={submitAction} disabled={saving}>{saving ? 'Memproses...' : 'Konfirmasi'}</button></div></div></Modal></>
}
