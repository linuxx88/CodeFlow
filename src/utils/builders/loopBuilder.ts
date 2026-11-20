import { FlowElementBuilder } from './FlowElementBuilder'
import { Position } from '@xyflow/react'
import { getNodeDimensions } from '../layoutEngine'
import type { FlowNodeType, ScanData, Template } from '../../types'

const boxSize = (label: string, type: FlowNodeType) =>
  getNodeDimensions({
    id: '',
    type: 'customNode',
    position: { x: 0, y: 0 },
    data: { label, type },
  })

export const buildLoopTemplates = (
  scanData: ScanData | null | undefined,
  templates: Record<string, Template>
): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (!scanData?.loops) return temps

  const VERTICAL_GAP = 60
  const HORIZONTAL_GAP = 60

  for (const loopFile of scanData.loops) {
    const file = loopFile.file || 'Unknown file'
    const items = Array.isArray(loopFile.items) ? loopFile.items : []
    if (items.length === 0) continue

    const startLabel = `Entry: ${file}`
    const builder = new FlowElementBuilder(
      `Project: ${file}`,
      `Live loops - ${items.length} loops detected.`
    )
      .addNode('start')
      .withNodeType('start')
      .withPosition(250, 20)
      .withLabel(startLabel)
      .withBadgeLabel('Entry')
      .commit()

    let prevNodeId = 'start'
    let cursorY = 20 + boxSize(startLabel, 'start').height + VERTICAL_GAP

    items.forEach((item, idx) => {
      const condNodeId = `cond-${idx}`
      const bodyNodeId = `body-${idx}`
      const exitNodeId = `exit-${idx}`

      const condLabel = `Line ${item.line ?? '?'}: while (${item.condition || '...'})`
      const bodyLabel = String(item.body ?? 'Loop body')
      const exitLabel = 'Exit loop'

      const condDims = boxSize(condLabel, 'condition')
      const bodyDims = boxSize(bodyLabel, 'action')
      const exitDims = boxSize(exitLabel, 'action')

      const branchY = cursorY + condDims.height + VERTICAL_GAP
      const exitX = Math.max(420, 20 + bodyDims.width + HORIZONTAL_GAP)

      builder
        .addNode(condNodeId)
        .withNodeType('condition')
        .withPosition(250, cursorY)
        .withLabel(condLabel)
        .withBadgeLabel('Loop Check')
        .commit()

        .addNode(bodyNodeId)
        .withNodeType('action')
        .withPosition(20, branchY)
        .withLabel(bodyLabel)
        .withBadgeLabel('Loop Body')
        .withSourcePosition(Position.Top)
        .withTargetPosition(Position.Top)
        .commit()

        .addNode(exitNodeId)
        .withNodeType('action')
        .withPosition(exitX, branchY)
        .withLabel(exitLabel)
        .withBadgeLabel('Exit')
        .commit()

        .addEdge(`edge-to-cond-${idx}`)
        .from(prevNodeId)
        .to(condNodeId)
        .withDefaultTheme()
        .commit()

        .addEdge(`edge-cond-body-${idx}`)
        .from(condNodeId)
        .to(bodyNodeId)
        .withLabel('TRUE')
        .withTrueTheme()
        .commit()

        .addEdge(`edge-cond-exit-${idx}`)
        .from(condNodeId)
        .to(exitNodeId)
        .withLabel('FALSE')
        .withFalseTheme()
        .commit()

        .addEdge(`edge-body-cond-${idx}`)
        .from(bodyNodeId)
        .to(condNodeId)
        .withLabel('LOOP')
        .withLoopTheme()
        .commit()

      prevNodeId = exitNodeId
      cursorY = branchY + Math.max(bodyDims.height, exitDims.height) + VERTICAL_GAP
    })

    temps[`project-${file}`] = builder.build()
  }
  return temps
}
