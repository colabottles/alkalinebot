import type { Config } from '@netlify/functions'
import { getAgent, postStandalone } from '../../src/lib/bluesky'
import { supabase } from '../../src/lib/supabase'
import { randomLyric } from '../../src/lib/matchLyric'

// posts a lyric on its own roughly one day in three, so the bot doesn't post every single day
const POST_CHANCE = 1 / 3

export default async () => {
  if (Math.random() > POST_CHANCE) {
    return new Response('skipped this run')
  }

  const { data: lyrics } = await supabase.from('lyrics').select('*')
  if (!lyrics || lyrics.length === 0) {
    return new Response('lyric bank is empty, add rows to the lyrics table', { status: 500 })
  }

  const lyric = randomLyric(lyrics)
  const agent = await getAgent()
  await postStandalone(agent, `"${lyric.line}" - ${lyric.song}`)

  return new Response(`posted a line from ${lyric.song}`)
}

// checked once a day, actual posting is gated by POST_CHANCE above
export const config: Config = {
  schedule: '0 18 * * *'
}