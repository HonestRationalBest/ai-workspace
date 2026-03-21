export type AgentId = 'coding' | 'writing' | 'research'

export type ChatRole = 'user' | 'assistant'

export type Message = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
}

export type Chat = {
  id: string
  title: string
  agentId: AgentId
  messages: Message[]
  createdAt: number
}
