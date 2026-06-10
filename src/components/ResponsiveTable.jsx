export default function ResponsiveTable({ columns = [], rows = [], emptyText = 'Data belum tersedia.' }) {
  const safeColumns = Array.isArray(columns) ? columns : []
  const safeRows = Array.isArray(rows) ? rows : []

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{safeColumns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {safeRows.length === 0 && (
            <tr><td colSpan={Math.max(safeColumns.length, 1)} className="empty-cell">{emptyText}</td></tr>
          )}
          {safeRows.map((row, index) => (
            <tr key={row?.id || row?.code || index}>
              {safeColumns.map((column) => (
                <td key={column.key} data-label={column.label}>
                  {column.render ? column.render(row || {}) : (row?.[column.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
