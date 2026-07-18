import heic2any from 'heic2any'

// Strategy 1: createImageBitmap → canvas (handles HEIC natively on iOS Safari 17+)
async function viaImageBitmap(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width  = bitmap.width
  canvas.height = bitmap.height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
  bitmap.close()
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) { reject(new Error('toBlob failed')); return }
      resolve(new File([blob], 'photo.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.88)
  })
}

// Strategy 2: heic2any library (desktop HEIC support)
async function viaHeic2Any(file: File): Promise<File> {
  const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 })
  const blob = Array.isArray(converted) ? converted[0] : converted
  return new File([blob], 'photo.jpg', { type: 'image/jpeg' })
}

// Strategy 3: <img> tag → canvas (jpg / png / webp / fake extensions)
async function viaImgTag(file: File): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img  = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('toBlob failed')); return }
        resolve(new File([blob], 'photo.jpg', { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.88)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img load failed')) }
    img.src = url
  })
}

// Detect if the raw file bytes confirm it's a HEIC/image we can safely pass through
async function detectImageType(file: File): Promise<{ ext: string; mime: string } | null> {
  try {
    const buf  = await file.slice(0, 12).arrayBuffer()
    const u8   = new Uint8Array(buf)
    const hex  = Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('')
    const ftyp = new TextDecoder().decode(u8.slice(4, 12))

    if (hex.startsWith('ffd8ff'))   return { ext: 'jpg',  mime: 'image/jpeg' }
    if (hex.startsWith('89504e47')) return { ext: 'png',  mime: 'image/png'  }
    if (hex.startsWith('47494638')) return { ext: 'gif',  mime: 'image/gif'  }

    // HEIC/HEIF: ftyp box at offset 4 contains brand string
    if (ftyp.includes('heic') || ftyp.includes('heix') ||
        ftyp.includes('mif1') || ftyp.includes('msf1') ||
        ftyp.includes('heif')) {
      return { ext: 'heic', mime: 'image/heic' }
    }
  } catch { /* ignore */ }

  // Fall back to MIME type or file extension reported by browser
  if (file.type.startsWith('image/')) {
    const sub = file.type.split('/')[1]
    return { ext: sub === 'jpeg' ? 'jpg' : sub, mime: file.type }
  }
  if (/\.(heic|heif)$/i.test(file.name)) return { ext: 'heic', mime: 'image/heic' }

  return null
}

/**
 * Normalize any image → JPEG.
 * Falls back to uploading the original file if the browser cannot decode it
 * (e.g. HEIC on Chrome/Firefox) — registration never blocks on conversion.
 */
export async function normalizeImageFile(file: File): Promise<File> {
  // Try conversion in order
  try { return await viaImageBitmap(file) } catch { /* next */ }
  try { return await viaHeic2Any(file)    } catch { /* next */ }
  try { return await viaImgTag(file)      } catch { /* next */ }

  // Conversion failed — pass through if we can confirm it's some kind of image
  const detected = await detectImageType(file)
  if (detected) {
    return new File([file], `photo.${detected.ext}`, { type: detected.mime })
  }

  throw new Error(`"${file.name}" could not be read as an image. Please upload a JPG or PNG file.`)
}

/**
 * For document slots: real PDFs stay as PDF, everything else → normalizeImageFile.
 */
export async function normalizeDocumentFile(file: File): Promise<File> {
  const buf = await file.slice(0, 4).arrayBuffer()
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  if (hex.startsWith('25504446')) {
    return new File([file], 'document.pdf', { type: 'application/pdf' })
  }
  try {
    return await normalizeImageFile(file)
  } catch {
    throw new Error(`"${file.name}" is not a valid file. Please upload a JPG, PNG, or PDF.`)
  }
}

// Keep old export so nothing else in the codebase breaks
export async function prepareImageFile(file: File): Promise<File> {
  return normalizeImageFile(file)
}
