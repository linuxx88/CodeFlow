import type { Node, Edge } from '@xyflow/react'
import { Position } from '@xyflow/react'
import type { Template } from '../templateBuilders'

export const buildAlgoTemplates = (scanData: any, templates: Record<string, Template>): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (scanData?.algorithms) {
    for (const algoFile of scanData.algorithms) {
      const file = algoFile.file
      for (const item of algoFile.items) {
        const funcName = item.name
        const steps = item.steps
        
        const nodes: Node[] = [
          {
            id: 'start',
            type: 'customNode',
            position: { x: 250, y: 20 },
            data: { label: `Début: ${funcName}(${item.args})`, type: 'start' },
            sourcePosition: Position.Bottom
          }
        ]
        const edges: Edge[] = []
        let prevNodeId = 'start'
        
        steps.forEach((step: string, sIdx: number) => {
          const stepNodeId = `step-${sIdx}`
          const yBase = 120 + sIdx * 100
          
          nodes.push({
            id: stepNodeId,
            type: 'customNode',
            position: { x: 250, y: yBase },
            data: { label: step, type: 'action' },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top
          })
          
          edges.push({
            id: `edge-${sIdx}`,
            source: prevNodeId,
            target: stepNodeId,
            type: 'smoothstep',
            style: { stroke: 'var(--accent)' }
          })
          prevNodeId = stepNodeId
        })
        
        temps[`project-${file}-${funcName}`] = {
          name: `Fonction: ${funcName}()`,
          description: `Fichier: ${file}`,
          nodes,
          edges
        }
      }
    }
  }
  return temps
}
