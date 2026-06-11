import { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import ResponsiveTable from '../../components/ResponsiveTable'
import { recordBranchSale } from '../../services/api'
function belongs(row, user) { return !user?.branch_id || String(row.branch_id || '') === String(user.branch_id || '') }
const emptyForm = { material_id: '', quantity: '', notes: '' }
export default function BranchSales({ data = {}, user, refreshData }) {
  const stocks = (Array.isArray(data.branch_stocks) ? data.branch_stocks : []).filter((row) => belongs(row, user))
  const sales = (Array.isArray(data.branch_sales) ? data.branch_sales : []).filter((row) => belongs(row, user))
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [modal, setModal] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const selectedStock = stocks.find((item) => String(item.material_id) === String(form.material_id))
  const filtered = useMemo(() => sales.filter((row) => [row.code, row.material_name, row.created_by, row.notes].some((v) => String(v || '').toLowerCase().includes(search.toLowerCase()))), [sales, search])
  function updateField(key, value) { setForm((prev) => ({ ...prev, [key]: value })) }
  async function submitSale(e) { e.preventDefault(); setSaving(true); setMessage(''); try { await recordBranchSale({ branch_id: user?.branch_id, material_id: Number(form.material_id), quantity: Number(form.quantity), unit: selectedStock?.unit, notes: form.notes, created_by: user?.name || 'Cabang' }); setModal(null); setForm(emptyForm); setMessage('Penjualan berhasil dicatat dan stok cabang berkurang.'); await refreshData?.() } catch (error) { setMessage(error.message || 'Gagal mencatat penjualan.') } finally { setSaving(false) } }
  const columns = [{ key: 'created_at', label: 'Tanggal' }, { key: 'code', label: 'Kode' }, { key: 'material_name', label: 'Barang' }, { key: 'quantity', label: 'Jumlah', render: (row) => `${row.quantity} ${row.unit}` }, { key: 'created_by', label: 'Dicatat Oleh' }, { key: 'notes', label: 'Catatan' }]
  return <><section className="page-head-card"><div><span>Cabang</span><h2>Penjualan Cabang</h2><p>Catat penjualan agar stok cabang berkurang dan laporan manajemen otomatis terbarui.</p></div><div className="head-actions"><button type="button" onClick={() => setModal('sale')}>+ Catat Penjualan</button></div></section>{message && <div className="api-alert">{message}</div>}<article className="panel-card"><div className="filter-bar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari transaksi, barang, catatan..." /></div><ResponsiveTable columns={columns} rows={filtered} /></article><Modal open={modal === 'sale'} title="Catat Penjualan Cabang" onClose={() => setModal(null)} size="lg"><form className="mini-form modal-form-grid" onSubmit={submitSale}><label>Barang Terjual</label><select value={form.material_id} onChange={(e) => updateField('material_id', e.target.value)} required><option value="">Pilih stok cabang</option>{stocks.map((item) => <option key={item.material_id} value={item.material_id}>{item.material_name} — stok {item.stock} {item.unit}</option>)}</select><label>Jumlah Terjual</label><input type="number" min="1" max={selectedStock?.stock || undefined} value={form.quantity} onChange={(e) => updateField('quantity', e.target.value)} required /><label>Catatan</label><textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Contoh: penjualan shift pagi" /><button className="login-button" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Penjualan'}</button></form></Modal></>
}
