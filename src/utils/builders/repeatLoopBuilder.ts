import { FlowElementBuilder } from './FlowElementBuilder'
import { getNodeDimensions } from '../layoutEngine'
import type { FlowNodeType, ScanData, Template } from '../../types'

const boxSize = (label: string, type: FlowNodeType) =>
  getNodeDimensions({
    id: '',
    type: 'customNode',
    position: { x: 0, y: 0 },
    data: { label, type },
  })

export const buildRepeatLoopTemplates = (
  scanData: ScanData | null | undefined,
  templates: Record<string, Template>
): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (!scanData?.repeatLoops) return temps

  const VERTICAL_GAP = 60

  for (const repeatFile of scanData.repeatLoops) {
    const file = repeatFile.file || 'Unknown file'
    const items = Array.isArray(repeatFile.items) ? repeatFile.items : []
    if (items.length === 0) continue

    const startLabel = `Entry: ${file}`
    const builder = new FlowElementBuilder(
      `Project: ${file}`,
      `Repeat loops - ${items.length} loops detected.`
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
      const bodyNodeId = `body-${idx}`
      const condNodeId = `cond-${idx}`
      const exitNodeId = `exit-${idx}`

      const bodyLabel = String(item.body ?? 'Loop body')
      const condLabel = `Line ${item.line ?? '?'}: while (${item.condition || '...'})`
      const exitLabel = 'Exit loop'

      const bodyDims = boxSize(bodyLabel, 'action')
      const condDims = boxSize(condLabel, 'condition')
      const exitDims = boxSize(exitLabel, 'action')

      const condY = cursorY + bodyDims.height + VERTICAL_GAP
      const exitY = condY + condDims.height + VERTICAL_GAP

      builder
        .addNode(bodyNodeId)
        .withNodeType('action')
        .withPosition(250, cursorY)
        .withLabel(bodyLabel)
        .withBadgeLabel('Loop Body')
        .commit()

        .addNode(condNodeId)
        .withNodeType('condition')
        .withPosition(250, condY)
        .withLabel(condLabel)
        .withBadgeLabel('Loop Check')
        .commit()

        .addNode(exitNodeId)
        .withNodeType('action')
        .withPosition(460, exitY)
        .withLabel(exitLabel)
        .withBadgeLabel('Exit')
        .commit()

        .addEdge(`edge-to-body-${idx}`)
        .from(prevNodeId)
        .to(bodyNodeId)
        .withDefaultTheme()
        .commit()

        .addEdge(`edge-body-cond-${idx}`)
        .from(bodyNodeId)
        .to(condNodeId)
        .withDefaultTheme()
        .commit()

        .addEdge(`edge-cond-exit-${idx}`)
        .from(condNodeId)
        .to(exitNodeId)
        .withLabel('FALSE')
        .withFalseTheme()
        .commit()

        .addEdge(`edge-cond-body-loop-${idx}`)
        .from(condNodeId)
        .to(bodyNodeId)
        .withLabel('TRUE (LOOP)')
        .withTrueTheme()
        .withAnimated(true)
        .withStyle({ strokeDasharray: '4 4' })
        .commit()

      prevNodeId = exitNodeId
      cursorY = exitY + exitDims.height + VERTICAL_GAP
    })

    temps[`project-${file}`] = builder.build()
  }
  return temps
}
