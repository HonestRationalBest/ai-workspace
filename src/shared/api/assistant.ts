export type ApiMessage = { role: 'user' | 'assistant'; content: string }

export type CompleteChatInput = {
  agentId: string
  messages: ApiMessage[]
}

function resolveBackendChatUrl(): string | null {
  const explicit = import.meta.env.VITE_API_BASE_URL?.trim()
  if (explicit) {
    return `${explicit.replace(/\/$/, '')}/api/chat`
  }
  if (import.meta.env.DEV) {
    return '/api/chat'
  }
  return null
}

/**
 * Calls `POST /api/chat` on the Node server when a URL is available
 * (`VITE_API_BASE_URL` or same-origin `/api/chat` in dev via Vite proxy).
 * API keys live in `server/.env` only.
 *
 * If no backend URL (e.g. production build without `VITE_API_BASE_URL`), returns a mock reply.
 */
export async function completeChat({
  agentId,
  messages,
}: CompleteChatInput): Promise<string> {
  const backendUrl = resolveBackendChatUrl()
  if (backendUrl) {
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, messages }),
    })
    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      detail?: string
      reply?: string
    }
    if (!res.ok) {
      const detail = data.detail ? ` ${data.detail}` : ''
      throw new Error((data.error ?? res.statusText) + detail)
    }
    const reply = data.reply?.trim()
    if (!reply) throw new Error('Invalid response from API')
    return reply
  }

  await new Promise((r) => setTimeout(r, 450 + Math.floor(Math.random() * 350)))
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const preview = lastUser?.content?.slice(0, 120) ?? ''
  return (
    `[${agentId} · demo] You wrote: "${preview}${(lastUser?.content?.length ?? 0) > 120 ? '…' : ''}"\n\n` +
    'Start the API from the `ai-workspace-server` project (`LLM_API_KEY` in its `.env`) and run this app with `npm run dev`. For production, set `VITE_API_BASE_URL` to your deployed API origin.'
  )
}
