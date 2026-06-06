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
  { value: 'all', label: 'Dependency Flow' },
  { value: 'web', label: 'Web Development Flowchart' },
  { value: 'if-then', label: 'If-Then Flowchart' },
  { value: 'conditional-statement', label: 'Conditional Statement Flowchart' },
  { value: 'class-diagram', label: 'Class Diagram Flowchart' },
  { value: 'while-loop', label: 'While Loop Flowchart' },
  { value: 'repeat-loop', label: 'Repeat Loop Flowchart' },
  { value: 'algo', label: 'Algorithm Flowchart' },
  { value: 'process-flowchart', label: 'App Development Process Flowchart' },
  { value: 'python-flowchart', label: 'Python Flowchart' }
]

export const getViewLabel = (view: FlowchartView | string): string => {
  const option = VIEW_OPTIONS.find((opt) => opt.value === view)
  return option ? option.label : view
}
