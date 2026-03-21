import type { ChatRole, Message } from '../model/types'

export function createMessage(role: ChatRole, content: string): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
  }
}
