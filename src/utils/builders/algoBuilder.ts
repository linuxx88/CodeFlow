import { FlowElementBuilder } from './FlowElementBuilder'
import { getNodeDimensions } from '../layoutEngine'
import type { FlowNodeType, ScanData, Template } from '../../types'

const boxHeight = (label: string, type: FlowNodeType): number =>
  getNodeDimensions({
    id: '',
    type: 'customNode',
    position: { x: 0, y: 0 },
    data: { label, type },
  }).height

export const buildAlgoTemplates = (
  scanData: ScanData | null | undefined,
  templates: Record<string, Template>
): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (!scanData?.algorithms) return temps

  const VERTICAL_GAP = 60

  for (const algoFile of scanData.algorithms) {
    const file = algoFile.file || 'Unknown file'
    const items = algoFile.items || []
    for (const item of items) {
      const funcName = item.name || 'function'
      const steps = Array.isArray(item.steps) ? item.steps : []
      const args = item.args ?? ''
      const startLabel = `Start: ${funcName}(${args})`

      const builder = new FlowElementBuilder(
        `Function: ${funcName}()`,
        `File: ${file}`
      )
        .addNode('start')
        .withNodeType('start')
        .withPosition(250, 20)
        .withLabel(startLabel)
        .commit()

      let prevNodeId = 'start'
      let cursorY = 20 + boxHeight(startLabel, 'start') + VERTICAL_GAP

      steps.forEach((step, sIdx) => {
        const stepNodeId = `step-${sIdx}`
        const stepLabel = String(step ?? '')

        builder
          .addNode(stepNodeId)
          .withNodeType('action')
          .withPosition(250, cursorY)
          .withLabel(stepLabel)
          .commit()

          .addEdge(`edge-${sIdx}`)
          .from(prevNodeId)
          .to(stepNodeId)
          .withDefaultTheme()
          .commit()

        prevNodeId = stepNodeId
        cursorY += boxHeight(stepLabel, 'action') + VERTICAL_GAP
      })

      temps[`project-${file}-${funcName}`] = builder.build()
    }
  }
  return temps
}
