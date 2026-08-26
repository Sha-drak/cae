import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AlbumForm from '../../components/admin/AlbumForm'
import PhotoUploader from '../../components/admin/PhotoUploader'
import PhotoList from '../../components/admin/PhotoList'
import {
  createAlbum,
  fetchAlbumById,
  fetchAlbumPhotos,
  reorderPhotos,
  deleteAlbumWithPhotos,
  deletePhoto,
  slugify,
  updateAlbum,
} from '../../lib/api'
import type { AlbumRow, PhotoRow } from '../../lib/database.types'

export default function AlbumEditPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id
  const navigate = useNavigate()

  const [album, setAlbum] = useState<AlbumRow | null>(null)
  const [photos, setPhotos] = useState<PhotoRow[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [notFound, setNotFound] = useState(false)
  const [savingForm, setSavingForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmDeleteAlbum, setConfirmDeleteAlbum] = useState(false)
  const positionRef = useRef(0)

  useEffect(() => {
    if (isNew) return
    let active = true

    async function load() {
      const { data: albumData } = await fetchAlbumById(id as string)
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
      const maxPosition = photoData && photoData.length > 0 
        ? Math.max(...photoData.map(p => p.position)) 
        : -1
      positionRef.current = maxPosition + 1
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [id, isNew])

  async function handleCreate(values: { title: string; event_date: string; description: string }) {
    setSavingForm(true)
    setFormError(null)
    const { data, error } = await createAlbum({
      title: values.title,
      event_date: values.event_date,
      description: values.description || null,
      slug: slugify(values.title, values.event_date),
    })
    setSavingForm(false)
    if (error || !data) {
      setFormError(error?.message ?? 'Could not create the album.')
      return
    }
    navigate(`/admin/albums/${data.id}`, { replace: true })
  }

  async function handleSaveDetails(values: { title: string; event_date: string; description: string }) {
    if (!album) return
    setSavingForm(true)
    setFormError(null)
    const { data, error } = await updateAlbum(album.id, {
      title: values.title,
      event_date: values.event_date,
      description: values.description || null,
    })
    setSavingForm(false)
    if (error || !data) {
      setFormError(error?.message ?? 'Could not save changes.')
      return
    }
    setAlbum(data)
  }

  async function handleTogglePublish() {
    if (!album) return
    const { data, error } = await updateAlbum(album.id, { published: !album.published })
    if (error || !data) {
      setFormError(error?.message ?? 'Could not update publish state.')
      return
    }
    setAlbum(data)
  }

  async function handleSetCover(photo: PhotoRow) {
    if (!album) return
    const { data, error } = await updateAlbum(album.id, { cover_photo_id: photo.id })
    if (error || !data) return
    setAlbum(data)
  }

  async function handleReorder(orderedPhotos: PhotoRow[]) {
    setPhotos(orderedPhotos)
    await reorderPhotos(orderedPhotos.map((photo) => photo.id))
  }

  async function handleDeletePhoto(photo: PhotoRow) {
    try {
      await deletePhoto(photo)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not delete the photo.')
      return
    }
    setPhotos((current) => current.filter((p) => p.id !== photo.id))
    if (album?.cover_photo_id === photo.id) {
      await updateAlbum(album.id, { cover_photo_id: null })
    }
  }

  const handleUploaded = useCallback((photo: PhotoRow) => {
    positionRef.current = Math.max(positionRef.current, photo.position + 1)
    setPhotos((current) => [...current, photo])
  }, [])

  async function handleDeleteAlbum() {
    if (!album) return
    setConfirmDeleteAlbum(false)
    const { error } = await deleteAlbumWithPhotos(album.id)
    if (error) {
      setFormError(error.message)
      return
    }
    navigate('/admin', { replace: true })
  }

  if (notFound) {
    return (
      <div className="dashboard">
        <p className="gallery__status">Album not found.</p>
        <Link to="/admin" className="btn btn--ghost">
          ← Back to albums
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" aria-label="Loading album" />
      </div>
    )
  }

  if (isNew) {
    return (
      <div className="editor editor--narrow">
        <Link to="/admin" className="editor__back">
          ← Back to albums
        </Link>
        <h1>New Album</h1>
        <p className="dashboard__sub">
          Create the album first, then you can upload photos to it.
        </p>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <div className="card">
          <AlbumForm busy={savingForm} submitLabel="Create album" onSubmit={handleCreate} />
        </div>
      </div>
    )
  }

  if (!album) return null

  return (
    <div className="editor">
      <Link to="/admin" className="editor__back">
        ← Back to albums
      </Link>

      <div className="editor__header">
        <h1>{album.title}</h1>
        <span className={`badge ${album.published ? 'badge--published' : 'badge--draft'}`}>
          {album.published ? 'Published' : 'Draft'}
        </span>
        <button type="button" className="btn btn--small" onClick={handleTogglePublish}>
          {album.published ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <div className="editor__grid">
        <section className="card">
          <h2>Album details</h2>
          <AlbumForm
            initialValues={{
              title: album.title,
              event_date: album.event_date,
              description: album.description ?? '',
            }}
            busy={savingForm}
            submitLabel="Save details"
            onSubmit={handleSaveDetails}
          />
          {album.slug && <p className="editor__slug">Public address: /gallery/{album.slug}</p>}
        </section>

        <section className="card">
          <h2>Danger zone</h2>
          <p>Deleting removes the album and all of its photos permanently.</p>
          {confirmDeleteAlbum ? (
            <div className="editor__confirm-row">
              <button type="button" className="btn btn--danger" onClick={handleDeleteAlbum}>
                Yes, delete everything
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setConfirmDeleteAlbum(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirmDeleteAlbum(true)}>
              Delete this album
            </button>
          )}
        </section>
      </div>

      <section className="card editor__photos-card">
        <h2>Photos ({photos.length})</h2>
        <p className="dashboard__sub">
          Drag photos to reorder · ★ sets the cover · 🗑 deletes. Changes apply immediately.
        </p>

        <PhotoUploader albumId={album.id} nextPosition={() => positionRef.current} onUploaded={handleUploaded} />

        <PhotoList
          photos={photos}
          coverPhotoId={album.cover_photo_id}
          onReorder={handleReorder}
          onSetCover={handleSetCover}
          onDelete={handleDeletePhoto}
        />
      </section>
    </div>
  )
}
