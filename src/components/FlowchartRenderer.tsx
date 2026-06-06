import React from 'react'
import { IfThenFlowchart } from './IfThenFlowchart'
import { ConditionalStatementFlowchart } from './ConditionalStatementFlowchart'
import { ClassDiagramFlowchart } from './ClassDiagramFlowchart'
import { WhileLoopFlowchart } from './WhileLoopFlowchart'
import { RepeatLoopFlowchart } from './RepeatLoopFlowchart'
import { AlgorithmFlowchart } from './AlgorithmFlowchart'
import { AppDevelopmentProcessFlowchart } from './AppDevelopmentProcessFlowchart'
import { PythonFlowchart } from './PythonFlowchart'
import type { FlowchartView } from '../constants/views'

interface FlowchartRendererProps {
  currentView: FlowchartView
  scanData: any
}

export const FlowchartRenderer: React.FC<FlowchartRendererProps> = ({ currentView, scanData }) => {
  switch (currentView) {
    case 'if-then':
      return <IfThenFlowchart scanData={scanData} />
    case 'conditional-statement':
      return <ConditionalStatementFlowchart scanData={scanData} />
    case 'class-diagram':
      return <ClassDiagramFlowchart scanData={scanData} />
    case 'while-loop':
      return <WhileLoopFlowchart scanData={scanData} />
    case 'repeat-loop':
      return <RepeatLoopFlowchart scanData={scanData} />
    case 'algo':
      return <AlgorithmFlowchart scanData={scanData} />
    case 'process-flowchart':
      return <AppDevelopmentProcessFlowchart scanData={scanData} />
    case 'python-flowchart':
      return <PythonFlowchart scanData={scanData} />
    default:
      return null
  }
}
