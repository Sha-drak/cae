import { useRef, useState } from 'react'
import { prepareImage } from '../../lib/imageUtils'
import { uploadPhoto } from '../../lib/api'
import type { PhotoRow } from '../../lib/database.types'

interface Task {
  id: string
  name: string
  status: 'pending' | 'working' | 'done' | 'error'
  error?: string
}

interface PhotoUploaderProps {
  albumId: string
  nextPosition: () => number
  onUploaded: (photo: PhotoRow) => void
}

const CONCURRENCY = 2
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function PhotoUploader({ albumId, nextPosition, onUploaded }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [busy, setBusy] = useState(false)

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks((current) => current.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  async function processQueue(files: File[]) {
    if (files.length === 0) return

    const newTasks: Task[] = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      status: 'pending',
    }))
    setTasks((current) => [...newTasks, ...current])
    setBusy(true)

    let cursor = 0

    async function worker() {
      while (cursor < files.length) {
        const index = cursor++
        const file = files[index]
        const task = newTasks[index]
        updateTask(task.id, { status: 'working' })
        try {
          if (!ACCEPTED_TYPES.includes(file.type)) {
            throw new Error('Only JPG, PNG, or WebP images are allowed')
          }
          const prepared = await prepareImage(file)
          const photo = await uploadPhoto(albumId, nextPosition(), prepared)
          updateTask(task.id, { status: 'done' })
          onUploaded(photo)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : `Could not upload ${file.name}`
          updateTask(task.id, { status: 'error', error: message })
        }
      }
    }

    const workers = Array.from({ length: Math.min(CONCURRENCY, files.length) }, () => worker())
    await Promise.all(workers)
    setBusy(false)
  }

  const doneCount = tasks.filter((t) => t.status === 'done').length
  const failedCount = tasks.filter((t) => t.status === 'error').length
  const overallPct = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100)

  return (
    <section className="uploader">
      <div
        className={`uploader__dropzone ${dragOver ? 'is-over' : ''} ${busy ? 'is-busy' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragOver(false)
          void processQueue(Array.from(event.dataTransfer.files))
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
        }}
      >
        <strong>Drop photos here</strong>
        <span>or click to choose files · JPG / PNG / WebP · up to 25 MB each</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        hidden
        onChange={(event) => {
          void processQueue(Array.from(event.target.files ?? []))
          event.target.value = ''
        }}
      />

      {tasks.length > 0 && (
        <div className="uploader__progress">
          <div className="uploader__progress-bar">
            <div className="uploader__progress-fill" style={{ width: `${overallPct}%` }} />
          </div>
          <span className="uploader__progress-label">
            {doneCount}/{tasks.length} uploaded
            {failedCount > 0 ? ` · ${failedCount} failed` : ''}
          </span>
          <ul className="uploader__queue">
            {tasks.slice(0, 12).map((task) => (
              <li key={task.id} className={`uploader__task uploader__task--${task.status}`}>
                <span className="uploader__task-name">{task.name}</span>
                <span className="uploader__task-status">
                  {task.status === 'pending' && 'Waiting…'}
                  {task.status === 'working' && 'Uploading…'}
                  {task.status === 'done' && '✓'}
                  {task.status === 'error' && (task.error ?? 'Failed')}
                </span>
              </li>
            ))}
            {tasks.length > 12 && <li className="uploader__task">…and {tasks.length - 12} more</li>}
          </ul>
        </div>
      )}
    </section>
  )
}
