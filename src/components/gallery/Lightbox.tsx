import { useCallback, useEffect, useState } from 'react'
import type { PhotoRow } from '../../lib/database.types'
import { photoPublicUrl } from '../../lib/supabaseClient'
import { downloadFileFromUrl } from '../../lib/download'

interface LightboxProps {
  photos: PhotoRow[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function Lightbox({ photos, index, onClose, onNavigate }: LightboxProps) {
  const [downloading, setDownloading] = useState(false)
  const photo = photos[index]

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + photos.length) % photos.length)
  }, [index, photos.length, onNavigate])

  const goNext = useCallback(() => {
    onNavigate((index + 1) % photos.length)
  }, [index, photos.length, onNavigate])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, goPrev, goNext])

  if (!photo) return null

  async function handleDownload() {
    try {
      setDownloading(true)
      const name = photo.original_filename ?? `photo-${index + 1}.jpg`
      await downloadFileFromUrl(photoPublicUrl(photo.storage_path), name)
    } catch (error) {
      console.error('Download failed', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
      <button type="button" className="lightbox__backdrop" onClick={onClose} aria-label="Close viewer" />
      <div className="lightbox__topbar">
        <span className="lightbox__counter">
          {index + 1} / {photos.length}
        </span>
        <div className="lightbox__actions">
          <button type="button" className="lightbox__btn" onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Downloading…' : 'Download'}
          </button>
          <button type="button" className="lightbox__btn lightbox__btn--close" onClick={onClose}>
            ✕ Close
          </button>
        </div>
      </div>

      {photos.length > 1 && (
        <button type="button" className="lightbox__arrow lightbox__arrow--prev" onClick={goPrev} aria-label="Previous photo">
          ‹
        </button>
      )}

      <img
        key={photo.id}
        className="lightbox__img"
        src={photoPublicUrl(photo.storage_path)}
        alt={photo.original_filename ?? `Photo ${index + 1}`}
      />

      {photos.length > 1 && (
        <button type="button" className="lightbox__arrow lightbox__arrow--next" onClick={goNext} aria-label="Next photo">
          ›
        </button>
      )}
    </div>
  )
}
