import { useMemo, useState } from 'react'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
function belongs(row, user) { return !user?.branch_id || String(row.branch_id || '') === String(user.branch_id || '') }
export default function BranchStock({ data = {}, user }) {
  const rows = (Array.isArray(data.branch_stocks) ? data.branch_stocks : []).filter((row) => belongs(row, user))
  const [filters, setFilters] = useState({ search: '', status: 'Semua' })
  const filtered = useMemo(() => rows.filter((row) => (filters.status === 'Semua' || row.status === filters.status) && [row.material_name, row.category, row.branch_name].some((v) => String(v || '').toLowerCase().includes(filters.search.toLowerCase()))), [rows, filters])
  const columns = [
    { key: 'material_name', label: 'Barang' }, { key: 'category', label: 'Kategori' }, { key: 'stock', label: 'Stok Cabang', render: (row) => `${row.stock} ${row.unit}` }, { key: 'updated_at', label: 'Update' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
  ]
  return <><section className="page-head-card"><div><span>Cabang</span><h2>Stok Cabang</h2><p>Stok cabang hanya bertambah setelah gudang mengirim dan cabang mengonfirmasi barang diterima.</p></div></section><article className="panel-card"><div className="filter-bar"><input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Cari barang..." /><select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}><option>Semua</option><option>Aman</option><option>Menipis</option><option>Kosong</option></select></div><ResponsiveTable columns={columns} rows={filtered} /></article></>
}
