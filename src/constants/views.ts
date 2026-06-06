export type FlowchartView =
  | 'all'
  | 'web'
  | 'if-then'
  | 'conditional-statement'
  | 'class-diagram'
  | 'while-loop'
  | 'repeat-loop'
  | 'algo'
  | 'process-flowchart'
  | 'python-flowchart'

export interface ViewOption {
  value: FlowchartView
  label: string
}

export const VIEW_OPTIONS: ViewOption[] = [
  { value: 'all', label: 'Flux de Dépendances' },
  { value: 'web', label: 'Flowchart de Développement Web' },
  { value: 'if-then', label: 'Flowchart SI-ALORS' },
  { value: 'conditional-statement', label: "Flowchart d'Instructions Conditionnelles" },
  { value: 'class-diagram', label: 'Flowchart de Diagramme de Classes' },
  { value: 'while-loop', label: 'Flowchart de Boucle TANT QUE' },
  { value: 'repeat-loop', label: 'Flowchart de Boucle RÉPÉTER' },
  { value: 'algo', label: "Flowchart d'Algorithme" },
  { value: 'process-flowchart', label: 'Flowchart de Processus de Développement' },
  { value: 'python-flowchart', label: 'Flowchart Python' }
]

export const getViewLabel = (view: FlowchartView | string): string => {
  const option = VIEW_OPTIONS.find((opt) => opt.value === view)
  return option ? option.label : view
}
