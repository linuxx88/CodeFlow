import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import React from 'react'
import { FileNode } from './FileNode'
import { ClassCustomNode } from './ClassCustomNode'
import { IfThenCustomNode } from './IfThenCustomNode'

describe('Custom Node Sizing & Rendering', () => {
  it('FileNode respects bounded width [180, 280] and renders 2-line filename + folder + inDegree pill', () => {
    const { container } = render(
      <ReactFlowProvider>
        <FileNode
          id="file-1"
          data={{
            label: 'src/components/VeryLongFileNameForTestingTruncation.tsx',
            fileName: 'VeryLongFileNameForTestingTruncation.tsx',
            folderPath: 'src/components',
            inDegree: 3,
            width: 450
          }}
        />
      </ReactFlowProvider>
    )
    expect(screen.getByText('VeryLongFileNameForTestingTruncation.tsx')).toBeInTheDocument()
    expect(screen.getByText('src/components')).toBeInTheDocument()
    expect(screen.getByText('3 in')).toBeInTheDocument()
    const card = container.querySelector('[style*="max-width: 280px"]') as HTMLElement
    expect(card).toBeTruthy()
    expect(card.style.width).toBe('280px')
  })

  it('ClassCustomNode respects bounded width [240, 380] and truncates long class name', () => {
    const { container } = render(
      <ReactFlowProvider>
        <ClassCustomNode
          id="class-1"
          data={{
            name: 'VeryLongClassNameThatShouldTruncateCleanly',
            width: 300,
            properties: ['propA: string'],
            methods: ['doSomething(): void']
          }}
        />
      </ReactFlowProvider>
    )
    expect(screen.getByText('VeryLongClassNameThatShouldTruncateCleanly')).toBeInTheDocument()
    const card = container.querySelector('[style*="max-width: 380px"]') as HTMLElement
    expect(card).toBeTruthy()
    expect(card.style.width).toBe('300px')
  })

  it('IfThenCustomNode applies layout dimensions for condition and action nodes with word wrapping', () => {
    const { container: condContainer } = render(
      <ReactFlowProvider>
        <IfThenCustomNode
          id="cond-1"
          data={{ label: 'isReady && hasValidConfiguration', type: 'condition', width: 280, height: 130 }}
        />
      </ReactFlowProvider>
    )
    const condWrapper = condContainer.querySelector('[style*="max-width: 360px"]') as HTMLElement
    expect(condWrapper).toBeTruthy()
    expect(condWrapper.style.width).toBe('280px')
    expect(condWrapper.style.height).toBe('130px')

    const { container: actionContainer } = render(
      <ReactFlowProvider>
        <IfThenCustomNode
          id="act-1"
          data={{ label: 'executeLongOperation()', type: 'action', width: 250 }}
        />
      </ReactFlowProvider>
    )
    const actionWrapper = actionContainer.querySelector('[style*="max-width: 320px"]') as HTMLElement
    expect(actionWrapper).toBeTruthy()
    expect(actionWrapper.style.width).toBe('250px')
  })
})
