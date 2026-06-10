export function ChickenBadge() {
  return (
    <svg viewBox="0 0 120 120" className="svg-hero" aria-hidden="true">
      <circle className="svg-pulse" cx="60" cy="60" r="48" />
      <path className="svg-wing" d="M37 62c5-23 27-31 45-18 12 9 16 26 7 40-8 12-24 16-38 10-13-6-18-18-14-32Z" />
      <path className="svg-body" d="M45 61c3-18 20-27 36-19 11 6 17 20 12 33-6 15-26 22-41 12-8-5-11-15-7-26Z" />
      <path className="svg-crest" d="M52 37c-8-11 3-20 10-11 4-13 18-7 13 5 12-4 17 10 5 15" />
      <circle cx="73" cy="55" r="3.5" fill="#241915" />
      <path d="M83 60l13 6-14 7" fill="#f59e0b" />
      <path className="svg-spark spark-a" d="M22 35l7 3-7 3-3 7-3-7-7-3 7-3 3-7z" />
      <path className="svg-spark spark-b" d="M96 28l5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />
    </svg>
  )
}

export function TruckIcon() {
  return (
    <svg viewBox="0 0 80 80" className="mini-svg" aria-hidden="true">
      <rect className="svg-card-a" x="12" y="29" width="35" height="24" rx="5" />
      <path className="svg-card-b" d="M47 36h12l9 10v7H47z" />
      <circle className="svg-wheel" cx="28" cy="56" r="6" />
      <circle className="svg-wheel" cx="58" cy="56" r="6" />
      <path className="svg-motion" d="M8 35h13M5 44h18" />
    </svg>
  )
}

export function StockIcon() {
  return (
    <svg viewBox="0 0 80 80" className="mini-svg" aria-hidden="true">
      <ellipse className="svg-card-b" cx="40" cy="22" rx="24" ry="9" />
      <path className="svg-card-a" d="M16 22v26c0 5 11 10 24 10s24-5 24-10V22" />
      <path className="svg-line" d="M16 35c0 5 11 10 24 10s24-5 24-10M16 47c0 5 11 10 24 10s24-5 24-10" />
    </svg>
  )
}

export function PartnerIcon() {
  return (
    <svg viewBox="0 0 80 80" className="mini-svg" aria-hidden="true">
      <circle className="svg-card-b" cx="29" cy="28" r="11" />
      <circle className="svg-card-a" cx="52" cy="28" r="11" />
      <path className="svg-line" d="M14 58c2-13 11-20 22-20M66 58c-2-13-11-20-22-20" />
      <path className="svg-motion" d="M35 45h10" />
    </svg>
  )
}
