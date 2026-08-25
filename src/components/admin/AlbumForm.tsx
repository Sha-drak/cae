import { useState } from 'react'

export interface AlbumFormValues {
  title: string
  event_date: string
  description: string
}

interface AlbumFormProps {
  initialValues?: Partial<AlbumFormValues>
  busy?: boolean
  submitLabel: string
  onSubmit: (values: AlbumFormValues) => Promise<void> | void
  onCancel?: () => void
}

function mostRecentSunday(): string {
  const now = new Date()
  const day = now.getDay()
  now.setDate(now.getDate() - day)
  return now.toISOString().slice(0, 10)
}

export default function AlbumForm({
  initialValues,
  busy,
  submitLabel,
  onSubmit,
  onCancel,
}: AlbumFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [eventDate, setEventDate] = useState(
    initialValues?.event_date ?? mostRecentSunday()
  )
  const [description, setDescription] = useState(initialValues?.description ?? '')

  return (
    <form
      className="album-form"
      onSubmit={(event) => {
        event.preventDefault()
        if (!title.trim() || !eventDate) return
        onSubmit({ title: title.trim(), event_date: eventDate, description: description.trim() })
      }}
    >
      <label className="field">
        <span>Title</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Sunday Service"
          required
        />
      </label>

      <label className="field">
        <span>Date</span>
        <input
          type="date"
          value={eventDate}
          onChange={(event) => setEventDate(event.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>Description (optional)</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="A short note about this event…"
        />
      </label>

      <div className="album-form__actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
