import type { Node, Edge } from '@xyflow/react'
import { Position } from '@xyflow/react'
import type { Template } from '../templateBuilders'

export const buildConditionalTemplates = (
  scanData: any,
  templates: Record<string, Template>,
  filterType: string
): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (scanData?.conditionals) {
    for (const condFile of scanData.conditionals) {
      const file = condFile.file
      const items = filterType === 'ifelse' 
        ? condFile.items.filter((i: any) => i.type === 'ifelse')
        : condFile.items
        
      if (items.length === 0) continue

      const nodes: Node[] = [
        {
          id: 'start',
          type: 'customNode',
          position: { x: 250, y: 20 },
          data: { label: `Début: ${file}`, type: 'start' },
          sourcePosition: Position.Bottom
        }
      ]
      const edges: Edge[] = []
      let prevNodeId = 'start'
      
      items.forEach((item: any, idx: number) => {
        const condNodeId = `cond-${idx}`
        const yBase = 120 + idx * 240
        
        nodes.push({
          id: condNodeId,
          type: 'customNode',
          position: { x: 250, y: yBase },
          data: { 
            label: `Ligne ${item.line}: ${item.condition || item.expression}`, 
            type: 'condition' 
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top
        })
        
        edges.push({
          id: `edge-to-cond-${idx}`,
          source: prevNodeId,
          target: condNodeId,
          type: 'smoothstep',
          style: { stroke: 'var(--accent)' }
        })
        
        if (item.type === 'ifelse') {
          const thenNodeId = `then-${idx}`
          nodes.push({
            id: thenNodeId,
            type: 'customNode',
            position: { x: 80, y: yBase + 100 },
            data: { label: item.then, type: 'action' },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top
          })
          
          edges.push({
            id: `edge-then-${idx}`,
            source: condNodeId,
            target: thenNodeId,
            label: 'VRAI',
            type: 'smoothstep',
            style: { stroke: '#10b981', strokeWidth: 2 },
            labelStyle: { fill: '#10b981', fontWeight: 'bold' }
          })
          
          if (item.else) {
            const elseNodeId = `else-${idx}`
            nodes.push({
              id: elseNodeId,
              type: 'customNode',
              position: { x: 420, y: yBase + 100 },
              data: { label: item.else, type: 'action' },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top
            })
            
            edges.push({
              id: `edge-else-${idx}`,
              source: condNodeId,
              target: elseNodeId,
              label: 'FAUX',
              type: 'smoothstep',
              style: { stroke: '#f43f5e', strokeWidth: 2 },
              labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
            })
          }
          prevNodeId = condNodeId
        } else if (item.type === 'switch') {
          const cases = item.cases || []
          cases.forEach((c: string, caseIdx: number) => {
            const caseNodeId = `case-${idx}-${caseIdx}`
            const xPos = cases.length > 1 ? 50 + (caseIdx * (400 / (cases.length - 1))) : 250
            
            nodes.push({
              id: caseNodeId,
              type: 'customNode',
              position: { x: xPos, y: yBase + 100 },
              data: { label: `Action: ${c}`, type: 'action' },
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top
            })
            
            edges.push({
              id: `edge-case-${idx}-${caseIdx}`,
              source: condNodeId,
              target: caseNodeId,
              label: c.toUpperCase(),
              type: 'smoothstep',
              style: { stroke: '#10b981', strokeWidth: 2 },
              labelStyle: { fill: '#10b981', fontWeight: 'bold' }
            })
          })
          prevNodeId = condNodeId
        }
      })
      
      temps[`project-${file}`] = {
        name: `Projet: ${file}`,
        description: `Flowchart live - ${items.length} conditions détectées.`,
        nodes,
        edges
      }
    }
  }
  return temps
}
