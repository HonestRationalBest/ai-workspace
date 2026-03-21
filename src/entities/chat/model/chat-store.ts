import { create } from 'zustand'
import type { AgentId, Chat, Message } from './types'
import { createEmptyChat } from '../lib/create-chat'

export type ChatWorkspaceStoreState = {
  chats: Chat[]
  activeChatId: string
  isSending: boolean
  sendError: string | null
}

type ChatWorkspaceActions = {
  createChat: () => void
  deleteChat: (chatId: string) => void
  selectChat: (chatId: string) => void
  setAgent: (chatId: string, agentId: AgentId) => void
  appendMessage: (chatId: string, message: Message) => void
  setTitle: (chatId: string, title: string) => void
  setSending: (value: boolean) => void
  setSendError: (message: string | null) => void
}

const first = createEmptyChat()

const initial: ChatWorkspaceStoreState = {
  chats: [first],
  activeChatId: first.id,
  isSending: false,
  sendError: null,
}

export const useChatWorkspaceStore = create<
  ChatWorkspaceStoreState & ChatWorkspaceActions
>((set) => ({
  ...initial,

  createChat: () => {
    const chat = createEmptyChat()
    set((s) => ({
      chats: [chat, ...s.chats],
      activeChatId: chat.id,
    }))
  },

  deleteChat: (chatId) => {
    set((s) => {
      const chats = s.chats.filter((c) => c.id !== chatId)
      if (chats.length === 0) {
        const fallback = createEmptyChat()
        return { chats: [fallback], activeChatId: fallback.id }
      }
      const activeChatId =
        s.activeChatId === chatId ? chats[0]!.id : s.activeChatId
      return { chats, activeChatId }
    })
  },

  selectChat: (chatId) => set({ activeChatId: chatId }),

  setAgent: (chatId, agentId) =>
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id === chatId ? { ...c, agentId } : c,
      ),
    })),

  appendMessage: (chatId, message) =>
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id === chatId ? { ...c, messages: [...c.messages, message] } : c,
      ),
    })),

  setTitle: (chatId, title) =>
    set((s) => ({
      chats: s.chats.map((c) => (c.id === chatId ? { ...c, title } : c)),
    })),

  setSending: (value) => set({ isSending: value }),
  setSendError: (message) => set({ sendError: message }),
}))

export const selectActiveChat = (
  state: ChatWorkspaceStoreState,
): Chat | undefined =>
  state.chats.find((c) => c.id === state.activeChatId) ?? state.chats[0]
