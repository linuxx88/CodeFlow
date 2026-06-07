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
  }

  it('should render only the toggle button initially', () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    // Toggle button should be visible
    const toggleButton = screen.getByTitle('Options de disposition')
    expect(toggleButton).toBeInTheDocument()
    
    // Dropdown content should not be present
    expect(screen.queryByText('Disposition du graphe')).not.toBeInTheDocument()
  })

  it('should toggle dropdown when clicking the toggle button', async () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    const toggleButton = screen.getByTitle('Options de disposition')
    
    // Click to open
    fireEvent.click(toggleButton)
    expect(screen.getByText('Disposition du graphe')).toBeInTheDocument()
    
    // Click to close
    fireEvent.click(toggleButton)
    expect(screen.queryByText('Disposition du graphe')).not.toBeInTheDocument()
  })

  it('should call setDirection when selecting orientation buttons', () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    // Open dropdown
    fireEvent.click(screen.getByTitle('Options de disposition'))
    
    const lrButton = screen.getByText('Gauche à Droite')
    const tbButton = screen.getByText('Du haut vers le bas')
    
    expect(lrButton).toBeInTheDocument()
    expect(tbButton).toBeInTheDocument()
    
    // Click LR (already active in props, but click should still trigger setDirection)
    fireEvent.click(lrButton)
    expect(defaultProps.setDirection).toHaveBeenCalledWith('LR')
    
    // Click TB
    fireEvent.click(tbButton)
    expect(defaultProps.setDirection).toHaveBeenCalledWith('TB')
  })

  it('should call setNodesep and setRanksep when changing sliders', () => {
    render(<LayoutToolbar {...defaultProps} />)
    
    // Open dropdown
    fireEvent.click(screen.getByTitle('Options de disposition'))
    
    // Spacing inputs
    const rangeSliders = screen.getAllByRole('slider')
    expect(rangeSliders).toHaveLength(2)
    
    const [nodesepSlider, ranksepSlider] = rangeSliders
    
    fireEvent.change(nodesepSlider, { target: { value: '80' } })
    expect(defaultProps.setNodesep).toHaveBeenCalledWith(80)
    
    fireEvent.change(ranksepSlider, { target: { value: '95' } })
    expect(defaultProps.setRanksep).toHaveBeenCalledWith(95)
  })
})
