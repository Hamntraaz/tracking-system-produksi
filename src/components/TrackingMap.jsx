import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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
  if (user?.role === 'warehouse') return `Perangkat Gudang/Cabang${name}`
  if (user?.role === 'supplier') return `Perangkat Supplier${name}`
  if (user?.role === 'courier') return `Perangkat Kurir Live${name}`
  if (user?.role === 'manager') return `Perangkat Manajemen${name}`
  return `Perangkat Pengguna${name}`
}

function userMarker(label) {
  return L.divIcon({
    className: 'driver-live-marker viewer-marker',
    html: `<span class="user-pulse"></span><span class="user-dot">📍</span><b>${escapeHtml(label)}</b>`,
    iconSize: [180, 52],
    iconAnchor: [26, 32],
  })
}

function toPoint(lat, lng) {
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) return [latitude, longitude]
  return null
}

function buildRouteUrl(points) {
  const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(';')
  return `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`
}

function ChangeMapView({ points }) {
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
  }, [points, map])

  return null
}

export default function TrackingMap({ delivery, deviceLocation, showUserLocation = false, viewerUser = null }) {
  const fallbackCenter = [-6.2, 106.83]
  const pickup = toPoint(delivery?.pickup_lat, delivery?.pickup_lng)
  const dbCurrent = toPoint(delivery?.current_lat, delivery?.current_lng)
  const userPoint = deviceLocation && Number.isFinite(Number(deviceLocation.latitude)) && Number.isFinite(Number(deviceLocation.longitude)) ? [Number(deviceLocation.latitude), Number(deviceLocation.longitude)] : null
  const trackingActive = ['Kurir Dalam Perjalanan', 'Driver Sampai', 'Pengiriman Selesai'].includes(delivery?.status)
  // Sebelum driver klik Driver Berangkat, maps hanya menampilkan titik supplier dan gudang.
  const current = trackingActive ? dbCurrent : null
  const destination = toPoint(delivery?.destination_lat, delivery?.destination_lng)

  const supplierLabel = delivery?.supplier_name || 'Supplier'
  const warehouseLabel = delivery?.warehouse_name || 'Gudang/Cabang'
  const courierLabel = delivery?.courier_name ? `Kurir: ${delivery.courier_name}` : 'Kurir Live'
  const viewerLabel = viewerLocationLabel(viewerUser)

  const roadWaypoints = useMemo(() => [pickup, current, destination].filter(Boolean), [pickup, current, destination])
  const fitPoints = useMemo(() => {
    const base = [pickup, current, destination].filter(Boolean)
    if (showUserLocation && userPoint) return [...base, userPoint]
    return base
  }, [pickup, current, destination, showUserLocation, userPoint])

  const [roadRoute, setRoadRoute] = useState([])
  const [routeStatus, setRouteStatus] = useState('Menunggu koordinat pengiriman.')

  useEffect(() => {
    let ignore = false

    async function loadRoadRoute() {
      if (roadWaypoints.length < 2) {
        setRoadRoute([])
        setRouteStatus('Rute belum bisa dibuat karena titik lokasi belum lengkap.')
        return
      }

      setRouteStatus('Mengambil rute jalan dari OSRM...')
      try {
        const response = await fetch(buildRouteUrl(roadWaypoints))
        const payload = await response.json()
        const coordinates = payload?.routes?.[0]?.geometry?.coordinates
        if (!ignore && Array.isArray(coordinates) && coordinates.length > 0) {
          setRoadRoute(coordinates.map(([lng, lat]) => [lat, lng]))
          setRouteStatus('Rute mengikuti jalan aktif.')
        } else if (!ignore) {
          setRoadRoute(roadWaypoints)
          setRouteStatus('Rute jalan tidak tersedia, memakai garis titik-ke-titik.')
        }
      } catch {
        if (!ignore) {
          setRoadRoute(roadWaypoints)
          setRouteStatus('Gagal mengambil rute jalan, memakai garis titik-ke-titik. Cek internet.')
        }
      }
    }

    loadRoadRoute()
    return () => { ignore = true }
  }, [roadWaypoints])

  return (
    <div className="map-shell">
      {!delivery && !userPoint && <div className="map-empty-overlay">Belum ada data pengiriman/lokasi untuk ditampilkan.</div>}
      <MapContainer center={fitPoints[0] || fallbackCenter} zoom={13} className="tracking-map" scrollWheelZoom>
        <ChangeMapView points={fitPoints} />
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {roadRoute.length >= 2 && <Polyline positions={roadRoute} pathOptions={{ weight: 6, opacity: 0.85 }} />}

        {pickup && (
          <Marker position={pickup} icon={divMarker(supplierLabel, 'red', '🏭')}>
            <Popup><b>{supplierLabel}</b><br />{delivery?.pickup_address || 'Lokasi supplier dari perangkat supplier'}</Popup>
          </Marker>
        )}

        {current && (
          <Marker position={current} icon={driverMarker(courierLabel)}>
            <Popup>
              <b>{delivery?.courier_name || 'Posisi Kurir'}</b><br />
              Status: {delivery?.status || 'Belum ada status'}<br />
              Update terakhir: {delivery?.recorded_at || '-'}<br />
              Sumber: {dbCurrent ? 'Database delivery_locations' : 'Lokasi perangkat kurir'}
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={destination} icon={divMarker(warehouseLabel, 'green', '🏬')}>
            <Popup><b>{warehouseLabel}</b><br />{delivery?.destination_address || 'Lokasi gudang/cabang dari perangkat admin'}</Popup>
          </Marker>
        )}

        {showUserLocation && userPoint && (
          <>
            <Marker position={userPoint} icon={userMarker(viewerLabel)}>
              <Popup>
                <b>{viewerLabel}</b><br />
                Akurasi: {Number.isFinite(Number(deviceLocation?.accuracy)) ? `${Math.round(Number(deviceLocation.accuracy))} meter` : '-'}
              </Popup>
            </Marker>
            {Number.isFinite(Number(deviceLocation?.accuracy)) && <Circle center={userPoint} radius={Number(deviceLocation.accuracy)} pathOptions={{ weight: 1, opacity: 0.35 }} />}
          </>
        )}
      </MapContainer>
      <div className="route-status-pill">{!trackingActive && delivery ? 'Driver belum berangkat: peta menampilkan lokasi supplier dan gudang.' : routeStatus}</div>
    </div>
  )
}
