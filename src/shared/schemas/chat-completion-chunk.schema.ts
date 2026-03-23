import { z } from 'zod'

export const chatCompletionChunkSchema = z.looseObject({
  choices: z
    .array(
      z.looseObject({
        delta: z
          .looseObject({
            content: z.string().nullable().optional(),
          })
          .optional(),
      }),
    )
    .optional(),
})

export type ChatCompletionChunk = z.infer<typeof chatCompletionChunkSchema>
