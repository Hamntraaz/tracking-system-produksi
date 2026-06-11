import { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import DeliveryProof from '../../components/DeliveryProof'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import { createBranchRequest } from '../../services/api'
function belongs(row, user) { return !user?.branch_id || String(row.branch_id || '') === String(user.branch_id || '') }
const emptyForm = { material_id: '', quantity: '', notes: '' }
export default function BranchRequests({ data = {}, user, refreshData }) {
  const materials = Array.isArray(data.materials) ? data.materials : []
  const requests = (Array.isArray(data.branch_requests) ? data.branch_requests : []).filter((row) => belongs(row, user))
  const [filters, setFilters] = useState({ search: '', status: 'Semua' })
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const filtered = useMemo(() => requests.filter((row) => (filters.status === 'Semua' || row.status === filters.status) && [row.code, row.material_name, row.status].some((v) => String(v || '').toLowerCase().includes(filters.search.toLowerCase()))), [requests, filters])
  const selectedMaterial = materials.find((item) => String(item.id) === String(form.material_id))
  function updateField(key, value) { setForm((prev) => ({ ...prev, [key]: value })) }
  async function submitRequest(e) { e.preventDefault(); setSaving(true); setMessage(''); try { await createBranchRequest({ branch_id: user?.branch_id, material_id: Number(form.material_id), quantity: Number(form.quantity), unit: selectedMaterial?.unit, notes: form.notes, requested_by: user?.name || 'Cabang' }); setModal(null); setForm(emptyForm); setMessage('Request barang berhasil dikirim ke gudang.'); await refreshData?.() } catch (error) { setMessage(error.message || 'Gagal membuat request barang.') } finally { setSaving(false) } }
  const columns = [
    { key: 'code', label: 'Kode' }, { key: 'material_name', label: 'Barang' }, { key: 'quantity', label: 'Jumlah', render: (row) => `${row.quantity} ${row.unit}` }, { key: 'created_at', label: 'Tanggal' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> }, { key: 'actions', label: 'Bukti Barang', render: (row) => row.proof_photo ? <button type="button" className="soft-action compact" onClick={() => setSelected(row)}>Lihat Bukti</button> : <span className="muted-text">Belum ada</span> },
  ]
  return <><section className="page-head-card"><div><span>Cabang</span><h2>Request Barang ke Gudang</h2><p>Cabang membuat permintaan barang ke gudang. Setelah kurir gudang mengupload bukti, stok cabang otomatis bertambah dan bukti bisa dilihat di sini.</p></div><div className="head-actions"><button type="button" onClick={() => setModal('request')}>+ Request Barang</button></div></section>{message && <div className="api-alert">{message}</div>}<article className="panel-card"><div className="filter-bar"><input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Cari kode, barang, status..." /><select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}><option>Semua</option><option>Menunggu Persetujuan Gudang</option><option>Disetujui Gudang</option><option>Dikirim ke Cabang</option><option>Menunggu Persetujuan Kurir</option><option>Tugas Diterima Kurir</option><option>Kurir Dalam Perjalanan</option><option>Driver Sampai</option><option>Menunggu Konfirmasi Cabang</option><option>Diterima Cabang</option><option>Ditolak Gudang</option></select></div><ResponsiveTable columns={columns} rows={filtered} /></article><Modal open={modal === 'request'} title="Buat Request Barang ke Gudang" onClose={() => setModal(null)} size="lg"><form className="mini-form modal-form-grid" onSubmit={submitRequest}><label>Barang</label><select value={form.material_id} onChange={(e) => updateField('material_id', e.target.value)} required><option value="">Pilih barang</option>{materials.map((item) => <option key={item.id} value={item.id}>{item.name} — stok gudang {item.stock} {item.unit}</option>)}</select><label>Jumlah Diminta</label><input type="number" min="1" value={form.quantity} onChange={(e) => updateField('quantity', e.target.value)} required /><label>Catatan</label><textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Contoh: stok cabang hampir habis" /><button className="login-button" disabled={saving}>{saving ? 'Mengirim...' : 'Kirim Request'}</button></form></Modal><Modal open={Boolean(selected)} title={`Bukti Barang ${selected?.code || ''}`} onClose={() => setSelected(null)} size="lg">{selected && <DeliveryProof delivery={selected} />}</Modal></>
}
