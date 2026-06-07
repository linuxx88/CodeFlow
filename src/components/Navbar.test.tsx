import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Navbar } from './Navbar'
import React from 'react'

describe('Navbar Component', () => {
  const defaultProps = {
    projectPath: '/mock/path',
    setProjectPath: vi.fn(),
    isScanning: false,
    onScan: vi.fn(),
    currentView: 'all' as const,
    onViewChange: vi.fn(),
    theme: 'dark' as const,
    setTheme: vi.fn(),
  }

  it('should render navbar layout and inputs correctly', () => {
    render(<Navbar {...defaultProps} />)
    
    // Header title
    expect(screen.getByText('Flux de Dépendance Interactif')).toBeInTheDocument()
    
    // Path input
    const pathInput = screen.getByPlaceholderText('Entrez le chemin du projet...')
    expect(pathInput).toBeInTheDocument()
    expect(pathInput.value).toBe('/mock/path')
    
    // Theme indicator
    expect(screen.getByText('dark')).toBeInTheDocument()
    
    // Scan button
    const scanButton = screen.getByRole('button', { name: 'Scanner' })
    expect(scanButton).toBeInTheDocument()
    expect(scanButton).not.toBeDisabled()
  })

  it('should call setProjectPath when path input changes', () => {
    render(<Navbar {...defaultProps} />)
    
    const pathInput = screen.getByPlaceholderText('Entrez le chemin du projet...')
    fireEvent.change(pathInput, { target: { value: '/new/path' } })
    
    expect(defaultProps.setProjectPath).toHaveBeenCalledWith('/new/path')
  })

  it('should toggle theme selection dropdown and select theme option', () => {
    render(<Navbar {...defaultProps} />)
    
    const themeBtn = screen.getByTitle('Changer le thème')
    expect(themeBtn).toBeInTheDocument()
    
    // Click theme dropdown
    fireEvent.click(themeBtn)
    
    const cyberpunkOption = screen.getByText('Cyberpunk')
    expect(cyberpunkOption).toBeInTheDocument()
    
    // Click theme option
    fireEvent.click(cyberpunkOption)
    expect(defaultProps.setTheme).toHaveBeenCalledWith('cyberpunk')
  })

  it('should toggle view options dropdown and call onViewChange when clicked', () => {
    render(<Navbar {...defaultProps} />)
    
    const viewBtn = screen.getByText(/Type de Flowchart :/)
    expect(viewBtn).toBeInTheDocument()
    
    // Click view dropdown
    fireEvent.click(viewBtn)
    
    // Select conditional-statement option (e.g. "Flowchart d'Instructions Conditionnelles")
    const conditionalOption = screen.getByText("Flowchart d'Instructions Conditionnelles")
    expect(conditionalOption).toBeInTheDocument()
    
    fireEvent.click(conditionalOption)
    expect(defaultProps.onViewChange).toHaveBeenCalledWith('conditional-statement')
  })

  it('should call onScan when scan button is clicked', () => {
    render(<Navbar {...defaultProps} />)
    
    const scanButton = screen.getByRole('button', { name: 'Scanner' })
    fireEvent.click(scanButton)
    
    expect(defaultProps.onScan).toHaveBeenCalled()
  })

  it('should disable scan button when isScanning is true', () => {
    render(<Navbar {...defaultProps} isScanning={true} />)
    
    const scanButton = screen.getByRole('button', { name: 'Scanner' })
    expect(scanButton).toBeDisabled()
  })
})
