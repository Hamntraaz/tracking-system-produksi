import { useCallback, useEffect, useRef, useState } from 'react'

const LAST_LOCATION_KEY = 'rafiza:last-device-location'

function readLastLocation() {
  try {
    const raw = localStorage.getItem(LAST_LOCATION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) return parsed
  } catch {}
  return null
}

function saveLastLocation(location) {
  try {
    localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location))
  } catch {}
}

function normalizePosition(position) {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    speed: position.coords.speed,
    heading: position.coords.heading,
    updatedAt: new Date().toISOString(),
  }
}

export default function useBrowserLocation() {
  const watchIdRef = useRef(null)
  const [deviceLocation, setDeviceLocation] = useState(() => readLastLocation())
  const [locationStatus, setLocationStatus] = useState(readLastLocation() ? 'cached' : 'idle')
  const [locationError, setLocationError] = useState('')

  const applyPosition = useCallback((position) => {
    const location = normalizePosition(position)
    setDeviceLocation(location)
    saveLastLocation(location)
    setLocationStatus('granted')
    setLocationError('')
    return location
  }, [])

  const applyError = useCallback((error) => {
    let message = error?.message || 'Gagal membaca lokasi perangkat.'

    if (error?.code === 1) {
      setLocationStatus('denied')
      message = 'Izin lokasi ditolak. Klik ikon gembok di address bar, izinkan Location, lalu refresh halaman.'
    } else if (error?.code === 2) {
      setLocationStatus('unavailable')
      message = 'Lokasi perangkat belum tersedia. Aktifkan Location Service Windows/HP dan pastikan internet stabil.'
    } else if (error?.code === 3) {
      setLocationStatus('timeout')
      message = 'Pembacaan lokasi timeout. Aktifkan Location Service perangkat, pastikan GPS/internet stabil, lalu muat ulang halaman.'
    } else {
      setLocationStatus('error')
    }

    setLocationError(message)
    return message
  }, [])

  const getPositionOnce = useCallback((options) => new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  }), [])

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported')
      setLocationError('Browser ini belum mendukung Geolocation API.')
      throw new Error('Browser belum mendukung lokasi.')
    }

    setLocationStatus('requesting')
    setLocationError('')

    // Tahap 1: pakai mode cepat/coarse dulu. Di laptop, high accuracy sering timeout.
    try {
      const position = await getPositionOnce({
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 120000,
      })
      applyPosition(position)
      return position
    } catch (firstError) {
      // Tahap 2: baru coba high accuracy lebih lama.
      try {
        const position = await getPositionOnce({
          enableHighAccuracy: true,
          timeout: 45000,
          maximumAge: 30000,
        })
        applyPosition(position)
        return position
      } catch (secondError) {
        applyError(secondError || firstError)
        throw secondError || firstError
      }
    }
  }, [applyError, applyPosition, getPositionOnce])

  const startWatching = useCallback((onPosition) => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported')
      setLocationError('Browser ini belum mendukung Geolocation API.')
      return () => {}
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    setLocationStatus('watching')
    setLocationError('')

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        applyPosition(position)
        if (typeof onPosition === 'function') onPosition(position)
      },
      (error) => {
        applyError(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 5000,
      },
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [applyError, applyPosition])

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  useEffect(() => stopWatching, [stopWatching])

  return {
    deviceLocation,
    locationStatus,
    locationError,
    requestLocation,
    startWatching,
    stopWatching,
  }
}
