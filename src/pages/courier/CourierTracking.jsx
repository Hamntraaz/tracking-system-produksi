import { useEffect, useRef, useState } from 'react'
import TrackingMap from '../../components/TrackingMap'
import Modal from '../../components/Modal'
import StatusBadge from '../../components/StatusBadge'
import { deliveryComplete, driverArrived, driverStart, updateDeliveryLocation } from '../../services/api'
import { isCloudinaryReady, uploadProofToCloudinary } from '../../services/cloudinary'

function SwipeToConfirm({ disabled, onUnlocked }) {
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [thumbX, setThumbX] = useState(0)
  const trackRef = useRef(null)

  function setFromClientX(clientX) {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    const maxX = Math.max(0, rect.width - 58)
    const rawX = Math.max(0, Math.min(maxX, clientX - rect.left - 29))
    setThumbX(rawX)
    setProgress(maxX ? rawX / maxX : 0)
  }

  function finishDrag() {
    setDragging(false)
    if (progress >= 0.86) {
      const rect = trackRef.current?.getBoundingClientRect()
      setProgress(1)
      setThumbX(rect ? Math.max(0, rect.width - 58) : 0)
      onUnlocked?.()
      window.setTimeout(() => { setProgress(0); setThumbX(0) }, 550)
    } else {
      setProgress(0)
      setThumbX(0)
    }
  }

  return (
    <div
      ref={trackRef}
      className={`swipe-track ${disabled ? 'disabled' : ''} ${dragging ? 'dragging' : ''}`}
      onPointerMove={(event) => dragging && !disabled && setFromClientX(event.clientX)}
      onPointerUp={() => !disabled && finishDrag()}
      onPointerCancel={() => !disabled && finishDrag()}
    >
      <span>Geser ke kanan untuk konfirmasi sampai</span>
      <button
        type="button"
        className="swipe-thumb"
        style={{ transform: `translateX(${thumbX}px)` }}
        onPointerDown={(event) => {
          if (disabled) return
          event.currentTarget.setPointerCapture?.(event.pointerId)
          setDragging(true)
          setFromClientX(event.clientX)
        }}
        aria-label="Geser konfirmasi selesai"
      >
        →
      </button>
    </div>
  )
}

export default function CourierTracking({ data = {}, user, deviceLocation, locationStatus, locationError, requestLocation, startWatching, stopWatching, refreshData }) {
  const delivery = data.deliveries?.find((item) => item.courier_id) || data.deliveries?.[0]
  const [trackingOn, setTrackingOn] = useState(false)
  const [sendStatus, setSendStatus] = useState('Menunggu instruksi perjalanan.')
  const [proofPhoto, setProofPhoto] = useState(delivery?.proof_photo || '')
  const [proofName, setProofName] = useState('')
  const [proofPreview, setProofPreview] = useState(delivery?.proof_photo || '')
  const [proofNote, setProofNote] = useState('')
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [uploadModal, setUploadModal] = useState({ open: false, stage: 'idle', progress: 0, message: '' })
  const [uploadResult, setUploadResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const lastSentRef = useRef(0)

  const isInTransit = delivery?.status === 'Kurir Dalam Perjalanan'
  const isArrived = delivery?.status === 'Driver Sampai'
  const isWaitingStart = delivery && ['Menunggu Driver Berangkat', 'Tugas Diterima Kurir'].includes(delivery.status)
  const isDone = delivery?.status === 'Pengiriman Selesai'
  const canUploadProof = isArrived && !isDone

  async function sendPosition(position) {
    if (!delivery?.id) return
    const now = Date.now()
    if (now - lastSentRef.current < 3000) return
    lastSentRef.current = now
    const coords = position.coords || position
    try {
      await updateDeliveryLocation({ deliveryId: delivery.id, courierId: delivery?.courier_id, latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy })
      setSendStatus(`Lokasi tersimpan ${new Date().toLocaleTimeString('id-ID')}`)
      refreshData?.({ silent: true })
    } catch (error) {
      setSendStatus(error.message || 'Gagal menyimpan lokasi ke database.')
    }
  }

  async function startDriver() {
    if (!delivery?.id) {
      setSendStatus('Belum ada tugas pengiriman aktif.')
      return
    }
    setBusy(true)
    try {
      const position = deviceLocation ? { coords: deviceLocation } : await requestLocation()
      const coords = position.coords || position
      await driverStart({ deliveryId: delivery.id, courierId: delivery?.courier_id, latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy })
      setSendStatus('Driver berangkat. Status gudang dan supplier berubah menjadi Kurir Dalam Perjalanan.')
      await refreshData?.()
      startWatching((latestPosition) => sendPosition(latestPosition))
      setTrackingOn(true)
    } catch (error) {
      setSendStatus(error?.message || 'Gagal memulai perjalanan. Cek izin lokasi browser/perangkat.')
    } finally {
      setBusy(false)
    }
  }

  async function markDriverArrived() {
    if (!delivery?.id) return
    setBusy(true)
    setSendStatus('Menyimpan status driver sampai...')
    try {
      const position = deviceLocation ? { coords: deviceLocation } : await requestLocation()
      const coords = position.coords || position
      await driverArrived({ deliveryId: delivery.id, courierId: delivery?.courier_id, latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy })
      setSendStatus('Driver sampai. Upload bukti foto penerimaan sudah dibuka.')
      await refreshData?.()
    } catch (error) {
      setSendStatus(error?.message || 'Gagal menyimpan status driver sampai.')
    } finally {
      setBusy(false)
    }
  }

  async function handleProofFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      setSendStatus('Ukuran bukti foto terlalu besar. Gunakan foto maksimal 15MB. Foto akan dikompres otomatis sebelum upload.')
      return
    }
    if (!isCloudinaryReady()) {
      setSendStatus('Cloudinary belum dikonfigurasi. Isi Cloud Name dan Upload Preset di frontend/.env.')
      return
    }
    const localPreview = URL.createObjectURL(file)
    setUploadingProof(true)
    setUploadResult(null)
    setProofName(file.name)
    setProofPreview(localPreview)
    setUploadModal({ open: true, stage: 'preparing', progress: 4, message: 'Menyiapkan foto bukti...' })
    setSendStatus('Mengupload bukti foto ke Cloudinary...')
    try {
      const uploaded = await uploadProofToCloudinary(file, {
        onProgress: (info) => setUploadModal((prev) => ({
          open: true,
          stage: info.stage || prev.stage,
          progress: Number.isFinite(Number(info.progress)) ? Number(info.progress) : prev.progress,
          message: info.message || prev.message,
        })),
      })
      setProofPhoto(uploaded.url)
      setProofPreview(uploaded.url)
      setUploadResult(uploaded)
      setUploadModal({ open: true, stage: 'success', progress: 100, message: 'Bukti foto berhasil diupload ke Cloudinary.' })
      setSendStatus('Bukti foto berhasil tersimpan di Cloudinary. Swipe konfirmasi pengiriman sudah aktif.')
    } catch (error) {
      setProofPhoto('')
      setUploadModal({ open: true, stage: 'error', progress: 0, message: error.message || 'Upload bukti foto gagal.' })
      setSendStatus(error.message || 'Upload bukti foto gagal.')
    } finally {
      setUploadingProof(false)
      URL.revokeObjectURL(localPreview)
    }
  }

  async function completeDelivery() {
    if (!delivery?.id) return
    if (!proofPhoto) {
      setSendStatus('Upload bukti foto ke Cloudinary dulu sebelum menyelesaikan pengiriman.')
      return
    }
    if (!confirmChecked) {
      setSendStatus('Centang konfirmasi bahwa barang benar-benar sudah diterima.')
      return
    }
    setBusy(true)
    try {
      const position = deviceLocation ? { coords: deviceLocation } : await requestLocation()
      const coords = position.coords || deviceLocation
      await deliveryComplete({ deliveryId: delivery.id, courierId: delivery?.courier_id, latitude: coords.latitude, longitude: coords.longitude, proofPhoto, proofNote })
      stopWatching?.()
      setTrackingOn(false)
      setConfirmVisible(false)
      setConfirmChecked(false)
      setSendStatus('Pengiriman selesai. Bukti foto dapat dilihat oleh gudang, supplier, dan manajemen.')
      await refreshData?.()
    } catch (error) {
      setSendStatus(error.message || 'Gagal menyelesaikan pengiriman.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!isInTransit || trackingOn) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const position = await requestLocation?.()
        if (cancelled) return
        await sendPosition(position)
        startWatching?.((latestPosition) => sendPosition(latestPosition))
        setTrackingOn(true)
        setSendStatus('Tracking live aktif. Lokasi dikirim otomatis ke database.')
      } catch (error) {
        setTrackingOn(false)
        setSendStatus(error?.message || 'Tracking belum aktif karena lokasi perangkat belum terbaca.')
      }
    })()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInTransit, delivery?.id])

  useEffect(() => {
    setProofPhoto(delivery?.proof_photo || '')
    setProofPreview(delivery?.proof_photo || '')
  }, [delivery?.proof_photo])

  useEffect(() => () => stopWatching?.(), [stopWatching])

  return (
    <>
      <section className="page-head-card">
        <div><span>Kurir</span><h2>Live Tracking Pengiriman</h2><p>Tracking aktif setelah driver berangkat. Foto bukti baru dapat diupload setelah kurir menekan tombol Driver Sampai.</p></div>
        {delivery && <StatusBadge>{delivery.status}</StatusBadge>}
      </section>

      <section className="content-grid two-one">
        <article className="panel-card wide">
          <div className="panel-head compact"><div><span>Maps Live</span><h3>{delivery?.order_code || 'Belum ada pengiriman aktif'}</h3></div><StatusBadge>{trackingOn ? 'Tracking Aktif' : 'Tracking Tidak Aktif'}</StatusBadge></div>
          <TrackingMap delivery={delivery} deviceLocation={deviceLocation} showUserLocation viewerUser={user} />
          {!trackingOn && isInTransit && <p className="warning-box">Maps belum menerima lokasi kurir. Pastikan GPS perangkat aktif dan halaman ini tetap terbuka.</p>}
        </article>

        <article className="panel-card">
          <div className="panel-head"><div><span>Kontrol Kurir</span><h3>Perjalanan & Bukti Terima</h3></div></div>
          <div className="tracking-control-stack">
            <button type="button" className="login-button" onClick={startDriver} disabled={busy || !delivery || !isWaitingStart}>{busy ? 'Memproses...' : 'Driver Berangkat'}</button>
            <button type="button" className="secondary-action full" onClick={markDriverArrived} disabled={busy || !delivery || !isInTransit}>{busy ? 'Memproses...' : 'Driver Sampai'}</button>
          </div>

          <div className="detail-stack location-detail">
            <p><b>Status izin lokasi</b><span>{locationStatus}</span></p>
            <p><b>Latitude</b><span>{Number.isFinite(Number(deviceLocation?.latitude)) ? Number(deviceLocation.latitude).toFixed(7) : '-'}</span></p>
            <p><b>Longitude</b><span>{Number.isFinite(Number(deviceLocation?.longitude)) ? Number(deviceLocation.longitude).toFixed(7) : '-'}</span></p>
            <p><b>Akurasi</b><span>{Number.isFinite(Number(deviceLocation?.accuracy)) ? `${Math.round(Number(deviceLocation.accuracy))} meter` : '-'}</span></p>
            <p><b>Status sistem</b><span>{sendStatus}</span></p>
          </div>

          <div className="proof-box">
            <label>Bukti Foto Saat Sampai</label>
            <input type="file" accept="image/*" capture="environment" onChange={handleProofFile} disabled={!canUploadProof || uploadingProof} />
            {proofName && <small>File: {proofName}</small>}
            {!canUploadProof && !isDone && <p className="helper-box">Tekan Driver Sampai terlebih dahulu agar upload bukti foto aktif.</p>}
            {uploadingProof && <p className="helper-box upload-inline"><span className="mini-spinner" /> Foto sedang diupload. Jangan tutup halaman ini.</p>}
            {proofPreview && <img src={proofPreview} alt="Preview bukti pengiriman" />}
            {proofPhoto && <a className="proof-link" href={proofPhoto} target="_blank" rel="noreferrer">Lihat file Cloudinary</a>}
            <textarea value={proofNote} onChange={(e) => setProofNote(e.target.value)} placeholder="Catatan opsional, contoh: barang diterima oleh gudang" disabled={!canUploadProof} />
          </div>

          <div className="completion-card">
            <SwipeToConfirm disabled={!canUploadProof || !proofPhoto || busy || uploadingProof} onUnlocked={() => setConfirmVisible(true)} />
            {confirmVisible && (
              <div className="confirm-arrival-box">
                <label><input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} disabled={busy} /> Saya memastikan barang sudah diterima dan bukti foto sudah benar.</label>
                <button type="button" className="login-button" onClick={completeDelivery} disabled={!confirmChecked || busy}>{busy ? 'Menyimpan...' : 'Konfirmasi Pengiriman Selesai'}</button>
              </div>
            )}
          </div>

          {locationError && <p className="error-box">{locationError}</p>}
          {!isCloudinaryReady() && <p className="warning-box">Cloudinary belum dikonfigurasi. Upload bukti foto membutuhkan Cloud Name dan Upload Preset.</p>}
        </article>
      </section>

      <Modal
        open={uploadModal.open}
        title={uploadModal.stage === 'success' ? 'Upload Bukti Berhasil' : uploadModal.stage === 'error' ? 'Upload Bukti Gagal' : 'Mengupload Bukti Foto'}
        onClose={() => {
          if (uploadingProof) return
          setUploadModal((prev) => ({ ...prev, open: false }))
        }}
      >
        <div className={`upload-modal-content ${uploadModal.stage}`}>
          <div className="upload-visual" aria-hidden="true">
            {uploadModal.stage === 'success' ? '✓' : uploadModal.stage === 'error' ? '!' : <span className="upload-spinner" />}
          </div>
          <h3>{uploadModal.message || 'Memproses bukti foto...'}</h3>
          {uploadModal.stage !== 'error' && (
            <div className="upload-progress-wrap">
              <div className="upload-progress-bar" style={{ width: `${Math.max(0, Math.min(100, uploadModal.progress || 0))}%` }} />
            </div>
          )}
          <p className="upload-percent">{uploadModal.stage === 'error' ? 'Coba pilih foto ulang atau gunakan jaringan yang lebih stabil.' : `${Math.round(uploadModal.progress || 0)}%`}</p>
          {proofPreview && <img className="upload-preview" src={proofPreview} alt="Preview bukti pengiriman" />}
          {uploadModal.stage === 'success' && uploadResult && (
            <div className="upload-result-detail">
              <span>Cloudinary tersimpan</span>
              <span>{uploadResult.width} × {uploadResult.height}px</span>
              <span>{uploadResult.uploadedSize ? `${Math.max(1, Math.round(uploadResult.uploadedSize / 1024))} KB` : 'Ukuran aman'}</span>
            </div>
          )}
          {uploadModal.stage !== 'uploading' && uploadModal.stage !== 'preparing' && uploadModal.stage !== 'compressing' && (
            <button type="button" className="login-button" onClick={() => setUploadModal((prev) => ({ ...prev, open: false }))}>Tutup</button>
          )}
        </div>
      </Modal>
    </>
  )
}

