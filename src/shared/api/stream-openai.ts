import {
  DEFAULT_STREAM_END_MARKERS,
  parseSseDataLine,
} from '../utils/parse-sse-data-line'

export {
  chatCompletionChunkSchema,
  type ChatCompletionChunk,
} from '../schemas/chat-completion-chunk.schema'
export {
  DEFAULT_STREAM_END_MARKERS,
  isStreamEndPayload,
  parseSseDataLine,
  type ParseSseDataLineResult,
} from '../utils/parse-sse-data-line'

export type ReadOpenAIChatStreamOptions = {
  signal?: AbortSignal
  streamEndMarkers?: readonly string[]
}

export async function readOpenAIChatStream(
  body: ReadableStream<Uint8Array>,
  onDelta: (delta: string) => void,
  options?: ReadOpenAIChatStreamOptions,
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const signal = options?.signal
  const markers = options?.streamEndMarkers?.length
    ? [...DEFAULT_STREAM_END_MARKERS, ...options.streamEndMarkers]
    : DEFAULT_STREAM_END_MARKERS

  try {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n')
      buffer = parts.pop() ?? ''
      for (const line of parts) {
        const result = parseSseDataLine(line, markers)
        if (result.kind === 'end') return
        if (result.kind === 'delta') onDelta(result.delta)
      }
    }
    if (buffer.trim()) {
      const result = parseSseDataLine(buffer.replace(/\r$/, ''), markers)
      if (result.kind === 'end') return
      if (result.kind === 'delta') onDelta(result.delta)
    }
  } finally {
    reader.releaseLock()
  }
}
