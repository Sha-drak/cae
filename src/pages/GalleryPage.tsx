import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import SiteHeader from '../components/gallery/SiteHeader'
import AlbumCard from '../components/gallery/AlbumCard'
import { fetchPublishedAlbums } from '../lib/api'
import type { AlbumWithCover } from '../lib/database.types'
import { staggerContainer, viewport, fadeIn } from '../hooks/useScrollAnimation'
import '../styles/gallery.css'

export default function GalleryPage() {
  const [albums, setAlbums] = useState<AlbumWithCover[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Photo Albums — Christian Awareness Embassy'
    let active = true

    async function load() {
      const { data, error: fetchError } = await fetchPublishedAlbums()
      if (!active) return
      if (fetchError) {
        setError('Could not load albums. Please try again later.')
        setAlbums([])
      } else {
        setAlbums((data ?? []) as AlbumWithCover[])
      }
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="gallery-page">
      <SiteHeader active="gallery" />

      <main className="section section--dark gallery">
        <div className="section__inner">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={fadeIn}
          >
            <span className="section-eyebrow">Gallery</span>
            <h2 className="section-title">Photo Albums</h2>
            <p className="section-subtitle">
              Moments from our services, events, and celebrations — captured and shared with the
              family.
            </p>
          </motion.div>

          {loading && (
            <div className="admin-loading">
              <div className="admin-spinner" aria-label="Loading albums" />
            </div>
          )}

          {error && <p className="gallery__status">{error}</p>}

          {!loading && !error && albums.length === 0 && (
            <p className="gallery__status">No photo albums have been published yet. Check back soon!</p>
          )}

          {!loading && albums.length > 0 && (
            <motion.div
              className="albums-grid"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              variants={staggerContainer}
            >
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
