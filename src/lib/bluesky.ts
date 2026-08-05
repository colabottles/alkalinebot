import { AtpAgent } from '@atproto/api'

export async function getAgent(): Promise<AtpAgent> {
  const agent = new AtpAgent({ service: 'https://bsky.social' })
  await agent.login({
    identifier: process.env.BLUESKY_HANDLE as string,
    password: process.env.BLUESKY_APP_PASSWORD as string
  })
  return agent
}

// mentions and replies the bot hasn't acknowledged yet
export async function getUnreadMentions(agent: AtpAgent) {
  const { data } = await agent.listNotifications({ limit: 30 })
  return data.notifications.filter(
    (n) => !n.isRead && (n.reason === 'mention' || n.reason === 'reply')
  )
}

export async function markAllRead(agent: AtpAgent) {
  await agent.updateSeenNotifications()
}

export async function replyTo(
  agent: AtpAgent,
  text: string,
  rootUri: string,
  rootCid: string,
  parentUri: string,
  parentCid: string
) {
  await agent.post({
    text,
    reply: {
      root: { uri: rootUri, cid: rootCid },
      parent: { uri: parentUri, cid: parentCid }
    }
  })
}

export async function postStandalone(agent: AtpAgent, text: string) {
  await agent.post({ text })
}