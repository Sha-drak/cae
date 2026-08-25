import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminAlbums, updateAlbum, deleteAlbumWithPhotos } from '../../lib/api'
import type { AlbumWithCover, PhotoRow } from '../../lib/database.types'
import { photoPublicUrl } from '../../lib/supabaseClient'
import { formatDate } from '../../components/gallery/AlbumCard'

function coverUrl(album: AlbumWithCover): string | null {
  const cover = album.cover
  if (!cover) return null
  const row: PhotoRow | undefined = Array.isArray(cover) ? cover[0] : cover
  return row ? photoPublicUrl(row.thumb_path) : null
}

export default function DashboardPage() {
  const [albums, setAlbums] = useState<AlbumWithCover[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await fetchAdminAlbums()
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setAlbums((data ?? []) as AlbumWithCover[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function togglePublish(album: AlbumWithCover) {
    const { error: updateError } = await updateAlbum(album.id, { published: !album.published })
    if (updateError) {
      setError(updateError.message)
      return
    }
    setAlbums((current) =>
      current.map((a) => (a.id === album.id ? { ...a, published: !a.published } : a))
    )
  }

  async function handleDelete(album: AlbumWithCover) {
    setDeleting(true)
    const { error: deleteError } = await deleteAlbumWithPhotos(album.id)
    setDeleting(false)
    setConfirmDeleteId(null)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setAlbums((current) => current.filter((a) => a.id !== album.id))
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1>Photo Albums</h1>
          <p className="dashboard__sub">
            {albums.length} album{albums.length === 1 ? '' : 's'} ·{' '}
            {albums.filter((a) => a.published).length} published
          </p>
        </div>
        <Link to="/admin/albums/new" className="btn btn--primary">
          + New Album
        </Link>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" aria-label="Loading albums" />
        </div>
      ) : albums.length === 0 ? (
        <div className="empty-state">
          <h2>No albums yet</h2>
          <p>Create your first album to start uploading weekly photos.</p>
          <Link to="/admin/albums/new" className="btn btn--primary">
            Create an album
          </Link>
        </div>
      ) : (
        <ul className="album-rows">
          {albums.map((album) => {
            const url = coverUrl(album)
            return (
              <li key={album.id} className="album-row">
                <div className="album-row__thumb">
                  {url ? (
                    <img src={url} alt="" loading="lazy" />
                  ) : (
                    <span className="album-row__thumb-empty" aria-hidden="true" />
                  )}
                </div>

                <div className="album-row__info">
                  <span className={`badge ${album.published ? 'badge--published' : 'badge--draft'}`}>
                    {album.published ? 'Published' : 'Draft'}
                  </span>
                  <h3 className="album-row__title">{album.title}</h3>
                  <p className="album-row__meta">
                    {formatDate(album.event_date)} · {album.photo_count}{' '}
                    {album.photo_count === 1 ? 'photo' : 'photos'}
                  </p>
                </div>

                <div className="album-row__actions">
                  <button type="button" className="btn btn--small" onClick={() => togglePublish(album)}>
                    {album.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <Link to={`/gallery/${album.slug}`} className="btn btn--small btn--ghost">
                    View
                  </Link>
                  <Link to={`/admin/albums/${album.id}`} className="btn btn--small btn--ghost">
                    Edit
                  </Link>
                  {confirmDeleteId === album.id ? (
                    <>
                      <button
                        type="button"
                        className="btn btn--small btn--danger"
                        disabled={deleting}
                        onClick={() => handleDelete(album)}
                      >
                        {deleting ? 'Deleting…' : 'Confirm delete'}
                      </button>
                      <button
                        type="button"
                        className="btn btn--small btn--ghost"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--small btn--danger-ghost"
                      onClick={() => setConfirmDeleteId(album.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
