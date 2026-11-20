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

export const buildConditionalTemplates = (
  scanData: ScanData | null | undefined,
  templates: Record<string, Template>,
  filterType: string
): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (!scanData?.conditionals) return temps

  const VERTICAL_GAP = 60
  const HORIZONTAL_GAP = 60

  for (const condFile of scanData.conditionals) {
    const file = condFile.file || 'Unknown file'
    const rawItems = Array.isArray(condFile.items) ? condFile.items : []
    const items =
      filterType === 'ifelse'
        ? rawItems.filter((i) => i.type === 'ifelse')
        : rawItems

    if (items.length === 0) continue

    const startLabel = `Start: ${file}`
    const builder = new FlowElementBuilder(
      `Project: ${file}`,
      `Live flowchart - ${items.length} conditionals detected.`
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
      const condText = item.condition || item.expression || 'condition'
      const condLabel = `Line ${item.line ?? '?'}: ${condText}`
      const condDims = boxSize(condLabel, 'condition')

      builder
        .addNode(condNodeId)
        .withNodeType('condition')
        .withPosition(250, cursorY)
        .withLabel(condLabel)
        .withBadgeLabel(item.type === 'switch' ? 'Switch' : 'IF (Condition)')
        .commit()

        .addEdge(`edge-to-cond-${idx}`)
        .from(prevNodeId)
        .to(condNodeId)
        .withDefaultTheme()
        .commit()

      const branchY = cursorY + condDims.height + VERTICAL_GAP
      let maxBranchHeight = 0

      if (item.type === 'ifelse') {
        const thenLabel = String(item.then ?? 'Action')
        const thenDims = boxSize(thenLabel, 'action')
        maxBranchHeight = Math.max(maxBranchHeight, thenDims.height)

        const thenNodeId = `then-${idx}`
        builder
          .addNode(thenNodeId)
          .withNodeType('action')
          .withPosition(20, branchY)
          .withLabel(thenLabel)
          .withBadgeLabel('THEN Branch')
          .commit()

          .addEdge(`edge-then-${idx}`)
          .from(condNodeId)
          .to(thenNodeId)
          .withLabel('TRUE')
          .withTrueTheme()
          .commit()

        if (item.else) {
          const elseLabel = String(item.else)
          const elseDims = boxSize(elseLabel, 'action')
          maxBranchHeight = Math.max(maxBranchHeight, elseDims.height)

          const elseX = Math.max(420, 20 + thenDims.width + HORIZONTAL_GAP)
          const elseNodeId = `else-${idx}`
          builder
            .addNode(elseNodeId)
            .withNodeType('action')
            .withPosition(elseX, branchY)
            .withLabel(elseLabel)
            .withBadgeLabel('ELSE Branch')
            .commit()

            .addEdge(`edge-else-${idx}`)
            .from(condNodeId)
            .to(elseNodeId)
            .withLabel('FALSE')
            .withFalseTheme()
            .commit()
        }
        prevNodeId = condNodeId
      } else if (item.type === 'switch') {
        const cases = Array.isArray(item.cases) ? item.cases : []
        const caseDims = cases.map((c) => boxSize(`Action: ${String(c ?? '')}`, 'action'))
        const totalWidth = caseDims.reduce(
          (sum, d, cIdx) => sum + d.width + (cIdx > 0 ? HORIZONTAL_GAP : 0),
          0
        )
        let cursorX = 250 + condDims.width / 2 - totalWidth / 2

        cases.forEach((c, caseIdx) => {
          const caseText = String(c ?? '')
          const caseNodeId = `case-${idx}-${caseIdx}`
          const dims = caseDims[caseIdx]
          maxBranchHeight = Math.max(maxBranchHeight, dims.height)

          builder
            .addNode(caseNodeId)
            .withNodeType('action')
            .withPosition(cursorX, branchY)
            .withLabel(`Action: ${caseText}`)
            .withBadgeLabel('Case')
            .commit()

            .addEdge(`edge-case-${idx}-${caseIdx}`)
            .from(condNodeId)
            .to(caseNodeId)
            .withLabel(caseText.toUpperCase())
            .withTrueTheme()
            .commit()

          cursorX += dims.width + HORIZONTAL_GAP
        })
        prevNodeId = condNodeId
      }

      cursorY = branchY + maxBranchHeight + VERTICAL_GAP
    })

    temps[`project-${file}`] = builder.build()
  }
  return temps
}
