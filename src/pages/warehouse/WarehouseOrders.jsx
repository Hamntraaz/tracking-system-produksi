import { useMemo, useState } from 'react'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import DeliveryProof from '../../components/DeliveryProof'
import Modal from '../../components/Modal'
import { createPurchaseOrder } from '../../services/api'

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

export default function WarehouseOrders({ data = {}, deviceLocation, requestLocation, refreshData, user }) {
  const materials = Array.isArray(data.materials) ? data.materials : []
  const suppliers = Array.isArray(data.suppliers) ? data.suppliers.filter((item) => (item.status || 'Aktif') === 'Aktif') : []
  const orders = Array.isArray(data.orders) ? data.orders : []
  const [form, setForm] = useState({ supplier_id: suppliers[0]?.id || '', quantity: '', notes: '' })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [proofModal, setProofModal] = useState(null)

  const selectedSupplier = useMemo(() => suppliers.find((item) => String(item.id) === String(form.supplier_id)), [suppliers, form.supplier_id])
  const selectedMaterial = useMemo(() => {
    if (!selectedSupplier?.material_type) return null
    return materials.find((item) => normalizeText(item.name) === normalizeText(selectedSupplier.material_type)) || null
  }, [materials, selectedSupplier])
  const unit = selectedSupplier?.material_unit || selectedMaterial?.unit || '-'

  function updateField(key, value) { setForm((prev) => ({ ...prev, [key]: value })) }

  async function submitRequest(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      if (!selectedSupplier) throw new Error('Pilih supplier terlebih dahulu.')
      if (!selectedMaterial?.id) throw new Error('Bahan baku dari supplier belum terhubung ke master bahan. Minta manajer cek data supplier.')
      const position = deviceLocation ? { coords: deviceLocation } : await requestLocation?.()
      const coords = position?.coords || deviceLocation
      await createPurchaseOrder({
        material_id: Number(selectedMaterial.id),
        supplier_id: Number(form.supplier_id),
        quantity: Number(form.quantity),
        unit,
        notes: form.notes,
        warehouse_id: user?.warehouse_id || null,
        destination_lat: coords?.latitude,
        destination_lng: coords?.longitude,
        destination_address: user?.branch || user?.name || 'Gudang Rafiza',
      })
      setMessage('Permintaan barang terkirim ke supplier yang dipilih. Supplier akan mendapat notifikasi beep saat dashboardnya aktif.')
      setForm({ supplier_id: suppliers[0]?.id || '', quantity: '', notes: '' })
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal membuat permintaan barang.')
    } finally {
      setSaving(false)
    }
  }



  const columns = [
    { key: 'code', label: 'Kode PO' },
    { key: 'items_text', label: 'Item' },
    { key: 'supplier_name', label: 'Supplier' },
    { key: 'warehouse_name', label: 'Gudang' },
    { key: 'courier_name', label: 'Kurir' },
    { key: 'ordered_at', label: 'Tanggal' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
    {
      key: 'proof',
      label: 'Bukti Barang',
      render: (row) => {
        const proof = (data.deliveries || []).find((delivery) => String(delivery.order_id || '') === String(row.id || '') && delivery.proof_photo)
        return proof ? <button type="button" className="soft-action compact" onClick={() => setProofModal(proof)}>Lihat Bukti</button> : <span className="muted-text">Belum ada</span>
      },
    },
  ]

  return (
    <>
      <section className="page-head-card"><div><span>Gudang</span><h2>Permintaan Barang ke Supplier</h2><p>Gudang memilih supplier. Bahan baku dan satuan otomatis mengikuti data supplier yang didaftarkan manajer.</p></div></section>
      {message && <div className="api-alert">{message}</div>}
      <section className="content-grid two-one">
        <article className="panel-card wide">
          <div className="panel-head"><div><span>Riwayat PO</span><h3>Status Pesanan</h3></div></div>
          <ResponsiveTable columns={columns} rows={orders} />
        </article>
        <article className="panel-card">
          <div className="panel-head"><div><span>Buat Request</span><h3>Minta Barang</h3></div></div>
          <form className="mini-form" onSubmit={submitRequest}>
            <label>Supplier Tujuan</label>
            <select value={form.supplier_id} onChange={(e) => updateField('supplier_id', e.target.value)} required>
              <option value="">Pilih supplier</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </select>
            <label>Bahan Baku</label>
            <input value={selectedSupplier?.material_type || ''} placeholder="Otomatis dari data supplier" readOnly />
            <label>Satuan</label>
            <input value={unit} placeholder="Otomatis dari data supplier" readOnly />
            <label>Jumlah</label>
            <input type="number" min="1" value={form.quantity} onChange={(e) => updateField('quantity', e.target.value)} placeholder={`Masukkan jumlah (${unit})`} required />
            {!selectedMaterial && selectedSupplier && <p className="warning-box">Bahan supplier belum ada di master bahan. Sistem biasanya membuat master bahan otomatis saat manajer menambahkan supplier.</p>}
            <label>Catatan</label>
            <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Contoh: Stok ayam untuk cabang A menipis" />
            <p className="helper-box">Koordinat tujuan akan diambil dari izin lokasi browser gudang, bukan titik toko statis.</p>
            <button className="login-button" type="submit" disabled={saving || !selectedSupplier || !selectedMaterial}>{saving ? 'Mengirim...' : 'Kirim Permintaan ke Supplier'}</button>
          </form>
        </article>
      </section>

      <Modal open={Boolean(proofModal)} title={`Bukti Barang ${proofModal?.order_code || ''}`} size="lg" onClose={() => setProofModal(null)}>
        {proofModal && <DeliveryProof delivery={proofModal} />}
      </Modal>
    </>
  )
}
