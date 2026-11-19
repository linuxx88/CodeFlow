import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Navbar } from './Navbar'
import React from 'react'

vi.mock('../services/transportService', () => ({
  checkBackendHealth: vi.fn().mockResolvedValue(true)
}))

describe('Navbar Component', () => {
  const defaultProps = {
    projectPath: '/mock/path',
    setProjectPath: vi.fn(),
    isScanning: false,
    onScan: vi.fn(),
    onCancel: vi.fn(),
    currentView: 'all' as const,
    onViewChange: vi.fn(),
    theme: 'dark' as const,
    setTheme: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderNavbar = async (props = defaultProps) => {
    render(<Navbar {...props} />)
    await waitFor(() => {
      expect(screen.getByText('Engine OK')).toBeInTheDocument()
    })
  }

  it('should render navbar layout and inputs correctly', async () => {
    await renderNavbar()
    
    // Header title
    expect(screen.getByText('Interactive Dependency Flow')).toBeInTheDocument()
    
    // Path input
    const pathInput = screen.getByPlaceholderText('Enter project path...') as HTMLInputElement
    expect(pathInput).toBeInTheDocument()
    expect(pathInput.value).toBe('/mock/path')
    
    // Theme indicator
    expect(screen.getByText('dark')).toBeInTheDocument()
    
    // Scan button
    const scanButton = screen.getByRole('button', { name: 'Scan' })
    expect(scanButton).toBeInTheDocument()
    expect(scanButton).not.toBeDisabled()
  })

  it('should call setProjectPath when path input changes', async () => {
    await renderNavbar()
    
    const pathInput = screen.getByPlaceholderText('Enter project path...')
    fireEvent.change(pathInput, { target: { value: '/new/path' } })
    
    expect(defaultProps.setProjectPath).toHaveBeenCalledWith('/new/path')
  })

  it('should call onScan when pressing Enter in path input', async () => {
    await renderNavbar()

    const pathInput = screen.getByPlaceholderText('Enter project path...')
    fireEvent.keyDown(pathInput, { key: 'Enter' })

    expect(defaultProps.onScan).toHaveBeenCalledTimes(1)
  })

  it('should toggle theme selection dropdown and select theme option', async () => {
    await renderNavbar()
    
    const themeBtn = screen.getByTitle('Change theme')
    expect(themeBtn).toBeInTheDocument()
    
    // Click theme dropdown
    fireEvent.click(themeBtn)
    
    const cyberpunkOption = screen.getByText('Cyberpunk')
    expect(cyberpunkOption).toBeInTheDocument()
    
    // Click theme option
    fireEvent.click(cyberpunkOption)
    expect(defaultProps.setTheme).toHaveBeenCalledWith('cyberpunk')
  })

  it('should toggle view options dropdown and call onViewChange when clicked', async () => {
    await renderNavbar()
    
    const viewBtn = screen.getByText(/Flowchart Type:/)
    expect(viewBtn).toBeInTheDocument()
    
    // Click view dropdown
    fireEvent.click(viewBtn)
    
    // Select conditional-statement option
    const conditionalOption = screen.getByText('Conditional Statements Flowchart')
    expect(conditionalOption).toBeInTheDocument()
    
    fireEvent.click(conditionalOption)
    expect(defaultProps.onViewChange).toHaveBeenCalledWith('conditional-statement')
  })

  it('should call onScan when scan button is clicked', async () => {
    await renderNavbar()
    
    const scanButton = screen.getByRole('button', { name: 'Scan' })
    fireEvent.click(scanButton)
    
    expect(defaultProps.onScan).toHaveBeenCalled()
  })

  it('should disable scan button when isScanning is true or projectPath is empty', async () => {
    await renderNavbar({ ...defaultProps, isScanning: true })
    
    const scanButton = screen.getByRole('button', { name: 'Scan' })
    expect(scanButton).toBeDisabled()

    await renderNavbar({ ...defaultProps, projectPath: '   ' })
    const scanButtons = screen.getAllByRole('button', { name: 'Scan' })
    expect(scanButtons[1]).toBeDisabled()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    await renderNavbar({ ...defaultProps, isScanning: true, onCancel })
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    expect(cancelButton).toBeInTheDocument()
    fireEvent.click(cancelButton)
    expect(onCancel).toHaveBeenCalled()
  })
})
