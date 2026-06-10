export function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const icons = {
    home: <svg {...common}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>,
    menu: <svg {...common}><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>,
    partner: <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    dashboard: <svg {...common}><rect x="3" y="3" width="7" height="8" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="15" width="7" height="6" rx="2"/></svg>,
    stock: <svg {...common}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
    order: <svg {...common}><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>,
    supplier: <svg {...common}><path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-7h6v7"/><path d="M9 10h.01"/><path d="M15 10h.01"/></svg>,
    courier: <svg {...common}><path d="M3 7h11v10H3z"/><path d="M14 11h3l4 4v2h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
    map: <svg {...common}><path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15"/><path d="M15 6v15"/></svg>,
    report: <svg {...common}><path d="M4 19.5V4a2 2 0 0 1 2-2h9l5 5v12.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>,
    chart: <svg {...common}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
    bell: <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    logout: <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>,
    check: <svg {...common}><path d="m20 6-11 11-5-5"/></svg>,
    plus: <svg {...common}><path d="M12 5v14"/><path d="M5 12h14"/></svg>,
    contact: <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.61a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.47-1.21a2 2 0 0 1 2.11-.45c.84.28 1.71.48 2.61.6A2 2 0 0 1 22 16.92Z"/></svg>,
  }
  return icons[name] || icons.dashboard
}

export function HeroChicken() {
  return (
    <svg className="hero-chicken" viewBox="0 0 430 360" role="img" aria-label="Ilustrasi ayam krispi Rafiza">
      <defs>
        <linearGradient id="drumstick" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffd35c" />
          <stop offset="0.55" stopColor="#ec7b23" />
          <stop offset="1" stopColor="#c8341c" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="18" floodColor="#7a1d10" floodOpacity="0.18" />
        </filter>
      </defs>
      <circle cx="215" cy="180" r="140" fill="#fff2cf" />
      <circle cx="215" cy="180" r="112" fill="#ffd558" opacity=".75" />
      <g filter="url(#softShadow)">
        <path d="M118 221c-42-56-16-125 41-144 62-21 132 18 146 81 13 58-25 111-79 125-44 11-82-9-108-62Z" fill="url(#drumstick)" />
        <path d="M255 96c25-26 56-32 76-13 18 18 12 48-13 73-10 10-22 17-34 21-8-31-17-55-29-81Z" fill="#fff6e8" />
        <circle cx="332" cy="73" r="24" fill="#fff6e8" />
        <circle cx="358" cy="96" r="22" fill="#fff6e8" />
        <path d="M150 151c31-34 84-45 124-12" stroke="#ffef99" strokeWidth="11" strokeLinecap="round" opacity=".7" />
        <path d="M142 215c24 36 75 55 121 28" stroke="#8f2418" strokeWidth="8" strokeLinecap="round" opacity=".2" />
      </g>
      <g className="hero-spark"><circle cx="85" cy="96" r="10"/><circle cx="349" cy="232" r="7"/><circle cx="126" cy="286" r="6"/><path d="M82 260h35"/><path d="M100 242v35"/></g>
    </svg>
  )
}
