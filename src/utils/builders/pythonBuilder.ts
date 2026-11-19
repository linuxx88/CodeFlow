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

export const buildPythonTemplates = (
  scanData: ScanData | null | undefined,
  templates: Record<string, Template>
): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (!scanData?.pythonStructures) return temps

  const VERTICAL_GAP = 60
  const HORIZONTAL_GAP = 60

  for (const pyFile of scanData.pythonStructures) {
    const file = pyFile.file || 'Unknown file'
    const items = Array.isArray(pyFile.items) ? pyFile.items : []
    if (items.length === 0) continue

    const startLabel = `Python script: ${file}`
    const builder = new FlowElementBuilder(
      `Python: ${file}`,
      `Python structure - ${items.length} elements detected.`
    )
      .addNode('start')
      .withNodeType('start')
      .withPosition(250, 20)
      .withLabel(startLabel)
      .commit()

    let prevNodeId = 'start'
    let cursorY = 20 + boxSize(startLabel, 'start').height + VERTICAL_GAP

    items.forEach((item, idx) => {
      if (item.type === 'tryexcept') {
        const tryNodeId = `try-${idx}`
        const successNodeId = `success-${idx}`
        const exceptNodeId = `except-${idx}`

        const tryLabel = `Try: ${item.try || '...'}`
        const successLabel = 'Success: continue'
        const exceptLabel = `Except ${item.except || ''}`.trim()

        const tryDims = boxSize(tryLabel, 'condition')
        const successDims = boxSize(successLabel, 'action')
        const exceptDims = boxSize(exceptLabel, 'action')

        const branchY = cursorY + tryDims.height + VERTICAL_GAP
        const exceptX = Math.max(420, 20 + successDims.width + HORIZONTAL_GAP)

        builder
          .addNode(tryNodeId)
          .withNodeType('condition')
          .withPosition(250, cursorY)
          .withLabel(tryLabel)
          .commit()

          .addNode(successNodeId)
          .withNodeType('action')
          .withPosition(20, branchY)
          .withLabel(successLabel)
          .commit()

          .addNode(exceptNodeId)
          .withNodeType('action')
          .withPosition(exceptX, branchY)
          .withLabel(exceptLabel)
          .commit()

          .addEdge(`edge-to-try-${idx}`)
          .from(prevNodeId)
          .to(tryNodeId)
          .withDefaultTheme()
          .commit()

          .addEdge(`edge-try-success-${idx}`)
          .from(tryNodeId)
          .to(successNodeId)
          .withLabel('TRY')
          .withTrueTheme()
          .commit()

          .addEdge(`edge-try-except-${idx}`)
          .from(tryNodeId)
          .to(exceptNodeId)
          .withLabel('EXCEPT')
          .withFalseTheme()
          .commit()

        prevNodeId = successNodeId
        cursorY = branchY + Math.max(successDims.height, exceptDims.height) + VERTICAL_GAP
      } else if (item.type === 'decorator') {
        const decNodeId = `dec-${idx}`
        const decLabel = `@${item.name || 'decorator'}`
        builder
          .addNode(decNodeId)
          .withNodeType('start')
          .withPosition(250, cursorY)
          .withLabel(decLabel)
          .commit()

          .addEdge(`edge-dec-${idx}`)
          .from(prevNodeId)
          .to(decNodeId)
          .withDefaultTheme()
          .commit()
        prevNodeId = decNodeId
        cursorY += boxSize(decLabel, 'start').height + VERTICAL_GAP
      } else if (item.type === 'main') {
        const mainNodeId = `main-${idx}`
        const mainLabel = 'if __name__ == "__main__"'
        builder
          .addNode(mainNodeId)
          .withNodeType('action')
          .withPosition(250, cursorY)
          .withLabel(mainLabel)
          .commit()

          .addEdge(`edge-main-${idx}`)
          .from(prevNodeId)
          .to(mainNodeId)
          .withDefaultTheme()
          .commit()
        prevNodeId = mainNodeId
        cursorY += boxSize(mainLabel, 'action').height + VERTICAL_GAP
      }
    })

    temps[`project-${file}`] = builder.build()
  }
  return temps
}
