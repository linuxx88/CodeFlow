import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LayoutToolbar } from './LayoutToolbar'
import React from 'react'

describe('LayoutToolbar Component', () => {
  const defaultProps = {
    direction: 'LR' as const,
    setDirection: vi.fn(),
    nodesep: 50,
    setNodesep: vi.fn(),
    ranksep: 50,
    setRanksep: vi.fn(),
    layoutType: 'dagre' as const,
    setLayoutType: vi.fn(),
  }

  it('should render only the toggle button initially', () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    const toggleButton = screen.getByTitle('Options de disposition')
    expect(toggleButton).toBeInTheDocument()
    
    expect(screen.queryByText('Disposition du graphe')).not.toBeInTheDocument()
  })

  it('should toggle dropdown when clicking the toggle button', async () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    const toggleButton = screen.getByTitle('Options de disposition')
    
    fireEvent.click(toggleButton)
    expect(screen.getByText('Disposition du graphe')).toBeInTheDocument()
    
    fireEvent.click(toggleButton)
    expect(screen.queryByText('Disposition du graphe')).not.toBeInTheDocument()
  })

  it('should call setDirection when selecting orientation buttons', () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    fireEvent.click(screen.getByTitle('Options de disposition'))
    
    const lrButton = screen.getByText('Gauche-Droite')
    const tbButton = screen.getByText('Haut-Bas')
    
    expect(lrButton).toBeInTheDocument()
    expect(tbButton).toBeInTheDocument()
    
    fireEvent.click(lrButton)
    expect(defaultProps.setDirection).toHaveBeenCalledWith('LR')
    
    fireEvent.click(tbButton)
    expect(defaultProps.setDirection).toHaveBeenCalledWith('TB')
  })

  it('should call setLayoutType when selecting layout engine buttons', () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    fireEvent.click(screen.getByTitle('Options de disposition'))
    
    const dagreButton = screen.getByText('Dagre (Standard)')
    const elkButton = screen.getByText('ELK JS (Gros graphes)')
    const pythonButton = screen.getByText('Custom Python (Séquentiel)')
    
    expect(dagreButton).toBeInTheDocument()
    expect(elkButton).toBeInTheDocument()
    expect(pythonButton).toBeInTheDocument()
    
    fireEvent.click(elkButton)
    expect(defaultProps.setLayoutType).toHaveBeenCalledWith('elk')
  })

  it('should call setNodesep and setRanksep when changing sliders', () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    fireEvent.click(screen.getByTitle('Options de disposition'))
    
    const rangeSliders = screen.getAllByRole('slider')
    expect(rangeSliders).toHaveLength(2)
    
    const [nodesepSlider, ranksepSlider] = rangeSliders
    
    fireEvent.change(nodesepSlider, { target: { value: '80' } })
    expect(defaultProps.setNodesep).toHaveBeenCalledWith(80)
    
    fireEvent.change(ranksepSlider, { target: { value: '95' } })
    expect(defaultProps.setRanksep).toHaveBeenCalledWith(95)
  })
})
