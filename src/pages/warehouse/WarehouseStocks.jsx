import { useMemo, useState } from 'react'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import { upsertMaterial } from '../../services/api'

const emptyForm = { id: '', name: '', category: '', unit: 'Kg', stock: '', minimum_stock: '' }

export default function WarehouseStocks({ data = {}, refreshData }) {
  const materials = Array.isArray(data.materials) ? data.materials : []
  const movements = Array.isArray(data.movements) ? data.movements : []
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const recentMovements = useMemo(() => movements.slice(0, 8), [movements])

  function editMaterial(row) {
    setForm({ id: row.id, name: row.name || '', category: row.category || '', unit: row.unit || 'Kg', stock: row.stock ?? '', minimum_stock: row.minimum_stock ?? '' })
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submitMaterial(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await upsertMaterial({ ...form, id: form.id ? Number(form.id) : 0, stock: Number(form.stock || 0), minimum_stock: Number(form.minimum_stock || 0) })
      setMessage(form.id ? 'Data bahan baku berhasil diperbarui.' : 'Bahan baku baru berhasil ditambahkan.')
      setForm(emptyForm)
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal menyimpan bahan baku.')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'code', label: 'Kode' },
    { key: 'name', label: 'Bahan' },
    { key: 'category', label: 'Kategori' },
    { key: 'stock', label: 'Stok', render: (row) => `${row.stock} ${row.unit}` },
    { key: 'minimum_stock', label: 'Minimum', render: (row) => `${row.minimum_stock} ${row.unit}` },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
    { key: 'actions', label: 'Aksi', render: (row) => <button type="button" className="soft-action compact" onClick={() => editMaterial(row)}>Edit</button> },
  ]

  const movementColumns = [
    { key: 'created_at', label: 'Tanggal' },
    { key: 'material_name', label: 'Bahan' },
    { key: 'movement_type', label: 'Tipe', render: (row) => <StatusBadge>{row.movement_type === 'IN' ? 'Masuk' : row.movement_type === 'OUT' ? 'Keluar' : 'Koreksi'}</StatusBadge> },
    { key: 'quantity', label: 'Jumlah', render: (row) => `${row.quantity} ${row.unit}` },
    { key: 'source_type', label: 'Sumber' },
    { key: 'stock_after', label: 'Stok Akhir' },
  ]

  return (
    <>
      <section className="page-head-card"><div><span>Gudang/Cabang</span><h2>Stok Bahan Baku</h2><p>Kelola bahan baku, stok minimum, dan lihat riwayat stok masuk/keluar.</p></div></section>
      {message && <div className="api-alert">{message}</div>}
      <section className="content-grid two-one">
        <article className="panel-card wide"><ResponsiveTable columns={columns} rows={materials} /></article>
        <article className="panel-card">
          <div className="panel-head"><div><span>{form.id ? 'Edit' : 'Tambah'}</span><h3>Data Bahan</h3></div></div>
          <form className="mini-form" onSubmit={submitMaterial}>
            <label>Nama Bahan</label>
            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Contoh: Ayam Potong" required />
            <label>Kategori</label>
            <input value={form.category} onChange={(event) => updateField('category', event.target.value)} placeholder="Bahan Utama / Topping" />
            <label>Satuan</label>
            <input value={form.unit} onChange={(event) => updateField('unit', event.target.value)} placeholder="Kg, Liter, Botol" required />
            <label>Stok Saat Ini</label>
            <input type="number" min="0" value={form.stock} onChange={(event) => updateField('stock', event.target.value)} required />
            <label>Stok Minimum</label>
            <input type="number" min="0" value={form.minimum_stock} onChange={(event) => updateField('minimum_stock', event.target.value)} required />
            <button className="login-button" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : form.id ? 'Update Bahan' : 'Simpan Bahan'}</button>
            {form.id && <button type="button" className="soft-action" onClick={() => setForm(emptyForm)}>Batal Edit</button>}
          </form>
        </article>
      </section>
      <article className="panel-card"><div className="panel-head"><div><span>Riwayat</span><h3>Stok Masuk & Keluar Terbaru</h3></div></div><ResponsiveTable columns={movementColumns} rows={recentMovements} /></article>
    </>
  )
}
