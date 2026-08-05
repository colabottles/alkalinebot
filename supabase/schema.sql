-- Alkaline Trio lyric bank
-- keywords are the themes/topics a lyric line applies to, used for matching against mention text
create table if not exists lyrics (
  id uuid primary key default gen_random_uuid(),
  song text not null,
  album text not null,
  line text not null,
  keywords text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists lyrics_keywords_idx on lyrics using gin (keywords);

-- Tracks which Bluesky notifications we've already replied to, so a bot restart doesn't double-reply
create table if not exists processed_mentions (
  uri text primary key,
  replied_lyric_id uuid references lyrics (id),
  processed_at timestamptz not null default now()
);

-- Tracks the last time the bot made an unprompted post, to space those out
create table if not exists bot_state (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);