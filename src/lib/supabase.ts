import { createClient } from '@supabase/supabase-js'

// service role key is required here since this runs server side with no user session
export const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export interface Lyric {
  id: string
  song: string
  album: string
  line: string
  keywords: string[]
}