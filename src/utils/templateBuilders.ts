import type { Node, Edge } from '@xyflow/react'

export interface Template {
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
}

export { buildLoopTemplates } from './builders/loopBuilder'
export { buildRepeatLoopTemplates } from './builders/repeatLoopBuilder'
export { buildAlgoTemplates } from './builders/algoBuilder'
export { buildPythonTemplates } from './builders/pythonBuilder'
export { buildConditionalTemplates } from './builders/conditionalBuilder'
