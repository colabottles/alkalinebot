# AlkalineBot

Bluesky bot that replies to mentions with an Alkaline Trio lyric line, picked by matching the words in the mention against keywords tagged on each lyric, instead of picking randomly. Falls back to a random line if nothing scores a match. Also posts a line on its own roughly one day in three.

## Setup

1. `npm install`
2. Run `supabase/schema.sql` against your Supabase project
3. Copy `.env.example` to `.env` and fill in a Bluesky app password (not your main password)
   and your Supabase service role key
4. Populate the `lyrics` table yourself, one row per line, with a `keywords` array of the
   topics that line fits (breakups, drinking, insomnia, etc). I didn't seed this with real
   lyrics since reproducing song lyrics isn't something I can generate, this part is on you.
5. `netlify deploy` (set the same env vars in the Netlify site's environment settings)

## How matching works

`src/lib/matchLyric.ts` strips the mention down to meaningful words, then scores every lyric
by how many of its `keywords` show up in those words. Highest score wins; if nothing scores
above zero it falls back to a random line, so the bot still always replies.

## Files

- `netlify/functions/check-mentions.ts` - polls notifications every 10 minutes, replies once per mention
- `netlify/functions/daily-post.ts` - checked once a day, posts about a third of the time
- `src/lib/bluesky.ts` - AT Protocol login, notification fetching, posting
- `src/lib/matchLyric.ts` - the keyword scoring logic
- `src/lib/supabase.ts` - Supabase client and the `Lyric` type
- `supabase/schema.sql` - `lyrics`, `processed_mentions`, `bot_state` tables
