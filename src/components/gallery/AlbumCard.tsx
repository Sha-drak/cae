import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp } from '../../hooks/useScrollAnimation'
import type { AlbumWithCover, PhotoRow } from '../../lib/database.types'
import { photoPublicUrl } from '../../lib/supabaseClient'

function coverUrl(album: AlbumWithCover): string | null {
  const cover = album.cover
  if (!cover) return null
  const row: PhotoRow | undefined = Array.isArray(cover) ? cover[0] : cover
  return row ? photoPublicUrl(row.thumb_path) : null
}

export function formatDate(dateIso: string): string {
  return new Date(`${dateIso}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function AlbumCard({ album }: { album: AlbumWithCover }) {
  const url = coverUrl(album)
  return (
    <motion.div variants={fadeUp}>
      <Link to={`/gallery/${album.slug}`} className="album-card">
        <div className="album-card__img-wrap">
          {url ? (
            <img src={url} alt={album.title} className="album-card__img" loading="lazy" />
          ) : (
            <div className="album-card__placeholder" aria-hidden="true">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="rgba(255,255,255,0.35)">
                <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" />
              </svg>
            </div>
          )}
          <span className="album-card__count" aria-label={`${album.photo_count} photos`}>
            {album.photo_count} {album.photo_count === 1 ? 'photo' : 'photos'}
          </span>
        </div>
        <div className="album-card__body">
          <h3 className="album-card__title">{album.title}</h3>
          <p className="album-card__date">{formatDate(album.event_date)}</p>
        </div>
      </Link>
    </motion.div>
  )
}
