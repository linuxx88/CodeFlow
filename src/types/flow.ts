import type { Node, Edge } from '@xyflow/react'

/**
 * Shared TypeScript types for React Flow templates, builders,
 * validation, and layout engines.
 */

export type FlowNodeType = 'start' | 'condition' | 'action'

export interface FlowNodeData extends Record<string, unknown> {
  label: string
  type: FlowNodeType
  width?: number
  height?: number
}

export interface ClassNodeData extends Record<string, unknown> {
  name: string
  inherits?: string | string[] | null
  properties?: string[]
  methods?: string[]
  width?: number
  height?: number
}

export interface Template {
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
}

export interface ValidationResult {
  isValid: boolean
  message?: string
  details?: string
}

export type LayoutDirection = 'LR' | 'TB'

export type LayoutType = 'dagre' | 'elk' | 'python'

export interface LayoutOptions {
  direction: LayoutDirection
  nodesep: number
  ranksep: number
}

export interface LayoutResult {
  nodes: Node[]
  edges: Edge[]
}

export interface LayoutEngine {
  layout(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions
  ): Promise<LayoutResult> | LayoutResult
}
