import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import '../styles/sermons.css'
import { fadeUp, fadeIn, slideLeft, scaleUp, staggerContainer, viewport } from '../hooks/useScrollAnimation'
import { fetchSiteVideos } from '../lib/api'
import type { SiteVideoRow } from '../lib/database.types'

const featuredSermonDefault = {
  youtubeId: 'Yp_Kr9T3d9I',
  title: 'Walking in His Purpose',
  speaker: 'Pastor OFOSU SAMPSON',
  date: 'Featured Message',
  series: 'Kingdom Living',
}

const recentSermonsDefault = [
  {
    youtubeId: '7c123xyNyGo',
    title: 'Sunday preaching Highlight',
    speaker: 'Pastor OFOSU SAMPSON',
    date: 'Recent Message',
    series: 'Highlights',
  },
]

const tiktokVideosDefault = [
  { id: '7659201547884039444', caption: 'Special teachings' },
  { id: '7647192917429439765', caption: 'Mid-week Word' },
  { id: '7639371730686856468', caption: 'word ministration' },
]

type FeaturedSermon = typeof featuredSermonDefault
type RecentSermon = RecentSermonItem
interface RecentSermonItem {
  youtubeId: string
  title: string
  speaker: string
  date: string
  series: string
}
type TikTokVideo = { id: string; caption: string }

function mapVideos(rows: SiteVideoRow[]): {
  featured: FeaturedSermon
  recents: RecentSermon[]
  tiktoks: TikTokVideo[]
} {
  const featuredRow = rows.find((v) => v.kind === 'youtube' && v.slot === 'featured')
  const recentRows = rows
    .filter((v) => v.kind === 'youtube' && v.slot === 'recent')
    .sort((a, b) => a.position - b.position)
  const shortRows = rows
    .filter((v) => v.kind === 'tiktok' && v.slot === 'short')
    .sort((a, b) => a.position - b.position)

  return {
    featured: featuredRow
      ? {
          youtubeId: featuredRow.video_id,
          title: featuredRow.title ?? featuredSermonDefault.title,
          speaker: featuredRow.speaker ?? featuredSermonDefault.speaker,
          date: 'Featured Message',
          series: featuredRow.series ?? featuredSermonDefault.series,
        }
      : featuredSermonDefault,
    recents: recentRows.length
      ? recentRows.map((row) => ({
          youtubeId: row.video_id,
          title: row.title ?? 'Recent Message',
          speaker: row.speaker ?? '',
          date: 'Recent Message',
          series: row.series ?? 'Highlights',
        }))
      : recentSermonsDefault,
    tiktoks: shortRows.length
      ? shortRows.map((row) => ({
          id: row.video_id,
          caption: row.caption ?? '',
        }))
      : tiktokVideosDefault,
  }
}

function YoutubeThumbnail({ videoId, title }: { videoId: string; title: string }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${videoId}`}
      target="_blank"
      rel="noreferrer"
      className="sermon-thumb"
      aria-label={`Watch ${title} on YouTube`}
    >
      <div className="sermon-thumb__img-wrap">
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          className="sermon-thumb__img"
          loading="lazy"
        />
        <span className="sermon-thumb__play" aria-hidden="true">
          <svg viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="30" fill="rgba(0,0,0,0.55)" />
            <polygon points="24,18 46,30 24,42" fill="white" />
          </svg>
        </span>
      </div>
    </a>
  )
}

const tiktokThumbCache = new Map<string, string>()

/**
 * TikTokFacade — fetches the real thumbnail via our own /api/tiktok-oembed
 * proxy (TikTok's oEmbed endpoint has no CORS headers and rate-limits
 * direct browser calls). The iframe only loads on click, so page load stays fast.
 */
function TikTokFacade({ id, caption }: { id: string; caption: string }) {
  const [activated, setActivated] = useState(false)
  const [thumb, setThumb] = useState<string | null>(() => tiktokThumbCache.get(id) ?? null)

  useEffect(() => {
    if (thumb) return
    let cancelled = false

    const videoUrl = `https://www.tiktok.com/@c.a.e.i2/video/${id}`
    fetch(`/api/tiktok-oembed?url=${encodeURIComponent(videoUrl)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const thumbUrl: string | undefined = data?.thumbnail_url
        if (!cancelled && thumbUrl) {
          tiktokThumbCache.set(id, thumbUrl)
          setThumb(thumbUrl)
        }
      })
      .catch(() => {
        // proxy unavailable — branded placeholder stays, no problem
      })

    return () => {
      cancelled = true
    }
  }, [id, thumb])

  if (activated) {
    return (
      <div className="sermons__tiktok-embed">
        <iframe
          src={`https://www.tiktok.com/embed/v2/${id}`}
          allowFullScreen
          allow="encrypted-media"
          title={caption}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <button
      className="sermons__tiktok-facade"
      onClick={() => setActivated(true)}
      aria-label={`Play TikTok video: ${caption}`}
      type="button"
    >
      {thumb ? (
        <img
          src={thumb}
          alt={caption}
          className="sermons__tiktok-facade-thumb"
          loading="lazy"
        />
      ) : (
        <div className="sermons__tiktok-facade-bg" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
          </svg>
        </div>
      )}
      <div className="sermons__tiktok-play-btn" aria-hidden="true">
        <svg viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="30" fill="rgba(0,0,0,0.55)" />
          <polygon points="24,18 46,30 24,42" fill="white" />
        </svg>
      </div>
    </button>
  )
}

export default function Sermons() {
  const [featuredSermon, setFeaturedSermon] = useState<FeaturedSermon>(featuredSermonDefault)
  const [recentSermons, setRecentSermons] = useState<RecentSermon[]>(recentSermonsDefault)
  const [tiktokVideos, setTiktokVideos] = useState<TikTokVideo[]>(tiktokVideosDefault)

  useEffect(() => {
    let active = true

    async function load() {
      const rows = await fetchSiteVideos()
      if (!active || !rows || rows.length === 0) return
      const mapped = mapVideos(rows)
      setFeaturedSermon(mapped.featured)
      setRecentSermons(mapped.recents)
      setTiktokVideos(mapped.tiktoks)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="section section--dark sermons" id="sermons">
      <div className="section__inner">

        {/* Section header */}
        <motion.div
          className="section-header"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={fadeUp}
        >
          <span className="section-eyebrow">Messages</span>
          <h2 className="section-title">Watch &amp; Listen</h2>
          <p className="section-subtitle">
            Be encouraged, challenged, and built up in your faith. Click below to listen to Pastor Ofosu Sampson now!
          </p>
        </motion.div>

        {/* Featured sermon */}
        <div className="sermons__featured">
          <motion.div
            className="sermons__featured-embed"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={slideLeft}
          >
            <iframe
              src={`https://www.youtube.com/embed/${featuredSermon.youtubeId}?rel=0`}
              title={featuredSermon.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </motion.div>

          <motion.div
            className="sermons__featured-info"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={staggerContainer}
          >
            <motion.span className="sermons__series-tag" variants={fadeUp}>{featuredSermon.series}</motion.span>
            <motion.h3 className="sermons__featured-title" variants={fadeUp}>{featuredSermon.title}</motion.h3>
            <motion.p className="sermons__featured-meta" variants={fadeUp}>
              {featuredSermon.speaker} &nbsp;·&nbsp; {featuredSermon.date}
            </motion.p>
            <motion.div variants={fadeUp}>
              <a
                href={`https://www.youtube.com/watch?v=${featuredSermon.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn--outline-light"
              >
                Watch on YouTube
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Recent messages */}
        <motion.div
          className="sermons__recent-header"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={fadeIn}
        >
          <h3 className="sermons__recent-label">Recent Messages</h3>
          <a href="https://youtube.com/@c.a.e.i?si=xmjIm8BIT1ztV_n4" target="_blank" rel="noreferrer" className="sermons__view-all">
            View all →
          </a>
        </motion.div>

        <motion.div
          className="sermons__grid"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={staggerContainer}
        >
          {recentSermons.map((s) => (
            <motion.div key={s.title} className="sermons__card" variants={scaleUp}>
              <YoutubeThumbnail videoId={s.youtubeId} title={s.title} />
              <div className="sermons__card-body">
                <span className="sermons__series-tag">{s.series}</span>
                <h4 className="sermons__card-title">{s.title}</h4>
                <p className="sermons__card-meta">{s.speaker} · {s.date}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* TikTok shorts */}
        <div className="sermons__tiktok-section">
          <motion.div
            className="sermons__recent-header"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={fadeIn}
          >
            <h3 className="sermons__recent-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{display:'inline',verticalAlign:'middle',marginRight:'0.4rem'}}>
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
              </svg>
              Shorts &amp; Highlights
            </h3>
            <a href="https://www.tiktok.com/@c.a.e.i2" target="_blank" rel="noreferrer" className="sermons__view-all">
              Follow on TikTok →
            </a>
          </motion.div>

          <motion.div
            className="sermons__tiktok-grid"
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={staggerContainer}
          >
            {tiktokVideos.map((v) => (
              <motion.div key={v.id} className="sermons__tiktok-card" variants={scaleUp}>
                <TikTokFacade id={v.id} caption={v.caption} />
                <p className="sermons__tiktok-caption">{v.caption}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  )
}
