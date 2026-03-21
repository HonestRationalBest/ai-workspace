import type { Chat } from '../model/types'

export function createEmptyChat(): Chat {
  return {
    id: crypto.randomUUID(),
    title: 'New chat',
    agentId: 'coding',
    messages: [],
    createdAt: Date.now(),
  }
}
