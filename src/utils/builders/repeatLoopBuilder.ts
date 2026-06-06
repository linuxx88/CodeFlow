import type { Node, Edge } from '@xyflow/react'
import { Position } from '@xyflow/react'
import type { Template } from '../templateBuilders'

export const buildRepeatLoopTemplates = (scanData: any, templates: Record<string, Template>): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (scanData?.repeatLoops) {
    for (const repeatFile of scanData.repeatLoops) {
      const file = repeatFile.file
      const items = repeatFile.items
      if (items.length === 0) continue

      const nodes: Node[] = [
        {
          id: 'start',
          type: 'customNode',
          position: { x: 250, y: 20 },
          data: { label: `Entrée: ${file}`, type: 'start' },
          sourcePosition: Position.Bottom
        }
      ]
      const edges: Edge[] = []
      let prevNodeId = 'start'

      items.forEach((item: any, idx: number) => {
        const bodyNodeId = `body-${idx}`
        const condNodeId = `cond-${idx}`
        const exitNodeId = `exit-${idx}`
        const yBase = 120 + idx * 260

        nodes.push({
          id: bodyNodeId,
          type: 'customNode',
          position: { x: 250, y: yBase },
          data: { label: item.body, type: 'action' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top
        })

        nodes.push({
          id: condNodeId,
          type: 'customNode',
          position: { x: 250, y: yBase + 100 },
          data: { label: `Ligne ${item.line}: while (${item.condition})`, type: 'condition' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top
        })

        nodes.push({
          id: exitNodeId,
          type: 'customNode',
          position: { x: 420, y: yBase + 200 },
          data: { label: 'Sortie de boucle', type: 'action' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top
        })

        edges.push({
          id: `edge-to-body-${idx}`,
          source: prevNodeId,
          target: bodyNodeId,
          type: 'smoothstep',
          style: { stroke: 'var(--accent)' }
        })

        edges.push({
          id: `edge-body-cond-${idx}`,
          source: bodyNodeId,
          target: condNodeId,
          type: 'smoothstep',
          style: { stroke: 'var(--accent)' }
        })

        edges.push({
          id: `edge-cond-exit-${idx}`,
          source: condNodeId,
          target: exitNodeId,
          label: 'FAUX',
          type: 'smoothstep',
          style: { stroke: '#f43f5e', strokeWidth: 2 },
          labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
        })

        edges.push({
          id: `edge-cond-body-loop-${idx}`,
          source: condNodeId,
          target: bodyNodeId,
          label: 'VRAI (BOUCLER)',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4' },
          labelStyle: { fill: '#10b981', fontWeight: 'bold' }
        })

        prevNodeId = exitNodeId
      })

      temps[`project-${file}`] = {
        name: `Projet: ${file}`,
        description: `Boucles repeat - ${items.length} boucles détectées.`,
        nodes,
        edges
      }
    }
  }
  return temps
}
