import { FlowElementBuilder } from './FlowElementBuilder'
import type { Template } from '../templateBuilders'

export const buildRepeatLoopTemplates = (scanData: any, templates: Record<string, Template>): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (scanData?.repeatLoops) {
    for (const repeatFile of scanData.repeatLoops) {
      const file = repeatFile.file
      const items = repeatFile.items
      if (items.length === 0) continue

      const builder = new FlowElementBuilder(
        `Projet: ${file}`,
        `Boucles repeat - ${items.length} boucles détectées.`
      )
        .addNode('start')
        .withNodeType('start')
        .withPosition(250, 20)
        .withLabel(`Entrée: ${file}`)
        .commit()

      let prevNodeId = 'start'

      items.forEach((item: any, idx: number) => {
        const bodyNodeId = `body-${idx}`
        const condNodeId = `cond-${idx}`
        const exitNodeId = `exit-${idx}`
        const yBase = 120 + idx * 260

        builder
          .addNode(bodyNodeId)
          .withNodeType('action')
          .withPosition(250, yBase)
          .withLabel(item.body)
          .commit()

          .addNode(condNodeId)
          .withNodeType('condition')
          .withPosition(250, yBase + 100)
          .withLabel(`Ligne ${item.line}: while (${item.condition})`)
          .commit()

          .addNode(exitNodeId)
          .withNodeType('action')
          .withPosition(420, yBase + 200)
          .withLabel('Sortie de boucle')
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
          .withLabel('FAUX')
          .withFalseTheme()
          .commit()

          .addEdge(`edge-cond-body-loop-${idx}`)
          .from(condNodeId)
          .to(bodyNodeId)
          .withLabel('VRAI (BOUCLER)')
          .withTrueTheme()
          .withAnimated(true)
          .withStyle({ strokeDasharray: '4 4' })
          .commit()

        prevNodeId = exitNodeId
      })

      temps[`project-${file}`] = builder.build()
    }
  }
  return temps
}
