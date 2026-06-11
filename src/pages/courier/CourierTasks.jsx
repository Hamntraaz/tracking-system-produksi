import { useMemo, useState } from 'react'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { courierTaskResponse } from '../../services/api'

function normalizeTasks(data, user) {
  const supplierTasks = (Array.isArray(data.deliveries) ? data.deliveries : [])
    .filter((item) => !user?.courier_id || String(item.courier_id || '') === String(user.courier_id))
    .map((item) => ({ ...item, delivery_type: 'supplier_delivery', task_id: item.id, source_label: item.supplier_name || 'Supplier', target_label: item.warehouse_name || 'Gudang' }))
  const branchTasks = (Array.isArray(data.branch_requests) ? data.branch_requests : [])
    .filter((item) => item.courier_id && (!user?.courier_id || String(item.courier_id || '') === String(user.courier_id)))
    .map((item) => ({ ...item, delivery_type: 'branch_request', task_id: item.id, order_code: item.code, pickup_address: item.warehouse_name || 'Gudang', destination_address: item.branch_name || 'Cabang', source_label: item.warehouse_name || 'Gudang', target_label: item.branch_name || 'Cabang' }))
  return [...supplierTasks, ...branchTasks]
}

export default function CourierTasks({ data = {}, refreshData, user }) {
  const tasks = useMemo(() => normalizeTasks(data, user).filter((task) => !['Menunggu Konfirmasi Gudang', 'Menunggu Konfirmasi Cabang', 'Pengiriman Selesai', 'Pesanan Diterima', 'Diterima Cabang'].includes(task.status)), [data, user])
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState('')
  const [rejectTask, setRejectTask] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  async function acceptTask(row) {
    setBusyId(`${row.delivery_type}:${row.task_id}`); setMessage('')
    try {
      await courierTaskResponse({ deliveryId: row.delivery_type === 'supplier_delivery' ? row.task_id : undefined, requestId: row.delivery_type === 'branch_request' ? row.task_id : undefined, deliveryType: row.delivery_type, courierId: row.courier_id, action: 'accept' })
      setMessage(`${row.order_code || row.code} diterima. Silakan lanjut ke menu Maps untuk klik Driver Berangkat.`)
      await refreshData?.()
    } catch (error) { setMessage(error.message || 'Gagal menerima tugas antar.') }
    finally { setBusyId(null) }
  }

  async function submitReject() {
    if (!rejectTask) return
    if (!rejectReason.trim()) { setMessage('Isi alasan penolakan terlebih dahulu.'); return }
    setBusyId(`${rejectTask.delivery_type}:${rejectTask.task_id}`); setMessage('')
    try {
      await courierTaskResponse({ deliveryId: rejectTask.delivery_type === 'supplier_delivery' ? rejectTask.task_id : undefined, requestId: rejectTask.delivery_type === 'branch_request' ? rejectTask.task_id : undefined, deliveryType: rejectTask.delivery_type, courierId: rejectTask.courier_id, action: 'reject', reason: rejectReason })
      setMessage(`${rejectTask.order_code || rejectTask.code} ditolak dan catatan sudah dikirim.`)
      setRejectTask(null); setRejectReason('')
      await refreshData?.()
    } catch (error) { setMessage(error.message || 'Gagal menolak tugas antar.') }
    finally { setBusyId(null) }
  }

  const columns = [
    { key: 'order_code', label: 'Order/Request' },
    { key: 'source_label', label: 'Dari' },
    { key: 'target_label', label: 'Tujuan' },
    { key: 'courier_name', label: 'Kurir' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
    { key: 'actions', label: 'Aksi', render: (row) => { const canRespond = row.status === 'Menunggu Persetujuan Kurir'; const key = `${row.delivery_type}:${row.task_id}`; return <div className="table-actions task-actions"><button type="button" onClick={() => acceptTask(row)} disabled={!canRespond || busyId === key}>✓ Terima</button><button type="button" className="soft-danger" onClick={() => setRejectTask(row)} disabled={!canRespond || busyId === key}>Tolak</button></div> } },
  ]

  return <><section className="page-head-card"><div><span>Kurir</span><h2>Tugas Pengiriman</h2><p>Kurir supplier mengantar ke gudang. Kurir gudang mengantar ke cabang. Pilih tugas, terima, lalu lanjutkan dari menu Maps.</p></div></section>{message && <div className="api-alert">{message}</div>}<article className="panel-card"><ResponsiveTable columns={columns} rows={tasks} /></article><Modal open={Boolean(rejectTask)} title="Tolak Tugas Pengiriman" onClose={() => setRejectTask(null)}><div className="confirm-modal-content"><p>Berikan alasan profesional kenapa tugas <b>{rejectTask?.order_code || rejectTask?.code}</b> ditolak.</p><textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Contoh: kendaraan bermasalah atau jadwal bentrok." /><div className="modal-actions"><button className="soft-action" onClick={() => setRejectTask(null)}>Batal</button><button className="soft-danger" onClick={submitReject}>Kirim Penolakan</button></div></div></Modal></>
}
