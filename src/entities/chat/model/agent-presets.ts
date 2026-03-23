import type { AgentId } from './types'

export type AgentMeta = {
  id: AgentId
  label: string
  shortLabel: string
  description: string
}

export const AGENT_PRESETS: AgentMeta[] = [
  {
    id: 'coding',
    label: 'Coding assistant',
    shortLabel: 'Code',
    description: 'Helps with code, refactoring, and architecture.',
  },
  {
    id: 'writing',
    label: 'Writing assistant',
    shortLabel: 'Write',
    description: 'Editing, tone, and structure for your text.',
  },
  {
    id: 'research',
    label: 'Research assistant',
    shortLabel: 'Research',
    description:
      'Gathering facts, comparing options, and careful conclusions.',
  },
]

export const AGENT_BY_ID: Record<AgentId, AgentMeta> = Object.fromEntries(
  AGENT_PRESETS.map((p) => [p.id, p]),
) as Record<AgentId, AgentMeta>
