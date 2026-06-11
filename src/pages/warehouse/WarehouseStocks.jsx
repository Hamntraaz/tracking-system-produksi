import { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import { upsertMaterial } from '../../services/api'

const emptyForm = { id: '', name: '', category: '', unit: 'Kg', stock: '', minimum_stock: '' }
function match(row, keyword) { return [row.name, row.category, row.code, row.status].some((v) => String(v || '').toLowerCase().includes(keyword.toLowerCase())) }

export default function WarehouseStocks({ data = {}, refreshData }) {
  const materials = Array.isArray(data.materials) ? data.materials : []
  const movements = Array.isArray(data.movements) ? data.movements : []
  const [filters, setFilters] = useState({ search: '', status: 'Semua' })
  const [form, setForm] = useState(emptyForm)
  const [modal, setModal] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const filteredMaterials = useMemo(() => materials.filter((row) => (filters.status === 'Semua' || row.status === filters.status) && match(row, filters.search)), [materials, filters])
  const filteredMovements = useMemo(() => movements.filter((row) => [row.material_name, row.source_type, row.movement_type, row.created_by].some((v) => String(v || '').toLowerCase().includes(filters.search.toLowerCase()))).slice(0, 12), [movements, filters.search])

  function updateField(key, value) { setForm((prev) => ({ ...prev, [key]: value })) }
  function openCreate() { setForm(emptyForm); setModal('material') }
  function editMaterial(row) { setForm({ id: row.id, name: row.name || '', category: row.category || '', unit: row.unit || 'Kg', stock: row.stock ?? '', minimum_stock: row.minimum_stock ?? '' }); setModal('material') }
  async function submitMaterial(event) {
    event.preventDefault(); setSaving(true); setMessage('')
    try { await upsertMaterial({ ...form, id: form.id ? Number(form.id) : 0, stock: Number(form.stock || 0), minimum_stock: Number(form.minimum_stock || 0) }); setModal(null); setMessage(form.id ? 'Data stok gudang diperbarui.' : 'Item stok gudang ditambahkan.'); await refreshData?.() }
    catch (error) { setMessage(error.message || 'Gagal menyimpan stok gudang.') } finally { setSaving(false) }
  }

  const columns = [
    { key: 'code', label: 'Kode' }, { key: 'name', label: 'Barang/Bahan' }, { key: 'category', label: 'Kategori' },
    { key: 'stock', label: 'Stok Gudang', render: (row) => `${row.stock} ${row.unit}` }, { key: 'minimum_stock', label: 'Minimum', render: (row) => `${row.minimum_stock} ${row.unit}` },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> }, { key: 'actions', label: 'Aksi', render: (row) => <button type="button" className="soft-action compact" onClick={() => editMaterial(row)}>Edit</button> },
  ]
  const movementColumns = [
    { key: 'created_at', label: 'Tanggal' }, { key: 'material_name', label: 'Barang' }, { key: 'movement_type', label: 'Tipe', render: (row) => <StatusBadge>{row.movement_type === 'IN' ? 'Masuk' : 'Keluar'}</StatusBadge> }, { key: 'source_type', label: 'Sumber' }, { key: 'quantity', label: 'Jumlah', render: (row) => `${row.quantity} ${row.unit}` }, { key: 'stock_after', label: 'Stok Akhir' },
  ]

  return (
    <>
      <section className="page-head-card"><div><span>Gudang</span><h2>Stok Gudang</h2><p>Gudang menyimpan stok pusat. Stok bertambah dari supplier dan berkurang saat dikirim ke cabang.</p></div><div className="head-actions"><button type="button" onClick={openCreate}>+ Item Stok</button></div></section>
      {message && <div className="api-alert">{message}</div>}
      <article className="panel-card"><div className="filter-bar"><input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Cari barang, kategori, kode..." /><select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}><option>Semua</option><option>Aman</option><option>Menipis</option><option>Kosong</option></select></div><ResponsiveTable columns={columns} rows={filteredMaterials} /></article>
      <article className="panel-card"><div className="panel-head"><div><span>Riwayat</span><h3>Pergerakan Stok Gudang</h3></div></div><ResponsiveTable columns={movementColumns} rows={filteredMovements} /></article>
      <Modal open={modal === 'material'} title={form.id ? 'Edit Stok Gudang' : 'Tambah Item Stok Gudang'} onClose={() => setModal(null)} size="lg"><form className="mini-form modal-form-grid" onSubmit={submitMaterial}><label>Nama Barang/Bahan</label><input value={form.name} onChange={(e) => updateField('name', e.target.value)} required /><label>Kategori</label><input value={form.category} onChange={(e) => updateField('category', e.target.value)} /><label>Satuan</label><input value={form.unit} onChange={(e) => updateField('unit', e.target.value)} required /><label>Stok Saat Ini</label><input type="number" min="0" value={form.stock} onChange={(e) => updateField('stock', e.target.value)} required /><label>Stok Minimum</label><input type="number" min="0" value={form.minimum_stock} onChange={(e) => updateField('minimum_stock', e.target.value)} required /><button className="login-button" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button></form></Modal>
    </>
  )
}
