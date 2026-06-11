import { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import {
  createManagedSupplier,
  createManagedWarehouse,
  deleteManagedSupplier,
  deleteManagedWarehouse,
  updateManagedAccountStatus,
  updateManagedSupplier,
  updateManagedWarehouse,
} from '../../services/api'

const defaultSupplierForm = {
  id: '',
  company_name: '',
  material_type: '',
  material_unit: '',
  phone: '',
  address: '',
  email: '',
  password: '12345678',
  status: 'Aktif',
}

const defaultWarehouseForm = {
  id: '',
  warehouse_name: '',
  pic_name: '',
  address: '',
  email: '',
  password: '12345678',
  status: 'Aktif',
}

const roleLabels = {
  manager: 'Manager',
  warehouse: 'Gudang/Cabang',
  supplier: 'Supplier',
  courier: 'Kurir',
}

function findUserBySupplier(users, supplierId) {
  return users.find((user) => user.role === 'supplier' && String(user.supplier_id || '') === String(supplierId || ''))
}

function findUserByWarehouse(users, warehouseId) {
  return users.find((user) => user.role === 'warehouse' && String(user.warehouse_id || '') === String(warehouseId || ''))
}

export default function ManagerAccounts({ data = {}, refreshData }) {
  const suppliers = Array.isArray(data.suppliers) ? data.suppliers : []
  const warehouses = Array.isArray(data.warehouses) ? data.warehouses : []
  const users = Array.isArray(data.users) ? data.users : []
  const [modal, setModal] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [supplierForm, setSupplierForm] = useState(defaultSupplierForm)
  const [warehouseForm, setWarehouseForm] = useState(defaultWarehouseForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const supplierAccounts = useMemo(() => users.filter((user) => user.role === 'supplier'), [users])
  const warehouseAccounts = useMemo(() => users.filter((user) => user.role === 'warehouse'), [users])
  const activeAccounts = useMemo(() => users.filter((user) => (user.status || 'Aktif') === 'Aktif'), [users])
  const nonActiveAccounts = useMemo(() => users.filter((user) => (user.status || 'Aktif') !== 'Aktif'), [users])

  function updateSupplier(key, value) { setSupplierForm((prev) => ({ ...prev, [key]: value })) }
  function updateWarehouse(key, value) { setWarehouseForm((prev) => ({ ...prev, [key]: value })) }

  function openCreateSupplier() {
    setSupplierForm(defaultSupplierForm)
    setModal('supplier-create')
  }

  function openEditSupplier(row) {
    const account = findUserBySupplier(users, row.id)
    setSupplierForm({
      id: row.id,
      company_name: row.name || '',
      material_type: row.material_type || '',
      material_unit: row.material_unit || '',
      phone: row.phone || '',
      address: row.address || '',
      email: account?.email || '',
      password: '',
      status: row.status || account?.status || 'Aktif',
    })
    setModal('supplier-edit')
  }

  function openViewSupplier(row) {
    setSelectedItem({ type: 'supplier', data: row, account: findUserBySupplier(users, row.id) })
    setModal('view')
  }

  function openCreateWarehouse() {
    setWarehouseForm(defaultWarehouseForm)
    setModal('warehouse-create')
  }

  function openEditWarehouse(row) {
    const account = findUserByWarehouse(users, row.id)
    setWarehouseForm({
      id: row.id,
      warehouse_name: row.name || '',
      pic_name: account?.name || '',
      address: row.address || '',
      email: account?.email || '',
      password: '',
      status: row.status || account?.status || 'Aktif',
    })
    setModal('warehouse-edit')
  }

  function openViewWarehouse(row) {
    setSelectedItem({ type: 'warehouse', data: row, account: findUserByWarehouse(users, row.id) })
    setModal('view')
  }

  function editAccount(row) {
    if (row.role === 'supplier' && row.supplier_id) {
      const supplier = suppliers.find((item) => String(item.id) === String(row.supplier_id))
      if (supplier) return openEditSupplier(supplier)
    }
    if (row.role === 'warehouse' && row.warehouse_id) {
      const warehouse = warehouses.find((item) => String(item.id) === String(row.warehouse_id))
      if (warehouse) return openEditWarehouse(warehouse)
    }
    setSelectedItem({ type: 'account', data: row, account: row })
    setModal('view')
  }

  async function submitSupplier(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const isEdit = Boolean(supplierForm.id)
      if (isEdit) await updateManagedSupplier(supplierForm)
      else await createManagedSupplier(supplierForm)
      setSupplierForm(defaultSupplierForm)
      setModal(null)
      setMessage(isEdit ? 'Supplier dan akun login supplier berhasil diperbarui.' : 'Supplier dan akun login supplier berhasil dibuat.')
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal menyimpan akun supplier.')
    } finally {
      setSaving(false)
    }
  }

  async function submitWarehouse(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const isEdit = Boolean(warehouseForm.id)
      const payload = { ...warehouseForm, admin_name: warehouseForm.pic_name }
      if (isEdit) await updateManagedWarehouse(payload)
      else await createManagedWarehouse(payload)
      setWarehouseForm(defaultWarehouseForm)
      setModal(null)
      setMessage(isEdit ? 'Gudang/cabang dan akun login berhasil diperbarui.' : 'Gudang/cabang dan akun login berhasil dibuat.')
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal menyimpan akun gudang/cabang.')
    } finally {
      setSaving(false)
    }
  }

  async function setSupplierStatus(row, status) {
    const ok = window.confirm(`${status === 'Aktif' ? 'Aktifkan' : 'Nonaktifkan'} supplier ${row.name}? Akun login supplier juga ikut berubah.`)
    if (!ok) return
    setSaving(true)
    setMessage('')
    try {
      if (status === 'Nonaktif') await deleteManagedSupplier(row.id)
      else await updateManagedSupplier({ ...row, company_name: row.name, status: 'Aktif' })
      setMessage(`Supplier berhasil ${status === 'Aktif' ? 'diaktifkan' : 'dinonaktifkan'}.`)
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal mengubah status supplier.')
    } finally {
      setSaving(false)
    }
  }

  async function setWarehouseStatus(row, status) {
    const ok = window.confirm(`${status === 'Aktif' ? 'Aktifkan' : 'Nonaktifkan'} gudang/cabang ${row.name}? Akun login gudang/cabang juga ikut berubah.`)
    if (!ok) return
    setSaving(true)
    setMessage('')
    try {
      if (status === 'Nonaktif') await deleteManagedWarehouse(row.id)
      else await updateManagedWarehouse({ ...row, warehouse_name: row.name, status: 'Aktif' })
      setMessage(`Gudang/cabang berhasil ${status === 'Aktif' ? 'diaktifkan' : 'dinonaktifkan'}.`)
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal mengubah status gudang/cabang.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAccount(row) {
    if (row.role === 'manager') {
      setMessage('Akun manager utama tidak dinonaktifkan dari tabel ini agar sistem tidak terkunci.')
      return
    }
    const nextStatus = (row.status || 'Aktif') === 'Aktif' ? 'Nonaktif' : 'Aktif'
    const ok = window.confirm(`${nextStatus === 'Aktif' ? 'Aktifkan' : 'Nonaktifkan'} akun ${row.email}?`)
    if (!ok) return
    setSaving(true)
    setMessage('')
    try {
      await updateManagedAccountStatus({ id: row.id, status: nextStatus })
      setMessage(`Akun ${row.email} berhasil ${nextStatus === 'Aktif' ? 'diaktifkan' : 'dinonaktifkan'}.`)
      await refreshData?.()
    } catch (error) {
      setMessage(error.message || 'Gagal mengubah status akun.')
    } finally {
      setSaving(false)
    }
  }

  const supplierColumns = [
    { key: 'name', label: 'Nama PT/CV' },
    { key: 'material_type', label: 'Bahan Baku' },
    { key: 'material_unit', label: 'Satuan', render: (row) => row.material_unit || '-' },
    { key: 'phone', label: 'Kontak' },
    { key: 'account', label: 'Akun', render: (row) => findUserBySupplier(users, row.id)?.email || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status || 'Aktif'}</StatusBadge> },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row) => {
        const isActive = (row.status || 'Aktif') === 'Aktif'
        return (
          <div className="table-actions">
            <button type="button" onClick={() => openViewSupplier(row)}>Lihat</button>
            <button type="button" className="soft-action" onClick={() => openEditSupplier(row)}>Edit</button>
            <button type="button" className={isActive ? 'soft-danger' : 'soft-success'} onClick={() => setSupplierStatus(row, isActive ? 'Nonaktif' : 'Aktif')} disabled={saving}>{isActive ? 'Nonaktif' : 'Aktifkan'}</button>
          </div>
        )
      },
    },
  ]

  const warehouseColumns = [
    { key: 'name', label: 'Gudang/Cabang' },
    { key: 'address', label: 'Alamat' },
    { key: 'account', label: 'Akun Login', render: (row) => findUserByWarehouse(users, row.id)?.email || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status || 'Aktif'}</StatusBadge> },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row) => {
        const isActive = (row.status || 'Aktif') === 'Aktif'
        return (
          <div className="table-actions">
            <button type="button" onClick={() => openViewWarehouse(row)}>Lihat</button>
            <button type="button" className="soft-action" onClick={() => openEditWarehouse(row)}>Edit</button>
            <button type="button" className={isActive ? 'soft-danger' : 'soft-success'} onClick={() => setWarehouseStatus(row, isActive ? 'Nonaktif' : 'Aktif')} disabled={saving}>{isActive ? 'Nonaktif' : 'Aktifkan'}</button>
          </div>
        )
      },
    },
  ]

  const accountColumns = [
    { key: 'name', label: 'Nama Akun' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => roleLabels[row.role] || row.role },
    { key: 'linked', label: 'Terhubung ke', render: (row) => row.supplier_name || row.warehouse_name || row.courier_name || row.branch || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status || 'Aktif'}</StatusBadge> },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row) => {
        const isActive = (row.status || 'Aktif') === 'Aktif'
        return (
          <div className="table-actions">
            <button type="button" onClick={() => editAccount(row)}>Detail/Edit</button>
            <button type="button" className={isActive ? 'soft-danger' : 'soft-success'} onClick={() => toggleAccount(row)} disabled={saving || row.role === 'manager'}>{isActive ? 'Nonaktif' : 'Aktifkan'}</button>
          </div>
        )
      },
    },
  ]

  const isSupplierModal = modal === 'supplier-create' || modal === 'supplier-edit'
  const isWarehouseModal = modal === 'warehouse-create' || modal === 'warehouse-edit'

  return (
    <>
      <section className="page-head-card">
        <div>
          <span>Manajemen</span>
          <h2>Akun & Mitra Operasional</h2>
          <p>Manager memiliki kontrol penuh untuk membuat, mengedit, mengaktifkan, dan menonaktifkan supplier serta gudang/cabang. Kurir tetap dibuat dari akun supplier.</p>
        </div>
        <div className="header-actions">
          <button type="button" onClick={openCreateWarehouse}>+ Gudang/Cabang</button>
          <button type="button" className="soft-action" onClick={openCreateSupplier}>+ Supplier</button>
        </div>
      </section>

      {message && <div className="api-alert">{message}</div>}

      <section className="content-grid two-one">
        <article className="panel-card wide">
          <div className="panel-head"><div><span>Master</span><h3>Supplier Terdaftar</h3></div></div>
          <ResponsiveTable columns={supplierColumns} rows={suppliers} />
        </article>
        <article className="panel-card">
          <div className="panel-head"><div><span>Ringkasan</span><h3>Kontrol Akun</h3></div></div>
          <div className="detail-stack">
            <p><b>Supplier</b><span>{suppliers.length} mitra</span></p>
            <p><b>Gudang/Cabang</b><span>{warehouses.length} lokasi</span></p>
            <p><b>Akun Aktif</b><span>{activeAccounts.length} akun</span></p>
            <p><b>Akun Nonaktif</b><span>{nonActiveAccounts.length} akun</span></p>
            <p><b>Akun Supplier</b><span>{supplierAccounts.length} akun</span></p>
            <p><b>Akun Gudang/Cabang</b><span>{warehouseAccounts.length} akun</span></p>
          </div>
        </article>
      </section>

      <article className="panel-card">
        <div className="panel-head"><div><span>Master</span><h3>Gudang / Cabang</h3></div></div>
        <ResponsiveTable columns={warehouseColumns} rows={warehouses} />
      </article>

      <article className="panel-card">
        <div className="panel-head"><div><span>Users</span><h3>Akun Sistem</h3></div></div>
        <ResponsiveTable columns={accountColumns} rows={users} />
      </article>

      <Modal open={isSupplierModal} title={supplierForm.id ? 'Edit Supplier & Akun Login' : 'Tambah Supplier & Akun Login'} onClose={() => setModal(null)} size="lg">
        <form className="mini-form modal-form-grid" onSubmit={submitSupplier}>
          <label>Nama PT/CV Supplier</label>
          <input value={supplierForm.company_name} onChange={(e) => updateSupplier('company_name', e.target.value)} placeholder="Contoh: PT Ayam Segar Mandiri" required />
          <label>Bahan Baku yang Disediakan</label>
          <input value={supplierForm.material_type} onChange={(e) => updateSupplier('material_type', e.target.value)} placeholder="Contoh: Ayam Potong" required />
          <label>Satuan Bahan</label>
          <input value={supplierForm.material_unit} onChange={(e) => updateSupplier('material_unit', e.target.value)} placeholder="Kg / Liter / Botol / Dus" required />
          <label>No HP / Kontak</label>
          <input value={supplierForm.phone} onChange={(e) => updateSupplier('phone', e.target.value)} placeholder="08xxxxxxxxxx" />
          <label>Alamat Supplier</label>
          <textarea value={supplierForm.address} onChange={(e) => updateSupplier('address', e.target.value)} placeholder="Alamat supplier" />
          <label>Email Login Supplier</label>
          <input type="email" value={supplierForm.email} onChange={(e) => updateSupplier('email', e.target.value)} placeholder="supplier@perusahaan.com" required />
          <label>Password {supplierForm.id ? '(kosongkan jika tidak diganti)' : ''}</label>
          <input value={supplierForm.password} onChange={(e) => updateSupplier('password', e.target.value)} required={!supplierForm.id} placeholder={supplierForm.id ? 'Kosongkan jika tidak diganti' : '12345678'} />
          <label>Status</label>
          <select value={supplierForm.status} onChange={(e) => updateSupplier('status', e.target.value)}><option>Aktif</option><option>Nonaktif</option></select>
          <button type="submit" className="login-button" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Supplier'}</button>
        </form>
      </Modal>

      <Modal open={isWarehouseModal} title={warehouseForm.id ? 'Edit Gudang/Cabang & Akun Login' : 'Tambah Gudang/Cabang & Akun Login'} onClose={() => setModal(null)} size="lg">
        <form className="mini-form modal-form-grid" onSubmit={submitWarehouse}>
          <label>Nama Gudang/Cabang</label>
          <input value={warehouseForm.warehouse_name} onChange={(e) => updateWarehouse('warehouse_name', e.target.value)} placeholder="Contoh: Cabang Rafiza Cibinong" required />
          <label>Nama PIC Gudang/Cabang</label>
          <input value={warehouseForm.pic_name} onChange={(e) => updateWarehouse('pic_name', e.target.value)} placeholder="Contoh: PIC Cabang Cibinong" />
          <label>Alamat Gudang/Cabang</label>
          <textarea value={warehouseForm.address} onChange={(e) => updateWarehouse('address', e.target.value)} placeholder="Alamat gudang/cabang" />
          <label>Email Login Gudang/Cabang</label>
          <input type="email" value={warehouseForm.email} onChange={(e) => updateWarehouse('email', e.target.value)} placeholder="gudang.cabang@email.com" required />
          <label>Password {warehouseForm.id ? '(kosongkan jika tidak diganti)' : ''}</label>
          <input value={warehouseForm.password} onChange={(e) => updateWarehouse('password', e.target.value)} required={!warehouseForm.id} placeholder={warehouseForm.id ? 'Kosongkan jika tidak diganti' : '12345678'} />
          <label>Status</label>
          <select value={warehouseForm.status} onChange={(e) => updateWarehouse('status', e.target.value)}><option>Aktif</option><option>Nonaktif</option></select>
          <button type="submit" className="login-button" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Gudang/Cabang'}</button>
        </form>
      </Modal>

      <Modal open={modal === 'view'} title="Detail Akun & Mitra" onClose={() => setModal(null)} size="lg">
        {selectedItem && (
          <div className="detail-stack account-detail-modal">
            <p><b>Jenis</b><span>{selectedItem.type === 'supplier' ? 'Supplier' : selectedItem.type === 'warehouse' ? 'Gudang/Cabang' : 'Akun Sistem'}</span></p>
            <p><b>Nama</b><span>{selectedItem.data?.name || '-'}</span></p>
            {selectedItem.type === 'supplier' && <p><b>Bahan Baku</b><span>{selectedItem.data?.material_type || '-'}</span></p>}
            {selectedItem.type === 'supplier' && <p><b>Satuan</b><span>{selectedItem.data?.material_unit || '-'}</span></p>}
            {selectedItem.type === 'supplier' && <p><b>Kontak</b><span>{selectedItem.data?.phone || '-'}</span></p>}
            {selectedItem.type === 'warehouse' && <p><b>Alamat</b><span>{selectedItem.data?.address || '-'}</span></p>}
            <p><b>Email Login</b><span>{selectedItem.account?.email || '-'}</span></p>
            <p><b>Nama Akun</b><span>{selectedItem.account?.name || '-'}</span></p>
            <p><b>Role</b><span>{roleLabels[selectedItem.account?.role] || selectedItem.account?.role || '-'}</span></p>
            <p><b>Status</b><span>{selectedItem.data?.status || selectedItem.account?.status || '-'}</span></p>
          </div>
        )}
      </Modal>
    </>
  )
}
