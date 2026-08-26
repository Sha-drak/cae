import { useEffect, useRef } from 'react'
import type { TouchEvent } from 'react'
import type { PhotoRow } from '../../lib/database.types'
import { photoPublicUrl } from '../../lib/supabaseClient'

interface PhotoGridProps {
  photos: PhotoRow[]
  zoom: ZoomLevel
  onZoomChange: (zoom: ZoomLevel) => void
  onOpen: (index: number) => void
}

export type ZoomLevel = 'lg' | 'md' | 'sm'

export const ZOOM_ORDER: ZoomLevel[] = ['sm', 'md', 'lg']
export const GALLERY_ZOOM_KEY = 'cae.gallery.zoom'

export function readStoredZoom(): ZoomLevel {
  try {
    const stored = localStorage.getItem(GALLERY_ZOOM_KEY)
    return ZOOM_ORDER.includes(stored as ZoomLevel) ? (stored as ZoomLevel) : 'md'
  } catch {
    return 'md'
  }
}

export function persistZoom(zoom: ZoomLevel) {
  try {
    localStorage.setItem(GALLERY_ZOOM_KEY, zoom)
  } catch {
    // storage unavailable (private mode) — zoom just won't persist
  }
}

export default function PhotoGrid({ photos, zoom, onZoomChange, onOpen }: PhotoGridProps) {
  const pinchBaseDist = useRef<number | null>(null)

  function touchDistance(touches: React.TouchList): number {
    const a = touches[0]
    const b = touches[1]
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (event.touches.length === 2) pinchBaseDist.current = touchDistance(event.touches)
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (pinchBaseDist.current === null || event.touches.length !== 2) return
    const distance = touchDistance(event.touches)
    const ratio = distance / pinchBaseDist.current

    if (ratio > 1.28 || ratio < 0.78) {
      const index = ZOOM_ORDER.indexOf(zoom)
      const nextIndex = Math.min(
        ZOOM_ORDER.length - 1,
        Math.max(0, ratio > 1.28 ? index + 1 : index - 1)
      )
      if (ZOOM_ORDER[nextIndex] !== zoom) onZoomChange(ZOOM_ORDER[nextIndex])
      pinchBaseDist.current = distance
    }
  }

  function handleTouchEnd() {
    pinchBaseDist.current = null
  }

  useEffect(() => {
    persistZoom(zoom)
  }, [zoom])

  return (
    <div
      className={`photo-grid photo-grid--${zoom}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          type="button"
          className="photo-grid__item"
          onClick={() => onOpen(index)}
          aria-label={`Open photo ${index + 1} of ${photos.length}`}
        >
          <img
            src={photoPublicUrl(photo.thumb_path)}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </button>
      ))}
    </div>
  )
}
