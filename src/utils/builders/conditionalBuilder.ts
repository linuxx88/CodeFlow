import { FlowElementBuilder } from './FlowElementBuilder'
import type { Template } from '../templateBuilders'

export const buildConditionalTemplates = (
  scanData: any,
  templates: Record<string, Template>,
  filterType: string
): Record<string, Template> => {
  const temps: Record<string, Template> = { ...templates }
  if (scanData?.conditionals) {
    for (const condFile of scanData.conditionals) {
      const file = condFile.file
      const items = filterType === 'ifelse' 
        ? condFile.items.filter((i: any) => i.type === 'ifelse')
        : condFile.items
        
      if (items.length === 0) continue

      const builder = new FlowElementBuilder(
        `Projet: ${file}`,
        `Flowchart live - ${items.length} conditions détectées.`
      )
        .addNode('start')
        .withNodeType('start')
        .withPosition(250, 20)
        .withLabel(`Début: ${file}`)
        .commit()

      let prevNodeId = 'start'
      
      items.forEach((item: any, idx: number) => {
        const condNodeId = `cond-${idx}`
        const yBase = 120 + idx * 240
        
        builder
          .addNode(condNodeId)
          .withNodeType('condition')
          .withPosition(250, yBase)
          .withLabel(`Ligne ${item.line}: ${item.condition || item.expression}`)
          .commit()

          .addEdge(`edge-to-cond-${idx}`)
          .from(prevNodeId)
          .to(condNodeId)
          .withDefaultTheme()
          .commit()
        
        if (item.type === 'ifelse') {
          const thenNodeId = `then-${idx}`
          builder
            .addNode(thenNodeId)
            .withNodeType('action')
            .withPosition(80, yBase + 100)
            .withLabel(item.then)
            .commit()
            
            .addEdge(`edge-then-${idx}`)
            .from(condNodeId)
            .to(thenNodeId)
            .withLabel('VRAI')
            .withTrueTheme()
            .commit()
          
          if (item.else) {
            const elseNodeId = `else-${idx}`
            builder
              .addNode(elseNodeId)
              .withNodeType('action')
              .withPosition(420, yBase + 100)
              .withLabel(item.else)
              .commit()
              
              .addEdge(`edge-else-${idx}`)
              .from(condNodeId)
              .to(elseNodeId)
              .withLabel('FAUX')
              .withFalseTheme()
              .commit()
          }
          prevNodeId = condNodeId
        } else if (item.type === 'switch') {
          const cases = item.cases || []
          cases.forEach((c: string, caseIdx: number) => {
            const caseNodeId = `case-${idx}-${caseIdx}`
            const xPos = cases.length > 1 ? 50 + (caseIdx * (400 / (cases.length - 1))) : 250
            
            builder
              .addNode(caseNodeId)
              .withNodeType('action')
              .withPosition(xPos, yBase + 100)
              .withLabel(`Action: ${c}`)
              .commit()
              
              .addEdge(`edge-case-${idx}-${caseIdx}`)
              .from(condNodeId)
              .to(caseNodeId)
              .withLabel(c.toUpperCase())
              .withTrueTheme()
              .commit()
          })
          prevNodeId = condNodeId
        }
      })
      
      temps[`project-${file}`] = builder.build()
    }
  }
  return temps
}
