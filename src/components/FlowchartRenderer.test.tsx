import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FlowchartRenderer } from './FlowchartRenderer'
import React from 'react'

// Mock sub-components to prevent deep mounting issues in simple tests
vi.mock('./IfThenFlowchart', () => ({
  IfThenFlowchart: () => <div data-testid="ifthen-flowchart">IfThenFlowchart Mock</div>
}))
vi.mock('./ConditionalStatementFlowchart', () => ({
  ConditionalStatementFlowchart: () => <div data-testid="conditional-flowchart">ConditionalStatementFlowchart Mock</div>
}))
vi.mock('./ClassDiagramFlowchart', () => ({
  ClassDiagramFlowchart: () => <div data-testid="class-flowchart">ClassDiagramFlowchart Mock</div>
}))
vi.mock('./WhileLoopFlowchart', () => ({
  WhileLoopFlowchart: () => <div data-testid="while-flowchart">WhileLoopFlowchart Mock</div>
}))
vi.mock('./RepeatLoopFlowchart', () => ({
  RepeatLoopFlowchart: () => <div data-testid="repeat-flowchart">RepeatLoopFlowchart Mock</div>
}))
vi.mock('./AlgorithmFlowchart', () => ({
  AlgorithmFlowchart: () => <div data-testid="algo-flowchart">AlgorithmFlowchart Mock</div>
}))
vi.mock('./AppDevelopmentProcessFlowchart', () => ({
  AppDevelopmentProcessFlowchart: () => <div data-testid="process-flowchart">AppDevelopmentProcessFlowchart Mock</div>
}))
vi.mock('./PythonFlowchart', () => ({
  PythonFlowchart: () => <div data-testid="python-flowchart">PythonFlowchart Mock</div>
}))

describe('FlowchartRenderer Component', () => {
  it('should render empty state when scanData is missing', () => {
    render(<FlowchartRenderer currentView="if-then" scanData={null} />)
    expect(screen.getByText('Aucun projet ou fichier chargé')).toBeInTheDocument()
    expect(screen.getByText("Sélectionnez un fichier dans l'explorateur pour afficher son diagramme.")).toBeInTheDocument()
  })

  it('should render validation error if validation fails', () => {
    // Malformed scan data that triggers validation error
    const invalidScanData = {
      classes: [{
        file: 'test.ts',
        items: [{
          name: 123 // number instead of string to trigger className.toLowerCase() error
        }]
      }]
    }
    // We render a view with invalid scan data
    render(<FlowchartRenderer currentView="class-diagram" scanData={invalidScanData} />)
    expect(screen.getByText('Erreur de validation du Flowchart')).toBeInTheDocument()
  })

  it('should render specific flowchart sub-component when scanData is valid', () => {
    const validScanData = {
      conditionals: [],
      loops: [],
      repeatLoops: [],
      algorithms: [],
      pythonStructures: [],
      classes: []
    }

    const { rerender } = render(<FlowchartRenderer currentView="if-then" scanData={validScanData} />)
    expect(screen.getByTestId('ifthen-flowchart')).toBeInTheDocument()

    rerender(<FlowchartRenderer currentView="conditional-statement" scanData={validScanData} />)
    expect(screen.getByTestId('conditional-flowchart')).toBeInTheDocument()

    rerender(<FlowchartRenderer currentView="while-loop" scanData={validScanData} />)
    expect(screen.getByTestId('while-flowchart')).toBeInTheDocument()

    rerender(<FlowchartRenderer currentView="repeat-loop" scanData={validScanData} />)
    expect(screen.getByTestId('repeat-flowchart')).toBeInTheDocument()

    rerender(<FlowchartRenderer currentView="algo" scanData={validScanData} />)
    expect(screen.getByTestId('algo-flowchart')).toBeInTheDocument()

    rerender(<FlowchartRenderer currentView="process-flowchart" scanData={validScanData} />)
    expect(screen.getByTestId('process-flowchart')).toBeInTheDocument()

    rerender(<FlowchartRenderer currentView="python-flowchart" scanData={validScanData} />)
    expect(screen.getByTestId('python-flowchart')).toBeInTheDocument()
  })
})
