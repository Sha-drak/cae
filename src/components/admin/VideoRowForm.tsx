import { useState } from 'react'
import type { VideoKind } from '../../lib/database.types'
import { parseVideoId, youtubeThumbUrl } from '../../lib/videoUtils'

export interface VideoFormResult {
  video_id: string
  title: string
  caption: string
  speaker: string
  series: string
}

interface VideoRowFormProps {
  kind: VideoKind
  submitLabel?: string
  busy?: boolean
  error?: string | null
  onSave: (result: VideoFormResult) => Promise<void> | void
  onCancel?: () => void
}

export default function VideoRowForm({
  kind,
  submitLabel = 'Add',
  busy,
  error,
  onSave,
  onCancel,
}: VideoRowFormProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [speaker, setSpeaker] = useState('')
  const [series, setSeries] = useState('')

  const parsedId =
    kind === 'youtube' ? parseVideoId('youtube', url) : parseVideoId('tiktok', url)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!parsedId) return
    await onSave({ video_id: parsedId, title: title.trim(), caption: caption.trim(), speaker: speaker.trim(), series: series.trim() })
    setUrl('')
    setTitle('')
    setCaption('')
    setSpeaker('')
    setSeries('')
  }

  return (
    <form className="video-form" onSubmit={handleSubmit}>
      <div className="video-form__row">
        <label className="field field--grow">
          <span>{kind === 'youtube' ? 'YouTube link or ID' : 'TikTok link or ID'}</span>
          <input
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={
              kind === 'youtube' ? 'https://youtu.be/…' : 'https://www.tiktok.com/@user/video/…'
            }
            required
          />
        </label>
        {parsedId && kind === 'youtube' && (
          <img className="video-form__preview" src={youtubeThumbUrl(parsedId)} alt="" />
        )}
      </div>

      {parsedId && kind === 'youtube' && (
        <div className="video-form__row">
          <label className="field field--grow">
            <span>Title</span>
            <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>Speaker (optional)</span>
            <input type="text" value={speaker} onChange={(event) => setSpeaker(event.target.value)} />
          </label>
          <label className="field">
            <span>Series (optional)</span>
            <input type="text" value={series} onChange={(event) => setSeries(event.target.value)} />
          </label>
        </div>
      )}

      {parsedId && kind === 'tiktok' && (
        <label className="field">
          <span>Caption</span>
          <input type="text" value={caption} onChange={(event) => setCaption(event.target.value)} />
        </label>
      )}

      {!parsedId && url.trim() !== '' && (
        <p className="form-error">That doesn't look like a valid {kind === 'youtube' ? 'YouTube' : 'TikTok'} link.</p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="video-form__actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn--primary btn--small" disabled={!parsedId || busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
