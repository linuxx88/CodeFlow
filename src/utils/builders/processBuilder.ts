import { MarkerType } from '@xyflow/react'
import { findCycles } from '../projectUtils'
import type { ScanData, Template } from '../../types'

export const buildProcessTemplates = (
  scanData: ScanData | null | undefined,
  templates: Record<string, Template> = {}
): Record<string, Template> => {
  const result: Record<string, Template> = { ...templates }
  const data = scanData || {}
  const nodesList = data.dependencies?.nodes || []
  const linksList = data.dependencies?.links || []
  const classesList = data.classes || []
  const algorithmsList = data.algorithms || []
  const conditionalsList = data.conditionals || []
  const loopsList = data.loops || []
  const hotspots = data.git?.hotspots || []

  const fileCount = nodesList.filter((n) => n?.type === 'file').length
  const pkgCount = nodesList.filter((n) => n?.type === 'package').length
  const linkCount = linksList.length
  const cycleCount = findCycles(nodesList, linksList).sccs.length
  const classCount = classesList.reduce((acc, f) => acc + (f?.items?.length || 0), 0)
  const functionCount = algorithmsList.reduce((acc, f) => acc + (f?.items?.length || 0), 0)
  const condCount = conditionalsList.reduce((acc, f) => acc + (f?.items?.length || 0), 0)
  const loopCount = loopsList.reduce((acc, f) => acc + (f?.items?.length || 0), 0)
  const sortedHotspots = [...hotspots].sort((a, b) => (b?.commits || 0) - (a?.commits || 0))
  const hotspot = sortedHotspots[0]?.file || 'None'
  const commits = sortedHotspots[0]?.commits || 0

  result['project-lifecycle'] = {
    name: 'Live Project Lifecycle',
    description: `Live metrics: ${fileCount} files, ${linkCount} links, ${cycleCount} cycles, ${functionCount} functions, ${classCount} classes.`,
    nodes: [
      {
        id: 'live-plan',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: {
          label: `1. Scan: ${fileCount} source files indexed`,
          type: 'start',
          badgeLabel: 'Scan',
        },
      },
      {
        id: 'live-arch',
        type: 'customNode',
        position: { x: 250, y: 180 },
        data: {
          label: `2. Architecture: ${pkgCount} packages, ${linkCount} edges, ${cycleCount} cycles`,
          type: 'condition',
          badgeLabel: 'Architecture',
        },
      },
      {
        id: 'live-code',
        type: 'customNode',
        position: { x: 250, y: 380 },
        data: {
          label: `3. Codebase: ${functionCount} functions, ${classCount} classes, ${condCount} conditionals, ${loopCount} loops`,
          type: 'action',
          badgeLabel: 'Codebase',
        },
      },
      {
        id: 'live-quality',
        type: 'customNode',
        position: { x: 250, y: 540 },
        data: {
          label: `4. Git Activity: Top hotspot ${hotspot} (${commits} commits)`,
          type: 'action',
          badgeLabel: 'Git Activity',
        },
      },
      {
        id: 'live-status',
        type: 'customNode',
        position: { x: 250, y: 700 },
        data: {
          label: `5. Summary: ${fileCount} files analyzed (${cycleCount === 0 ? 'acyclic' : `${cycleCount} cycle(s)`})`,
          type: 'action',
          badgeLabel: 'Summary',
        },
      },
    ],
    edges: [
      { id: 'el-1', source: 'live-plan', target: 'live-arch', type: 'smoothstep', style: { stroke: 'var(--accent)' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'el-2', source: 'live-arch', target: 'live-code', type: 'smoothstep', style: { stroke: 'var(--accent)' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'el-3', source: 'live-code', target: 'live-quality', type: 'smoothstep', style: { stroke: 'var(--accent)' }, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'el-4', source: 'live-quality', target: 'live-status', type: 'smoothstep', style: { stroke: 'var(--accent)' }, markerEnd: { type: MarkerType.ArrowClosed } },
    ],
  }

  return result
}
