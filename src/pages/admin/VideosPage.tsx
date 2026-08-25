import { useCallback, useEffect, useState } from 'react'
import VideoRowForm from '../../components/admin/VideoRowForm'
import { youtubeThumbUrl } from '../../lib/videoUtils'
import {
  deleteSiteVideo,
  fetchSiteVideos,
  insertSiteVideo,
  updateSiteVideo,
} from '../../lib/api'
import type { SiteVideoRow } from '../../lib/database.types'

export default function VideosPage() {
  const [videos, setVideos] = useState<SiteVideoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchSiteVideos()
    if (data === null) {
      setLoadFailed(true)
    } else {
      setLoadFailed(false)
      setVideos(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const featured = videos.find((v) => v.kind === 'youtube' && v.slot === 'featured') ?? null
  const recents = videos
    .filter((v) => v.kind === 'youtube' && v.slot === 'recent')
    .sort((a, b) => a.position - b.position)
  const shorts = videos
    .filter((v) => v.kind === 'tiktok' && v.slot === 'short')
    .sort((a, b) => a.position - b.position)

  async function runBusy(
    id: string | 'new',
    action: () => Promise<{ error: { message?: string } | null }>
  ) {
    setBusyId(id)
    setRowError(null)
    const result = await action()
    setBusyId(null)
    if (result?.error) {
      setRowError(result.error.message ?? 'Something went wrong.')
      return false
    }
    return true
  }

  async function handleAdd(
    input: { video_id: string; title: string; caption: string; speaker: string; series: string },
    kind: 'youtube' | 'tiktok',
    slot: 'featured' | 'recent' | 'short',
    existingInSlot: SiteVideoRow[]
  ) {
    const position =
      existingInSlot.length > 0 ? Math.max(...existingInSlot.map((v) => v.position)) + 1 : 0

    if (slot === 'featured' && featured) {
      const ok = await runBusy('new', () =>
        updateSiteVideo(featured.id, {
          video_id: input.video_id,
          title: input.title || null,
          speaker: input.speaker || null,
          series: input.series || null,
        })
      )
      if (ok) await load()
      return
    }

    const ok = await runBusy('new', () =>
      insertSiteVideo({
        kind,
        slot,
        video_id: input.video_id,
        title: input.title || null,
        caption: input.caption || null,
        speaker: input.speaker || null,
        series: input.series || null,
        position,
      })
    )
    if (ok) await load()
  }

  async function handleDelete(video: SiteVideoRow) {
    if (!window.confirm(`Remove "${video.title ?? video.caption ?? video.video_id}"?`)) return
    const ok = await runBusy(video.id, () => deleteSiteVideo(video.id))
    if (ok) setVideos((current) => current.filter((v) => v.id !== video.id))
  }

  async function move(video: SiteVideoRow, list: SiteVideoRow[], direction: -1 | 1) {
    const index = list.findIndex((v) => v.id === video.id)
    const neighbor = list[index + direction]
    if (!neighbor) return
    await runBusy(video.id, async () => {
      await updateSiteVideo(video.id, { position: -(index + direction + 1) })
      await updateSiteVideo(neighbor.id, { position: -(index + 1) })
      const finalMove = await updateSiteVideo(video.id, { position: index + direction })
      if (finalMove.error) return finalMove
      return updateSiteVideo(neighbor.id, { position: index })
    })
    await load()
  }

  function renderList(list: SiteVideoRow[], kind: 'youtube' | 'tiktok', slotLabel: string) {
    if (list.length === 0) {
      return <p className="dashboard__sub">No {slotLabel.toLowerCase()} yet.</p>
    }
    return (
      <ul className="video-rows">
        {list.map((video, index) => (
          <li key={video.id} className="video-row">
            <img
              className="video-row__thumb"
              src={kind === 'youtube' ? youtubeThumbUrl(video.video_id) : undefined}
              alt=""
              loading="lazy"
            />
            <div className="video-row__info">
              <strong>{video.title ?? video.caption ?? video.video_id}</strong>
              {(kind === 'youtube' && (video.speaker || video.series)) && (
                <span>
                  {[video.speaker, video.series].filter(Boolean).join(' · ')}
                </span>
              )}
            </div>
            <div className="video-row__actions">
              <button type="button" className="btn btn--small btn--ghost" disabled={index === 0 || busyId !== null} onClick={() => move(video, list, -1)}>
                ↑
              </button>
              <button type="button" className="btn btn--small btn--ghost" disabled={index === list.length - 1 || busyId !== null} onClick={() => move(video, list, 1)}>
                ↓
              </button>
              <button type="button" className="btn btn--small btn--danger-ghost" disabled={busyId !== null} onClick={() => handleDelete(video)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" aria-label="Loading videos" />
      </div>
    )
  }

  if (loadFailed) {
    return (
      <div className="dashboard">
        <h1>Videos</h1>
        <p className="form-error">
          Could not reach the database. Check that Supabase is configured in .env.local.
        </p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1>Videos</h1>
          <p className="dashboard__sub">These appear in the “Watch &amp; Listen” section of the website.</p>
        </div>
      </div>

      {rowError && (
        <p className="form-error" role="alert">
          {rowError}
        </p>
      )}

      <section className="card">
        <h2>Featured message</h2>
        <p className="dashboard__sub">
          The large video at the top of the sermons section.
          {featured && (
            <>
              {' '}Currently:{' '}
              <strong>{featured.title ?? featured.video_id}</strong>
            </>
          )}
        </p>
        <VideoRowForm
          key={`featured-${featured?.id ?? 'none'}-${featured?.video_id ?? ''}`}
          kind="youtube"
          submitLabel={featured ? 'Replace featured' : 'Set featured'}
          onSave={(input) =>
            handleAdd(input, 'youtube', 'featured', featured ? [featured] : [])
          }
        />
      </section>

      <section className="card">
        <h2>Recent messages</h2>
        {renderList(recents, 'youtube', 'recent messages')}
        <h3 className="video-section-sub">Add a recent message</h3>
        <VideoRowForm kind="youtube" submitLabel="Add message" onSave={(input) => handleAdd(input, 'youtube', 'recent', recents)} />
      </section>

      <section className="card">
        <h2>TikTok shorts</h2>
        {renderList(shorts, 'tiktok', 'TikTok shorts')}
        <h3 className="video-section-sub">Add a short</h3>
        <VideoRowForm kind="tiktok" submitLabel="Add short" onSave={(input) => handleAdd(input, 'tiktok', 'short', shorts)} />
      </section>
    </div>
  )
}
