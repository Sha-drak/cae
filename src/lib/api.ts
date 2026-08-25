import type { AlbumRow, AlbumWithCover, PhotoRow, SiteVideoRow } from './database.types'
import { supabase } from './supabaseClient'

export function slugify(title: string, date: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const datePart = date.slice(0, 10)
  return `${base || 'album'}-${datePart}`
}

const albumCoverSelect =
  'id, slug, title, event_date, description, photo_count, published, cover_photo_id, cover:photos!albums_cover_fk(id, thumb_path)'

export async function fetchPublishedAlbums() {
  const result = await supabase
    .from('albums')
    .select(albumCoverSelect)
    .eq('published', true)
    .order('event_date', { ascending: false })
  return { data: (result.data ?? null) as AlbumWithCover[] | null, error: result.error }
}

export async function fetchAlbumBySlug(slug: string) {
  const result = await supabase
    .from('albums')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  return { data: (result.data ?? null) as AlbumRow | null, error: result.error }
}

export async function fetchAlbumPhotos(albumId: string) {
  const result = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', albumId)
    .order('position', { ascending: true })
  return { data: (result.data ?? []) as PhotoRow[], error: result.error }
}

export async function fetchAdminAlbums() {
  const result = await supabase
    .from('albums')
    .select(`${albumCoverSelect}, created_at, updated_at`)
    .order('event_date', { ascending: false })
  return { data: (result.data ?? []) as AlbumWithCover[], error: result.error }
}

export async function fetchAlbumById(id: string) {
  const result = await supabase.from('albums').select('*').eq('id', id).maybeSingle()
  return { data: (result.data ?? null) as AlbumRow | null, error: result.error }
}

export interface NewAlbumInput {
  title: string
  event_date: string
  description: string | null
  slug: string
}

export async function createAlbum(input: NewAlbumInput): Promise<{ data: AlbumRow | null; error: { message: string } | null }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from('albums')
      .insert(input)
      .select('*')
      .single()
    if (!error) return { data: data as unknown as AlbumRow, error: null }
    if (error.code === '23505' && /slug|albums_slug_key/.test(error.message)) {
      input = { ...input, slug: `${input.slug}-${Math.random().toString(36).slice(2, 6)}` }
      continue
    }
    return { data: null, error }
  }
  return { data: null, error: { message: 'Could not generate a unique album address' } }
}

export interface AlbumPatch {
  title?: string
  event_date?: string
  description?: string | null
  published?: boolean
  cover_photo_id?: string | null
}

export async function updateAlbum(
  id: string,
  patch: AlbumPatch
): Promise<{ data: AlbumRow | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('albums')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) return { data: null, error }
  return { data: data as unknown as AlbumRow, error: null }
}

export async function deleteAlbumWithPhotos(albumId: string): Promise<{ error: { message: string } | null }> {
  const selectResult = await supabase
    .from('photos')
    .select('storage_path, thumb_path')
    .eq('album_id', albumId)
  const photos = (selectResult.data ?? []) as Pick<PhotoRow, 'storage_path' | 'thumb_path'>[]
  if (selectResult.error) return { error: selectResult.error }

  if (photos.length > 0) {
    const paths = photos.flatMap((p) => [p.storage_path, p.thumb_path])
    const { error } = await supabase.storage.from('photos').remove(paths)
    if (error) return { error }
  }

  const { error } = await supabase.from('albums').delete().eq('id', albumId)
  return { error }
}

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

export interface PreparedUpload {
  original: File | Blob
  originalName: string
  thumb: Blob
  thumbExtension: 'webp' | 'jpg'
  width: number
  height: number
}

export async function uploadPhoto(
  albumId: string,
  position: number,
  prepared: PreparedUpload
): Promise<PhotoRow> {
  if (prepared.original.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${prepared.originalName} is larger than 25 MB`)
  }

  const photoId = crypto.randomUUID()
  const extMatch = /\.([a-z0-9]{2,5})$/i.exec(prepared.originalName)
  const originalExt = (extMatch ? extMatch[1] : 'jpg').toLowerCase()
  const storagePath = `photos/${albumId}/${photoId}/original.${originalExt}`
  const thumbPath = `photos/${albumId}/${photoId}/thumb.${prepared.thumbExtension}`

  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(storagePath, prepared.original, {
      contentType: prepared.original.type || 'application/octet-stream',
      upsert: false,
    })
  if (uploadError) throw uploadError

  const { error: thumbError } = await supabase.storage
    .from('photos')
    .upload(thumbPath, prepared.thumb, { contentType: prepared.thumb.type, upsert: false })
  if (thumbError) {
    await supabase.storage.from('photos').remove([storagePath])
    throw thumbError
  }

  const insertResult = await supabase
    .from('photos')
    .insert({
      album_id: albumId,
      storage_path: storagePath,
      thumb_path: thumbPath,
      original_filename: prepared.originalName,
      width: prepared.width,
      height: prepared.height,
      size_bytes: prepared.original.size,
      position,
    })
    .select('*')
    .single()

  const { error, data } = insertResult
  if (error || !data) {
    await supabase.storage.from('photos').remove([storagePath, thumbPath])
    throw error ?? new Error('Photo row could not be saved')
  }
  return data as unknown as PhotoRow
}

export async function deletePhoto(photo: Pick<PhotoRow, 'id' | 'storage_path' | 'thumb_path'>): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from('photos')
    .remove([photo.storage_path, photo.thumb_path])
  if (storageError) throw storageError

  const { error } = await supabase.from('photos').delete().eq('id', photo.id)
  if (error) throw error
}

export async function reorderPhotos(orderedIds: string[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from('photos').update({ position: -(i + 1) }).eq('id', orderedIds[i])
  }
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from('photos').update({ position: i }).eq('id', orderedIds[i])
  }
}

export async function fetchSiteVideos(): Promise<SiteVideoRow[] | null> {
  const { data, error } = await supabase
    .from('site_videos')
    .select('*')
    .order('position', { ascending: true })
  if (error) return null
  return (data ?? []) as SiteVideoRow[]
}

export type DbError = { message: string } | null

export interface SiteVideoInput {
  kind: SiteVideoRow['kind']
  slot: SiteVideoRow['slot']
  video_id: string
  title?: string | null
  caption?: string | null
  speaker?: string | null
  series?: string | null
  position: number
}

export async function insertSiteVideo(
  input: SiteVideoInput
): Promise<{ data: SiteVideoRow | null; error: DbError }> {
  const { data, error } = await supabase
    .from('site_videos')
    .insert(input)
    .select('*')
    .single()
  if (error) return { data: null, error }
  return { data: data as unknown as SiteVideoRow, error: null }
}

export async function updateSiteVideo(
  id: string,
  patch: Partial<Omit<SiteVideoInput, 'kind' | 'slot'>>
): Promise<{ error: DbError }> {
  const { error } = await supabase.from('site_videos').update(patch).eq('id', id)
  return { error }
}

export async function deleteSiteVideo(id: string): Promise<{ error: DbError }> {
  const { error } = await supabase.from('site_videos').delete().eq('id', id)
  return { error }
}
