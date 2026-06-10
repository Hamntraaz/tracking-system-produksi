import { useState } from 'react'
import StatusBadge from '../../components/StatusBadge'
import { createCourier, updateCourierStatus } from '../../services/api'

export default function SupplierCouriers({ data = {}, refreshData, user }) {
  const allCouriers = Array.isArray(data.couriers) ? data.couriers : []
  const suppliers = Array.isArray(data.suppliers) ? data.suppliers : []
  const defaultSupplierId = user?.supplier_id || suppliers[0]?.id || 1
  const couriers = user?.supplier_id ? allCouriers.filter((courier) => Number(courier.supplier_id) === Number(user.supplier_id)) : allCouriers
  const [form, setForm] = useState({ name: '', phone: '', vehicle_plate: '', email: '', password: '12345678', supplier_id: defaultSupplierId })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submitHandler(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await createCourier({ ...form, supplier_id: Number(form.supplier_id || defaultSupplierId) })
      setMessage('Kurir baru berhasil ditambahkan ke database.')
      setForm({ name: '', phone: '', vehicle_plate: '', email: '', password: '12345678', supplier_id: defaultSupplierId })
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal menambahkan kurir.')
    } finally {
      setSaving(false)
    }
  }


  async function toggleCourier(courier) {
    setSaving(true)
    setMessage('')
    try {
      const nextStatus = courier.status === 'Nonaktif' ? 'Tersedia' : 'Nonaktif'
      await updateCourierStatus({ courier_id: courier.id, status: nextStatus })
      setMessage(nextStatus === 'Nonaktif' ? 'Kurir berhasil dinonaktifkan.' : 'Kurir berhasil diaktifkan kembali.')
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal mengubah status kurir.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <section className="page-head-card"><div><span>Supplier</span><h2>Kurir Supplier</h2><p>Supplier dapat menambahkan kurir, menugaskan ke pesanan, dan menonaktifkan kurir tanpa menghapus riwayat pengiriman.</p></div></section>

      <section className="content-grid two-one">
        <article className="panel-card wide">
          <div className="panel-head"><div><span>Data API</span><h3>Daftar Kurir</h3></div></div>
          <section className="cards-grid three">
            {couriers.length === 0 && <p className="muted-text">Belum ada kurir.</p>}
            {couriers.map((courier) => (
              <article className="courier-profile" key={courier.id}>
                <div className="avatar big">{courier.initials || 'KR'}</div>
                <h3>{courier.name || '-'}</h3>
                <p>{courier.supplier_name || 'Supplier'}</p>
                <div className="profile-lines"><span>{courier.phone || '-'}</span><span>{courier.vehicle_plate || '-'}</span></div>
                <StatusBadge>{courier.status || 'Tersedia'}</StatusBadge>
                <button type="button" className={courier.status === 'Nonaktif' ? 'soft-success compact' : 'soft-danger compact'} onClick={() => toggleCourier(courier)} disabled={saving}>
                  {courier.status === 'Nonaktif' ? 'Aktifkan' : 'Nonaktifkan'}
                </button>
              </article>
            ))}
          </section>
        </article>

        <article className="panel-card">
          <div className="panel-head"><div><span>Tambah</span><h3>Kurir Baru</h3></div></div>
          <form className="mini-form" onSubmit={submitHandler}>
            <label>Supplier</label>
            <select value={form.supplier_id} onChange={(event) => updateField('supplier_id', event.target.value)} disabled={Boolean(user?.supplier_id)}>
              {suppliers.length === 0 && <option value="1">Supplier Default</option>}
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </select>
            <label>Nama Kurir</label>
            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Contoh: Andi Pratama" required />
            <label>No HP</label>
            <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="08xxxxxxxxxx" />
            <label>Plat Kendaraan</label>
            <input value={form.vehicle_plate} onChange={(event) => updateField('vehicle_plate', event.target.value)} placeholder="B 1234 RFC" />
            <label>Email Login Kurir</label>
            <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="kurir@email.com" required />
            <label>Password</label>
            <input value={form.password} onChange={(event) => updateField('password', event.target.value)} required />
            <button type="submit" className="login-button" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Kurir'}</button>
            {message && <p className="helper-box">{message}</p>}
          </form>
        </article>
      </section>
    </>
  )
}
