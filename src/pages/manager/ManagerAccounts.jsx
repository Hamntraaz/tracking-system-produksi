import { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import {
  createManagedSupplier,
  createManagedWarehouse,
  createManagedBranch,
  deleteManagedSupplier,
  deleteManagedWarehouse,
  deleteManagedBranch,
  updateManagedAccountStatus,
  updateManagedSupplier,
  updateManagedWarehouse,
  updateManagedBranch,
} from '../../services/api'

const defaultSupplierForm = { id: '', company_name: '', material_type: '', material_unit: 'Kg', phone: '', address: '', email: '', password: '12345678', status: 'Aktif' }
const defaultWarehouseForm = { id: '', warehouse_name: '', pic_name: '', address: '', email: '', password: '12345678', status: 'Aktif' }
const defaultBranchForm = { id: '', branch_name: '', pic_name: '', address: '', email: '', password: '12345678', status: 'Aktif' }

const roleLabels = { manager: 'Manager', warehouse: 'Gudang', branch: 'Cabang', supplier: 'Supplier', courier: 'Kurir' }
function contains(value = '', keyword = '') { return String(value || '').toLowerCase().includes(String(keyword || '').toLowerCase()) }
function findUserBySupplier(users, supplierId) { return users.find((user) => user.role === 'supplier' && String(user.supplier_id || '') === String(supplierId || '')) }
function findUserByWarehouse(users, warehouseId) { return users.find((user) => user.role === 'warehouse' && String(user.warehouse_id || '') === String(warehouseId || '')) }
function findUserByBranch(users, branchId) { return users.find((user) => user.role === 'branch' && String(user.branch_id || '') === String(branchId || '')) }

export default function ManagerAccounts({ data = {}, refreshData }) {
  const suppliers = Array.isArray(data.suppliers) ? data.suppliers : []
  const warehouses = Array.isArray(data.warehouses) ? data.warehouses : []
  const branches = Array.isArray(data.branches) ? data.branches : []
  const users = Array.isArray(data.users) ? data.users : []
  const [activeTab, setActiveTab] = useState('supplier')
  const [filters, setFilters] = useState({ search: '', status: 'Semua', role: 'Semua' })
  const [modal, setModal] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [supplierForm, setSupplierForm] = useState(defaultSupplierForm)
  const [warehouseForm, setWarehouseForm] = useState(defaultWarehouseForm)
  const [branchForm, setBranchForm] = useState(defaultBranchForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const activeAccounts = useMemo(() => users.filter((user) => (user.status || 'Aktif') === 'Aktif'), [users])
  const nonActiveAccounts = useMemo(() => users.filter((user) => (user.status || 'Aktif') !== 'Aktif'), [users])

  const filteredSuppliers = suppliers.filter((row) =>
    (filters.status === 'Semua' || (row.status || 'Aktif') === filters.status) &&
    [row.name, row.material_type, row.phone, findUserBySupplier(users, row.id)?.email].some((value) => contains(value, filters.search))
  )
  const filteredWarehouses = warehouses.filter((row) =>
    (filters.status === 'Semua' || (row.status || 'Aktif') === filters.status) &&
    [row.name, row.address, findUserByWarehouse(users, row.id)?.email].some((value) => contains(value, filters.search))
  )
  const filteredBranches = branches.filter((row) =>
    (filters.status === 'Semua' || (row.status || 'Aktif') === filters.status) &&
    [row.name, row.address, findUserByBranch(users, row.id)?.email].some((value) => contains(value, filters.search))
  )
  const filteredUsers = users.filter((row) =>
    (filters.status === 'Semua' || (row.status || 'Aktif') === filters.status) &&
    (filters.role === 'Semua' || row.role === filters.role) &&
    [row.name, row.email, roleLabels[row.role], row.supplier_name, row.warehouse_name, row.branch_name, row.courier_name].some((value) => contains(value, filters.search))
  )

  function setFilter(key, value) { setFilters((prev) => ({ ...prev, [key]: value })) }
  function updateSupplier(key, value) { setSupplierForm((prev) => ({ ...prev, [key]: value })) }
  function updateWarehouse(key, value) { setWarehouseForm((prev) => ({ ...prev, [key]: value })) }
  function updateBranch(key, value) { setBranchForm((prev) => ({ ...prev, [key]: value })) }

  function openCreateSupplier() { setSupplierForm(defaultSupplierForm); setModal('supplier') }
  function openCreateWarehouse() { setWarehouseForm(defaultWarehouseForm); setModal('warehouse') }
  function openCreateBranch() { setBranchForm(defaultBranchForm); setModal('branch') }

  function openEditSupplier(row) {
    const account = findUserBySupplier(users, row.id)
    setSupplierForm({ id: row.id, company_name: row.name || '', material_type: row.material_type || '', material_unit: row.material_unit || 'Kg', phone: row.phone || '', address: row.address || '', email: account?.email || '', password: '', status: row.status || account?.status || 'Aktif' })
    setModal('supplier')
  }
  function openEditWarehouse(row) {
    const account = findUserByWarehouse(users, row.id)
    setWarehouseForm({ id: row.id, warehouse_name: row.name || '', pic_name: account?.name || '', address: row.address || '', email: account?.email || '', password: '', status: row.status || account?.status || 'Aktif' })
    setModal('warehouse')
  }
  function openEditBranch(row) {
    const account = findUserByBranch(users, row.id)
    setBranchForm({ id: row.id, branch_name: row.name || '', pic_name: account?.name || '', address: row.address || '', email: account?.email || '', password: '', status: row.status || account?.status || 'Aktif' })
    setModal('branch')
  }
  function openView(row, type) {
    const account = type === 'supplier' ? findUserBySupplier(users, row.id) : type === 'warehouse' ? findUserByWarehouse(users, row.id) : type === 'branch' ? findUserByBranch(users, row.id) : row
    setSelectedItem({ type, data: row, account })
    setModal('view')
  }
  function editAccount(row) {
    if (row.role === 'supplier' && row.supplier_id) return openEditSupplier(suppliers.find((item) => String(item.id) === String(row.supplier_id)) || row)
    if (row.role === 'warehouse' && row.warehouse_id) return openEditWarehouse(warehouses.find((item) => String(item.id) === String(row.warehouse_id)) || row)
    if (row.role === 'branch' && row.branch_id) return openEditBranch(branches.find((item) => String(item.id) === String(row.branch_id)) || row)
    openView(row, 'account')
  }

  async function submitSupplier(event) {
    event.preventDefault(); setSaving(true); setMessage('')
    try {
      if (supplierForm.id) await updateManagedSupplier(supplierForm)
      else await createManagedSupplier(supplierForm)
      setModal(null); setMessage(supplierForm.id ? 'Supplier berhasil diperbarui.' : 'Supplier berhasil dibuat.'); await refreshData?.()
    } catch (error) { setMessage(error.message || 'Gagal menyimpan supplier.') } finally { setSaving(false) }
  }
  async function submitWarehouse(event) {
    event.preventDefault(); setSaving(true); setMessage('')
    try {
      const payload = { ...warehouseForm, admin_name: warehouseForm.pic_name }
      if (warehouseForm.id) await updateManagedWarehouse(payload)
      else await createManagedWarehouse(payload)
      setModal(null); setMessage(warehouseForm.id ? 'Gudang berhasil diperbarui.' : 'Gudang berhasil dibuat.'); await refreshData?.()
    } catch (error) { setMessage(error.message || 'Gagal menyimpan gudang.') } finally { setSaving(false) }
  }
  async function submitBranch(event) {
    event.preventDefault(); setSaving(true); setMessage('')
    try {
      if (branchForm.id) await updateManagedBranch(branchForm)
      else await createManagedBranch(branchForm)
      setModal(null); setMessage(branchForm.id ? 'Cabang berhasil diperbarui.' : 'Cabang berhasil dibuat.'); await refreshData?.()
    } catch (error) { setMessage(error.message || 'Gagal menyimpan cabang.') } finally { setSaving(false) }
  }

  function askStatus(type, row, nextStatus) {
    setConfirmAction({ type, row, nextStatus })
    setModal('confirm-status')
  }

  async function executeConfirm() {
    if (!confirmAction) return
    const { type, row, nextStatus } = confirmAction
    setSaving(true); setMessage('')
    try {
      if (type === 'supplier') {
        if (nextStatus === 'Nonaktif') await deleteManagedSupplier(row.id)
        else await updateManagedSupplier({ ...row, company_name: row.name, status: 'Aktif' })
      }
      if (type === 'warehouse') {
        if (nextStatus === 'Nonaktif') await deleteManagedWarehouse(row.id)
        else await updateManagedWarehouse({ ...row, warehouse_name: row.name, status: 'Aktif' })
      }
      if (type === 'branch') {
        if (nextStatus === 'Nonaktif') await deleteManagedBranch(row.id)
        else await updateManagedBranch({ ...row, branch_name: row.name, status: 'Aktif' })
      }
      if (type === 'account') await updateManagedAccountStatus({ id: row.id, status: nextStatus })
      setModal(null); setConfirmAction(null); setMessage(`${type === 'account' ? 'Akun' : 'Data'} berhasil ${nextStatus === 'Aktif' ? 'diaktifkan' : 'dinonaktifkan'}.`)
      await refreshData?.()
    } catch (error) { setMessage(error.message || 'Gagal mengubah status.') } finally { setSaving(false) }
  }

  function actionButtons(row, type, onEdit) {
    const isActive = (row.status || 'Aktif') === 'Aktif'
    return <div className="table-actions"><button type="button" onClick={() => openView(row, type)}>Lihat</button><button type="button" className="soft-action" onClick={() => onEdit(row)}>Edit</button><button type="button" className={isActive ? 'soft-danger' : 'soft-success'} onClick={() => askStatus(type, row, isActive ? 'Nonaktif' : 'Aktif')} disabled={saving}>{isActive ? 'Nonaktif' : 'Aktifkan'}</button></div>
  }

  const supplierColumns = [
    { key: 'name', label: 'Nama Supplier' }, { key: 'material_type', label: 'Bahan' }, { key: 'material_unit', label: 'Satuan' }, { key: 'phone', label: 'Kontak' },
    { key: 'account', label: 'Akun', render: (row) => findUserBySupplier(users, row.id)?.email || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status || 'Aktif'}</StatusBadge> },
    { key: 'actions', label: 'Aksi', render: (row) => actionButtons(row, 'supplier', openEditSupplier) },
  ]
  const warehouseColumns = [
    { key: 'name', label: 'Gudang' }, { key: 'address', label: 'Alamat' }, { key: 'account', label: 'Akun Login', render: (row) => findUserByWarehouse(users, row.id)?.email || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status || 'Aktif'}</StatusBadge> },
    { key: 'actions', label: 'Aksi', render: (row) => actionButtons(row, 'warehouse', openEditWarehouse) },
  ]
  const branchColumns = [
    { key: 'name', label: 'Cabang' }, { key: 'address', label: 'Alamat' }, { key: 'account', label: 'Akun Login', render: (row) => findUserByBranch(users, row.id)?.email || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status || 'Aktif'}</StatusBadge> },
    { key: 'actions', label: 'Aksi', render: (row) => actionButtons(row, 'branch', openEditBranch) },
  ]
  const accountColumns = [
    { key: 'name', label: 'Nama Akun' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role', render: (row) => roleLabels[row.role] || row.role },
    { key: 'linked', label: 'Terhubung ke', render: (row) => row.supplier_name || row.warehouse_name || row.branch_name || row.courier_name || row.branch || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status || 'Aktif'}</StatusBadge> },
    { key: 'actions', label: 'Aksi', render: (row) => { const isActive = (row.status || 'Aktif') === 'Aktif'; return <div className="table-actions"><button type="button" onClick={() => editAccount(row)}>Detail/Edit</button><button type="button" className={isActive ? 'soft-danger' : 'soft-success'} onClick={() => askStatus('account', row, isActive ? 'Nonaktif' : 'Aktif')} disabled={saving || row.role === 'manager'}>{isActive ? 'Nonaktif' : 'Aktifkan'}</button></div> } },
  ]

  return (
    <>
      <section className="page-head-card">
        <div><span>Manajemen</span><h2>Akun & Mitra Operasional</h2><p>Manager mengelola supplier, gudang, cabang, serta status akun sistem. Gudang dan cabang dipisahkan sesuai alur operasional baru.</p></div>
        <div className="header-actions"><button type="button" onClick={openCreateWarehouse}>+ Gudang</button><button type="button" onClick={openCreateBranch}>+ Cabang</button><button type="button" className="soft-action" onClick={openCreateSupplier}>+ Supplier</button></div>
      </section>
      {message && <div className="api-alert">{message}</div>}

      <section className="stats-grid">
        <div className="stat-card"><div><span>Supplier</span><strong>{suppliers.length}</strong><small>mitra bahan baku</small></div></div>
        <div className="stat-card blue"><div><span>Gudang</span><strong>{warehouses.length}</strong><small>pusat stok</small></div></div>
        <div className="stat-card green"><div><span>Cabang</span><strong>{branches.length}</strong><small>area penjualan</small></div></div>
        <div className="stat-card orange"><div><span>Akun Aktif</span><strong>{activeAccounts.length}</strong><small>{nonActiveAccounts.length} nonaktif</small></div></div>
      </section>

      <article className="panel-card">
        <div className="panel-head"><div><span>Filter</span><h3>Pencarian Data</h3></div></div>
        <div className="filter-bar">
          <input value={filters.search} onChange={(e) => setFilter('search', e.target.value)} placeholder="Cari nama, email, bahan, alamat..." />
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}><option>Semua</option><option>Aktif</option><option>Nonaktif</option></select>
          <select value={filters.role} onChange={(e) => setFilter('role', e.target.value)}><option>Semua</option><option value="manager">Manager</option><option value="warehouse">Gudang</option><option value="branch">Cabang</option><option value="supplier">Supplier</option><option value="courier">Kurir</option></select>
        </div>
        <div className="tab-pills"><button className={activeTab === 'supplier' ? 'active' : ''} onClick={() => setActiveTab('supplier')}>Supplier</button><button className={activeTab === 'warehouse' ? 'active' : ''} onClick={() => setActiveTab('warehouse')}>Gudang</button><button className={activeTab === 'branch' ? 'active' : ''} onClick={() => setActiveTab('branch')}>Cabang</button><button className={activeTab === 'accounts' ? 'active' : ''} onClick={() => setActiveTab('accounts')}>Akun Sistem</button></div>
      </article>

      {activeTab === 'supplier' && <article className="panel-card"><div className="panel-head"><div><span>Master</span><h3>Supplier Terdaftar</h3></div></div><ResponsiveTable columns={supplierColumns} rows={filteredSuppliers} /></article>}
      {activeTab === 'warehouse' && <article className="panel-card"><div className="panel-head"><div><span>Master</span><h3>Gudang Pusat</h3></div></div><ResponsiveTable columns={warehouseColumns} rows={filteredWarehouses} /></article>}
      {activeTab === 'branch' && <article className="panel-card"><div className="panel-head"><div><span>Master</span><h3>Cabang Penjualan</h3></div></div><ResponsiveTable columns={branchColumns} rows={filteredBranches} /></article>}
      {activeTab === 'accounts' && <article className="panel-card"><div className="panel-head"><div><span>Users</span><h3>Akun Sistem</h3></div></div><ResponsiveTable columns={accountColumns} rows={filteredUsers} /></article>}

      <Modal open={modal === 'supplier'} title={supplierForm.id ? 'Edit Supplier & Akun' : 'Tambah Supplier & Akun'} onClose={() => setModal(null)} size="lg">
        <form className="mini-form modal-form-grid" onSubmit={submitSupplier}>
          <label>Nama Supplier</label><input value={supplierForm.company_name} onChange={(e) => updateSupplier('company_name', e.target.value)} required />
          <label>Bahan yang Disediakan</label><input value={supplierForm.material_type} onChange={(e) => updateSupplier('material_type', e.target.value)} required />
          <label>Satuan</label><input value={supplierForm.material_unit} onChange={(e) => updateSupplier('material_unit', e.target.value)} required />
          <label>Kontak</label><input value={supplierForm.phone} onChange={(e) => updateSupplier('phone', e.target.value)} />
          <label>Alamat</label><textarea value={supplierForm.address} onChange={(e) => updateSupplier('address', e.target.value)} />
          <label>Email Login</label><input type="email" value={supplierForm.email} onChange={(e) => updateSupplier('email', e.target.value)} required />
          <label>Password {supplierForm.id ? '(kosongkan jika tidak diganti)' : ''}</label><input value={supplierForm.password} onChange={(e) => updateSupplier('password', e.target.value)} required={!supplierForm.id} />
          <label>Status</label><select value={supplierForm.status} onChange={(e) => updateSupplier('status', e.target.value)}><option>Aktif</option><option>Nonaktif</option></select>
          <button className="login-button" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Supplier'}</button>
        </form>
      </Modal>
      <Modal open={modal === 'warehouse'} title={warehouseForm.id ? 'Edit Gudang & Akun' : 'Tambah Gudang & Akun'} onClose={() => setModal(null)} size="lg">
        <form className="mini-form modal-form-grid" onSubmit={submitWarehouse}>
          <label>Nama Gudang</label><input value={warehouseForm.warehouse_name} onChange={(e) => updateWarehouse('warehouse_name', e.target.value)} required />
          <label>Nama PIC</label><input value={warehouseForm.pic_name} onChange={(e) => updateWarehouse('pic_name', e.target.value)} />
          <label>Alamat Gudang</label><textarea value={warehouseForm.address} onChange={(e) => updateWarehouse('address', e.target.value)} />
          <label>Email Login</label><input type="email" value={warehouseForm.email} onChange={(e) => updateWarehouse('email', e.target.value)} required />
          <label>Password {warehouseForm.id ? '(kosongkan jika tidak diganti)' : ''}</label><input value={warehouseForm.password} onChange={(e) => updateWarehouse('password', e.target.value)} required={!warehouseForm.id} />
          <label>Status</label><select value={warehouseForm.status} onChange={(e) => updateWarehouse('status', e.target.value)}><option>Aktif</option><option>Nonaktif</option></select>
          <button className="login-button" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Gudang'}</button>
        </form>
      </Modal>
      <Modal open={modal === 'branch'} title={branchForm.id ? 'Edit Cabang & Akun' : 'Tambah Cabang & Akun'} onClose={() => setModal(null)} size="lg">
        <form className="mini-form modal-form-grid" onSubmit={submitBranch}>
          <label>Nama Cabang</label><input value={branchForm.branch_name} onChange={(e) => updateBranch('branch_name', e.target.value)} required />
          <label>Nama PIC</label><input value={branchForm.pic_name} onChange={(e) => updateBranch('pic_name', e.target.value)} />
          <label>Alamat Cabang</label><textarea value={branchForm.address} onChange={(e) => updateBranch('address', e.target.value)} />
          <label>Email Login</label><input type="email" value={branchForm.email} onChange={(e) => updateBranch('email', e.target.value)} required />
          <label>Password {branchForm.id ? '(kosongkan jika tidak diganti)' : ''}</label><input value={branchForm.password} onChange={(e) => updateBranch('password', e.target.value)} required={!branchForm.id} />
          <label>Status</label><select value={branchForm.status} onChange={(e) => updateBranch('status', e.target.value)}><option>Aktif</option><option>Nonaktif</option></select>
          <button className="login-button" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Cabang'}</button>
        </form>
      </Modal>
      <Modal open={modal === 'confirm-status'} title="Konfirmasi Perubahan Status" onClose={() => setModal(null)}>
        <div className="confirm-modal-content"><p>Anda akan <b>{confirmAction?.nextStatus === 'Aktif' ? 'mengaktifkan' : 'menonaktifkan'}</b> data <b>{confirmAction?.row?.name || confirmAction?.row?.email}</b>. Akun terkait akan ikut diperbarui.</p><div className="modal-actions"><button type="button" className="soft-action" onClick={() => setModal(null)}>Batal</button><button type="button" className={confirmAction?.nextStatus === 'Aktif' ? 'soft-success' : 'soft-danger'} onClick={executeConfirm} disabled={saving}>{saving ? 'Memproses...' : 'Ya, Lanjutkan'}</button></div></div>
      </Modal>
      <Modal open={modal === 'view'} title="Detail Akun & Mitra" onClose={() => setModal(null)} size="lg">
        {selectedItem && <div className="detail-stack account-detail-modal"><p><b>Jenis</b><span>{roleLabels[selectedItem.account?.role] || selectedItem.type}</span></p><p><b>Nama</b><span>{selectedItem.data?.name || selectedItem.account?.name || '-'}</span></p><p><b>Email Login</b><span>{selectedItem.account?.email || '-'}</span></p><p><b>Alamat/Terhubung</b><span>{selectedItem.data?.address || selectedItem.account?.supplier_name || selectedItem.account?.warehouse_name || selectedItem.account?.branch_name || '-'}</span></p><p><b>Status</b><span>{selectedItem.data?.status || selectedItem.account?.status || '-'}</span></p></div>}
      </Modal>
    </>
  )
}
