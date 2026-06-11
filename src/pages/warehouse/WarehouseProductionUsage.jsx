import { useMemo, useState } from 'react'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import { recordProductionUsage } from '../../services/api'

export default function WarehouseProductionUsage({ data = {}, user = {}, refreshData }) {
  const materials = Array.isArray(data.materials) ? data.materials : []
  const movements = Array.isArray(data.movements) ? data.movements.filter((item) => item.movement_type === 'OUT') : []
  const [form, setForm] = useState({ material_id: materials[0]?.id || '', quantity: '', notes: '' })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedMaterial = useMemo(() => materials.find((item) => String(item.id) === String(form.material_id)), [materials, form.material_id])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submitUsage(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await recordProductionUsage({
        material_id: Number(form.material_id),
        quantity: Number(form.quantity),
        notes: form.notes || 'Pemakaian produksi harian',
        created_by: user?.name || 'Gudang',
      })
      setMessage('Pemakaian produksi berhasil dicatat. Stok otomatis berkurang dan laporan manajemen diperbarui.')
      setForm({ material_id: materials[0]?.id || '', quantity: '', notes: '' })
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal mencatat pemakaian produksi.')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'created_at', label: 'Tanggal' },
    { key: 'material_name', label: 'Bahan' },
    { key: 'quantity', label: 'Jumlah', render: (row) => `${row.quantity} ${row.unit}` },
    { key: 'stock_before', label: 'Stok Awal' },
    { key: 'stock_after', label: 'Stok Akhir' },
    { key: 'notes', label: 'Catatan' },
    { key: 'source_type', label: 'Jenis', render: (row) => <StatusBadge>{row.source_type}</StatusBadge> },
  ]

  return (
    <>
      <section className="page-head-card">
        <div>
          <span>Gudang</span>
          <h2>Pemakaian Produksi</h2>
          <p>Catat bahan yang dipakai untuk produksi agar stok berkurang secara resmi, bukan berubah tiba-tiba.</p>
        </div>
      </section>

      {message && <div className="api-alert">{message}</div>}

      <section className="content-grid two-one">
        <article className="panel-card wide">
          <div className="panel-head"><div><span>Riwayat</span><h3>Stok Keluar Produksi</h3></div></div>
          <ResponsiveTable columns={columns} rows={movements} />
        </article>

        <article className="panel-card">
          <div className="panel-head"><div><span>Input</span><h3>Catat Pemakaian</h3></div></div>
          <form className="mini-form" onSubmit={submitUsage}>
            <label>Bahan Baku</label>
            <select value={form.material_id} onChange={(event) => updateField('material_id', event.target.value)} required>
              <option value="">Pilih bahan</option>
              {materials.map((item) => <option key={item.id} value={item.id}>{item.name} — stok {item.stock} {item.unit}</option>)}
            </select>
            <label>Jumlah Dipakai</label>
            <input type="number" min="1" max={selectedMaterial?.stock || undefined} value={form.quantity} onChange={(event) => updateField('quantity', event.target.value)} placeholder={`Satuan: ${selectedMaterial?.unit || '-'}`} required />
            <label>Keterangan</label>
            <textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Contoh: Produksi ayam crispy shift pagi" />
            <p className="helper-box">Setelah disimpan, sistem mencatat movement OUT dan mengurangi stok bahan baku.</p>
            <button className="login-button" type="submit" disabled={saving}>{saving ? 'Mencatat...' : 'Simpan Pemakaian Produksi'}</button>
          </form>
        </article>
      </section>
    </>
  )
}
