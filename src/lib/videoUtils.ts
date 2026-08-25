import type { VideoKind } from './database.types'

export function parseYouTubeId(input: string): string | null {
  const value = input.trim()
  if (!value) return null
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function parseTikTokId(input: string): string | null {
  const value = input.trim()
  if (!value) return null
  if (/^\d{10,25}$/.test(value)) return value
  const match = value.match(/tiktok\.com\/(?:@[\w.\-]+\/video|v)\/(\d{10,25})/)
  return match ? match[1] : null
}

export function parseVideoId(
  kind: VideoKind,
  input: string
): string | null {
  return kind === 'youtube' ? parseYouTubeId(input) : parseTikTokId(input)
}

export function youtubeThumbUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}
