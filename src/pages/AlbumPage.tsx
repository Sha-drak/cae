import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/gallery/SiteHeader'
import PhotoGrid, {
  ZOOM_ORDER,
  readStoredZoom,
  type ZoomLevel,
} from '../components/gallery/PhotoGrid'
import Lightbox from '../components/gallery/Lightbox'
import { fetchAlbumBySlug, fetchAlbumPhotos } from '../lib/api'
import type { AlbumRow, PhotoRow } from '../lib/database.types'
import { downloadAlbumAsZip } from '../lib/download'
import { formatDate } from '../components/gallery/AlbumCard'
import '../styles/gallery.css'

const ZIP_PHOTO_SOFT_CAP = 150

export default function AlbumPage() {
  const { slug } = useParams<{ slug: string }>()
  const [album, setAlbum] = useState<AlbumRow | null>(null)
  const [photos, setPhotos] = useState<PhotoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [zoom, setZoom] = useState<ZoomLevel>(readStoredZoom)
  const [zipState, setZipState] = useState<{ busy: boolean; done: number; total: number; error: string | null }>({
    busy: false,
    done: 0,
    total: 0,
    error: null,
  })

  useEffect(() => {
    let active = true

    async function load() {
      if (!slug) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const { data: albumData } = await fetchAlbumBySlug(slug)
      if (!active) return
      if (!albumData) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const { data: photoData } = await fetchAlbumPhotos(albumData.id)
      if (!active) return
      setAlbum(albumData)
      setPhotos(photoData ?? [])
      document.title = `${albumData.title} — Christian Awareness Embassy`
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [slug])

  function stepZoom(direction: 1 | -1) {
    setZoom((current) => {
      const index = ZOOM_ORDER.indexOf(current)
      const nextIndex = Math.min(ZOOM_ORDER.length - 1, Math.max(0, index + direction))
      return ZOOM_ORDER[nextIndex]
    })
  }

  async function handleDownloadAll() {
    if (!album || photos.length === 0 || zipState.busy) return
    const batch = photos.slice(0, ZIP_PHOTO_SOFT_CAP)
    setZipState({ busy: true, done: 0, total: batch.length, error: null })
    try {
      await downloadAlbumAsZip(batch, album.slug, (done, total) =>
        setZipState((state) => ({ ...state, done, total }))
      )
      setZipState({ busy: false, done: 0, total: 0, error: null })
    } catch (error) {
      console.error('Zip download failed', error)
      setZipState({
        busy: false,
        done: 0,
        total: 0,
        error: 'Could not prepare the zip file. Please try again.',
      })
    }
  }

  if (loading) {
    return (
      <div className="gallery-page">
        <SiteHeader active="gallery" />
        <div className="admin-loading">
          <div className="admin-spinner" aria-label="Loading album" />
        </div>
      </div>
    )
  }

  if (notFound || !album) {
    return (
      <div className="gallery-page">
        <SiteHeader active="gallery" />
        <main className="section section--dark gallery">
          <div className="section__inner gallery__status-wrap">
            <p className="gallery__status">This album is not available.</p>
            <Link to="/gallery" className="btn btn--glass">
              ← Back to Albums
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="gallery-page">
      <SiteHeader active="gallery" />

      <main className="section section--dark gallery">
        <div className="section__inner">
          <Link to="/gallery" className="gallery__back">
            ← All Albums
          </Link>

          <div className="gallery__album-header">
            <p className="gallery__kicker">{formatDate(album.event_date)}</p>
            <h1 className="gallery__album-title">{album.title}</h1>
            {album.description && <p className="gallery__description">{album.description}</p>}
          </div>

          {photos.length === 0 ? (
            <p className="gallery__status">No photos in this album yet.</p>
          ) : (
            <>
              <div className="ios-gallery__toolbar">
                <div className="ios-gallery__tools">
                  <button
                    type="button"
                    className="ios-gallery__zoom-btn"
                    onClick={() => stepZoom(-1)}
                    disabled={zoom === 'sm'}
                    aria-label="Smaller thumbnails"
                    title="More photos per screen"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="ios-gallery__zoom-btn"
                    onClick={() => stepZoom(1)}
                    disabled={zoom === 'lg'}
                    aria-label="Larger thumbnails"
                    title="Bigger thumbnails"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn--glass btn--small gallery__download-all"
                    onClick={handleDownloadAll}
                    disabled={zipState.busy}
                  >
                    {zipState.busy
                      ? `Preparing zip… ${zipState.done}/${zipState.total}`
                      : `Download all (${Math.min(photos.length, ZIP_PHOTO_SOFT_CAP)})`}
                  </button>
                </div>
              </div>
              {zipState.error && <p className="gallery__status">{zipState.error}</p>}
              {photos.length > ZIP_PHOTO_SOFT_CAP && !zipState.busy && (
                <p className="gallery__hint">
                  Large album — the zip includes the first {ZIP_PHOTO_SOFT_CAP} photos. Use the
                  download button in the photo viewer for the rest.
                </p>
              )}
              <PhotoGrid photos={photos} zoom={zoom} onZoomChange={setZoom} onOpen={(index) => setLightboxIndex(index)} />
            </>
          )}
        </div>
      </main>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(index) => setLightboxIndex(index)}
        />
      )}
    </div>
  )
}
