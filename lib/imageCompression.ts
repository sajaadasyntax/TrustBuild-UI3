const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.82
const TARGET_MAX_BYTES = 4.5 * 1024 * 1024

const SUPPORTED_BROWSER_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

function isHeic(file: File) {
  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()
  return type.includes('heic') || type.includes('heif') || name.endsWith('.heic') || name.endsWith('.heif')
}

export function getUploadErrorMessage(error: unknown, fallback = 'Failed to upload the file.') {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export async function prepareImageForUpload(file: File): Promise<File> {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    if (file.size > 15 * 1024 * 1024) {
      throw new Error('PDF files must be 15MB or smaller.')
    }
    return file
  }

  if (isHeic(file)) {
    throw new Error('HEIC/HEIF photos are not supported. Please export or save the image as JPG or PNG, then upload it again.')
  }

  const looksLikeImage = (file.type || '').startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(file.name)
  if (!looksLikeImage) {
    throw new Error('Unsupported file format. Please upload a JPG, PNG, WEBP, or PDF file (max 15MB).')
  }

  if (!SUPPORTED_BROWSER_TYPES.includes(file.type) && file.size <= TARGET_MAX_BYTES) {
    return file
  }

  // Keep small PNGs as-is so transparent logos / icons keep their transparency.
  // Only compress/convert PNGs that are too large to send directly.
  if (file.type === 'image/png' && file.size <= TARGET_MAX_BYTES) {
    return file
  }

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return file
    }

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob: Blob | null = await new Promise((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/jpeg', JPEG_QUALITY)
    })

    if (!blob) {
      return file
    }

    const compressed = new File(
      [blob],
      file.name.replace(/\.[^.]+$/, '') + '.jpg',
      { type: 'image/jpeg', lastModified: Date.now() }
    )

    if (compressed.size > 15 * 1024 * 1024) {
      throw new Error('The image is still too large after resizing. Please choose a smaller photo (max 15MB).')
    }

    return compressed
  } catch (error) {
    if (error instanceof Error && error.message.includes('too large')) {
      throw error
    }
    if (file.size > 15 * 1024 * 1024) {
      throw new Error('The image is too large (max 15MB). Please compress it or choose a smaller file.')
    }
    return file
  }
}
