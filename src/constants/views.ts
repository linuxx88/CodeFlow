export type FlowchartView =
  | 'all'
  | 'web'
  | 'conditional-statement'
  | 'class-diagram'
  | 'while-loop'
  | 'repeat-loop'
  | 'algo'
  | 'process-flowchart'
  | 'python-flowchart'

export type ViewCategory = 'graph' | 'code' | 'overview'

export interface ViewOption {
  value: FlowchartView
  label: string
  category: ViewCategory
  description: string
}

export const VIEW_CATEGORY_LABELS: Record<ViewCategory, string> = {
  graph: 'Dependency Graphs',
  code: 'Code Structure & Control Flow',
  overview: 'Project Overview'
}

export const VIEW_OPTIONS: ViewOption[] = [
  {
    value: 'all',
    label: 'Dependency Graph',
    category: 'graph',
    description: 'Full file & package dependency graph'
  },
  {
    value: 'web',
    label: 'Web Dependencies',
    category: 'graph',
    description: 'Filtered graph for web & frontend files'
  },
  {
    value: 'conditional-statement',
    label: 'Conditional Branches',
    category: 'code',
    description: 'If/else, switch/case, and ternary control flow'
  },
  {
    value: 'while-loop',
    label: 'While & For Loops',
    category: 'code',
    description: 'Pre-condition and iterative loop structures'
  },
  {
    value: 'repeat-loop',
    label: 'Do-While Loops',
    category: 'code',
    description: 'Post-condition repeat-until loop structures'
  },
  {
    value: 'algo',
    label: 'Functions & Algorithms',
    category: 'code',
    description: 'Function steps and algorithmic control flow'
  },
  {
    value: 'class-diagram',
    label: 'Class Diagram',
    category: 'code',
    description: 'UML classes, attributes, methods, and inheritance'
  },
  {
    value: 'python-flowchart',
    label: 'Python Structures',
    category: 'code',
    description: 'Functions, loops, and structures from .py files'
  },
  {
    value: 'process-flowchart',
    label: 'Project Lifecycle',
    category: 'overview',
    description: 'Live scan metrics & development lifecycle'
  }
]

export const getViewLabel = (view: FlowchartView | string): string => {
  const option = VIEW_OPTIONS.find((opt) => opt.value === view)
  return option ? option.label : view
}
