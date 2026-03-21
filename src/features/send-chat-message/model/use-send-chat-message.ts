import { useCallback } from 'react'
import {
  createMessage,
  selectActiveChat,
  useChatWorkspaceStore,
} from '@/entities/chat'
import { completeChat } from '@/shared/api/assistant'

export function useSendChatMessage() {
  const send = useCallback(
    async (rawText: string, onSettled?: () => void) => {
      const trimmed = rawText.trim()
      if (!trimmed) {
        onSettled?.()
        return
      }

      const store = useChatWorkspaceStore.getState()
      if (store.isSending) {
        onSettled?.()
        return
      }

      const active = selectActiveChat(store)
      if (!active) {
        onSettled?.()
        return
      }

      store.setSendError(null)
      store.setSending(true)

      const userMsg = createMessage('user', trimmed)
      store.appendMessage(active.id, userMsg)

      if (active.messages.length === 0) {
        const title =
          trimmed.length > 48 ? `${trimmed.slice(0, 47)}…` : trimmed
        store.setTitle(active.id, title)
      }

      const chat = selectActiveChat(useChatWorkspaceStore.getState())
      if (!chat) {
        useChatWorkspaceStore.getState().setSending(false)
        onSettled?.()
        return
      }

      try {
        const reply = await completeChat({
          agentId: chat.agentId,
          messages: chat.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        })
        useChatWorkspaceStore.getState().appendMessage(
          chat.id,
          createMessage('assistant', reply),
        )
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : 'Could not get a response'
        useChatWorkspaceStore.getState().setSendError(msg)
      } finally {
        useChatWorkspaceStore.getState().setSending(false)
        onSettled?.()
      }
    },
    [],
  )

  return { send }
}
