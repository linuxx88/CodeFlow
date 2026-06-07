import { FlowElementBuilder } from './FlowElementBuilder'
import type { Template } from '../templateBuilders'

export const buildPythonTemplates = (scanData: any, templates: Record<string, Template>): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (scanData?.pythonStructures) {
    for (const pyFile of scanData.pythonStructures) {
      const file = pyFile.file
      const items = pyFile.items
      if (items.length === 0) continue

      const builder = new FlowElementBuilder(
        `Python: ${file}`,
        `Structure Python - ${items.length} éléments détectés.`
      )
        .addNode('start')
        .withNodeType('start')
        .withPosition(250, 20)
        .withLabel(`Script Python: ${file}`)
        .commit()

      let prevNodeId = 'start'

      items.forEach((item: any, idx: number) => {
        const yBase = 120 + idx * 240

        if (item.type === 'tryexcept') {
          const tryNodeId = `try-${idx}`
          const successNodeId = `success-${idx}`
          const exceptNodeId = `except-${idx}`

          builder
            .addNode(tryNodeId)
            .withNodeType('condition')
            .withPosition(250, yBase)
            .withLabel(`Try: ${item.try}`)
            .commit()

            .addNode(successNodeId)
            .withNodeType('action')
            .withPosition(80, yBase + 100)
            .withLabel('Succès: continuer')
            .commit()

            .addNode(exceptNodeId)
            .withNodeType('action')
            .withPosition(420, yBase + 100)
            .withLabel(`Except ${item.except}`)
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
        } else if (item.type === 'decorator') {
          const decNodeId = `dec-${idx}`
          builder
            .addNode(decNodeId)
            .withNodeType('start')
            .withPosition(250, yBase)
            .withLabel(`@${item.name}`)
            .commit()

            .addEdge(`edge-dec-${idx}`)
            .from(prevNodeId)
            .to(decNodeId)
            .withDefaultTheme()
            .commit()
          prevNodeId = decNodeId
        } else if (item.type === 'main') {
          const mainNodeId = `main-${idx}`
          builder
            .addNode(mainNodeId)
            .withNodeType('action')
            .withPosition(250, yBase)
            .withLabel('if __name__ == "__main__"')
            .commit()

            .addEdge(`edge-main-${idx}`)
            .from(prevNodeId)
            .to(mainNodeId)
            .withDefaultTheme()
            .commit()
          prevNodeId = mainNodeId
        }
      })

      temps[`project-${file}`] = builder.build()
    }
  }
  return temps
}
