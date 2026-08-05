import type { Lyric } from './supabase'

// common words that carry no topical meaning, ignored when scoring matches
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be',
  'to', 'of', 'in', 'on', 'at', 'for', 'with', 'about', 'as', 'it', 'this',
  'that', 'my', 'me', 'i', 'you', 'your', 'im', 'so', 'just', 'like',
  'alkaline', 'trio'
])

// strips mentions, links and punctuation, then splits into lowercase words
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/@[\w.]+/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
}

// scores a lyric by how many of its keywords appear in the mention's words
function scoreLyric(mentionWords: Set<string>, lyric: Lyric): number {
  let score = 0
  for (const keyword of lyric.keywords) {
    if (mentionWords.has(keyword.toLowerCase())) score++
  }
  return score
}

// finds the best-matching lyric for a mention, or null if nothing scores above the threshold
export function findBestMatch(mentionText: string, lyrics: Lyric[]): Lyric | null {
  const mentionWords = new Set(tokenize(mentionText))
  if (mentionWords.size === 0) return null

  let best: Lyric | null = null
  let bestScore = 0

  for (const lyric of lyrics) {
    const score = scoreLyric(mentionWords, lyric)
    if (score > bestScore) {
      bestScore = score
      best = lyric
    }
  }

  // require at least one real keyword hit, otherwise let the caller fall back to random
  return bestScore > 0 ? best : null
}

export function randomLyric(lyrics: Lyric[]): Lyric {
  return lyrics[Math.floor(Math.random() * lyrics.length)]
}