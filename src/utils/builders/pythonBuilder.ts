import type { Node, Edge } from '@xyflow/react'
import { Position } from '@xyflow/react'
import type { Template } from '../templateBuilders'

export const buildPythonTemplates = (scanData: any, templates: Record<string, Template>): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (scanData?.pythonStructures) {
    for (const pyFile of scanData.pythonStructures) {
      const file = pyFile.file
      const items = pyFile.items
      if (items.length === 0) continue

      const nodes: Node[] = [
        {
          id: 'start',
          type: 'customNode',
          position: { x: 250, y: 20 },
          data: { label: `Script Python: ${file}`, type: 'start' },
          sourcePosition: Position.Bottom
        }
      ]
      const edges: Edge[] = []
      let prevNodeId = 'start'

      items.forEach((item: any, idx: number) => {
        const yBase = 120 + idx * 240

        if (item.type === 'tryexcept') {
          const tryNodeId = `try-${idx}`
          const successNodeId = `success-${idx}`
          const exceptNodeId = `except-${idx}`

          nodes.push({
            id: tryNodeId,
            type: 'customNode',
            position: { x: 250, y: yBase },
            data: { label: `Try: ${item.try}`, type: 'condition' },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top
          })

          nodes.push({
            id: successNodeId,
            type: 'customNode',
            position: { x: 80, y: yBase + 100 },
            data: { label: 'Succès: continuer', type: 'action' },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top
          })

          nodes.push({
            id: exceptNodeId,
            type: 'customNode',
            position: { x: 420, y: yBase + 100 },
            data: { label: `Except ${item.except}`, type: 'action' },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top
          })

          edges.push({
            id: `edge-to-try-${idx}`,
            source: prevNodeId,
            target: tryNodeId,
            type: 'smoothstep',
            style: { stroke: 'var(--accent)' }
          })

          edges.push({
            id: `edge-try-success-${idx}`,
            source: tryNodeId,
            target: successNodeId,
            label: 'TRY',
            type: 'smoothstep',
            style: { stroke: '#10b981', strokeWidth: 2 },
            labelStyle: { fill: '#10b981', fontWeight: 'bold' }
          })

          edges.push({
            id: `edge-try-except-${idx}`,
            source: tryNodeId,
            target: exceptNodeId,
            label: 'EXCEPT',
            type: 'smoothstep',
            style: { stroke: '#f43f5e', strokeWidth: 2 },
            labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
          })

          prevNodeId = successNodeId
        } else if (item.type === 'decorator') {
          const decNodeId = `dec-${idx}`
          nodes.push({
            id: decNodeId,
            type: 'customNode',
            position: { x: 250, y: yBase },
            data: { label: `@${item.name}`, type: 'start' },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top
          })

          edges.push({
            id: `edge-dec-${idx}`,
            source: prevNodeId,
            target: decNodeId,
            type: 'smoothstep',
            style: { stroke: 'var(--accent)' }
          })
          prevNodeId = decNodeId
        } else if (item.type === 'main') {
          const mainNodeId = `main-${idx}`
          nodes.push({
            id: mainNodeId,
            type: 'customNode',
            position: { x: 250, y: yBase },
            data: { label: 'if __name__ == "__main__"', type: 'action' },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top
          })

          edges.push({
            id: `edge-main-${idx}`,
            source: prevNodeId,
            target: mainNodeId,
            type: 'smoothstep',
            style: { stroke: 'var(--accent)' }
          })
          prevNodeId = mainNodeId
        }
      })

      temps[`project-${file}`] = {
        name: `Python: ${file}`,
        description: `Structure Python - ${items.length} éléments détectés.`,
        nodes,
        edges
      }
    }
  }
  return temps
}
