import type { ChatRole, Message, MessageStatus } from '../model/types'

export function createMessage(
  role: ChatRole,
  content: string,
  status?: MessageStatus,
): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
    ...(status ? { status } : {}),
  }
}
