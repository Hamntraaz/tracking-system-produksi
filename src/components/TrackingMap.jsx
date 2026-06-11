import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, Circle, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getMapsRoute } from '../services/api'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function roleIcon(role = '') {
  const key = String(role || '').toLowerCase()
  if (key === 'supplier') return '🏭'
  if (key === 'warehouse') return '🏬'
  if (key === 'branch') return '🏪'
  if (key === 'courier') return '🏍️'
  if (key === 'manager') return '📊'
  return '📍'
}

function roleTone(role = '', fallback = 'orange') {
  const key = String(role || '').toLowerCase()
  if (key === 'supplier') return 'red'
  if (key === 'warehouse') return 'green'
  if (key === 'branch') return 'orange'
  if (key === 'courier') return 'orange'
  if (key === 'manager') return 'green'
  return fallback
}

function divMarker(label, tone, emoji = '') {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<span class="pin ${tone}">${emoji}</span><b>${escapeHtml(label)}</b>`,
    iconSize: [150, 42],
    iconAnchor: [18, 32],
  })
}

function driverMarker(label = 'Kurir Live') {
  return L.divIcon({
    className: 'driver-live-marker',
    html: `<span class="driver-pulse"></span><span class="driver-dot">🏍️</span><b>${escapeHtml(label)}</b>`,
    iconSize: [160, 52],
    iconAnchor: [26, 32],
  })
}

function viewerLocationLabel(user) {
  const name = user?.name ? ` - ${user.name}` : ''
  if (user?.role === 'warehouse') return `Perangkat Gudang${name}`
  if (user?.role === 'branch') return `Perangkat Cabang${name}`
  if (user?.role === 'supplier') return `Perangkat Supplier${name}`
  if (user?.role === 'courier') return `Perangkat Kurir Live${name}`
  if (user?.role === 'manager') return `Perangkat Manajemen${name}`
  return `Perangkat Pengguna${name}`
}

function userMarker(label, role) {
  return L.divIcon({
    className: 'driver-live-marker viewer-marker',
    html: `<span class="user-pulse"></span><span class="user-dot">${roleIcon(role)}</span><b>${escapeHtml(label)}</b>`,
    iconSize: [190, 52],
    iconAnchor: [26, 32],
  })
}

function toPoint(lat, lng) {
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) return [latitude, longitude]
  return null
}

function normalizePoint(point) {
  if (!point) return null
  const lat = Number(point[0])
  const lng = Number(point[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return [lat, lng]
}

function formatDistance(meters) {
  const value = Number(meters)
  if (!Number.isFinite(value)) return '-'
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)} km`
  return `${Math.round(value)} m`
}

function formatDuration(seconds) {
  const value = Number(seconds)
  if (!Number.isFinite(value)) return '-'
  const minutes = Math.max(1, Math.round(value / 60))
  if (minutes >= 60) return `${Math.floor(minutes / 60)} jam ${minutes % 60} menit`
  return `${minutes} menit`
}

function buildRouteUrl(points) {
  const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(';')
  return `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&alternatives=true&steps=true`
}

function googleMapsRouteUrl(points) {
  const valid = (points || []).map(normalizePoint).filter(Boolean)
  if (valid.length === 1) return `https://www.google.com/maps?q=${valid[0][0]},${valid[0][1]}`
  if (valid.length < 2) return 'https://www.google.com/maps'
  const origin = valid[0]
  const destination = valid[valid.length - 1]
  const waypoints = valid.slice(1, -1).map((point) => `${point[0]},${point[1]}`).join('|')
  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', '1')
  url.searchParams.set('origin', `${origin[0]},${origin[1]}`)
  url.searchParams.set('destination', `${destination[0]},${destination[1]}`)
  url.searchParams.set('travelmode', 'driving')
  if (waypoints) url.searchParams.set('waypoints', waypoints)
  return url.toString()
}

function openExternalMaps(points) {
  window.open(googleMapsRouteUrl(points), '_blank', 'noopener,noreferrer')
}

function ChangeMapView({ points, focusNonce }) {
  const map = useMap()

  useEffect(() => {
    const validPoints = (points || []).filter(Boolean)
    if (validPoints.length < 1) return
    if (validPoints.length === 1) {
      map.setView(validPoints[0], 15, { animate: true })
      return
    }
    const bounds = L.latLngBounds(validPoints)
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16, animate: true })
  }, [points, map, focusNonce])

  return null
}

function MarkerPopup({ title, subtitle, address, status, updatedAt, points, delivery }) {
  return (
    <div className="map-popup-card">
      <strong>{title}</strong>
      {subtitle && <span>{subtitle}</span>}
      {status && <p><b>Status</b><em>{status}</em></p>}
      {delivery?.code && <p><b>Kode</b><em>{delivery.code}</em></p>}
      {delivery?.order_code && <p><b>PO</b><em>{delivery.order_code}</em></p>}
      {address && <p><b>Alamat</b><em>{address}</em></p>}
      {updatedAt && <p><b>Update</b><em>{updatedAt}</em></p>}
      <button type="button" onClick={() => openExternalMaps(points)}>Lihat di Maps</button>
    </div>
  )
}

export default function TrackingMap({ delivery, deviceLocation, showUserLocation = false, viewerUser = null, showOnlyActive = false }) {
  const fallbackCenter = [-6.2, 106.83]
  const pickup = toPoint(delivery?.pickup_lat, delivery?.pickup_lng)
  const dbCurrent = toPoint(delivery?.current_lat, delivery?.current_lng)
  const userPoint = deviceLocation && Number.isFinite(Number(deviceLocation.latitude)) && Number.isFinite(Number(deviceLocation.longitude)) ? [Number(deviceLocation.latitude), Number(deviceLocation.longitude)] : null
  const destination = toPoint(delivery?.destination_lat, delivery?.destination_lng)
  const mapType = delivery?.map_type || 'supplier_delivery'
  const activeStatuses = mapType === 'branch_request'
    ? ['Disetujui Gudang', 'Dikirim ke Cabang', 'Diterima Cabang']
    : ['Tugas Diterima Kurir', 'Menunggu Driver Berangkat', 'Kurir Dalam Perjalanan', 'Driver Sampai', 'Menunggu Konfirmasi Gudang', 'Pengiriman Selesai']
  const trackingActive = activeStatuses.includes(delivery?.status)
  const current = mapType === 'branch_request' ? null : (trackingActive ? dbCurrent : null)

  const pickupRole = delivery?.pickup_role || 'supplier'
  const destinationRole = delivery?.destination_role || 'warehouse'
  const pickupLabel = delivery?.pickup_label || delivery?.supplier_name || 'Supplier'
  const destinationLabel = delivery?.destination_label || delivery?.warehouse_name || 'Gudang'
  const courierLabel = delivery?.courier_name ? `Kurir: ${delivery.courier_name}` : 'Kurir Live'
  const viewerLabel = viewerLocationLabel(viewerUser)

  const roadWaypoints = useMemo(() => {
    if (showOnlyActive && delivery && !trackingActive) return []
    return [pickup, current, destination].filter(Boolean)
  }, [delivery, pickup?.[0], pickup?.[1], current?.[0], current?.[1], destination?.[0], destination?.[1], showOnlyActive, trackingActive])

  const fitPoints = useMemo(() => {
    const base = [pickup, current, destination].filter(Boolean)
    if (showUserLocation && userPoint) return [...base, userPoint]
    return base
  }, [pickup?.[0], pickup?.[1], current?.[0], current?.[1], destination?.[0], destination?.[1], showUserLocation, userPoint?.[0], userPoint?.[1]])

  const waypointKey = useMemo(() => roadWaypoints.map((point) => `${point[0].toFixed(6)},${point[1].toFixed(6)}`).join('|'), [roadWaypoints])
  const [roadRoute, setRoadRoute] = useState([])
  const [routeInfo, setRouteInfo] = useState(null)
  const [routeStatus, setRouteStatus] = useState('Menunggu koordinat pengiriman.')
  const [focusNonce, setFocusNonce] = useState(0)

  useEffect(() => {
    let ignore = false

    async function loadRoadRoute() {
      if (roadWaypoints.length < 2) {
        setRoadRoute([])
        setRouteInfo(null)
        setRouteStatus('Rute belum bisa dibuat karena titik lokasi belum lengkap.')
        return
      }

      setRouteStatus('Mencari jalur gratis terdekat berbasis jalan...')
      try {
        const payload = await getMapsRoute(roadWaypoints)
        const bestRoute = payload?.route
        if (!ignore && Array.isArray(bestRoute?.geometry) && bestRoute.geometry.length > 0) {
          setRoadRoute(bestRoute.geometry)
          setRouteInfo(bestRoute)
          setRouteStatus(`Rute ${bestRoute.source || 'OSRM'} aktif: ${formatDistance(bestRoute.distance_m)} • ${formatDuration(bestRoute.duration_s)}. Jalur mengikuti aturan jalan.`)
          return
        }
        throw new Error(payload?.message || 'Rute backend tidak tersedia')
      } catch (backendError) {
        try {
          const response = await fetch(buildRouteUrl(roadWaypoints))
          const payload = await response.json()
          const routes = Array.isArray(payload?.routes) ? payload.routes : []
          const best = routes.reduce((winner, route) => !winner || Number(route.duration) < Number(winner.duration) ? route : winner, null)
          const coordinates = best?.geometry?.coordinates
          if (!ignore && Array.isArray(coordinates) && coordinates.length > 0) {
            const routeGeometry = coordinates.map(([lng, lat]) => [lat, lng])
            setRoadRoute(routeGeometry)
            setRouteInfo({ distance_m: best.distance, duration_s: best.duration, source: 'OSRM Public' })
            setRouteStatus(`Rute OSRM aktif: ${formatDistance(best.distance)} • ${formatDuration(best.duration)}. Mengikuti jalan, bukan garis lurus.`)
            return
          }
          throw new Error('Rute publik kosong')
        } catch {
          if (!ignore) {
            setRoadRoute(roadWaypoints)
            setRouteInfo(null)
            setRouteStatus('Rute jalan gratis sedang tidak tersedia, sementara memakai garis titik-ke-titik.')
          }
        }
      }
    }

    loadRoadRoute()
    return () => { ignore = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypointKey])

  const emptyText = mapType === 'branch_request'
    ? 'Belum ada titik lokasi gudang/cabang untuk ditampilkan. Aktifkan izin lokasi di perangkat cabang.'
    : 'Belum ada data pengiriman/lokasi untuk ditampilkan.'
  const waitingText = mapType === 'branch_request'
    ? 'Peta cabang menampilkan rute Gudang → Cabang berdasarkan lokasi perangkat yang tersimpan.'
    : 'Driver belum berangkat: peta menampilkan lokasi supplier dan gudang.'

  return (
    <div className="map-shell map-shell-pro">
      {!delivery && !userPoint && <div className="map-empty-overlay">{emptyText}</div>}
      <MapContainer center={fitPoints[0] || fallbackCenter} zoom={13} className="tracking-map" scrollWheelZoom zoomControl={false}>
        <ZoomControl position="topright" />
        <ChangeMapView points={fitPoints.length ? fitPoints : roadRoute} focusNonce={focusNonce} />
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {roadRoute.length >= 2 && <Polyline positions={roadRoute} pathOptions={{ weight: 6, opacity: 0.85 }} />}

        {pickup && (
          <Marker position={pickup} icon={divMarker(pickupLabel, roleTone(pickupRole, 'red'), roleIcon(pickupRole))}>
            <Popup>
              <MarkerPopup title={pickupLabel} subtitle={pickupRole === 'supplier' ? 'Titik pickup supplier' : 'Titik asal'} address={delivery?.pickup_address || `Lokasi ${pickupLabel}`} status={delivery?.status} points={roadWaypoints.length >= 2 ? roadWaypoints : [pickup]} delivery={delivery} />
            </Popup>
          </Marker>
        )}

        {current && (
          <Marker position={current} icon={driverMarker(courierLabel)}>
            <Popup>
              <MarkerPopup title={delivery?.courier_name || 'Posisi Kurir'} subtitle="Lokasi live pengiriman" address={delivery?.current_lat && delivery?.current_lng ? `${Number(delivery.current_lat).toFixed(6)}, ${Number(delivery.current_lng).toFixed(6)}` : 'Koordinat belum tersedia'} status={delivery?.status || 'Belum ada status'} updatedAt={delivery?.recorded_at || '-'} points={roadWaypoints.length >= 2 ? roadWaypoints : [current]} delivery={delivery} />
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={destination} icon={divMarker(destinationLabel, roleTone(destinationRole, 'green'), roleIcon(destinationRole))}>
            <Popup>
              <MarkerPopup title={destinationLabel} subtitle={destinationRole === 'branch' ? 'Titik tujuan cabang' : 'Titik tujuan'} address={delivery?.destination_address || `Lokasi ${destinationLabel}`} status={delivery?.status} points={roadWaypoints.length >= 2 ? roadWaypoints : [destination]} delivery={delivery} />
            </Popup>
          </Marker>
        )}

        {showUserLocation && userPoint && (
          <>
            <Marker position={userPoint} icon={userMarker(viewerLabel, viewerUser?.role)}>
              <Popup>
                <MarkerPopup title={viewerLabel} subtitle="Lokasi perangkat aktif" address={`Akurasi ${Number.isFinite(Number(deviceLocation?.accuracy)) ? `${Math.round(Number(deviceLocation.accuracy))} meter` : '-'}`} points={[userPoint]} delivery={delivery} />
              </Popup>
            </Marker>
            {Number.isFinite(Number(deviceLocation?.accuracy)) && <Circle center={userPoint} radius={Number(deviceLocation.accuracy)} pathOptions={{ weight: 1, opacity: 0.35 }} />}
          </>
        )}
      </MapContainer>

      <div className="map-floating-controls">
        <button type="button" onClick={() => setFocusNonce((value) => value + 1)}>Fokus Rute</button>
        <button type="button" onClick={() => openExternalMaps(roadWaypoints.length >= 2 ? roadWaypoints : fitPoints)}>Lihat di Maps</button>
      </div>

      <div className="route-status-pill route-status-pro">
        <b>{routeInfo ? `${formatDistance(routeInfo.distance_m)} • ${formatDuration(routeInfo.duration_s)}` : 'Maps Gratis'}</b>
        <span>{!trackingActive && delivery ? waitingText : routeStatus}</span>
      </div>
    </div>
  )
}
