import type { Message } from '../model/types'

export function toApiMessages(messages: Message[]): {
  role: 'user' | 'assistant'
  content: string
}[] {
  return messages
    .filter((m) => !(m.role === 'assistant' && m.status === 'streaming'))
    .map((m) => ({ role: m.role, content: m.content }))
}
