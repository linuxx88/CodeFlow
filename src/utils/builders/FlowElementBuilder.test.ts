import { describe, it, expect } from 'vitest'
import { FlowElementBuilder } from './FlowElementBuilder'
import { Position } from '@xyflow/react'
import type { Node } from '@xyflow/react'
import { getNodeDimensions } from '../layoutEngine'
import {
  buildAlgoTemplates,
  buildConditionalTemplates,
  buildLoopTemplates,
  buildRepeatLoopTemplates,
  buildPythonTemplates,
} from '../templateBuilders'

const assertTemplateNoOverlaps = (nodes: Node[]) => {
  const boxes = nodes.map((n) => {
    const dims = getNodeDimensions(n)
    return {
      id: n.id,
      x1: n.position.x,
      y1: n.position.y,
      x2: n.position.x + dims.width,
      y2: n.position.y + dims.height,
    }
  })

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]
      const b = boxes[j]
      const overlapsX = a.x1 < b.x2 && a.x2 > b.x1
      const overlapsY = a.y1 < b.y2 && a.y2 > b.y1
      expect(
        overlapsX && overlapsY,
        `Template nodes "${a.id}" and "${b.id}" overlap`
      ).toBe(false)
    }
  }
}

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

  it('should preserve custom handle positions when set before withNodeType', () => {
    const template = new FlowElementBuilder('Handles', 'Custom handles')
      .addNode('n1')
        .withSourcePosition(Position.Right)
        .withTargetPosition(Position.Left)
        .withNodeType('action')
        .withLabel('Custom')
      .build()

    expect(template.nodes[0].sourcePosition).toBe(Position.Right)
    expect(template.nodes[0].targetPosition).toBe(Position.Left)
  })

  it('should throw validation error on malformed or NaN node position', () => {
    const builder = new FlowElementBuilder('Error Node', 'invalid position')
    builder.addNode('n1').withNodeType('start').withLabel('N1').commit()

    // @ts-expect-error - testing invalid private property position assignment
    builder.nodes[0].position = undefined

    expect(() => builder.build()).toThrow('Validation Error: Node n1 has invalid position coordinates')

    const nanBuilder = new FlowElementBuilder('NaN Node', 'NaN position')
      .addNode('n1').withPosition(Number.NaN, 0).withLabel('N1').commit()
    expect(() => nanBuilder.build()).toThrow('Validation Error: Node n1 has invalid position coordinates')
  })

  it('should throw validation error on invalid classNode or orphan edge', () => {
    const classBuilder = new FlowElementBuilder('Class', 'Missing name')
      .addNode('c1').withType('classNode').withPosition(0, 0).commit()
    expect(() => classBuilder.build()).toThrow('Validation Error: Class node c1 is missing a valid name')

    const builder = new FlowElementBuilder('Error Edge', 'orphan link')
      .addNode('n1').withNodeType('start').withPosition(0, 0).withLabel('N1')
      .addEdge('e-orphan').from('n1').to('non-existent')

    expect(() => builder.build()).toThrow('Validation Error: Edge e-orphan references non-existent target node "non-existent"')
  })
})

describe('templateBuilders', () => {
  it('builds algo, conditional, loop, repeatLoop, and python templates with zero node overlaps', () => {
    const algo = buildAlgoTemplates(
      {
        algorithms: [
          {
            file: 'math.ts',
            items: [
              {
                name: 'sum',
                args: 'a, b',
                steps: [
                  'Validate input arguments are finite numbers',
                  'Compute intermediate sum and check overflow\nReturn clamped result',
                ],
              },
            ],
          },
        ],
      },
      {}
    )
    expect(algo['project-math.ts-sum'].nodes).toHaveLength(3)
    expect(algo['project-math.ts-sum'].nodes[0].data.badgeLabel).toBe('Function')
    expect(algo['project-math.ts-sum'].nodes[1].data.badgeLabel).toBe('Step')
    assertTemplateNoOverlaps(algo['project-math.ts-sum'].nodes)

    const cond = buildConditionalTemplates(
      {
        conditionals: [
          {
            file: 'auth.ts',
            items: [
              {
                type: 'ifelse',
                line: 10,
                condition: 'isValidUser && hasPermission',
                then: 'Grant access to protected dashboard',
                else: 'Redirect to login page with error',
              },
              {
                type: 'switch',
                line: 20,
                expression: 'role',
                cases: ['admin', 'editor', 'viewer', 'guest', 'banned'],
              },
            ],
          },
        ],
      },
      {},
      'all'
    )
    expect(cond['project-auth.ts'].nodes.length).toBeGreaterThan(8)
    assertTemplateNoOverlaps(cond['project-auth.ts'].nodes)

    const loops = buildLoopTemplates(
      {
        loops: [
          {
            file: 'loop.ts',
            items: [
              { line: 5, condition: 'i < items.length', body: 'Process item and increment index' },
              { line: 12, condition: 'hasNext()', body: 'Fetch next page' },
            ],
          },
        ],
      },
      {}
    )
    expect(loops['project-loop.ts'].nodes).toHaveLength(7)
    expect(loops['project-loop.ts'].nodes[1].data.badgeLabel).toBe('Loop Check')
    expect(loops['project-loop.ts'].nodes[2].data.badgeLabel).toBe('Loop Body')
    assertTemplateNoOverlaps(loops['project-loop.ts'].nodes)

    const repeats = buildRepeatLoopTemplates(
      {
        repeatLoops: [
          {
            file: 'rep.ts',
            items: [
              { line: 8, condition: 'ok', body: 'retry()' },
              { line: 16, condition: 'done', body: 'pollStatus()' },
            ],
          },
        ],
      },
      {}
    )
    expect(repeats['project-rep.ts'].nodes).toHaveLength(7)
    assertTemplateNoOverlaps(repeats['project-rep.ts'].nodes)

    const py = buildPythonTemplates(
      {
        pythonStructures: [
          {
            file: 'app.py',
            items: [
              { type: 'tryexcept', try: 'run_pipeline()', except: 'ValueError' },
              { type: 'decorator', name: 'route' },
              { type: 'main' },
            ],
          },
        ],
      },
      {}
    )
    expect(py['project-app.py'].nodes.length).toBe(6)
    assertTemplateNoOverlaps(py['project-app.py'].nodes)
  })
})
