import { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import { createCourier, updateCourierStatus } from '../../services/api'

const emptyForm = { name: '', phone: '', vehicle_plate: '', email: '', password: '12345678' }

export default function WarehouseCouriers({ data = {}, refreshData, user }) {
  const allCouriers = Array.isArray(data.couriers) ? data.couriers : []
  const warehouseId = user?.warehouse_id || (Array.isArray(data.warehouses) ? data.warehouses[0]?.id : null)
  const couriers = useMemo(() => allCouriers.filter((courier) => String(courier.warehouse_id || '') === String(warehouseId || '')), [allCouriers, warehouseId])
  const [form, setForm] = useState(emptyForm)
  const [modal, setModal] = useState(false)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(key, value) { setForm((prev) => ({ ...prev, [key]: value })) }

  async function submitHandler(event) {
    event.preventDefault()
    setSaving(true); setMessage('')
    try {
      await createCourier({ ...form, warehouse_id: warehouseId })
      setMessage('Kurir gudang berhasil ditambahkan.')
      setForm(emptyForm)
      setModal(false)
      await refreshData?.()
    } catch (error) { setMessage(error.message || 'Gagal menambahkan kurir gudang.') }
    finally { setSaving(false) }
  }

  async function toggleCourier(row) {
    setSaving(true); setMessage('')
    try {
      const nextStatus = row.status === 'Nonaktif' ? 'Tersedia' : 'Nonaktif'
      await updateCourierStatus({ courier_id: row.id, status: nextStatus })
      setMessage(nextStatus === 'Nonaktif' ? 'Kurir gudang dinonaktifkan.' : 'Kurir gudang diaktifkan kembali.')
      await refreshData?.()
    } catch (error) { setMessage(error.message || 'Gagal mengubah status kurir.') }
    finally { setSaving(false) }
  }

  const columns = [
    { key: 'code', label: 'Kode' },
    { key: 'name', label: 'Nama Kurir' },
    { key: 'phone', label: 'No HP' },
    { key: 'vehicle_plate', label: 'Plat' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
    { key: 'actions', label: 'Aksi', render: (row) => <button type="button" className={row.status === 'Nonaktif' ? 'soft-success compact' : 'soft-danger compact'} onClick={() => toggleCourier(row)} disabled={saving}>{row.status === 'Nonaktif' ? 'Aktifkan' : 'Nonaktifkan'}</button> },
  ]

  return (
    <>
      <section className="page-head-card"><div><span>Gudang</span><h2>Kurir Gudang</h2><p>Gudang punya kurir sendiri untuk mengirim barang dari gudang ke cabang.</p></div><div className="head-actions"><button type="button" onClick={() => setModal(true)}>+ Tambah Kurir Gudang</button></div></section>
      {message && <div className="api-alert">{message}</div>}
      <article className="panel-card"><ResponsiveTable columns={columns} rows={couriers} /></article>
      <Modal open={modal} title="Tambah Kurir Gudang" onClose={() => setModal(false)} size="lg">
        <form className="mini-form modal-form-grid" onSubmit={submitHandler}>
          <label>Nama Kurir</label><input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
          <label>No HP</label><input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
          <label>Plat Kendaraan</label><input value={form.vehicle_plate} onChange={(e) => updateField('vehicle_plate', e.target.value)} />
          <label>Email Login Kurir</label><input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
          <label>Password</label><input value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
          <button className="login-button" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Kurir'}</button>
        </form>
      </Modal>
    </>
  )
}
