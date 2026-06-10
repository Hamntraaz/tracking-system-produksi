import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ResponsiveTable from '../../components/ResponsiveTable'
import StatusBadge from '../../components/StatusBadge'

function escXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function sheetXml(name, headers, rows) {
  const headerRow = headers.map((h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escXml(h.label)}</Data></Cell>`).join('')
  const bodyRows = rows.map((row, index) => {
    const style = index % 2 === 0 ? 'RowA' : 'RowB'
    return `<Row>${headers.map((h) => `<Cell ss:StyleID="${style}"><Data ss:Type="String">${escXml(h.value(row))}</Data></Cell>`).join('')}</Row>`
  }).join('')
  return `<Worksheet ss:Name="${escXml(name).slice(0, 31)}"><Table><Row>${headerRow}</Row>${bodyRows || `<Row><Cell ss:MergeAcross="${headers.length - 1}" ss:StyleID="Empty"><Data ss:Type="String">Belum ada data</Data></Cell></Row>`}</Table></Worksheet>`
}

function downloadExcelWorkbook({ materials, stockIn, stockOut, orders, suppliers }) {
  const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#C51F26" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
<Style ss:ID="RowA"><Interior ss:Color="#FFF7E6" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F5D0A9"/></Borders></Style>
<Style ss:ID="RowB"><Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F5D0A9"/></Borders></Style>
<Style ss:ID="Empty"><Font ss:Italic="1" ss:Color="#666666"/><Interior ss:Color="#F4F4F4" ss:Pattern="Solid"/></Style>
</Styles>
${sheetXml('Stok Bahan', [
  { label: 'Kode', value: (r) => r.code }, { label: 'Bahan', value: (r) => r.name }, { label: 'Kategori', value: (r) => r.category }, { label: 'Stok', value: (r) => `${r.stock} ${r.unit}` }, { label: 'Minimum', value: (r) => `${r.minimum_stock} ${r.unit}` }, { label: 'Status', value: (r) => r.status },
], materials)}
${sheetXml('Barang Masuk', [
  { label: 'Tanggal', value: (r) => r.created_at }, { label: 'PO', value: (r) => r.order_code }, { label: 'Bahan', value: (r) => r.material_name }, { label: 'Jumlah', value: (r) => `${r.quantity} ${r.unit}` }, { label: 'Stok Awal', value: (r) => r.stock_before }, { label: 'Stok Akhir', value: (r) => r.stock_after }, { label: 'Catatan', value: (r) => r.notes },
], stockIn)}
${sheetXml('Pemakaian Produksi', [
  { label: 'Tanggal', value: (r) => r.created_at }, { label: 'Bahan', value: (r) => r.material_name }, { label: 'Jumlah', value: (r) => `${r.quantity} ${r.unit}` }, { label: 'Stok Awal', value: (r) => r.stock_before }, { label: 'Stok Akhir', value: (r) => r.stock_after }, { label: 'Catatan', value: (r) => r.notes }, { label: 'Dicatat Oleh', value: (r) => r.created_by },
], stockOut)}
${sheetXml('Pembelian Gudang', [
  { label: 'Kode PO', value: (r) => r.code }, { label: 'Gudang/Cabang', value: (r) => r.warehouse_name }, { label: 'Supplier', value: (r) => r.supplier_name }, { label: 'Item', value: (r) => r.items_text }, { label: 'Kurir', value: (r) => r.courier_name }, { label: 'Status', value: (r) => r.status }, { label: 'Tanggal', value: (r) => r.ordered_at },
], orders)}
${sheetXml('Supplier', [
  { label: 'Nama PT/CV', value: (r) => r.name }, { label: 'Bahan Baku', value: (r) => r.material_type }, { label: 'Satuan', value: (r) => r.material_unit }, { label: 'Kontak', value: (r) => r.phone }, { label: 'Status', value: (r) => r.status },
], suppliers)}
</Workbook>`
  downloadBlob(`laporan-operasional-rafiza-${new Date().toISOString().slice(0, 10)}.xls`, workbook, 'application/vnd.ms-excel;charset=utf-8')
}

function addSectionPdf(doc, title, headers, rows, startNewPage = false) {
  if (startNewPage) doc.addPage()
  doc.setFillColor(197, 31, 38)
  doc.rect(0, 0, 210, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.text(title, 14, 14)
  doc.setTextColor(42, 30, 22)
  autoTable(doc, {
    startY: 30,
    head: [headers.map((h) => h.label)],
    body: rows.length ? rows.map((row) => headers.map((h) => h.value(row))) : [[`Belum ada data ${title}`]],
    theme: 'grid',
    headStyles: { fillColor: [197, 31, 38], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [255, 247, 230] },
    styles: { fontSize: 8, cellPadding: 2 },
  })
}

function downloadPdfReport({ materials, stockIn, stockOut, orders, suppliers }) {
  const doc = new jsPDF('p', 'mm', 'a4')
  doc.setProperties({ title: 'Laporan Operasional Rafiza Fried Chicken' })
  addSectionPdf(doc, 'Laporan Stok Bahan Baku', [
    { label: 'Kode', value: (r) => r.code }, { label: 'Bahan', value: (r) => r.name }, { label: 'Stok', value: (r) => `${r.stock} ${r.unit}` }, { label: 'Minimum', value: (r) => `${r.minimum_stock} ${r.unit}` }, { label: 'Status', value: (r) => r.status },
  ], materials, false)
  addSectionPdf(doc, 'Laporan Barang Masuk', [
    { label: 'Tanggal', value: (r) => r.created_at }, { label: 'PO', value: (r) => r.order_code }, { label: 'Bahan', value: (r) => r.material_name }, { label: 'Jumlah', value: (r) => `${r.quantity} ${r.unit}` }, { label: 'Stok Akhir', value: (r) => r.stock_after },
  ], stockIn, true)
  addSectionPdf(doc, 'Laporan Pemakaian Produksi', [
    { label: 'Tanggal', value: (r) => r.created_at }, { label: 'Bahan', value: (r) => r.material_name }, { label: 'Jumlah', value: (r) => `${r.quantity} ${r.unit}` }, { label: 'Stok Akhir', value: (r) => r.stock_after }, { label: 'Dicatat Oleh', value: (r) => r.created_by },
  ], stockOut, true)
  addSectionPdf(doc, 'Laporan Pembelian Gudang', [
    { label: 'PO', value: (r) => r.code }, { label: 'Gudang', value: (r) => r.warehouse_name }, { label: 'Supplier', value: (r) => r.supplier_name }, { label: 'Item', value: (r) => r.items_text }, { label: 'Status', value: (r) => r.status },
  ], orders, true)
  addSectionPdf(doc, 'Laporan Supplier', [
    { label: 'Nama PT/CV', value: (r) => r.name }, { label: 'Bahan', value: (r) => r.material_type }, { label: 'Satuan', value: (r) => r.material_unit }, { label: 'Kontak', value: (r) => r.phone }, { label: 'Status', value: (r) => r.status },
  ], suppliers, true)
  doc.save(`laporan-operasional-rafiza-${new Date().toISOString().slice(0, 10)}.pdf`)
}

function ChartBar({ value, total, tone = '' }) {
  const width = total > 0 && value > 0 ? Math.max(6, Math.min(100, Math.round((value / total) * 100))) : 0
  return <div className={`bar-track ${tone}`}><i style={{ width: `${width}%` }} /></div>
}

export default function ManagerReports({ data = {} }) {
  const materials = Array.isArray(data.materials) ? data.materials : []
  const movements = Array.isArray(data.movements) ? data.movements : []
  const orders = Array.isArray(data.orders) ? data.orders : []
  const suppliers = Array.isArray(data.suppliers) ? data.suppliers : []
  const stockIn = movements.filter((item) => item.movement_type === 'IN')
  const stockOut = movements.filter((item) => item.movement_type === 'OUT')
  const inQty = stockIn.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const outQty = stockOut.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const lowStock = materials.filter((item) => item.status === 'Menipis').length
  const maxMetric = Math.max(inQty, outQty, lowStock, 0)

  const columns = [
    { key: 'code', label: 'Kode' },
    { key: 'name', label: 'Bahan' },
    { key: 'stock', label: 'Stok', render: (row) => `${row.stock} ${row.unit}` },
    { key: 'minimum_stock', label: 'Minimum', render: (row) => `${row.minimum_stock} ${row.unit}` },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
  ]

  const movementColumns = [
    { key: 'created_at', label: 'Tanggal' },
    { key: 'order_code', label: 'PO' },
    { key: 'material_name', label: 'Bahan' },
    { key: 'source_type', label: 'Sumber' },
    { key: 'quantity', label: 'Jumlah', render: (row) => `${row.quantity} ${row.unit}` },
    { key: 'stock_after', label: 'Stok Akhir' },
  ]

  return (
    <>
      <section className="page-head-card">
        <div><span>Manajemen</span><h2>Laporan Operasional</h2><p>Laporan stok, pembelian gudang, barang masuk, dan pemakaian produksi.</p></div>
        <div className="header-actions">
          <button className="soft-action" type="button" onClick={() => downloadExcelWorkbook({ materials, stockIn, stockOut, orders, suppliers })}>Download Excel</button>
          <button className="soft-action" type="button" onClick={() => downloadPdfReport({ materials, stockIn, stockOut, orders, suppliers })}>Download PDF</button>
        </div>
      </section>

      <section className="stats-grid">
        <div className="mini-chart-card"><span>Barang Masuk</span><b>{inQty}</b><ChartBar value={inQty} total={maxMetric} /></div>
        <div className="mini-chart-card"><span>Pemakaian Produksi</span><b>{outQty}</b><ChartBar value={outQty} total={maxMetric} tone="red" /></div>
        <div className="mini-chart-card"><span>Stok Menipis</span><b>{lowStock}</b><ChartBar value={lowStock} total={maxMetric} tone="orange" /></div>
      </section>

      <article className="panel-card"><div className="panel-head"><div><span>Laporan</span><h3>Stok Bahan Baku</h3></div></div><ResponsiveTable columns={columns} rows={materials} /></article>
      <article className="panel-card"><div className="panel-head"><div><span>Laporan</span><h3>Barang Masuk dari Supplier</h3></div></div><ResponsiveTable columns={movementColumns} rows={stockIn} /></article>
      <article className="panel-card"><div className="panel-head"><div><span>Laporan</span><h3>Pemakaian Produksi</h3></div></div><ResponsiveTable columns={movementColumns} rows={stockOut} /></article>
    </>
  )
}
