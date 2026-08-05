import type { Config } from '@netlify/functions'
import { getAgent, getUnreadMentions, markAllRead, replyTo } from '../../src/lib/bluesky'
import { supabase, type Lyric } from '../../src/lib/supabase'
import { findBestMatch, randomLyric } from '../../src/lib/matchLyric'

export default async () => {
  const agent = await getAgent()
  const mentions = await getUnreadMentions(agent)

  if (mentions.length === 0) {
    await markAllRead(agent)
    return new Response('no new mentions')
  }

  const { data: lyrics } = await supabase.from('lyrics').select('*')
  if (!lyrics || lyrics.length === 0) {
    return new Response('lyric bank is empty, add rows to the lyrics table', { status: 500 })
  }

  for (const mention of mentions) {
    // skip anything we've already replied to, in case a run gets interrupted before markAllRead
    const { data: already } = await supabase
      .from('processed_mentions')
      .select('uri')
      .eq('uri', mention.uri)
      .maybeSingle()
    if (already) continue

    const mentionText = mention.record && 'text' in mention.record ? (mention.record.text as string) : ''
    const match: Lyric = findBestMatch(mentionText, lyrics as Lyric[]) ?? randomLyric(lyrics as Lyric[])

    const replyText = `"${match.line}" - ${match.song}`

    // a reply notification already has a reply.root on the record; a plain mention is itself the root
    const record = mention.record as { reply?: { root: { uri: string; cid: string } } }
    const root = record.reply?.root ?? { uri: mention.uri, cid: mention.cid }

    await replyTo(agent, replyText, root.uri, root.cid, mention.uri, mention.cid)

    await supabase.from('processed_mentions').insert({
      uri: mention.uri,
      replied_lyric_id: match.id
    })
  }

  await markAllRead(agent)
  return new Response(`replied to ${mentions.length} mention(s)`)
}

// runs every 10 minutes
export const config: Config = {
  schedule: '*/10 * * * *'
}