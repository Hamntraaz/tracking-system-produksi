const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''

export function isCloudinaryReady() {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET)
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Foto tidak dapat dibaca browser. Coba gunakan format JPG/PNG.'))
    }

    image.src = objectUrl
  })
}

function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.78) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Gagal mengompres foto.'))
        return
      }
      resolve(blob)
    }, type, quality)
  })
}

export async function prepareProofImage(file, onProgress) {
  if (!file) throw new Error('File bukti foto belum dipilih.')
  if (!file.type?.startsWith('image/')) throw new Error('File harus berupa gambar.')

  onProgress?.({ stage: 'preparing', progress: 5, message: 'Membaca foto bukti...' })

  // GIF dan SVG tidak dikompres agar tidak merusak file.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file
  }

  try {
    const image = await loadImageFromFile(file)
    const maxDimension = 1280
    const originalWidth = image.naturalWidth || image.width
    const originalHeight = image.naturalHeight || image.height

    if (!originalWidth || !originalHeight) return file

    const scale = Math.min(1, maxDimension / Math.max(originalWidth, originalHeight))
    const targetWidth = Math.max(1, Math.round(originalWidth * scale))
    const targetHeight = Math.max(1, Math.round(originalHeight * scale))

    onProgress?.({ stage: 'compressing', progress: 18, message: 'Mengoptimalkan ukuran foto...' })

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d', { alpha: false })
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight)

    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.78)

    // Kalau hasil kompres malah lebih besar, pakai file asli.
    if (blob.size >= file.size) return file

    const optimizedName = file.name.replace(/\.[^.]+$/, '') + '-bukti.jpg'
    return new File([blob], optimizedName, { type: 'image/jpeg', lastModified: Date.now() })
  } catch (error) {
    // Jangan gagalkan upload hanya karena kompresi gagal. Cloudinary tetap bisa menerima file asli.
    console.warn('Optimasi foto dilewati:', error)
    return file
  }
}


function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Gagal membaca foto bukti.'))
    reader.readAsDataURL(blob)
  })
}

async function prepareLocalProofDataUrl(file, onProgress) {
  onProgress?.({ stage: 'compressing', progress: 18, message: 'Mengoptimalkan foto bukti untuk disimpan di database...' })
  const image = await loadImageFromFile(file)
  const maxDimension = 720
  const originalWidth = image.naturalWidth || image.width
  const originalHeight = image.naturalHeight || image.height
  const scale = Math.min(1, maxDimension / Math.max(originalWidth, originalHeight || 1))
  const targetWidth = Math.max(1, Math.round(originalWidth * scale))
  const targetHeight = Math.max(1, Math.round(originalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d', { alpha: false })
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, targetWidth, targetHeight)
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.62)
  const dataUrl = await blobToDataUrl(blob)
  onProgress?.({ stage: 'success', progress: 100, message: 'Foto bukti tersimpan lokal di database.' })
  return {
    url: dataUrl,
    publicId: 'database-local-proof',
    width: targetWidth,
    height: targetHeight,
    originalSize: file.size,
    uploadedSize: blob.size,
    storage: 'database',
  }
}

function uploadWithProgress(url, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.timeout = 60000

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        onProgress?.({ stage: 'uploading', progress: 35, message: 'Mengupload foto ke Cloudinary...' })
        return
      }
      const uploadProgress = Math.round((event.loaded / event.total) * 70)
      onProgress?.({
        stage: 'uploading',
        progress: Math.min(95, 25 + uploadProgress),
        message: `Mengupload foto ke Cloudinary... ${Math.min(100, Math.round((event.loaded / event.total) * 100))}%`,
      })
    }

    xhr.onload = () => {
      let payload = {}
      try {
        payload = JSON.parse(xhr.responseText || '{}')
      } catch {
        payload = {}
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload)
        return
      }

      reject(new Error(payload?.error?.message || 'Upload bukti foto ke Cloudinary gagal.'))
    }

    xhr.onerror = () => reject(new Error('Koneksi upload Cloudinary gagal. Cek internet perangkat.'))
    xhr.ontimeout = () => reject(new Error('Upload foto terlalu lama. Coba ulangi dengan jaringan lebih stabil atau foto lebih kecil.'))
    xhr.send(formData)
  })
}

export async function uploadProofToCloudinary(file, options = {}) {
  const { onProgress } = options

  if (!file) throw new Error('File bukti foto belum dipilih.')
  if (!isCloudinaryReady()) {
    return prepareLocalProofDataUrl(file, onProgress)
  }

  const optimizedFile = await prepareProofImage(file, onProgress)
  onProgress?.({ stage: 'uploading', progress: 25, message: 'Mengupload foto ke Cloudinary...' })

  const formData = new FormData()
  formData.append('file', optimizedFile)
  formData.append('upload_preset', UPLOAD_PRESET)
  // Folder bisa diatur langsung dari Upload Preset Cloudinary.
  // Sengaja tidak dikirim dari frontend agar unsigned preset yang ketat tidak menolak upload.

  const payload = await uploadWithProgress(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    formData,
    onProgress
  )

  if (!payload?.secure_url) {
    throw new Error('Cloudinary tidak mengembalikan URL foto. Cek upload preset.')
  }

  onProgress?.({ stage: 'success', progress: 100, message: 'Foto berhasil diupload ke Cloudinary.' })

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
    width: payload.width,
    height: payload.height,
    originalSize: file.size,
    uploadedSize: optimizedFile.size,
  }
}
