import { MarkerType } from '@xyflow/react'
import type { Edge, Node } from '@xyflow/react'
import type { FlowchartView } from '../constants/views'
import {
  CONDITIONAL_TEMPLATES,
  LOOP_TEMPLATES,
  REPEAT_TEMPLATES,
  ALGO_TEMPLATES,
  PYTHON_TEMPLATES,
  PROCESS_TEMPLATES,
  CLASS_TEMPLATES,
} from '../templates'
import {
  buildLoopTemplates,
  buildRepeatLoopTemplates,
  buildAlgoTemplates,
  buildPythonTemplates,
  buildConditionalTemplates,
} from './templateBuilders'
import type { ScanData, Template, ValidationResult } from '../types'

const buildProcessTemplates = (scanData: ScanData | null | undefined): Record<string, Template> => {
  const templates: Record<string, Template> = { ...PROCESS_TEMPLATES }
  const data = scanData || {}
  const nodesList = data.dependencies?.nodes || []
  const linksList = data.dependencies?.links || []
  const classesList = data.classes || []
  const algorithmsList = data.algorithms || []
  const hotspots = data.git?.hotspots || []

  const fileCount = nodesList.filter((n) => n?.type === 'file').length
  const pkgCount = nodesList.filter((n) => n?.type === 'package').length
  const linkCount = linksList.length
  const classCount = classesList.reduce((acc, f) => acc + (f?.items?.length || 0), 0)
  const functionCount = algorithmsList.reduce((acc, f) => acc + (f?.items?.length || 0), 0)
  const hotspot = hotspots[0]?.file || 'None'
  const commits = hotspots[0]?.commits || 0

  templates['project-lifecycle'] = {
    name: 'Live Project Process',
    description: 'Real-time lifecycle and metrics from project scan.',
    nodes: [
      {
        id: 'live-plan',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: `1. Initialization: Project scanned with ${fileCount} files`, type: 'start' },
      },
      {
        id: 'live-arch',
        type: 'customNode',
        position: { x: 250, y: 180 },
        data: { label: `2. Architecture: ${pkgCount} packages, ${linkCount} links`, type: 'condition' },
      },
      {
        id: 'live-code',
        type: 'customNode',
        position: { x: 250, y: 380 },
        data: { label: `3. Code: ${functionCount} functions, ${classCount} classes`, type: 'action' },
      },
      {
        id: 'live-quality',
        type: 'customNode',
        position: { x: 250, y: 540 },
        data: { label: `4. Git: Top hotspot: ${hotspot} (${commits} commits)`, type: 'action' },
      },
      {
        id: 'live-status',
        type: 'customNode',
        position: { x: 250, y: 700 },
        data: { label: '5. Status: Production ready (build OK)', type: 'action' },
      },
    ],
    edges: [
      { id: 'el-1', source: 'live-plan', target: 'live-arch', type: 'smoothstep', style: { stroke: 'var(--accent)' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'el-2', source: 'live-arch', target: 'live-code', type: 'smoothstep', style: { stroke: 'var(--accent)' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'el-3', source: 'live-code', target: 'live-quality', type: 'smoothstep', style: { stroke: 'var(--accent)' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'el-4', source: 'live-quality', target: 'live-status', type: 'smoothstep', style: { stroke: 'var(--accent)' }, markerEnd: { type: MarkerType.ArrowClosed } },
    ],
  }

  return templates
}

const buildClassTemplates = (scanData: ScanData | null | undefined): Record<string, Template> => {
  const templates: Record<string, Template> = { ...CLASS_TEMPLATES }
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

    templates[`project-${file}`] = {
      name: `Project: ${file}`,
      description: `Class diagram - ${items.length} classes detected.`,
      nodes,
      edges,
    }
  }

  return templates
}

export const validateNodesForView = (
  currentView: FlowchartView,
  scanData: ScanData | null | undefined
): ValidationResult => {
  let templates: Record<string, Template> = {}

  try {
    switch (currentView) {
      case 'conditional-statement':
        templates = buildConditionalTemplates(scanData, CONDITIONAL_TEMPLATES, 'all')
        break
      case 'while-loop':
        templates = buildLoopTemplates(scanData, LOOP_TEMPLATES)
        break
      case 'repeat-loop':
        templates = buildRepeatLoopTemplates(scanData, REPEAT_TEMPLATES)
        break
      case 'algo':
        templates = buildAlgoTemplates(scanData, ALGO_TEMPLATES)
        break
      case 'python-flowchart':
        templates = buildPythonTemplates(scanData, PYTHON_TEMPLATES)
        break
      case 'process-flowchart':
        templates = buildProcessTemplates(scanData)
        break
      case 'class-diagram':
        templates = buildClassTemplates(scanData)
        break
      default:
        return { isValid: false, message: `Unrecognized or corrupted view: "${currentView}"` }
    }
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : String(err)
    return {
      isValid: false,
      message: 'Error building flowchart data',
      details,
    }
  }

  for (const [key, template] of Object.entries(templates)) {
    if (!template || typeof template !== 'object') {
      return { isValid: false, message: `Invalid template for key "${key}".` }
    }
    if (!Array.isArray(template.nodes)) {
      return {
        isValid: false,
        message: `Template "${template.name || key}" does not contain a valid node list.`,
      }
    }
    if (template.edges !== undefined && !Array.isArray(template.edges)) {
      return {
        isValid: false,
        message: `Template "${template.name || key}" does not contain a valid edge list.`,
      }
    }

    for (const node of template.nodes) {
      if (!node || typeof node !== 'object') {
        return { isValid: false, message: `Malformed node in template "${template.name || key}".` }
      }
      if (!node.id || typeof node.id !== 'string') {
        return {
          isValid: false,
          message: `Missing or invalid node ID in template "${template.name || key}".`,
        }
      }

      if (currentView === 'class-diagram') {
        if (node.type !== 'classNode') {
          return {
            isValid: false,
            message: `Invalid React Flow render target type: expected "classNode", got "${node.type || 'undefined'}".`,
            details: `Template: ${template.name || key}\nNode ID: ${node.id}`,
          }
        }
        const data = node.data || {}
        if (typeof data.name !== 'string') {
          return {
            isValid: false,
            message: 'Class node is missing a valid name or required attributes.',
            details: `Template: ${template.name || key}\nNode ID: ${node.id}\nData: ${JSON.stringify(data)}`,
          }
        }
      } else {
        if (node.type !== 'customNode') {
          return {
            isValid: false,
            message: `Invalid React Flow render target type: expected "customNode", got "${node.type || 'undefined'}".`,
            details: `Template: ${template.name || key}\nNode ID: ${node.id}`,
          }
        }
        const data = node.data || {}
        const label = data.label || 'Element'
        const nodeType = data.type || 'action'

        if (typeof label !== 'string') {
          return {
            isValid: false,
            message: `Node "${node.id}" does not have a string label.`,
            details: `Template: ${template.name || key}\nData: ${JSON.stringify(data)}`,
          }
        }
        if (nodeType !== 'start' && nodeType !== 'condition' && nodeType !== 'action') {
          return {
            isValid: false,
            message: `Unrecognized or corrupted node type "${nodeType}" (expected 'start', 'condition', or 'action').`,
            details: `Template: ${template.name || key}\nNode ID: ${node.id}\nLabel: "${label}"`,
          }
        }
      }
    }
  }

  return { isValid: true }
}
