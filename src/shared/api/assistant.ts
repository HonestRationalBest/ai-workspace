import { readOpenAIChatStream } from './stream-openai'

export type ApiMessage = { role: 'user' | 'assistant'; content: string }

export type StreamChatInput = {
  agentId: string
  messages: ApiMessage[]
  signal?: AbortSignal
  onDelta: (delta: string) => void
}

export async function streamChatCompletion(
  input: StreamChatInput,
): Promise<void> {
  const { agentId, messages, signal, onDelta } = input
  const base = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!base) {
    throw new Error(
      'VITE_API_BASE_URL is not set. Add it to your .env (e.g. VITE_API_BASE_URL=http://localhost:3000).',
    )
  }
  const streamUrl = `${base.replace(/\/$/, '')}/api/chat/stream`

  const res = await fetch(streamUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, messages }),
    signal,
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      detail?: string
    }
    const detail = data.detail ? ` ${data.detail}` : ''
    throw new Error((data.error ?? res.statusText) + detail)
  }
  if (!res.body) throw new Error('No response body')
  await readOpenAIChatStream(res.body, onDelta, { signal })
}
