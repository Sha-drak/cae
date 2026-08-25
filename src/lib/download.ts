import JSZip from 'jszip'
import type { PhotoRow } from './database.types'
import { photoPublicUrl } from './supabaseClient'

export async function downloadFileFromUrl(url: string, filename: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Download failed (${response.status})`)
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}

function safeName(name: string | null, index: number): string {
  const base = (name ?? `photo-${index + 1}`).replace(/[^\w.\-]+/g, '_')
  return `${String(index + 1).padStart(2, '0')}-${base}`
}

export async function downloadAlbumAsZip(
  photos: PhotoRow[],
  zipName: string,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const zip = new JSZip()
  let done = 0

  for (const photo of photos) {
    const url = photoPublicUrl(photo.storage_path)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch ${photo.original_filename ?? photo.id}`)
    const blob = await response.blob()
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
    let name = safeName(photo.original_filename, done)
    if (!/\.[a-z]{3,4}$/i.test(name)) name += `.${ext}`
    zip.file(name, blob)
    done += 1
    onProgress?.(done, photos.length)
  }

  const archive = await zip.generateAsync({ type: 'blob' })
  const objectUrl = URL.createObjectURL(archive)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = `${zipName}.zip`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}
