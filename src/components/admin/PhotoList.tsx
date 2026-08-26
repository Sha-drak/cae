import { useEffect, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { createPortal } from 'react-dom'
import type { PhotoRow } from '../../lib/database.types'
import { photoPublicUrl } from '../../lib/supabaseClient'

interface PhotoListProps {
  photos: PhotoRow[]
  coverPhotoId: string | null
  onReorder: (orderedPhotos: PhotoRow[]) => Promise<void>
  onSetCover: (photo: PhotoRow) => Promise<void>
  onDelete: (photo: PhotoRow) => Promise<void>
  onBulkDelete: (photoIds: string[]) => Promise<void>
}

const LONG_PRESS_MS = 450

export default function PhotoList({
  photos,
  coverPhotoId,
  onReorder,
  onSetCover,
  onDelete,
  onBulkDelete,
}: PhotoListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suppressClickRef = useRef(false)

  function clearPressTimer() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  useEffect(() => clearPressTimer, [])

  useEffect(() => {
    if (!selectionMode) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setSelectionMode(false)
      setSelectedIds(new Set())
      setConfirming(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectionMode])

  function beginPress(photoId: string) {
    if (selectionMode || deleting) return
    clearPressTimer()
    pressTimer.current = setTimeout(() => {
      suppressClickRef.current = true
      setSelectionMode(true)
      setSelectedIds(new Set([photoId]))
    }, LONG_PRESS_MS)
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return
    const next = [...photos]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(targetIndex, 0, moved)
    setDragIndex(null)
    void onReorder(next)
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, index: number) {
    if (selectionMode) return
    clearPressTimer()
    setDragIndex(index)
    event.dataTransfer.effectAllowed = 'move'
    try {
      event.dataTransfer.setData('text/plain', String(index))
    } catch {
      // some browsers restrict setData during drag; index state is enough
    }
  }

  function handleItemClick(photoId: string) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    if (!selectionMode || deleting) return
    const next = new Set(selectedIds)
    if (next.has(photoId)) next.delete(photoId)
    else next.add(photoId)
    setSelectedIds(next)
    if (next.size === 0) {
      setSelectionMode(false)
      setConfirming(false)
    }
  }

  function exitSelectionMode() {
    setSelectedIds(new Set())
    setSelectionMode(false)
    setConfirming(false)
  }

  function selectAll() {
    setSelectedIds(new Set(photos.map((p) => p.id)))
  }

  async function runBulkDelete() {
    if (deleting || selectedIds.size === 0) return
    setDeleting(true)
    try {
      await onBulkDelete(Array.from(selectedIds))
      setSelectionMode(false)
      setSelectedIds(new Set())
      setConfirming(false)
    } finally {
      setDeleting(false)
    }
  }

  if (photos.length === 0) return null

  const selectedCount = selectedIds.size

  const actionBar =
    selectionMode && selectedCount > 0
      ? createPortal(
    <div
      className="photo-list__selection-bar"
      role="toolbar"
      aria-label="Photo selection actions"
    >
      {confirming ? (
        <>
          <span className="photo-list__selection-count" aria-live="polite">
            Delete {selectedCount} photo{selectedCount !== 1 ? 's' : ''} permanently?
          </span>
          <div className="photo-list__selection-actions">
            <button
              type="button"
              className="photo-list__selection-btn"
              onClick={() => setConfirming(false)}
              disabled={deleting}
            >
              No, keep
            </button>
            <button
              type="button"
              className="photo-list__selection-btn photo-list__selection-btn--confirm"
              onClick={runBulkDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="photo-list__selection-count" aria-live="polite">
            {selectedCount} selected
          </span>
          <div className="photo-list__selection-actions">
            <button
              type="button"
              className="photo-list__selection-btn"
              onClick={selectAll}
              disabled={deleting || selectedCount === photos.length}
            >
              All
            </button>
            <button
              type="button"
              className="photo-list__selection-btn"
              onClick={exitSelectionMode}
              disabled={deleting}
            >
              Done
            </button>
            <button
              type="button"
              className="photo-list__selection-btn photo-list__selection-btn--delete"
              onClick={() => setConfirming(true)}
              disabled={deleting || selectedCount === 0}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>,
    document.body
  ) : null

  return (
    <div
      className={`photo-list${selectionMode ? ' photo-list--selecting' : ''}${
        deleting ? ' photo-list--deleting' : ''
      }`}
    >
      {!selectionMode && (
        <div className="photo-list__toolbar">
          <button
            type="button"
            className="btn btn--small btn--ghost"
            onClick={() => setSelectionMode(true)}
          >
            Select
          </button>
        </div>
      )}
      {selectionMode && selectedCount === 0 && !deleting && (
        <div className="photo-list__toolbar">
          <span className="photo-list__hint">Tap photos to select them</span>
          <button
            type="button"
            className="btn btn--small btn--ghost"
            onClick={exitSelectionMode}
          >
            Cancel
          </button>
        </div>
      )}
      {actionBar}
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className={`photo-item ${dragIndex === index ? 'is-dragging' : ''} ${
            photo.id === coverPhotoId ? 'is-cover' : ''
          } ${selectedIds.has(photo.id) ? 'is-selected' : ''}`}
          draggable={!selectionMode}
          onDragStart={(event) => handleDragStart(event, index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleDrop(index)}
          onDragEnd={() => setDragIndex(null)}
          onMouseDown={() => beginPress(photo.id)}
          onMouseUp={clearPressTimer}
          onMouseLeave={clearPressTimer}
          onTouchStart={() => beginPress(photo.id)}
          onTouchEnd={clearPressTimer}
          onTouchMove={clearPressTimer}
          onContextMenu={(event) => event.preventDefault()}
          onClick={() => handleItemClick(photo.id)}
        >
          <img src={photoPublicUrl(photo.thumb_path)} alt="" loading="lazy" />
          {photo.id === coverPhotoId && <span className="photo-item__cover-tag">Cover</span>}
          {selectionMode && (
            <span
              className={`photo-item__check${selectedIds.has(photo.id) ? ' is-on' : ''}`}
              aria-hidden="true"
            >
              {selectedIds.has(photo.id) && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
          )}
          {!selectionMode && (
            <>
              <div className="photo-item__actions">
                {photo.id !== coverPhotoId && (
                  <button
                    type="button"
                    className="photo-item__btn"
                    title="Set as cover"
                    onClick={(e) => {
                      e.stopPropagation()
                      void onSetCover(photo)
                    }}
                  >
                    ★
                  </button>
                )}
                <button
                  type="button"
                  className="photo-item__btn"
                  title="Delete photo"
                  onClick={(e) => {
                    e.stopPropagation()
                    void onDelete(photo)
                  }}
                >
                  🗑
                </button>
              </div>
              <span className="photo-item__grip" aria-hidden="true">
                ⠿
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
