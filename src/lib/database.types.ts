export interface ProfileRow {
  id: string
  is_admin: boolean
  created_at: string
}

export interface ProfileInsert {
  id: string
  is_admin?: boolean
  created_at?: string
}

export interface ProfileUpdate {
  id?: string
  is_admin?: boolean
  created_at?: string
}

export interface AlbumRow {
  id: string
  slug: string
  title: string
  event_date: string
  description: string | null
  cover_photo_id: string | null
  published: boolean
  photo_count: number
  created_at: string
  updated_at: string
}

export interface AlbumInsert {
  id?: string
  slug: string
  title: string
  event_date: string
  description?: string | null
  cover_photo_id?: string | null
  published?: boolean
  photo_count?: number
  created_at?: string
  updated_at?: string
}

export interface AlbumUpdate {
  id?: string
  slug?: string
  title?: string
  event_date?: string
  description?: string | null
  cover_photo_id?: string | null
  published?: boolean
  photo_count?: number
  created_at?: string
  updated_at?: string
}

export interface PhotoRow {
  id: string
  album_id: string
  storage_path: string
  thumb_path: string
  original_filename: string | null
  width: number | null
  height: number | null
  size_bytes: number | null
  position: number
  uploaded_at: string
}

export interface PhotoInsert {
  id?: string
  album_id: string
  storage_path: string
  thumb_path: string
  original_filename?: string | null
  width?: number | null
  height?: number | null
  size_bytes?: number | null
  position?: number
  uploaded_at?: string
}

export interface PhotoUpdate {
  id?: string
  album_id?: string
  storage_path?: string
  thumb_path?: string
  original_filename?: string | null
  width?: number | null
  height?: number | null
  size_bytes?: number | null
  position?: number
  uploaded_at?: string
}

export type VideoKind = 'youtube' | 'tiktok'
export type VideoSlot = 'featured' | 'recent' | 'short'

export interface SiteVideoRow {
  id: string
  kind: VideoKind
  video_id: string
  slot: VideoSlot
  title: string | null
  caption: string | null
  speaker: string | null
  series: string | null
  position: number
  updated_at: string
}

export interface SiteVideoInsert {
  id?: string
  kind: VideoKind
  video_id: string
  slot: VideoSlot
  title?: string | null
  caption?: string | null
  speaker?: string | null
  series?: string | null
  position?: number
  updated_at?: string
}

export interface SiteVideoUpdate {
  id?: string
  kind?: VideoKind
  video_id?: string
  slot?: VideoSlot
  title?: string | null
  caption?: string | null
  speaker?: string | null
  series?: string | null
  position?: number
  updated_at?: string
}

export interface AlbumWithCover extends AlbumRow {
  cover: PhotoRow | PhotoRow[] | null
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: ProfileUpdate
        Relationships: []
      }
      albums: {
        Row: AlbumRow
        Insert: AlbumInsert
        Update: AlbumUpdate
        Relationships: [
          {
            foreignKeyName: 'albums_cover_fk'
            columns: ['cover_photo_id']
            isOneToOne: true
            referencedRelation: 'photos'
            referencedColumns: ['id']
          },
        ]
      }
      photos: {
        Row: PhotoRow
        Insert: PhotoInsert
        Update: PhotoUpdate
        Relationships: [
          {
            foreignKeyName: 'photos_album_id_fkey'
            columns: ['album_id']
            isOneToOne: false
            referencedRelation: 'albums'
            referencedColumns: ['id']
          },
        ]
      }
      site_videos: {
        Row: SiteVideoRow
        Insert: SiteVideoInsert
        Update: SiteVideoUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
