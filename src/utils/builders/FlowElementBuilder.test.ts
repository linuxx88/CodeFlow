import { describe, it, expect } from 'vitest'
import { FlowElementBuilder } from './FlowElementBuilder'
import { Position } from '@xyflow/react'

describe('FlowElementBuilder', () => {
  it('should successfully build a valid template with fluent API', () => {
    const template = new FlowElementBuilder('Test Flow', 'A test flowchart')
      .addNode('start')
        .withNodeType('start')
        .withPosition(250, 20)
        .withLabel('Start Node')
      .addNode('step-1')
        .withNodeType('action')
        .withPosition(250, 120)
        .withLabel('Action Node')
      .addEdge('edge-1')
        .from('start')
        .to('step-1')
        .withDefaultTheme()
      .build()

    expect(template.name).toBe('Test Flow')
    expect(template.description).toBe('A test flowchart')
    expect(template.nodes).toHaveLength(2)
    expect(template.edges).toHaveLength(1)

    const startNode = template.nodes.find(n => n.id === 'start')!
    expect(startNode.data.type).toBe('start')
    expect(startNode.data.label).toBe('Start Node')
    expect(startNode.sourcePosition).toBe(Position.Bottom)

    const stepNode = template.nodes.find(n => n.id === 'step-1')!
    expect(stepNode.data.type).toBe('action')
    expect(stepNode.data.label).toBe('Action Node')
    expect(stepNode.targetPosition).toBe(Position.Top)

    const edge = template.edges[0]
    expect(edge.id).toBe('edge-1')
    expect(edge.source).toBe('start')
    expect(edge.target).toBe('step-1')
    expect(edge.style).toEqual({ stroke: 'var(--accent)' })
  })

  it('should apply true/false/loop themes on edges', () => {
    const template = new FlowElementBuilder('Themes', 'Edge themes')
      .addNode('n1').withNodeType('start').withPosition(0, 0).withLabel('N1').commit()
      .addNode('n2').withNodeType('condition').withPosition(0, 100).withLabel('N2').commit()
      .addNode('n3').withNodeType('action').withPosition(0, 200).withLabel('N3').commit()
      .addEdge('e-true').from('n1').to('n2').withTrueTheme().commit()
      .addEdge('e-false').from('n1').to('n3').withFalseTheme().commit()
      .addEdge('e-loop').from('n2').to('n1').withLoopTheme().commit()
      .build()

    const eTrue = template.edges.find(e => e.id === 'e-true')!
    expect(eTrue.style).toEqual({ stroke: '#10b981', strokeWidth: 2 })
    expect(eTrue.labelStyle).toEqual({ fill: '#10b981', fontWeight: 'bold' })

    const eFalse = template.edges.find(e => e.id === 'e-false')!
    expect(eFalse.style).toEqual({ stroke: '#f43f5e', strokeWidth: 2 })
    expect(eFalse.labelStyle).toEqual({ fill: '#f43f5e', fontWeight: 'bold' })

    const eLoop = template.edges.find(e => e.id === 'e-loop')!
    expect(eLoop.animated).toBe(true)
    expect(eLoop.style).toEqual({ stroke: '#eab308', strokeWidth: 2, strokeDasharray: '4 4' })
    expect(eLoop.labelStyle).toEqual({ fill: '#eab308', fontWeight: 'bold' })
  })

  it('should throw validation error on malformed node position', () => {
    const builder = new FlowElementBuilder('Error Node', 'invalid position')
    builder.addNode('n1').withNodeType('start').withLabel('N1').commit()
    
    // @ts-expect-error - testing invalid private property position assignment
    builder.nodes[0].position = undefined

    expect(() => builder.build()).toThrow('Validation Error: Node n1 has invalid position coordinates')
  })

  it('should throw validation error on orphan edge', () => {
    const builder = new FlowElementBuilder('Error Edge', 'orphan link')
      .addNode('n1').withNodeType('start').withPosition(0, 0).withLabel('N1')
      .addEdge('e-orphan').from('n1').to('non-existent')

    expect(() => builder.build()).toThrow('Validation Error: Edge e-orphan references non-existent target node "non-existent"')
  })
})
