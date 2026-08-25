import { photoPublicUrl } from '../../lib/supabaseClient'
import type { PhotoRow } from '../../lib/database.types'

interface PhotoGridProps {
  photos: PhotoRow[]
  onOpen: (index: number) => void
}

export default function PhotoGrid({ photos, onOpen }: PhotoGridProps) {
  return (
    <div className="photo-grid">
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
            alt={photo.original_filename ?? `Photo ${index + 1}`}
            loading="lazy"
          />
        </button>
      ))}
    </div>
  )
}
