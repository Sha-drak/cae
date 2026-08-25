import { useState } from 'react'
import type { DragEvent } from 'react'
import type { PhotoRow } from '../../lib/database.types'
import { photoPublicUrl } from '../../lib/supabaseClient'

interface PhotoListProps {
  photos: PhotoRow[]
  coverPhotoId: string | null
  onReorder: (orderedPhotos: PhotoRow[]) => Promise<void>
  onSetCover: (photo: PhotoRow) => Promise<void>
  onDelete: (photo: PhotoRow) => Promise<void>
}

export default function PhotoList({
  photos,
  coverPhotoId,
  onReorder,
  onSetCover,
  onDelete,
}: PhotoListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return
    const next = [...photos]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(targetIndex, 0, moved)
    setDragIndex(null)
    void onReorder(next)
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, index: number) {
    setDragIndex(index)
    event.dataTransfer.effectAllowed = 'move'
    try {
      event.dataTransfer.setData('text/plain', String(index))
    } catch {
      // some browsers restrict setData during drag; index state is enough
    }
  }

  if (photos.length === 0) return null

  return (
    <div className="photo-list">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className={`photo-item ${dragIndex === index ? 'is-dragging' : ''} ${
            photo.id === coverPhotoId ? 'is-cover' : ''
          }`}
          draggable
          onDragStart={(event) => handleDragStart(event, index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleDrop(index)}
          onDragEnd={() => setDragIndex(null)}
        >
          <img src={photoPublicUrl(photo.thumb_path)} alt="" loading="lazy" />
          {photo.id === coverPhotoId && <span className="photo-item__cover-tag">Cover</span>}
          <div className="photo-item__actions">
            {photo.id !== coverPhotoId && (
              <button
                type="button"
                className="photo-item__btn"
                title="Set as cover"
                onClick={() => void onSetCover(photo)}
              >
                ★
              </button>
            )}
            {confirmDeleteId === photo.id ? (
              <>
                <button
                  type="button"
                  className="photo-item__btn photo-item__btn--danger"
                  title="Confirm delete"
                  onClick={() => {
                    setConfirmDeleteId(null)
                    void onDelete(photo)
                  }}
                >
                  ✓
                </button>
                <button
                  type="button"
                  className="photo-item__btn"
                  title="Cancel"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  ✕
                </button>
              </>
            ) : (
              <button
                type="button"
                className="photo-item__btn"
                title="Delete photo"
                onClick={() => setConfirmDeleteId(photo.id)}
              >
                🗑
              </button>
            )}
          </div>
          <span className="photo-item__grip" aria-hidden="true">
            ⠿
          </span>
        </div>
      ))}
    </div>
  )
}
