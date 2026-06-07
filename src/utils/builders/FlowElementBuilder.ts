import type { Node, Edge } from '@xyflow/react'
import { Position } from '@xyflow/react'
import type { Template } from '../templateBuilders'
import React from 'react'

export class FlowElementBuilder {
  private nodes: Node[] = []
  private edges: Edge[] = []
  private name: string = ''
  private description: string = ''

  constructor(name?: string, description?: string) {
    if (name) this.name = name
    if (description) this.description = description
  }

  setName(name: string): this {
    this.name = name
    return this
  }

  setDescription(desc: string): this {
    this.description = desc
    return this
  }

  addNode(id: string): NodeBuilder {
    return new NodeBuilder(id, this)
  }

  addEdge(id: string): EdgeBuilder {
    return new EdgeBuilder(id, this)
  }

  addRawNode(node: Node): this {
    if (!this.nodes.some(n => n.id === node.id)) {
      this.nodes.push(node)
    }
    return this
  }

  addRawEdge(edge: Edge): this {
    if (!this.edges.some(e => e.id === edge.id)) {
      this.edges.push(edge)
    }
    return this
  }

  validate(): void {
    const nodeIds = new Set<string>()

    for (const node of this.nodes) {
      if (!node.id || typeof node.id !== 'string') {
        throw new Error(`Validation Error: Node has invalid or missing id`)
      }
      nodeIds.add(node.id)

      if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        throw new Error(`Validation Error: Node ${node.id} has invalid position coordinates`)
      }

      if (node.type === 'classNode') {
        if (!node.data || typeof node.data.name !== 'string' || !node.data.name) {
          throw new Error(`Validation Error: Class node ${node.id} is missing a valid name`)
        }
      } else {
        const data = node.data || {}
        const label = data.label
        const nodeType = data.type || 'action'

        if (typeof label !== 'string') {
          throw new Error(`Validation Error: Node ${node.id} label must be a string`)
        }
        if (nodeType !== 'start' && nodeType !== 'condition' && nodeType !== 'action') {
          throw new Error(`Validation Error: Node ${node.id} has invalid type "${nodeType}"`)
        }
      }
    }

    for (const edge of this.edges) {
      if (!edge.id || typeof edge.id !== 'string') {
        throw new Error(`Validation Error: Edge has invalid or missing id`)
      }
      if (!edge.source || !nodeIds.has(edge.source)) {
        throw new Error(`Validation Error: Edge ${edge.id} references non-existent source node "${edge.source}"`)
      }
      if (!edge.target || !nodeIds.has(edge.target)) {
        throw new Error(`Validation Error: Edge ${edge.id} references non-existent target node "${edge.target}"`)
      }
    }
  }

  build(): Template {
    this.validate()
    return {
      name: this.name,
      description: this.description,
      nodes: this.nodes,
      edges: this.edges
    }
  }
}

export class NodeBuilder {
  private node: Node
  private parent: FlowElementBuilder

  constructor(id: string, parent: FlowElementBuilder) {
    this.parent = parent
    this.node = {
      id,
      type: 'customNode',
      position: { x: 0, y: 0 },
      data: { label: '', type: 'action' }
    }
  }

  withType(type: string): this {
    this.node.type = type
    return this
  }

  withPosition(x: number, y: number): this {
    this.node.position = { x, y }
    return this
  }

  withData(data: Record<string, any>): this {
    this.node.data = { ...this.node.data, ...data }
    return this
  }

  withLabel(label: string): this {
    this.node.data = { ...this.node.data, label }
    return this
  }

  withNodeType(nodeType: 'start' | 'condition' | 'action'): this {
    this.node.data = { ...this.node.data, type: nodeType }
    
    // Auto configure defaults handles positions based on type
    if (nodeType === 'start') {
      this.node.sourcePosition = Position.Bottom
      this.node.targetPosition = undefined
    } else {
      this.node.sourcePosition = Position.Bottom
      this.node.targetPosition = Position.Top
    }
    
    return this
  }

  withSourcePosition(pos: Position): this {
    this.node.sourcePosition = pos
    return this
  }

  withTargetPosition(pos: Position): this {
    this.node.targetPosition = pos
    return this
  }

  withStyle(style: React.CSSProperties): this {
    this.node.style = style
    return this
  }

  // Chaining API
  addNode(id: string): NodeBuilder {
    this.parent.addRawNode(this.node)
    return this.parent.addNode(id)
  }

  addEdge(id: string): EdgeBuilder {
    this.parent.addRawNode(this.node)
    return this.parent.addEdge(id)
  }

  commit(): FlowElementBuilder {
    this.parent.addRawNode(this.node)
    return this.parent
  }

  build(): Template {
    this.parent.addRawNode(this.node)
    return this.parent.build()
  }
}

export class EdgeBuilder {
  private edge: Edge
  private parent: FlowElementBuilder

  constructor(id: string, parent: FlowElementBuilder) {
    this.parent = parent
    this.edge = {
      id,
      source: '',
      target: '',
      type: 'smoothstep'
    }
  }

  from(source: string): this {
    this.edge.source = source
    return this
  }

  to(target: string): this {
    this.edge.target = target
    return this
  }

  withType(type: string): this {
    this.edge.type = type
    return this
  }

  withLabel(label: string): this {
    this.edge.label = label
    return this
  }

  withAnimated(animated: boolean): this {
    this.edge.animated = animated
    return this
  }

  withStyle(style: React.CSSProperties): this {
    this.edge.style = { ...this.edge.style, ...style }
    return this
  }

  withLabelStyle(style: React.CSSProperties): this {
    this.edge.labelStyle = style
    return this
  }

  // Predefined Themes CSS
  withDefaultTheme(): this {
    this.edge.type = 'smoothstep'
    this.edge.style = { stroke: 'var(--accent)' }
    return this
  }

  withTrueTheme(): this {
    this.edge.type = 'smoothstep'
    this.edge.style = { stroke: '#10b981', strokeWidth: 2 }
    this.edge.labelStyle = { fill: '#10b981', fontWeight: 'bold' }
    return this
  }

  withFalseTheme(): this {
    this.edge.type = 'smoothstep'
    this.edge.style = { stroke: '#f43f5e', strokeWidth: 2 }
    this.edge.labelStyle = { fill: '#f43f5e', fontWeight: 'bold' }
    return this
  }

  withLoopTheme(): this {
    this.edge.type = 'smoothstep'
    this.edge.animated = true
    this.edge.style = { stroke: '#eab308', strokeWidth: 2, strokeDasharray: '4 4' }
    this.edge.labelStyle = { fill: '#eab308', fontWeight: 'bold' }
    return this
  }

  // Chaining API
  addNode(id: string): NodeBuilder {
    this.parent.addRawEdge(this.edge)
    return this.parent.addNode(id)
  }

  addEdge(id: string): EdgeBuilder {
    this.parent.addRawEdge(this.edge)
    return this.parent.addEdge(id)
  }

  commit(): FlowElementBuilder {
    this.parent.addRawEdge(this.edge)
    return this.parent
  }

  build(): Template {
    this.parent.addRawEdge(this.edge)
    return this.parent.build()
  }
}
