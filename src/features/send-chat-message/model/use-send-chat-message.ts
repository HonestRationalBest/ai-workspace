import { useCallback, useRef } from 'react'
import {
  createMessage,
  selectActiveChat,
  toApiMessages,
  useChatWorkspaceStore,
} from '@/entities/chat'
import { streamChatCompletion } from '@/shared/api/assistant'

export function useSendChatMessage() {
  const abortRef = useRef<AbortController | null>(null)

  const runAssistantStream = useCallback(
    async (
      chatId: string,
      onSettled?: () => void,
      onScroll?: () => void,
    ) => {
      const assistantPlaceholder = createMessage('assistant', '', 'streaming')
      useChatWorkspaceStore.getState().appendMessage(chatId, assistantPlaceholder)
      const assistantId = assistantPlaceholder.id

      const abort = new AbortController()
      abortRef.current = abort

      let scrollScheduled = false

      try {
        useChatWorkspaceStore.getState().setSendError(null)
        useChatWorkspaceStore.getState().setSending(true)

        const chat = selectActiveChat(useChatWorkspaceStore.getState())
        if (!chat || chat.id !== chatId) return

        const apiMessages = toApiMessages(chat.messages)

        await streamChatCompletion({
          agentId: chat.agentId,
          messages: apiMessages,
          signal: abort.signal,
          onDelta: (delta) => {
            useChatWorkspaceStore
              .getState()
              .appendMessageContent(chatId, assistantId, delta)
            if (onScroll) {
              if (!scrollScheduled) {
                scrollScheduled = true
                requestAnimationFrame(() => {
                  scrollScheduled = false
                  onScroll()
                })
              }
            }
          },
        })

        useChatWorkspaceStore.getState().updateMessage(chatId, assistantId, {
          status: undefined,
        })
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          useChatWorkspaceStore.getState().updateMessage(chatId, assistantId, {
            status: undefined,
          })
        } else {
          const msg =
            e instanceof Error ? e.message : 'Could not get a response'
          useChatWorkspaceStore.getState().setSendError(msg)
          const msgs = useChatWorkspaceStore
            .getState()
            .chats.find((c) => c.id === chatId)?.messages
          if (msgs) {
            useChatWorkspaceStore
              .getState()
              .replaceMessages(
                chatId,
                msgs.filter((m) => m.id !== assistantId),
              )
          }
        }
      } finally {
        abortRef.current = null
        useChatWorkspaceStore.getState().setSending(false)
        onSettled?.()
      }
    },
    [],
  )

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

      if (active.messages.length === 0) {
        store.setTitle(
          active.id,
          trimmed.length > 48 ? `${trimmed.slice(0, 47)}…` : trimmed,
        )
      }

      const userMsg = createMessage('user', trimmed)
      store.appendMessage(active.id, userMsg)

      await runAssistantStream(active.id, onSettled, onSettled)
    },
    [runAssistantStream],
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const regenerate = useCallback(
    async (onSettled?: () => void) => {
      const store = useChatWorkspaceStore.getState()
      if (store.isSending) return

      const chat = selectActiveChat(store)
      if (!chat || chat.messages.length === 0) return

      const last = chat.messages[chat.messages.length - 1]
      if (last.role !== 'assistant') return

      store.replaceMessages(chat.id, chat.messages.slice(0, -1))
      await runAssistantStream(chat.id, onSettled, onSettled)
    },
    [runAssistantStream],
  )

  const editUserMessageAndResend = useCallback(
    async (messageId: string, newContent: string, onSettled?: () => void) => {
      const trimmed = newContent.trim()
      if (!trimmed) return

      const store = useChatWorkspaceStore.getState()
      if (store.isSending) return

      const chat = selectActiveChat(store)
      if (!chat) return

      const idx = chat.messages.findIndex((m) => m.id === messageId)
      if (idx < 0 || chat.messages[idx].role !== 'user') return

      const prev = chat.messages[idx]
      const next = [
        ...chat.messages.slice(0, idx),
        { ...prev, content: trimmed },
      ]
      store.replaceMessages(chat.id, next)

      if (idx === 0) {
        store.setTitle(
          chat.id,
          trimmed.length > 48 ? `${trimmed.slice(0, 47)}…` : trimmed,
        )
      }

      await runAssistantStream(chat.id, onSettled, onSettled)
    },
    [runAssistantStream],
  )

  return { send, stop, regenerate, editUserMessageAndResend }
}
