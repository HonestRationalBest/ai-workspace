export type AgentId = 'coding' | 'writing' | 'research'

export type ChatRole = 'user' | 'assistant'

export type MessageStatus = 'streaming' | 'done'

export type Message = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
  status?: MessageStatus
}

export type Chat = {
  id: string
  title: string
  agentId: AgentId
  messages: Message[]
  createdAt: number
}
