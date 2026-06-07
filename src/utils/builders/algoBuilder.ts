import { FlowElementBuilder } from './FlowElementBuilder'
import type { Template } from '../templateBuilders'

export const buildAlgoTemplates = (scanData: any, templates: Record<string, Template>): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (scanData?.algorithms) {
    for (const algoFile of scanData.algorithms) {
      const file = algoFile.file
      for (const item of algoFile.items) {
        const funcName = item.name
        const steps = item.steps

        const builder = new FlowElementBuilder(
          `Fonction: ${funcName}()`,
          `Fichier: ${file}`
        )
          .addNode('start')
          .withNodeType('start')
          .withPosition(250, 20)
          .withLabel(`Début: ${funcName}(${item.args})`)
          .commit()

        let prevNodeId = 'start'

        steps.forEach((step: string, sIdx: number) => {
          const stepNodeId = `step-${sIdx}`
          const yBase = 120 + sIdx * 100

          builder
            .addNode(stepNodeId)
            .withNodeType('action')
            .withPosition(250, yBase)
            .withLabel(step)
            .commit()

            .addEdge(`edge-${sIdx}`)
            .from(prevNodeId)
            .to(stepNodeId)
            .withDefaultTheme()
            .commit()

          prevNodeId = stepNodeId
        })

        temps[`project-${file}-${funcName}`] = builder.build()
      }
    }
  }
  return temps
}
