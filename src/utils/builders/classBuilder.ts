import { MarkerType } from '@xyflow/react'
import type { Edge, Node } from '@xyflow/react'
import type { ScanData, Template } from '../../types'

export const buildClassTemplates = (
  scanData: ScanData | null | undefined,
  templates: Record<string, Template> = {}
): Record<string, Template> => {
  const result: Record<string, Template> = { ...templates }
  const classesList = scanData?.classes || []

  for (const classFile of classesList) {
    const file = classFile.file || 'Unknown file'
    const items = classFile.items || []
    if (items.length === 0) continue

    const nodes: Node[] = items.map((item, idx) => {
      const className = item.name || 'Unnamed class'
      return {
        id: `class-${className.toLowerCase()}`,
        type: 'classNode',
        position: { x: 50 + (idx % 3) * 420, y: 50 + Math.floor(idx / 3) * 320 },
        data: {
          name: className,
          inherits: item.inherits || [],
          properties: item.properties || [],
          methods: item.methods || [],
        },
      }
    })

    const nodeIds = new Set(nodes.map((n) => n.id))
    const edges: Edge[] = []

    for (const item of items) {
      const className = item.name || 'Unnamed class'
      const childId = `class-${className.toLowerCase()}`
      const inheritsList = Array.isArray(item.inherits)
        ? item.inherits
        : typeof item.inherits === 'string' && item.inherits.trim()
          ? [item.inherits.trim()]
          : []

      for (const parentName of inheritsList) {
        if (typeof parentName !== 'string' || !parentName.trim()) continue
        const parentId = `class-${parentName.trim().toLowerCase()}`
        if (nodeIds.has(parentId)) {
          edges.push({
            id: `edge-inherits-${childId}-${parentId}`,
            source: childId,
            target: parentId,
            type: 'smoothstep',
            label: 'INHERITS',
            style: { stroke: 'var(--accent)', strokeWidth: 2 },
            labelStyle: { fill: 'var(--accent)', fontWeight: 'bold' },
            markerEnd: { type: MarkerType.ArrowClosed },
          })
        }
      }
    }

    result[`project-${file}`] = {
      name: `Project: ${file}`,
      description: `Class diagram - ${items.length} classes detected.`,
      nodes,
      edges,
    }
  }

  return result
}
