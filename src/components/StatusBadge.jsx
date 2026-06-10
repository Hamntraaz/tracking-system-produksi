function toneFromText(text = '') {
  const value = text.toLowerCase()
  if (value.includes('selesai') || value.includes('aman') || value.includes('aktif') || value.includes('tersedia')) return 'green'
  if (value.includes('menipis') || value.includes('menunggu') || value.includes('diproses')) return 'yellow'
  if (value.includes('jalan') || value.includes('kirim') || value.includes('mengantar')) return 'blue'
  if (value.includes('tolak') || value.includes('habis')) return 'red'
  return 'neutral'
}

export default function StatusBadge({ children, tone }) {
  return <span className={`status-badge ${tone || toneFromText(String(children))}`}>{children}</span>
}
