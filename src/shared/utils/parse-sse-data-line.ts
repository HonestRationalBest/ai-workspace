import { chatCompletionChunkSchema } from '../schemas/chat-completion-chunk.schema'

export const DEFAULT_STREAM_END_MARKERS = ['[DONE]'] as const

export function isStreamEndPayload(
  data: string,
  markers: readonly string[] = DEFAULT_STREAM_END_MARKERS,
): boolean {
  return markers.includes(data)
}

export type ParseSseDataLineResult =
  | { kind: 'skip' }
  | { kind: 'end' }
  | { kind: 'delta'; delta: string }

function warnStreamParse(message: string, detail?: unknown): void {
  if (import.meta.env.DEV) {
    console.warn(`[chat-stream] ${message}`, detail ?? '')
  }
}

export function parseSseDataLine(
  rawLine: string,
  streamEndMarkers: readonly string[] = DEFAULT_STREAM_END_MARKERS,
): ParseSseDataLineResult {
  const trimmed = rawLine.replace(/\r$/, '')
  if (!trimmed.startsWith('data: ')) return { kind: 'skip' }
  const data = trimmed.slice(6).trim()
  if (isStreamEndPayload(data, streamEndMarkers)) return { kind: 'end' }
  if (data === '') return { kind: 'skip' }

  let parsed: unknown
  try {
    parsed = JSON.parse(data)
  } catch (e) {
    warnStreamParse('JSON.parse failed for SSE data payload', e)
    return { kind: 'skip' }
  }

  const result = chatCompletionChunkSchema.safeParse(parsed)
  if (!result.success) {
    warnStreamParse('Chunk failed Zod validation', result.error.flatten())
    return { kind: 'skip' }
  }

  const content = result.data.choices?.[0]?.delta?.content
  if (typeof content === 'string' && content.length > 0) {
    return { kind: 'delta', delta: content }
  }
  return { kind: 'skip' }
}
