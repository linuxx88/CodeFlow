import { FlowElementBuilder } from './FlowElementBuilder'
import { Position } from '@xyflow/react'
import type { Template } from '../templateBuilders'

export const buildLoopTemplates = (scanData: any, templates: Record<string, Template>): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (scanData?.loops) {
    for (const loopFile of scanData.loops) {
      const file = loopFile.file
      const items = loopFile.items
      if (items.length === 0) continue

      const builder = new FlowElementBuilder(
        `Projet: ${file}`,
        `Boucles live - ${items.length} boucles détectées.`
      )
        .addNode('start')
        .withNodeType('start')
        .withPosition(250, 20)
        .withLabel(`Entrée: ${file}`)
        .commit()

      let prevNodeId = 'start'

      items.forEach((item: any, idx: number) => {
        const condNodeId = `cond-${idx}`
        const bodyNodeId = `body-${idx}`
        const exitNodeId = `exit-${idx}`
        const yBase = 120 + idx * 240

        builder
          .addNode(condNodeId)
          .withNodeType('condition')
          .withPosition(250, yBase)
          .withLabel(`Ligne ${item.line}: while (${item.condition})`)
          .commit()

          .addNode(bodyNodeId)
          .withNodeType('action')
          .withPosition(80, yBase + 100)
          .withLabel(item.body)
          .withSourcePosition(Position.Top)
          .withTargetPosition(Position.Top)
          .commit()

          .addNode(exitNodeId)
          .withNodeType('action')
          .withPosition(420, yBase + 100)
          .withLabel('Sortie de boucle')
          .commit()

          .addEdge(`edge-to-cond-${idx}`)
          .from(prevNodeId)
          .to(condNodeId)
          .withDefaultTheme()
          .commit()

          .addEdge(`edge-cond-body-${idx}`)
          .from(condNodeId)
          .to(bodyNodeId)
          .withLabel('VRAI')
          .withTrueTheme()
          .commit()

          .addEdge(`edge-cond-exit-${idx}`)
          .from(condNodeId)
          .to(exitNodeId)
          .withLabel('FAUX')
          .withFalseTheme()
          .commit()

          .addEdge(`edge-body-cond-${idx}`)
          .from(bodyNodeId)
          .to(condNodeId)
          .withLabel('BOUCLER')
          .withLoopTheme()
          .commit()

        prevNodeId = exitNodeId
      })

      temps[`project-${file}`] = builder.build()
    }
  }
  return temps
}
