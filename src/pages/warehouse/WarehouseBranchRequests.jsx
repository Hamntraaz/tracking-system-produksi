import { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import { updateBranchRequest } from '../../services/api'

export default function WarehouseBranchRequests({ data = {}, user, refreshData }) {
  const requests = (Array.isArray(data.branch_requests) ? data.branch_requests : []).filter((row) => !user?.warehouse_id || !row.warehouse_id || String(row.warehouse_id) === String(user.warehouse_id))
  const warehouseCouriers = (Array.isArray(data.couriers) ? data.couriers : []).filter((row) => String(row.warehouse_id || '') === String(user?.warehouse_id || '') && row.status !== 'Nonaktif')
  const [filters, setFilters] = useState({ search: '', status: 'Semua' })
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState('')
  const [reason, setReason] = useState('')
  const [courierId, setCourierId] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const filtered = useMemo(() => requests.filter((row) => (filters.status === 'Semua' || row.status === filters.status) && [row.code, row.branch_name, row.material_name, row.status, row.courier_name].some((v) => String(v || '').toLowerCase().includes(filters.search.toLowerCase()))), [requests, filters])
  function openAction(row, nextAction) { setSelected(row); setAction(nextAction); setReason(''); setCourierId(row.courier_id || ''); setMessage('') }
  async function submitAction() {
    if (!selected || !action) return
    if (action === 'send' && !courierId) { setMessage('Pilih kurir gudang terlebih dahulu sebelum mengirim ke cabang.'); return }
    setSaving(true); setMessage('')
    try { await updateBranchRequest({ id: selected.id, action, reason, courier_id: courierId, approved_by: user?.name || 'Gudang' }); setSelected(null); setAction(''); setMessage('Permintaan cabang berhasil diproses.'); await refreshData?.() }
    catch (error) { setMessage(error.message || 'Gagal memproses permintaan cabang.') } finally { setSaving(false) }
  }
  const columns = [
    { key: 'code', label: 'Kode' }, { key: 'branch_name', label: 'Cabang' }, { key: 'material_name', label: 'Barang' }, { key: 'quantity', label: 'Jumlah', render: (row) => `${row.quantity} ${row.unit}` }, { key: 'courier_name', label: 'Kurir' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
    { key: 'actions', label: 'Aksi', render: (row) => <div className="table-actions"><button type="button" onClick={() => openAction(row, 'approve')} disabled={row.status !== 'Menunggu Persetujuan Gudang'}>Setujui</button><button type="button" className="soft-success" onClick={() => openAction(row, 'send')} disabled={!['Disetujui Gudang', 'Menunggu Persetujuan Gudang'].includes(row.status)}>Kirim</button><button type="button" className="soft-danger" onClick={() => openAction(row, 'reject')} disabled={['Ditolak Gudang', 'Diterima Cabang'].includes(row.status)}>Tolak</button></div> },
  ]
  const actionLabel = action === 'approve' ? 'menyetujui' : action === 'send' ? 'menugaskan kurir gudang dan mengirim barang ke cabang' : 'menolak'
  return <><section className="page-head-card"><div><span>Gudang</span><h2>Permintaan Barang dari Cabang</h2><p>Gudang menyetujui, menolak, lalu memilih kurir gudang untuk distribusi ke cabang. Saat dikirim, stok gudang otomatis berkurang.</p></div></section>{message && <div className="api-alert">{message}</div>}<article className="panel-card"><div className="filter-bar"><input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Cari kode, cabang, barang, kurir..." /><select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}><option>Semua</option><option>Menunggu Persetujuan Gudang</option><option>Disetujui Gudang</option><option>Menunggu Persetujuan Kurir</option><option>Tugas Diterima Kurir</option><option>Kurir Dalam Perjalanan</option><option>Driver Sampai</option><option>Menunggu Konfirmasi Cabang</option><option>Diterima Cabang</option><option>Ditolak Gudang</option><option>Ditolak Kurir</option></select></div><ResponsiveTable columns={columns} rows={filtered} /></article><Modal open={Boolean(selected)} title="Konfirmasi Proses Permintaan" onClose={() => setSelected(null)} size="lg"><div className="confirm-modal-content"><p>Anda akan <b>{actionLabel}</b> untuk <b>{selected?.code}</b> dari {selected?.branch_name}.</p><p className="helper-box">{selected?.material_name} — {selected?.quantity} {selected?.unit}</p>{action === 'send' && <><label>Pilih Kurir Gudang</label><select value={courierId} onChange={(e) => setCourierId(e.target.value)}><option value="">Pilih kurir gudang</option>{warehouseCouriers.map((courier) => <option key={courier.id} value={courier.id}>{courier.name} — {courier.status}</option>)}</select>{warehouseCouriers.length === 0 && <p className="warning-box">Belum ada kurir gudang. Tambahkan dulu di menu Kurir Gudang.</p>}</>}{action === 'reject' && <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan penolakan" />}<div className="modal-actions"><button type="button" className="soft-action" onClick={() => setSelected(null)}>Batal</button><button type="button" className={action === 'reject' ? 'soft-danger' : 'soft-success'} onClick={submitAction} disabled={saving}>{saving ? 'Memproses...' : 'Konfirmasi'}</button></div></div></Modal></>
}
