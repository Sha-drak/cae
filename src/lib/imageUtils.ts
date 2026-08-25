const THUMB_MAX_DIMENSION = 1200
const WEBP_QUALITY = 0.82
const JPEG_QUALITY = 0.85

export interface PreparedImage {
  original: File | Blob
  originalName: string
  thumb: Blob
  thumbExtension: 'webp' | 'jpg'
  width: number
  height: number
}

function loadBitmap(file: Blob): Promise<ImageBitmap> {
  return createImageBitmap(file)
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  const bitmap = await loadBitmap(file)
  const originalWidth = bitmap.width
  const originalHeight = bitmap.height
  const scale = Math.min(1, THUMB_MAX_DIMENSION / Math.max(originalWidth, originalHeight))
  const thumbWidth = Math.max(1, Math.round(originalWidth * scale))
  const thumbHeight = Math.max(1, Math.round(originalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = thumbWidth
  canvas.height = thumbHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Canvas is not supported in this browser')
  }
  ctx.drawImage(bitmap, 0, 0, thumbWidth, thumbHeight)
  bitmap.close()

  let thumb = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY)
  let thumbExtension: PreparedImage['thumbExtension'] = 'webp'
  if (!thumb || thumb.type !== 'image/webp') {
    thumb = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY)
    thumbExtension = 'jpg'
  }
  if (!thumb) throw new Error(`Could not create a thumbnail for ${file.name}`)

  return {
    original: file,
    originalName: file.name,
    thumb,
    thumbExtension,
    width: originalWidth,
    height: originalHeight,
  }
}
