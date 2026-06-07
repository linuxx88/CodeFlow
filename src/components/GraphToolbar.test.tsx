import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GraphToolbar } from './GraphToolbar'
import React from 'react'

describe('GraphToolbar Component', () => {
  const defaultProps = {
    filterQuery: '',
    setFilterQuery: vi.fn(),
    showExternal: false,
    setShowExternal: vi.fn(),
    showOnlyCycles: false,
    setShowOnlyCycles: vi.fn(),
    cycleNodesCount: 0,
    availableExtensions: ['.ts', '.py'],
    selectedExtensions: ['.ts'],
    setSelectedExtensions: vi.fn(),
    hasData: true,
    setIsFullscreen: vi.fn(),
  }

  it('should render components correctly', () => {
    render(<GraphToolbar {...defaultProps} />)
    
    // Search input
    expect(screen.getByPlaceholderText('Filtrer...')).toBeInTheDocument()
    
    // Checkboxes
    expect(screen.getByLabelText('Packages externes')).toBeInTheDocument()
    expect(screen.getByLabelText('Cycles uniquement')).toBeInTheDocument()
    
    // Fullscreen button
    expect(screen.getByText('Plein écran')).toBeInTheDocument()
    
    // Cycle badge should not be present since count is 0
    expect(screen.queryByText(/fichiers en cycle/)).not.toBeInTheDocument()
  })

  it('should call setFilterQuery on typing in filter input', () => {
    render(<GraphToolbar {...defaultProps} />)
    
    const filterInput = screen.getByPlaceholderText('Filtrer...')
    fireEvent.change(filterInput, { target: { value: 'utils' } })
    
    expect(defaultProps.setFilterQuery).toHaveBeenCalledWith('utils')
  })

  it('should call setShowExternal and setShowOnlyCycles when checked/unchecked', () => {
    render(<GraphToolbar {...defaultProps} />)
    
    const externalCheckbox = screen.getByLabelText('Packages externes')
    const cyclesCheckbox = screen.getByLabelText('Cycles uniquement')
    
    fireEvent.click(externalCheckbox)
    expect(defaultProps.setShowExternal).toHaveBeenCalledWith(true)
    
    fireEvent.click(cyclesCheckbox)
    expect(defaultProps.setShowOnlyCycles).toHaveBeenCalledWith(true)
  })

  it('should display cycle warning when cycleNodesCount > 0', () => {
    render(<GraphToolbar {...defaultProps} cycleNodesCount={3} />)
    expect(screen.getByText('3 fichiers en cycle')).toBeInTheDocument()
  })

  it('should toggle extensions dropdown and select extensions', () => {
    render(<GraphToolbar {...defaultProps} />)
    
    const dropdownButton = screen.getByText('Extensions (1)')
    expect(dropdownButton).toBeInTheDocument()
    
    // Click dropdown button to show items
    fireEvent.click(dropdownButton)
    
    // Verify list elements are shown
    const tsOption = screen.getByLabelText('.ts')
    const pyOption = screen.getByLabelText('.py')
    expect(tsOption).toBeInTheDocument()
    expect(pyOption).toBeInTheDocument()
    
    // .ts is selected, .py is not
    expect(tsOption).toBeChecked()
    expect(pyOption).not.toBeChecked()
    
    // Select .py option
    fireEvent.click(pyOption)
    expect(defaultProps.setSelectedExtensions).toHaveBeenCalledWith(['.ts', '.py'])
    
    // Deselect .ts option
    fireEvent.click(tsOption)
    expect(defaultProps.setSelectedExtensions).toHaveBeenCalledWith([])
  })

  it('should call setIsFullscreen when fullscreen button clicked', () => {
    render(<GraphToolbar {...defaultProps} />)
    
    const fullscreenBtn = screen.getByText('Plein écran')
    fireEvent.click(fullscreenBtn)
    
    expect(defaultProps.setIsFullscreen).toHaveBeenCalledWith(true)
  })
})
